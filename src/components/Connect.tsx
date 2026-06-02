import { Mail, Phone } from "lucide-react";

const Connect = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/80 backdrop-blur rounded-2xl p-10 md:p-14 text-center shadow-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Let's Connect</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Ready to be part of something extraordinary? Reach out to learn more about partnership opportunities and attending Breathe &amp; Bloom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@breatheandbloom.com"
              className="inline-flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              hello@breatheandbloom.com
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              Schedule a Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connect;
