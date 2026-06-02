import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingEvent from "@/components/UpcomingEvent";
import BrandStory from "@/components/BrandStory";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";
import waterfall from "@/assets/waterfall.jpg.asset.json";

const Index = () => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.25; // gentle drift
        if (bgRef.current) {
          bgRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(1.08)`;
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="on-dark-bg min-h-screen relative overflow-hidden">
      {/* Parallax background layer — slightly oversized to hide drift edges */}
      <div
        ref={bgRef}
        aria-hidden
        className="fixed inset-0 -top-[10vh] -bottom-[10vh] pointer-events-none will-change-transform motion-reduce:transform-none"
        style={{
          backgroundImage: `url(${waterfall.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "translate3d(0,0,0) scale(1.08)",
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
