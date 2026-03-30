import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, ArrowLeft, Download, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { downloadICS } from "@/lib/calendar";

const RSVPPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
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
      <div className="min-h-screen bg-section-light flex items-center justify-center px-6">
        <div className="bg-card rounded-2xl p-12 max-w-md text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
          <h2 className="font-serif text-2xl text-foreground mb-3">You're On The List</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Thank you for your interest in Breathe &amp; Bloom. We'll review your application
            and be in touch soon with next steps.
          </p>

          {guestId && (
            <div className="mb-6">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Your Check-In QR Code
              </p>
              <div className="inline-block p-4 bg-white rounded-xl shadow-inner">
                <QRCodeSVG value={qrValue} size={180} level="M" />
              </div>
              <p className="text-muted-foreground text-xs mt-3 leading-relaxed">
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
              className="inline-flex items-center gap-2 border border-border text-foreground/60 px-5 py-2.5 rounded-full text-sm hover:text-foreground hover:border-foreground/30 transition-colors mb-4"
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
    <div className="min-h-screen bg-section-light py-16 px-6">
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground text-sm mb-8 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Apply to Attend
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            Request Your Invitation
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Space is limited to 80–100 guests. Complete the form below and our team
            will review your application.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-lg space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">First Name *</label>
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Last Name *</label>
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1.5">Company / Organization</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1.5">Dietary Requirements</label>
            <input
              value={form.dietary_requirements}
              onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Vegan, gluten-free, allergies..."
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1.5">Why would you like to attend?</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-primary-foreground py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RSVPPage;
