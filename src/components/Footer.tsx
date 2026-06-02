const Footer = () => {
  return (
    <footer className="relative -mt-24 md:-mt-40 pt-4 pb-6 px-6 text-center">

      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm mb-4">
        <div className="text-center">
          <h4 className="font-serif text-foreground text-xs uppercase tracking-[0.2em] mb-2">Quick Links</h4>
          <ul className="flex gap-4 text-xs text-muted-foreground">
            <li><a href="#upcoming" className="hover:text-foreground transition-colors">Next Immersion</a></li>
            <li><a href="#connect" className="hover:text-foreground transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div className="text-center">
          <h4 className="font-serif text-foreground text-xs uppercase tracking-[0.2em] mb-2">Legal</h4>
          <ul className="flex gap-4 text-xs text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <p className="text-muted-foreground/70 text-[10px] tracking-wider">
        © 2024 Breathe &amp; Bloom. All rights reserved.
      </p>
    </footer>

  );
};

export default Footer;
