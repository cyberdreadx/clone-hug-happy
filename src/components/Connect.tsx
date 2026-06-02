import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/80 backdrop-blur rounded-2xl p-8 md:p-14 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Let's Connect</h2>
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
                className="w-full inline-flex items-center justify-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
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
