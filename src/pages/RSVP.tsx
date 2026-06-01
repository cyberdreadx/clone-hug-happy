import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, ArrowLeft, Download, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { downloadICS } from "@/lib/calendar";
import paypalQr from "@/assets/paypal-qr.png.asset.json";
import lilypadBg from "@/assets/rsvp-orchids.jpg.asset.json";

const bgStyle: React.CSSProperties = {
  backgroundImage: `linear-gradient(180deg, rgba(20,28,20,0.35) 0%, rgba(20,28,20,0.30) 50%, rgba(20,28,20,0.45) 100%), url(${lilypadBg.url})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-white/10 border border-white/25 text-white text-sm placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-transparent backdrop-blur-sm";
const labelClass = "block text-[11px] tracking-[0.25em] uppercase text-white/85 mb-2 font-medium";

const RSVPPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dietary_requirements: "",
    notes: "",
  });

  const { data: events } = useQuery({
    queryKey: ["active-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.from("guests").insert({
        ...form,
        event_id: events?.[0]?.id || null,
        status: "pending",
      }).select("id").single();
      if (error) throw error;
      setGuestId(data.id);
      setSubmitted(true);
      toast.success("RSVP submitted successfully!");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const qrValue = guestId ? `bb-checkin:${guestId}` : "";
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={bgStyle}>
        <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-12 max-w-md text-center shadow-2xl">
          <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
          <h2 className="font-serif text-2xl text-white mb-3">You're On The List</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Thank you for your interest in Breathe &amp; Bloom. We'll review your application
            and be in touch soon with next steps.
          </p>

          {guestId && (
            <div className="mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-3">
                Your Check-In QR Code
              </p>
              <div className="inline-block p-4 bg-white rounded-xl shadow-inner">
                <QRCodeSVG value={qrValue} size={180} level="M" />
              </div>
              <p className="text-white/60 text-xs mt-3 leading-relaxed">
                Screenshot this code — show it at the door for instant check-in
              </p>
            </div>
          )}

          {events?.[0]?.date && (
            <button
              onClick={() => {
                const ev = events[0];
                downloadICS({
                  name: ev.name,
                  date: ev.date!,
                  time: (ev as any).time,
                  endTime: (ev as any).end_time,
                  location: ev.location,
                  description: ev.description,
                });
              }}
              className="inline-flex items-center gap-2 border border-white/30 text-white/80 px-5 py-2.5 rounded-full text-sm hover:text-white hover:border-white/60 transition-colors mb-4"
            >
              <CalendarPlus className="w-4 h-4" /> Add to Calendar
            </button>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gold text-sm hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen py-16 px-6" style={bgStyle}>
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/70 text-sm mb-10 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-4">
            Secure Your Reservation
          </p>
          <div className="w-16 h-px bg-white/30 mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Reserve Your Spot
          </h1>
          <p className="text-white/70 text-sm max-w-lg mx-auto">
            Fill in your details, then scan the code to complete your $150 payment
            and lock in your spot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-black/35 backdrop-blur-xl border border-white/15 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 h-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  required
                  placeholder="Your first name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  required
                  placeholder="Your last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (305) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Dietary Requirements</label>
              <input
                value={form.dietary_requirements}
                onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })}
                className={inputClass}
                placeholder="Vegan, gluten-free, allergies..."
              />
            </div>

            <div>
              <label className={labelClass}>Why would you like to attend?</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4b483] via-[#d89b8a] to-[#c47e7e] text-white py-4 rounded-full text-sm tracking-[0.2em] uppercase font-medium hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg"
            >
              {loading ? "Submitting..." : "Submit My Reservation"}
            </button>

            <p className="text-white/75 text-xs text-center leading-relaxed">
              After submitting, complete your payment using the code to the right.
              A waiver will be provided upon arrival.
            </p>
          </form>

          {/* PayPal panel */}
          <div className="bg-black/35 backdrop-blur-xl border border-white/15 rounded-2xl p-8 sm:p-10 shadow-2xl text-center h-full flex flex-col justify-center">
            <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-3">
              Step 2 · Payment
            </p>
            <h2 className="font-serif text-2xl text-white mb-3">
              Scan to Pay
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-7 max-w-xs mx-auto">
              Use your phone camera or the PayPal app to scan and secure your reservation.
            </p>

            <div className="inline-block p-4 bg-white rounded-xl shadow-2xl mb-6">
              <img
                src={paypalQr.url}
                alt="PayPal QR code to reserve your seat"
                className="w-56 h-56"
              />
            </div>

            <p className="font-serif text-2xl text-white">
              $150 <span className="text-white/70 text-xl">· per guest</span>
            </p>
            <p className="text-white/60 text-[11px] tracking-[0.2em] uppercase mt-1">
              Powered by PayPal
            </p>

            <div className="mt-7 pt-6 border-t border-white/15">
              <p className="text-white/75 text-xs leading-relaxed">
                Your spot is confirmed once payment is received. Seats are extremely limited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPPage;
