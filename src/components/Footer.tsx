const Footer = () => {
  return (
    <footer className="py-10 md:py-20 px-6 text-center">
      {/* Large logo */}
      <div className="relative mb-10 md:mb-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-card/30 blur-3xl" />
        </div>
        <h2 className="relative font-serif text-5xl md:text-7xl text-foreground/20 leading-tight">
          BREATHE<br />&amp; BLOOM
        </h2>
      </div>

      {/* Footer links */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left text-sm mb-12">
        <div>
          <h4 className="font-serif text-foreground mb-3">Breathe &amp; Bloom</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            A transformative wellness retreat experience in Palm Springs, California. Elevate your well-being and forge meaningful connections.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#experience" className="hover:text-foreground transition-colors">The Experience</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Partnership</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Apply to Attend</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-foreground mb-3">Legal</h4>
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
