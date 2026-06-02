import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import luxuryTea from "@/assets/luxury-tea-detail.jpg";
import plate from "@/assets/plate.jpg";
import heroBg from "@/assets/hero-wheat-field.jpeg.asset.json";
import logo from "@/assets/breathe-bloom-logo.png.asset.json";

const Hero = () => {
  const { data: nextEvent } = useQuery({
    queryKey: ["hero-next-event"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("id, name")
        .eq("status", "active")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });


  return (
    <section
      className="relative w-full py-20 md:py-28 px-6 md:px-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg.url})` }}
    >
      {/* Cream wash for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-hero/85 via-hero/75 to-hero/95" />
      <div className="relative max-w-6xl mx-auto">
        {/* Editorial header */}
        <header className="flex flex-col items-center text-center mb-20">
          <img
            src={logo.url}
            alt="Breathe & Bloom"
            className="w-[28rem] md:w-[40rem] lg:w-[52rem] max-w-full h-auto my-0 object-contain"
          />

          <h2 className="uppercase tracking-[0.4em] text-[10px] text-gold font-semibold mb-6 italic">
            Wellness · Community · Impact
          </h2>

          <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl max-w-4xl leading-[1.15] italic font-light text-foreground">
            "A transformative retreat for the modern seeker — blending elevated
            self-care, mindful connections, and purposeful living in an intimate
            desert oasis."
          </blockquote>
        </header>

        {/* Editorial second half — philosophy + image diptych */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-t border-foreground/10 pt-16">
          <div className="lg:col-span-5 lg:col-start-1">
            <span className="block text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-bold">
              Our Philosophy
            </span>
            <h4 className="font-serif text-3xl md:text-4xl mb-5 italic text-foreground leading-tight">
              Mindful Connections
            </h4>
            <p className="text-base text-foreground/70 leading-relaxed font-light italic max-w-md">
              "We curate spaces where vulnerability becomes strength, and
              silence becomes a conversation."
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-6">
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
    </section>
  );
};

export default Hero;
