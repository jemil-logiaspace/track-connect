import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSettings } from "@/api/settings";
import Navbar from "@/components/layout/Navbar";
import StatusBadge from "@/components/tracking/StatusBadge";
import RecentTrackings, { addRecentTracking } from "@/components/tracking/RecentTrackings";
import { getPublicTracking, Tracking } from "@/api/trackings";
import { Search, Truck, MapPin, Shield, ArrowRight, Clock, Globe, Plane, Ship, Globe2, CheckCircle2, Quote } from "lucide-react";
import { motion } from "framer-motion";
const heroImg = { url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80" };
const airImg = { url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80" };
const seaImg = { url: "https://images.unsplash.com/photo-1712578585447-2bab142270b0?w=800&q=80" };
const roadImg = { url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" };
const ieImg = { url: "https://images.unsplash.com/photo-1759389003827-2a214e4c73b4?w=800&q=80" };
const logoDevKey = import.meta.env.VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY;

const springEase = [0.32, 0.72, 0, 1] as const;

const fadeUpBlur = {
  initial: { opacity: 0, y: 64, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true },
  transition: { duration: 0.7, ease: springEase },
};

const LandingPage = () => {
  const [trackingInput, setTrackingInput] = useState("");
  const [searchResults, setSearchResults] = useState<Tracking[]>([]);
  const [notFoundNumbers, setNotFoundNumbers] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [contactEmail, setContactEmail] = useState("hello@trace.tech");
  const [contactPhone, setContactPhone] = useState("+33 1 84 88 42 00");
  const navigate = useNavigate();

  useEffect(() => {
    getSettings().then((s) => {
      if (s.supportEmail) setContactEmail(s.supportEmail);
      if (s.supportPhone) setContactPhone(s.supportPhone);
    }).catch(() => {});
  }, []);

  const handleSearch = async () => {
    const numbers = trackingInput
      .split(/[\n,;]+/)
      .map((n) => n.trim().toUpperCase())
      .filter((n) => n.length > 0)
      .slice(0, 10);

    if (numbers.length === 0) return;

    setSearching(true);
    const found: Tracking[] = [];
    const notFound: string[] = [];

    for (const num of numbers) {
      try {
        const tracking = await getPublicTracking(num);
        found.push(tracking);
        addRecentTracking({ trackingNumber: tracking.trackingNumber, name: tracking.clientName, status: tracking.status });
      } catch {
        notFound.push(num);
      }
    }

    setSearchResults(found);
    setNotFoundNumbers(notFound);
    setHasSearched(true);
    setSearching(false);
  };

  const handleRecentSelect = async (trackingNumber: string) => {
    setTrackingInput(trackingNumber);
    try {
      const tracking = await getPublicTracking(trackingNumber);
      setSearchResults([tracking]);
      setNotFoundNumbers([]);
      setHasSearched(true);
    } catch {
      setNotFoundNumbers([trackingNumber]);
    }
  };

  const features = [
    { icon: MapPin, title: "Real-time Tracking", desc: "View the exact location of your packages and vehicles on an interactive map." },
    { icon: Shield, title: "Secure & Reliable", desc: "Your data is protected. Complete history of every movement recorded." },
    { icon: Clock, title: "Instant Updates", desc: "Receive notifications at every status change of your shipments." },
    { icon: Globe, title: "National Coverage", desc: "Track your shipments anywhere in France with our carrier partners." },
  ];

  const services = [
    { icon: Plane, title: "Air Freight", desc: "Express global air cargo when hours matter — 24–72h transit to major hubs.", image: airImg.url, to: "/services#air" },
    { icon: Ship, title: "Sea Freight", desc: "FCL & LCL ocean shipping with direct tier-1 carrier contracts.", image: seaImg.url, to: "/services#sea" },
    { icon: Truck, title: "Road Freight", desc: "Domestic and cross-border trucking with a live-tracked modern fleet.", image: roadImg.url, to: "/services#road" },
    { icon: Globe2, title: "Import & Export", desc: "Licensed customs brokers handling clearance, HS coding and compliance.", image: ieImg.url, to: "/services#import-export" },
  ];

  const testimonials = [
    { name: "Amélie Rousseau", role: "Head of Ops, Maison Verte", quote: "TRACE turned our shipping black box into a live dashboard. Support tickets dropped 60% in a month." },
    { name: "David Okonkwo", role: "Import Manager, Baobab Trading", quote: "Customs clearance used to be our worst headache. Their brokers handle everything — we just watch it move." },
    { name: "Yuki Tanaka", role: "Founder, Lumen Studio", quote: "The ETA accuracy is genuinely uncanny. Our clients trust us more because we finally trust our own timeline." },
  ];

  const partners = [
    { name: "FedEx", domain: "fedex.com" },
    { name: "UPS", domain: "ups.com" },
    { name: "DHL", domain: "dhl.com" },
    { name: "Maersk", domain: "maersk.com" },
    { name: "USPS", domain: "usps.com" },
    { name: "TNT", domain: "tnt.com" },
    { name: "Aramex", domain: "aramex.com" },
    { name: "GLS", domain: "gls-group.com" },
    { name: "Chronopost", domain: "chronopost.fr" },
    { name: "Colissimo", domain: "colissimo.fr" },
    { name: "DPD", domain: "dpd.com" },
    { name: "Hermes", domain: "hermesworld.com" },
    { name: "Royal Mail", domain: "royalmail.com" },
    { name: "Canada Post", domain: "canadapost-postescanada.ca" },
    { name: "Japan Post", domain: "post.japanpost.jp" },
    { name: "China Post", domain: "chinapost.com.cn" },
    { name: "SF Express", domain: "sf-express.com" },
    { name: "YunExpress", domain: "yunexpress.com" },
    { name: "CMA CGM", domain: "cma-cgm.com" },
    { name: "MSC", domain: "msc.com" },
    { name: "Hapag-Lloyd", domain: "hapag-lloyd.com" },
    { name: "Emirates SkyCargo", domain: "emirates.com" },
    { name: "Lufthansa Cargo", domain: "lufthansa-cargo.com" },
    { name: "Air France Cargo", domain: "airfrancecargo.com" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg.url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 pt-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: springEase }}
            >
              <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/10 text-white/80 mb-8">
                Global Freight & Live Tracking
              </span>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight">
                Freight that moves.<br />
                <span className="text-white/75">Visibility that stays.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
                Air, sea, and road freight across 120+ countries — with live tracking, real ETAs and dedicated support on every shipment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.2, ease: springEase }}
              className="max-w-xl mx-auto"
            >
              <div className="p-[1px] rounded-[2rem] bg-white/[0.08]">
                <div className="rounded-[calc(2rem-1px)] bg-white/95 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl p-6 space-y-5">
                  <textarea
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder={"Enter your tracking numbers...\nUp to 10 numbers (one per line)"}
                    className="w-full min-h-[48px] max-h-[120px] bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none text-sm leading-relaxed"
                    rows={2}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                      Separate by line, comma, or semicolon
                    </span>
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="rounded-full text-sm font-medium bg-gray-900 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50"
                    >
                      <span>Track</span>
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-3">
                Try: TRK-2024-001847, TRK-2024-003105
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.35, ease: springEase }}
              className="max-w-xl mx-auto"
            >
              <RecentTrackings onSelect={handleRecentSelect} />
            </motion.div>

            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: springEase }}
                className="max-w-xl mx-auto space-y-4"
              >
                {searchResults.length > 0 && (
                  <>
                    {searchResults.length > 1 && (
                      <p className="text-sm text-white/60 text-left font-medium">
                        {searchResults.length} packages found
                      </p>
                    )}
                    {searchResults.map((result) => (
                      <div key={result.id} className="p-[1px] rounded-[2rem] bg-white/[0.08]">
                        <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-6 space-y-4 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono text-xs text-gray-400">{result.trackingNumber}</p>
                              <p className="font-display font-semibold text-gray-900 text-lg">{result.clientName}</p>
                            </div>
                            <StatusBadge status={result.status} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 shrink-0" />
                            {(result.originAddress || "Origin")} → {(result.destinationAddress || "Destination")}
                          </div>
                          <button
                            onClick={() => navigate(`/track/${result.trackingNumber}`)}
                            className="rounded-full text-sm font-medium bg-gray-900 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-gray-800 active:scale-[0.97] w-full justify-between"
                          >
                            <span>View detailed tracking</span>
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {notFoundNumbers.length > 0 && (
                  <div className="p-[1px] rounded-[2rem] bg-white/[0.08]">
                    <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-6 space-y-3 text-left">
                      <p className="text-sm font-medium text-red-400">Numbers not found:</p>
                      {notFoundNumbers.map((num) => (
                        <p key={num} className="text-sm text-gray-400 font-mono">{num}</p>
                      ))}
                      <p className="text-xs text-gray-400">Check the spelling or contact your sender.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Services — Asymmetrical Bento ─── */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div {...fadeUpBlur} className="text-center mb-16">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-gray-600 mb-6">
              Our services
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              One partner, every mode of transport
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              From urgent air cargo to full container ocean freight, we design the route that fits your goods and your deadline.
            </p>
          </motion.div>

          <div className="grid grid-cols-4 gap-6">
            {services.map((s, i) => {
              const isWide = i === 0 || i === 3;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: springEase }}
                  className={isWide ? "col-span-4 md:col-span-3" : "col-span-4 md:col-span-1"}
                >
                  <Link to={s.to}>
                    <div className="p-[1px] rounded-[2rem] bg-black/[0.03] h-full group">
                      <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden h-full transition-all duration-700 ease-out-expo group-hover:shadow-[0_8px_60px_-16px_rgba(0,0,0,0.12)]">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover transition-all duration-700 ease-out-expo group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                          <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <s.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="p-7">
                          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                          <div className="mt-5">
                            <span className="rounded-full text-sm font-medium bg-gray-900 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo group-hover:bg-gray-800">
                              <span>Learn more</span>
                              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Why TRACE ─── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: springEase }}
          >
            <div className="p-[1px] rounded-[2rem] bg-black/[0.03]">
              <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <img src={seaImg.url} alt="Ocean freight container ship" className="w-full h-full object-cover aspect-[4/3]" loading="lazy" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: springEase }}
            className="space-y-6"
          >
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-gray-600">
              Why TRACE
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              Old-school reliability, modern visibility
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Fifteen years of freight-forwarding expertise combined with a tracking platform your team will actually enjoy using.
              No black-box shipments. No last-minute surprises.
            </p>
            <ul className="space-y-4 pt-2">
              {[
                "98.6% on-time delivery across all lanes",
                "Dedicated account manager per client",
                "Customs clearance & duty advisory included",
                "Real-time ETA with confidence scoring",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-700" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link to="/about">
                <span className="rounded-full text-sm font-medium bg-gray-900 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-gray-800 active:scale-[0.97]">
                  <span>About our company</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Bento ─── */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div {...fadeUpBlur} className="text-center mb-16">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-gray-600 mb-6">
              Platform
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              Everything you need
            </h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto text-lg leading-relaxed">
              A complete solution for tracking your shipments and vehicles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const isWide = i === 0 || i === 3;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: springEase }}
                  className={isWide ? "md:col-span-2" : "md:col-span-1"}
                >
                  <div className="p-[1px] rounded-[2rem] bg-black/[0.03] h-full group">
                    <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-8 h-full transition-all duration-700 ease-out-expo group-hover:shadow-[0_8px_60px_-16px_rgba(0,0,0,0.12)]">
                      <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-5">
                        <f.icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div {...fadeUpBlur} className="text-center mb-16">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-gray-600 mb-6">
              Trusted worldwide
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              What our clients say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: springEase }}
              >
                <div className="p-[1px] rounded-[2rem] bg-black/[0.03] h-full">
                  <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-8 h-full flex flex-col">
                    <Quote className="w-8 h-8 text-black/10 mb-5" />
                    <p className="text-gray-600 leading-relaxed flex-1">"{t.quote}"</p>
                    <div className="mt-6 pt-6 border-t border-black/[0.04]">
                      <p className="font-display font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {/* ─── Partners / Carriers ─── */}
      <section className="py-32 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div {...fadeUpBlur} className="text-center mb-16">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-gray-600 mb-6">
              Carrier network
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              Partners we ship with
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              Direct integrations with the world's leading carriers — sea, air, road and express — all unified in one tracking view.
            </p>
          </motion.div>

          <motion.div {...fadeUpBlur}>
            <div className="p-[1px] rounded-[2rem] bg-black/[0.03]">
              <div className="rounded-[calc(2rem-1px)] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-8 md:p-10">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-6 gap-y-8">
                  {partners.map((p) => (
                    <div
                      key={p.name}
                      className="group flex flex-col items-center justify-center gap-2"
                      title={p.name}
                    >
                      <div className="w-full aspect-[3/2] rounded-xl bg-gray-50 border border-black/[0.04] flex items-center justify-center p-3 transition-all duration-700 ease-out-expo group-hover:bg-white group-hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] group-hover:border-black/10">
                        <img
                          src={`https://img.logo.dev/${p.domain}?token=${logoDevKey}&size=128&format=png&fallback=404`}
                          alt={`${p.name} logo`}
                          loading="lazy"
                          className="max-h-10 max-w-full object-contain grayscale opacity-70 transition-all duration-700 ease-out-expo group-hover:grayscale-0 group-hover:opacity-100"
                          onError={(e) => {
                            const t = e.currentTarget;
                            t.style.display = "none";
                            const fb = t.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                        <span
                          style={{ display: "none" }}
                          className="w-full h-full items-center justify-center font-display text-xs font-semibold text-gray-500 text-center leading-tight"
                        >
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium text-center">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    <span className="font-display font-semibold text-gray-900">120+ carriers</span> integrated worldwide — and growing every month.
                  </p>
                  <Link to="/contact">
                    <span className="rounded-full text-sm font-medium bg-gray-900 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-gray-800 active:scale-[0.97]">
                      <span>Request a carrier</span>
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 bg-gray-900">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 64, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: springEase }}
            className="space-y-8"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Ready to ship smarter?
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
              Create your free account or talk to our team about your next shipment.
            </p>
            <div className="flex gap-4 justify-center flex-wrap pt-4">
              <button
                onClick={() => navigate("/register")}
                className="rounded-full text-sm font-medium bg-white text-gray-900 inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-white/90 active:scale-[0.97]"
              >
                <span>Create a free account</span>
                <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="rounded-full text-sm font-medium bg-white/10 text-white inline-flex items-center pl-6 pr-1 py-1 gap-3 transition-all duration-700 ease-out-expo hover:bg-white/20 active:scale-[0.97]"
              >
                <span>Talk to us</span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white border-t border-black/[0.04] py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <img src="/trace-logo.svg" alt="TRACE" className="h-7 w-auto" />
              <p className="text-sm text-gray-500 leading-relaxed">Enterprise tracking — everything in view.</p>
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-gray-900 mb-4">Services</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/services#air" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Air Freight</Link></li>
                <li><Link to="/services#sea" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Sea Freight</Link></li>
                <li><Link to="/services#road" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Road Freight</Link></li>
                <li><Link to="/services#import-export" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Import & Export</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-gray-900 mb-4">Company</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/about" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">About</Link></li>
                <li><Link to="/contact" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Contact</Link></li>
                <li><Link to="/track" className="hover:text-gray-900 transition-all duration-700 ease-out-expo">Track Shipment</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-gray-900 mb-4">Get in touch</p>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>{contactEmail}</li>
                <li>{contactPhone}</li>
                <li>Paris · Rotterdam · Lagos</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-black/[0.04] text-sm text-gray-400 text-center">
            &copy; 2026 TRACE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
