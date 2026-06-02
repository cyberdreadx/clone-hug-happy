import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
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
    <section className="relative w-full py-20 md:py-28 px-6 md:px-10">

      <div className="relative max-w-6xl mx-auto">
        {/* Editorial header */}
        <header className="flex flex-col items-center text-center mb-20">
          <img
            src={logo.url}
            alt="Breathe & Bloom"
            className="w-[28rem] md:w-[40rem] lg:w-[52rem] max-w-full h-auto my-0 object-contain"
          />

          {nextEvent && (
            <Link
              to={`/event/${nextEvent.id}`}
              className="group mt-10 inline-flex items-center gap-3 bg-blush hover:bg-blush/90 text-blush-foreground px-8 py-4 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-70">
                Next Immersion
              </span>
              <span className="font-serif italic text-lg">
                {nextEvent.name}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl max-w-4xl leading-[1.15] italic font-light text-foreground mt-10">
            "An immersion for the modern seeker — blending elevated self-care,
            breathwork, mindful connections, and purposeful living in nature and
            intimate spaces."
          </blockquote>
        </header>

      </div>
    </section>
  );
};

export default Hero;
