import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import heroFloral from "@/assets/hero-floral-blurred.jpeg.asset.json";
import sectionBg from "@/assets/hero-bg.jpeg.asset.json";

const UpcomingEvent = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["active-events-editorial"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .gte("date", today)
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const eventIds = events.map((e) => e.id);
  const { data: mainSponsors = [] } = useQuery({
    queryKey: ["main-sponsors-editorial", eventIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sponsors")
        .select("*")
        .in("event_id", eventIds)
        .eq("is_main", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: eventIds.length > 0,
  });

  const sponsorByEvent = mainSponsors.reduce<Record<string, any>>((acc, s) => {
    if (!acc[s.event_id]) acc[s.event_id] = s;
    return acc;
  }, {});

  if (isLoading || !events.length) return null;

  const [featured, ...rest] = events;
  const featuredSponsor = sponsorByEvent[featured.id];

  const longDate = (date: string | null, time: string | null) => {
    if (!date) return null;
    const d = new Date(date + "T12:00:00");
    const dateStr = format(d, "EEEE, MMMM d, yyyy");
    if (!time) return dateStr;
    const [h, m] = time.split(":").map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    return `${dateStr} · ${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const shortDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date + "T12:00:00"), "MMM d, yyyy");
  };

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="relative max-w-6xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold mb-4">
            The Calendar
          </span>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground italic leading-tight">
            Upcoming Experiences
          </h2>
          <div className="w-12 h-px bg-foreground/20 mt-8" />
        </div>

        {/* Featured event — editorial feature */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
          <Link
            to={`/event/${featured.id}`}
            className="lg:col-span-7 group block relative overflow-hidden"
          >
            <img
              src={featured.cover_image && featured.cover_image.trim() ? featured.cover_image : heroFloral.url}
              alt={featured.name}
              className="w-full aspect-[5/4] object-cover transition-transform duration-700 group-hover:scale-[1.02] rounded-2xl"
            />
            <span className="absolute top-6 left-6 bg-card/95 backdrop-blur px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-foreground">
              Next Gathering
            </span>
          </Link>

          <div className="lg:col-span-5">
            <h3 className="font-serif text-4xl md:text-5xl text-lime-950 leading-[1.1] mb-6">
              {featured.name}
            </h3>
            {featured.description && (
              <p className="text-base text-foreground/70 font-light leading-relaxed mb-8 max-w-md">
                {featured.description}
              </p>
            )}

            <dl className="space-y-3 mb-10 text-sm">
              {featured.date && (
                <div className="flex gap-4">
                  <dt className="text-[10px] uppercase tracking-widest text-foreground/40 w-20 pt-1">
                    Date
                  </dt>
                  <dd className="text-foreground/80 font-light">
                    {longDate(featured.date, featured.time)}
                  </dd>
                </div>
              )}
              {featured.location && (
                <div className="flex gap-4">
                  <dt className="text-[10px] uppercase tracking-widest text-foreground/40 w-20 pt-1">
                    Venue
                  </dt>
                  <dd className="text-foreground/80 font-light">
                    {featured.location}
                  </dd>
                </div>
              )}
              {(featured as any).ticket_price != null && (
                <div className="flex gap-4">
                  <dt className="text-[10px] uppercase tracking-widest text-foreground/40 w-20 pt-1">
                    From
                  </dt>
                  <dd className="text-foreground font-medium">
                    ${Number((featured as any).ticket_price).toFixed(0)}
                  </dd>
                </div>
              )}
            </dl>

            <Link
              to={`/event/${featured.id}`}
              className="inline-block bg-gold text-primary-foreground px-10 py-4 rounded-full uppercase tracking-[0.25em] text-xs hover:opacity-90 transition-opacity"
            >
              Reserve Your Place
            </Link>

            {featuredSponsor && (
              <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-foreground/40 font-light italic">
                In partnership with{" "}
                <span className="text-foreground/70 not-italic">
                  {featuredSponsor.name}
                </span>
              </p>
            )}
          </div>
        </article>

        {/* Additional events — quiet hairline list */}
        {rest.length > 0 && (
          <div className="border-t border-foreground/10 pt-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-8 text-center">
              Also On The Calendar
            </p>
            <ul className="divide-y divide-foreground/10">
              {rest.map((event) => (
                <li key={event.id}>
                  <Link
                    to={`/event/${event.id}`}
                    className="group grid grid-cols-12 gap-6 items-baseline py-6 hover:bg-foreground/[0.02] transition-colors -mx-4 px-4"
                  >
                    <span className="col-span-3 text-[11px] uppercase tracking-[0.25em] text-gold pt-1">
                      {shortDate(event.date)}
                    </span>
                    <h4 className="col-span-12 sm:col-span-6 font-serif text-2xl text-foreground leading-snug group-hover:italic transition-all">
                      {event.name}
                    </h4>
                    <span className="col-span-12 sm:col-span-3 text-xs text-foreground/60 font-light text-left sm:text-right">
                      {event.location?.split(",")[0]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvent;
