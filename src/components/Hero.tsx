import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const { data: nextEvent } = useQuery({
    queryKey: ["next-event-hero"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("events")
        .select("id, name, date, location")
        .eq("status", "active")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)
        .single();
      return data;
    },
  });

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-hero/60" />
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Logo circle */}
        <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-lg">
          <span className="font-serif text-foreground text-lg leading-tight text-center">
            BREATHE<br />&amp; BLOOM
          </span>
        </div>

        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">
          Wellness · Community · Impact
        </p>

        <p className="text-foreground/80 leading-relaxed mb-10 max-w-lg mx-auto text-sm">
          A transformative wellness retreat blending elevated self-care, mindful
          connections, and purposeful living in an intimate desert oasis.
        </p>

        {nextEvent && (
          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
              {nextEvent.date ? format(new Date(nextEvent.date + "T12:00:00"), "MMMM yyyy") : ""}{nextEvent.location ? ` · ${nextEvent.location}` : ""}
            </p>
            <Link
              to={`/event/${nextEvent.id}`}
              className="inline-block bg-gold text-primary-foreground px-10 py-3.5 rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Next Event
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
