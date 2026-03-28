import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Experience from "@/components/Experience";
import Audience from "@/components/Audience";
import WhyPartner from "@/components/WhyPartner";
import Partnership from "@/components/Partnership";
import Connect from "@/components/Connect";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Experience />
      <Audience />
      <WhyPartner />
      <Partnership />
      <Connect />
      <Footer />
    </div>
  );
};

export default Index;
