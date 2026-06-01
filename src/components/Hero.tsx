import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import heroFloral from "@/assets/hero-floral-blurred.jpeg.asset.json";
import luxuryTea from "@/assets/luxury-tea-detail.jpg";
import plate from "@/assets/plate.jpg";
import heroBg from "@/assets/hero-wheat-field.jpeg.asset.json";

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

  const dateLabel = nextEvent?.date
    ? format(new Date(nextEvent.date + "T12:00:00"), "MMMM yyyy")
    : "";

  return (
    <section
      className="relative w-full py-20 md:py-28 px-6 md:px-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg.url})` }}
    >
      {/* Cream wash for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/90 via-hero-bg/80 to-hero-bg/95" />
      <div className="relative max-w-6xl mx-auto">
        {/* Editorial header */}
        <header className="flex flex-col items-center text-center mb-20">
          <div className="w-28 h-28 rounded-full border border-foreground/15 bg-card flex items-center justify-center mb-8 shadow-sm">
            <span className="font-serif text-foreground text-base leading-tight tracking-tight uppercase">
              Breathe<br />
              <span className="italic font-light">&amp;</span> Bloom
            </span>
          </div>

          <h2 className="uppercase tracking-[0.4em] text-[10px] text-gold font-semibold mb-6 italic">
            Wellness · Community · Impact
          </h2>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl max-w-4xl leading-[1.05] mb-8 text-foreground">
            A transformative retreat for the{" "}
            <span className="italic font-light">modern seeker</span>.
          </h1>

          <p className="max-w-xl text-lg text-foreground/70 font-light leading-relaxed">
            Blending elevated self-care, mindful connections, and purposeful
            living in an intimate desert oasis.
          </p>
        </header>

        {/* Editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-foreground/10 pt-16">
          {/* Featured next event */}
          <div className="lg:col-span-7">
            <div className="relative mb-8 overflow-hidden">
              <img
                src={heroFloral.url}
                alt="Upcoming Breathe & Bloom experience"
                className="w-full aspect-[16/10] object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-card/90 backdrop-blur px-4 py-1 text-[10px] uppercase tracking-widest font-medium text-foreground">
                  Upcoming Release
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div>
                <h3 className="font-serif text-4xl mb-2 text-foreground">
                  {nextEvent?.name ?? "Our Next Gathering"}
                </h3>
                <p className="text-gold uppercase tracking-widest text-xs mb-4">
                  {dateLabel}
                  {nextEvent?.location ? ` · ${nextEvent.location.split(",")[0]}` : ""}
                </p>
                {nextEvent?.location && (
                  <p className="text-sm text-foreground/70 font-light max-w-sm mb-6">
                    {nextEvent.location}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                {nextEvent && (
                  <Link
                    to={`/event/${nextEvent.id}`}
                    className="bg-gold text-primary-foreground px-10 py-4 rounded-full uppercase tracking-widest text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Next Event
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 flex flex-col gap-12">
            <div className="border-b border-foreground/10 pb-10">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-bold">
                Our Philosophy
              </span>
              <h4 className="font-serif text-2xl mb-3 italic text-foreground">
                Mindful Connections
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed font-light italic">
                "We curate spaces where vulnerability becomes strength, and
                silence becomes a conversation."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <img
                  src={luxuryTea}
                  alt="Purposeful living"
                  className="w-full aspect-[4/5] object-cover mb-4"
                />
                <span className="text-[10px] uppercase tracking-widest text-gold">
                  Impact
                </span>
                <p className="text-xs mt-1 text-foreground">Purposeful Living</p>
              </div>
              <div className="flex flex-col pt-12">
                <img
                  src={plate}
                  alt="Elevated care"
                  className="w-full aspect-[4/5] object-cover mb-4"
                />
                <span className="text-[10px] uppercase tracking-widest text-gold">
                  Experience
                </span>
                <p className="text-xs mt-1 text-foreground">Elevated Care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
