import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

const UpcomingEvent = () => {
  const { data: event } = useQuery({
    queryKey: ["active-event-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!event) return null;

  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <h3 className="font-serif text-lg text-foreground">{event.name}</h3>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            {event.date && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gold" />
                {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                {event.location}
              </span>
            )}
            {event.max_guests && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold" />
                {event.max_guests} spots
              </span>
            )}
          </div>
        </div>
        <Link
          to="/rsvp"
          className="shrink-0 bg-gold text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          RSVP Now
        </Link>
      </div>
    </section>
  );
};

export default UpcomingEvent;
