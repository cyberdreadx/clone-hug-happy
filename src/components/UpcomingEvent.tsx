import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

const UpcomingEvent = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["active-events-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (!events.length) return null;

  // Gradient colors for cards without images
  const gradients = [
    "from-[hsl(80,25%,72%)] to-[hsl(80,20%,82%)]",
    "from-[hsl(42,35%,65%)] to-[hsl(42,30%,78%)]",
    "from-[hsl(160,18%,72%)] to-[hsl(160,15%,82%)]",
    "from-[hsl(30,25%,70%)] to-[hsl(30,20%,82%)]",
  ];

  const formatDate = (date: string | null, time: string | null) => {
    if (!date) return null;
    const d = new Date(date + "T00:00:00");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeStr = time ? ` at ${time}` : "";
    return `${dayName}, ${monthDay}${timeStr}`;
  };

  const shortLocation = (loc: string | null) => {
    if (!loc) return null;
    // Take city-level info (first 2 comma segments)
    const parts = loc.split(",").map((s) => s.trim());
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : loc;
  };

  return (
    <section className="py-16 px-6 bg-section-light">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Don't Miss Out
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              Upcoming Events
            </h2>
          </div>
          {events.length > 2 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event, i) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="group flex-shrink-0 w-72 sm:w-80 snap-start"
            >
              {/* Card visual */}
              <div
                className={`relative h-64 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} overflow-hidden mb-4`}
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-[0.08]">
                  <div className="absolute top-6 left-6 w-20 h-20 border-2 border-foreground rounded-full" />
                  <div className="absolute bottom-8 right-8 w-32 h-32 border-2 border-foreground rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-foreground rotate-45" />
                </div>

                {/* Event name overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="font-serif text-2xl text-foreground leading-tight group-hover:translate-x-1 transition-transform">
                    {event.name}
                  </h3>
                </div>

                {/* Date badge */}
                {event.date && (
                  <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-foreground">
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {event.date && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-gold" />
                      {formatDate(event.date, event.time)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        {shortLocation(event.location)}
                      </span>
                    )}
                  </div>
                  {event.max_guests && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {event.max_guests} spots
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvent;
