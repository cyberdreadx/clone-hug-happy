import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Sparkles, Play, Music,
  Heart, MessageCircle, Coffee, Mic, Loader2, Info,
} from "lucide-react";

const SEGMENT_ICONS: Record<string, typeof Play> = {
  welcome: Sparkles, breathwork: Play, sound: Music, integration: Heart,
  closing: MessageCircle, mingle: Coffee, partner: Mic, custom: Clock,
};

const EventDetail = () => {
  const { id } = useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["public-segments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_flow_segments")
        .select("*")
        .eq("event_id", id!)
        .order("segment_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: guestCount = 0 } = useQuery({
    queryKey: ["public-guest-count", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("guests")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .in("status", ["confirmed", "checked_in"]);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-section-light flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-section-light flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Event not found or not active</p>
          <Link to="/" className="text-gold text-sm mt-4 inline-block hover:opacity-80">Back to home</Link>
        </div>
      </div>
    );
  }

  const totalMinutes = segments.reduce((sum, s: any) => sum + (s.duration_minutes || 0), 0);
  const spotsLeft = Math.max((event.max_guests || 100) - guestCount, 0);
  const highlights: { label: string; value: string }[] = Array.isArray((event as any).highlights) ? (event as any).highlights : [];

  const formatTime12 = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${hour < 12 ? "AM" : "PM"}`;
  };

  // Calculate segment start times from event time
  const getSegmentTime = (segIndex: number) => {
    if (!(event as any).time) return null;
    const [startH, startM] = (event as any).time.split(":").map(Number);
    let totalMins = startH * 60 + startM;
    for (let i = 0; i < segIndex; i++) {
      totalMins += (segments[i] as any).duration_minutes || 0;
    }
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return formatTime12(`${h}:${String(m).padStart(2, "0")}`);
  };

  const getSegmentEndTime = (segIndex: number) => {
    if (!(event as any).time) return null;
    const [startH, startM] = (event as any).time.split(":").map(Number);
    let totalMins = startH * 60 + startM;
    for (let i = 0; i <= segIndex; i++) {
      totalMins += (segments[i] as any).duration_minutes || 0;
    }
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return formatTime12(`${h}:${String(m).padStart(2, "0")}`);
  };

  return (
    <div className="min-h-screen bg-section-light">
      {/* Cover Image */}
      {(event as any).cover_image && (
        <div className="w-full h-64 md:h-80 relative">
          <img src={(event as any).cover_image} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/80 text-sm hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {!(event as any).cover_image && (
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          )}

          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Upcoming Experience</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{event.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {event.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
            {(event as any).time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatTime12((event as any).time)}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mt-4 max-w-xl">{event.description}</p>
          )}

          <div className="flex items-center gap-6 mt-6">
            <Link
              to="/rsvp"
              className="inline-flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Request Invitation
            </Link>
            <span className="text-sm text-muted-foreground">
              <Users className="w-4 h-4 inline mr-1" />
              {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Waitlist only"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Good to Know */}
        {highlights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif text-2xl text-foreground">Good to Know</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((h, i) => (
                <div key={i} className="bg-card border border-border rounded-xl px-5 py-4">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">{h.label}</p>
                  <p className="text-foreground text-sm">{h.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda / Event Flow */}
        {segments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">Schedule</p>
                <h2 className="font-serif text-2xl text-foreground">Agenda</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                {Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)}h ` : ""}{totalMinutes % 60}m
              </span>
            </div>

            <div className="space-y-3">
              {segments.map((seg: any, idx: number) => {
                const Icon = SEGMENT_ICONS[seg.segment_type] || Clock;
                const startTime = getSegmentTime(idx);
                const endTime = getSegmentEndTime(idx);
                return (
                  <div key={seg.id} className="bg-card border border-border rounded-xl px-5 py-4">
                    {startTime && (
                      <p className="text-xs text-muted-foreground/60 mb-2">
                        {startTime} – {endTime}
                      </p>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-section-light flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{seg.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-muted-foreground text-xs">{seg.duration_minutes} min</span>
                          {seg.facilitator && (
                            <span className="text-muted-foreground text-xs">Led by {seg.facilitator}</span>
                          )}
                        </div>
                        {seg.description && (
                          <p className="text-muted-foreground/60 text-sm mt-2">{seg.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
