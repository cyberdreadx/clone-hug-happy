import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingEvent from "@/components/UpcomingEvent";
import Features from "@/components/Features";
import BrandStory from "@/components/BrandStory";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <UpcomingEvent />
      <BrandStory />
      <Connect />
      <Footer />
    </div>
  );
};

export default Index;
