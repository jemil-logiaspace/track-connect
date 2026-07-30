import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { badRequest, notFound } from "../utils/errors";
import { param } from "../utils/params";
import { geocodeAddress } from "../services/geocode";
import { calculateEta } from "../services/eta";
import { changeStatusAndNotify } from "../services/position";
import { getIO } from "../socket";

const router = Router();

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TC-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const createSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  packageDescription: z.string().optional(),
  weight: z.number().positive().optional(),
  originAddress: z.string().min(1),
  destinationAddress: z.string().min(1),
  avgSpeedKmh: z.number().positive().optional(),
  carrierRef: z.string().optional(),
});

router.get("/", auth, async (req: Request, res: Response) => {
  const { status, search } = req.query;

  const where: Record<string, unknown> = {};

  if (req.user!.role === "client") {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw notFound("User not found");
    where.clientEmail = user.email;
  }

  if (status && typeof status === "string") {
    where.status = status;
  }

  if (search && typeof search === "string") {
    where.OR = [
      { trackingNumber: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
    ];
  }

  const trackings = await prisma.tracking.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" }, take: 1 },
      _count: { select: { messages: true, disputes: true } },
    },
  });

  res.json(trackings);
});

router.get("/public/:trackingNumber", async (req: Request, res: Response) => {
  const tracking = await prisma.tracking.findUnique({
    where: { trackingNumber: param(req, "trackingNumber") },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });

  if (!tracking) throw notFound("Tracking number not found");

  res.json(tracking);
});

router.get("/:id", auth, async (req: Request, res: Response) => {
  const id = param(req, "id");
  const tracking = await prisma.tracking.findUnique({
    where: { id },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });

  if (!tracking) throw notFound("Tracking not found");

  if (req.user!.role === "client") {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (user && tracking.clientEmail !== user.email) {
      throw notFound("Tracking not found");
    }
  }

  res.json(tracking);
});

router.post("/", auth, requireRole("admin"), async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest("Validation failed", parsed.error.flatten());

  const {
    clientName,
    clientEmail,
    packageDescription,
    weight,
    originAddress,
    destinationAddress,
    avgSpeedKmh,
    carrierRef,
  } = parsed.data;

  const originGeo = await geocodeAddress(originAddress);
  if (!originGeo) throw badRequest(`Could not geocode origin address: "${originAddress}"`);

  const destGeo = await geocodeAddress(destinationAddress);
  if (!destGeo) throw badRequest(`Could not geocode destination address: "${destinationAddress}"`);

  const speed = avgSpeedKmh || 60;
  const { eta } = await calculateEta(
    originGeo.lat,
    originGeo.lng,
    destGeo.lat,
    destGeo.lng,
    speed
  );

  const trackingNumber = generateTrackingNumber();

  const tracking = await prisma.tracking.create({
    data: {
      trackingNumber,
      clientName,
      clientEmail,
      packageDescription,
      weight,
      originLat: originGeo.lat,
      originLng: originGeo.lng,
      originAddress: originGeo.displayName,
      destLat: destGeo.lat,
      destLng: destGeo.lng,
      destinationAddress: destGeo.displayName,
      currentLat: originGeo.lat,
      currentLng: originGeo.lng,
      status: "in_transit",
      carrierRef: carrierRef || null,
      avgSpeedKmh: speed,
      eta,
      statusHistory: {
        create: {
          oldStatus: null,
          newStatus: "in_transit",
          reason: "Colis créé et en transit",
        },
      },
    },
  });

  res.status(201).json(tracking);
});

router.patch(
  "/:id/status",
  auth,
  requireRole("admin", "operator"),
  async (req: Request, res: Response) => {
    const statusSchema = z.object({
      status: z.enum([
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delayed",
        "customs_hold",
        "fees_pending",
        "returned",
        "lost",
      ]),
      reason: z.string().min(1, "Reason is required"),
    });

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success)
      throw badRequest("Validation failed", parsed.error.flatten());

    const { status: newStatus, reason } = parsed.data;
    const id = param(req, "id");

    const tracking = await prisma.tracking.findUnique({ where: { id } });
    if (!tracking) throw notFound("Tracking not found");

    const oldStatus = tracking.status;

    await changeStatusAndNotify(id, oldStatus, newStatus, reason);

    const updated = await prisma.tracking.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { changedAt: "desc" }, take: 5 },
      },
    });

    res.json(updated);
  }
);

router.patch(
  "/:id/position",
  auth,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const posSchema = z.object({
      progressPercent: z.number().min(0).max(100),
    });

    const parsed = posSchema.safeParse(req.body);
    if (!parsed.success)
      throw badRequest("Validation failed", parsed.error.flatten());

    const { progressPercent } = parsed.data;
    const id = param(req, "id");

    const tracking = await prisma.tracking.findUnique({ where: { id } });
    if (!tracking) throw notFound("Tracking not found");

    const frac = progressPercent / 100;
    const newLat = tracking.originLat + (tracking.destLat - tracking.originLat) * frac;
    const newLng = tracking.originLng + (tracking.destLng - tracking.originLng) * frac;

    const { eta } = await calculateEta(
      newLat,
      newLng,
      tracking.destLat,
      tracking.destLng,
      tracking.avgSpeedKmh
    );

    const updated = await prisma.tracking.update({
      where: { id },
      data: { currentLat: newLat, currentLng: newLng, eta },
    });

    const io = getIO();
    io.to(`tracking:${id}`).emit("tracking:updated", {
      trackingId: id,
      status: tracking.status,
      currentLat: newLat,
      currentLng: newLng,
      eta: eta.toISOString(),
    });

    res.json(updated);
  }
);

export default router;
