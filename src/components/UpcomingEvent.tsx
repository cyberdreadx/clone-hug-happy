import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

const UpcomingEvent = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data: events = [], isLoading } = useQuery({
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

  useEffect(() => {
    if (events.length) {
      setTimeout(updateScrollButtons, 100);
    }
  }, [events]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (!events.length && !isLoading) return null;

  const formatDate = (date: string | null, time: string | null) => {
    if (!date) return null;
    const d = new Date(date + "T00:00:00");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let timeStr = "";
    if (time) {
      const [h, m] = time.split(":").map(Number);
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      timeStr = ` · ${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
    }
    return `${dayName}, ${monthDay}${timeStr}`;
  };

  const shortLocation = (loc: string | null) => {
    if (!loc) return null;
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
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="group flex-shrink-0 w-72 sm:w-80 snap-start"
            >
              {/* Card container */}
              <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                {/* Image area */}
                <div className="relative h-48 bg-muted">
                  {event.cover_image ? (
                    <img
                      src={event.cover_image}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/30">
                      <span className="font-serif text-2xl text-muted-foreground/40">
                        {event.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 space-y-2.5">
                  <h3 className="font-serif text-lg text-foreground leading-snug line-clamp-2">
                    {event.name}
                  </h3>

                  {event.date && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5 text-gold shrink-0" />
                      {formatDate(event.date, event.time)}
                    </p>
                  )}

                  {event.location && (
                    <p className="flex items-center gap-1.5 text-sm text-gold">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {shortLocation(event.location)}
                    </p>
                  )}

                  {(event as any).ticket_price != null && (
                    <p className="text-sm font-semibold text-foreground pt-1">
                      From ${Number((event as any).ticket_price).toFixed(2)}
                    </p>
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
