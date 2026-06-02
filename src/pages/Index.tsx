import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingEvent from "@/components/UpcomingEvent";
import BrandStory from "@/components/BrandStory";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";
import waterfall from "@/assets/waterfall.jpg.asset.json";

const Index = () => {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${waterfall.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
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
