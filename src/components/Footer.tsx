import logoAsset from "@/assets/breathe-bloom-logo.png.asset.json";

const Footer = () => {
  return (
    <footer className="py-8 md:py-12 px-6 text-center">
      {/* Large transparent logo */}
      <div className="relative mb-6 md:mb-8 flex items-center justify-center">
        <div className="absolute w-64 h-64 rounded-full bg-card/30 blur-3xl" />
        <img
          src={logoAsset.url}
          alt="Breathe & Bloom"
          className="relative w-48 md:w-72 h-auto opacity-30 mix-blend-screen select-none pointer-events-none"
        />
      </div>

      {/* Footer links — centered, balanced */}
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-sm mb-8">
        <div className="text-center">
          <h4 className="font-serif text-foreground mb-3 tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#upcoming" className="hover:text-foreground transition-colors">Next Immersion</a></li>
            <li><a href="#connect" className="hover:text-foreground transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div className="text-center">
          <h4 className="font-serif text-foreground mb-3 tracking-wide">Legal</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>


      <p className="text-muted-foreground text-xs">
        © 2024 Breathe &amp; Bloom. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
