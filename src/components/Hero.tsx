import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
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
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-8">
          November 2024 · Palm Springs, CA
        </p>

        <p className="text-foreground/80 leading-relaxed mb-10 max-w-lg mx-auto text-sm">
          A transformative wellness retreat blending elevated self-care, mindful
          connections, and purposeful living in an intimate desert oasis.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/rsvp"
            className="inline-block bg-gold text-primary-foreground px-8 py-3 rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            Apply to Attend
          </a>
          <a
            href="/login"
            className="inline-block bg-card/60 backdrop-blur text-foreground px-8 py-3 rounded-full text-sm font-medium tracking-wide hover:bg-card transition-colors"
          >
            Partner Login
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
