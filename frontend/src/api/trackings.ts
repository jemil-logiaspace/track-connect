import client, { publicClient } from "./client";

export interface Tracking {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientEmail: string;
  packageDescription: string | null;
  weight: number | null;
  originLat: number;
  originLng: number;
  originAddress: string | null;
  destLat: number;
  destLng: number;
  destinationAddress: string | null;
  currentLat: number;
  currentLng: number;
  status: string;
  carrierRef: string | null;
  avgSpeedKmh: number;
  eta: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: StatusEvent[];
  _count?: { messages: number; disputes: number };
}

export interface StatusEvent {
  id: string;
  trackingId: string;
  oldStatus: string | null;
  newStatus: string;
  reason: string | null;
  changedAt: string;
}

export async function getTrackings(params?: {
  status?: string;
  search?: string;
}): Promise<Tracking[]> {
  const { data } = await client.get<Tracking[]>("/trackings", { params });
  return data;
}

export async function getTracking(id: string): Promise<Tracking> {
  const { data } = await client.get<Tracking>(`/trackings/${id}`);
  return data;
}

export async function getPublicTracking(
  trackingNumber: string
): Promise<Tracking> {
  const { data } = await publicClient.get<Tracking>(
    `/trackings/public/${trackingNumber}`
  );
  return data;
}

export async function getCarriers(): Promise<string[]> {
  const { data } = await client.get<string[]>("/public/carriers");
  return data;
}

export async function createTracking(payload: {
  clientName: string;
  clientEmail: string;
  packageDescription?: string;
  weight?: number;
  originAddress: string;
  destinationAddress: string;
  avgSpeedKmh?: number;
  carrierRef?: string;
}): Promise<Tracking> {
  const { data } = await client.post<Tracking>("/trackings", payload);
  return data;
}

export async function updateStatus(
  id: string,
  payload: { status: string; reason: string }
): Promise<Tracking> {
  const { data } = await client.patch<Tracking>(
    `/trackings/${id}/status`,
    payload
  );
  return data;
}

export async function updatePosition(
  id: string,
  progressPercent: number
): Promise<Tracking> {
  const { data } = await client.patch<Tracking>(
    `/trackings/${id}/position`,
    { progressPercent }
  );
  return data;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeProgress(tracking: Tracking): number {
  const total = haversine(tracking.originLat, tracking.originLng, tracking.destLat, tracking.destLng);
  if (total === 0) return 0;
  const traveled = haversine(tracking.originLat, tracking.originLng, tracking.currentLat, tracking.currentLng);
  return Math.round(Math.min(100, Math.max(0, (traveled / total) * 100)));
}
