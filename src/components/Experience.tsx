const experiences = [
  { num: "01", title: "Welcome Ritual", desc: "Begin your journey with a grounding ceremony and intention-setting workshop." },
  { num: "02", title: "Yoga & Breathwork", desc: "Revitalizing movement and pranayama sessions led by world-class instructors." },
  { num: "03", title: "Curated Sauna Journeys", desc: "Cold plunge and infrared sauna rituals for deep restoration." },
  { num: "04", title: "Sound Bath", desc: "Deep meditative healing through crystal singing bowls and vibration therapy." },
  { num: "05", title: "Community & Discussion", desc: "Panel discussions on mindful living and building conscious enterprises." },
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 px-6 bg-section-light">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground text-center mb-3">What to Expect</p>
        <h2 className="font-serif text-3xl md:text-4xl text-center text-foreground mb-14">The Experience</h2>

        <div className="space-y-4">
          {experiences.map((e) => (
            <div
              key={e.num}
              className="bg-card/60 backdrop-blur rounded-lg px-8 py-6 flex items-start gap-6 hover:bg-card transition-colors"
            >
              <span className="text-gold font-serif text-xl font-semibold mt-0.5">{e.num}</span>
              <div>
                <h3 className="font-serif text-lg text-foreground mb-1">{e.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
