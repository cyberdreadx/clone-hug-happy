import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoAsset from "@/assets/breathe-bloom-logo.png.asset.json";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Connect = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { name, email, message } = parsed.data;
    const { error } = await supabase.from("contact_submissions").insert([{ name, email, message }]);
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    toast.success("Message sent. We'll be in touch shortly.");
  };

  return (
    <section className="py-12 md:py-24 px-6">
      <div className="relative max-w-5xl mx-auto rounded-[2rem] border border-white/20 bg-white/[0.06] backdrop-blur-2xl shadow-[0_30px_120px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] px-5 md:px-16 pt-4 md:pt-6 pb-10 md:pb-20 overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent after:pointer-events-none after:absolute after:-top-1/3 after:-left-1/4 after:w-[80%] after:h-[60%] after:rounded-full after:bg-gradient-to-br after:from-white/15 after:to-transparent after:blur-3xl">
        <div className="relative max-w-2xl mx-auto">

          <div className="relative text-center mb-8">
            <img
              src={logoAsset.url}
              alt="Breathe & Bloom"
              className="w-48 md:w-64 mx-auto opacity-80 mix-blend-screen select-none pointer-events-none"
            />
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 -mt-10 md:-mt-14 relative">Let's Connect</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              Ready to be part of something extraordinary? Share a few details and our team will reach out.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/20 text-gold mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <p className="font-serif text-xl text-foreground mb-2">Thank you</p>
              <p className="text-muted-foreground text-sm">We've received your message and will be in touch soon.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-xs text-gold underline-offset-4 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                  className="w-full bg-background/40 border border-border/40 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-gold/60 transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  className="w-full bg-background/40 border border-border/40 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-gold/60 transition-colors"
                  required
                />
              </div>
              <textarea
                placeholder="Tell us a little about your interest..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={2000}
                rows={5}
                className="w-full bg-background/40 border border-border/40 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-gold/60 transition-colors resize-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blush hover:bg-blush/90 text-blush-foreground px-6 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Connect;
