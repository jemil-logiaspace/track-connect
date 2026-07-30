import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { submitContact } from "@/api/contact";
import { getSettings } from "@/api/settings";

const fadeUp = {
  initial: { opacity: 0, y: 64, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
};

const ContactPage = () => {
  const [settings, setSettings] = useState({ supportEmail: "hello@trace.tech", supportPhone: "+33 1 84 88 42 00" });
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.supportEmail) setSettings((prev) => ({ ...prev, supportEmail: s.supportEmail }));
      if (s.supportPhone) setSettings((prev) => ({ ...prev, supportPhone: s.supportPhone }));
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContact(form);
      toast.success("Message sent — we'll get back to you within 24h.");
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: settings.supportEmail, href: `mailto:${settings.supportEmail}` },
    { icon: Phone, label: "Phone", value: settings.supportPhone, href: `tel:${settings.supportPhone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Headquarters", value: "24 Rue de la Logistique, 75008 Paris, France" },
    { icon: Clock, label: "Hours", value: "Mon – Fri · 08:00 – 19:00 CET" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div {...fadeUp}>
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 mb-6">
              Contact us
            </span>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              Let's talk <span className="text-gray-900">freight</span>
            </h1>
            <p className="text-gray-500 text-lg mt-6 max-w-xl mx-auto">
              A quote, a question, a partnership — our team replies within one business day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-32">
        <div className="container mx-auto px-4 max-w-6xl grid lg:grid-cols-5 gap-8">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((c, i) => (
              <motion.div key={c.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <div className="p-[1px] rounded-[2rem] bg-black/[0.03]">
                  <div className="rounded-[calc(2rem-1px)] bg-white p-5 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                        <c.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="font-medium text-sm text-gray-700 hover:text-gray-900 transition-colors duration-500 ease-out-expo">
                            {c.value}
                          </a>
                        ) : (
                          <p className="font-medium text-sm text-gray-700">{c.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div className="lg:col-span-3" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            <div className="p-[1px] rounded-[2rem] bg-black/[0.03]">
              <div className="rounded-[calc(2rem-1px)] bg-white p-8 sm:p-10 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)]">
                <h2 className="text-2xl font-semibold tracking-tight mb-8">Send us a message</h2>
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Full name *</label>
                      <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Email *</label>
                      <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Company</label>
                      <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Subject *</label>
                      <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-[0.1em]">Message *</label>
                    <div className="p-[1px] rounded-xl bg-black/[0.06] transition-all duration-500 ease-out-expo focus-within:bg-black/10">
                      <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 resize-none" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="group relative inline-flex items-center gap-2 rounded-full bg-black text-white pl-6 pr-1 py-1 text-sm font-medium transition-all duration-500 ease-out-expo hover:bg-black/90 active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>{sending ? "Sending..." : "Send message"}</span>
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all duration-500 ease-out-expo group-hover:translate-x-[1px] group-hover:-translate-y-[1px] group-hover:scale-105">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
