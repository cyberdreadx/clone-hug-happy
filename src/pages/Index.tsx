import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingEvent from "@/components/UpcomingEvent";
import BrandStory from "@/components/BrandStory";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";
import waterfall from "@/assets/waterfall.jpg.asset.json";

const Index = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raf = requestAnimationFrame(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("section"));
      const targets = sections.slice(1); // skip hero
      targets.forEach((el) => el.classList.add("lux-reveal"));

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );

      targets.forEach((el) => io.observe(el));
      (window as any).__indexLuxIO = io;
    });

    return () => {
      cancelAnimationFrame(raf);
      const io = (window as any).__indexLuxIO as IntersectionObserver | undefined;
      io?.disconnect();
    };
  }, []);

  return (
    <div className="on-dark-bg min-h-screen relative">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${waterfall.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 bg-black/55 pointer-events-none" />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <UpcomingEvent />
        <BrandStory />
        <Connect />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
