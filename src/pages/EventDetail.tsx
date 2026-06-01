import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Sparkles, Play, Music,
  Heart, MessageCircle, Coffee, Mic, Loader2, ExternalLink, Crown,
  ShieldCheck, CalendarPlus, Plus, Minus,
} from "lucide-react";
import { downloadICS } from "@/lib/calendar";
import heroFloralAsset from "@/assets/hero-floral-blurred.jpeg.asset.json";
const heroFloral = heroFloralAsset.url;
import teaDetail from "@/assets/luxury-tea-detail.jpg";
import alejandraAsset from "@/assets/host-alejandra.png.asset.json";
import carlaAsset from "@/assets/host-carla.jpg.asset.json";

const SEGMENT_ICONS: Record<string, typeof Play> = {
  welcome: Sparkles, breathwork: Play, sound: Music, integration: Heart,
  closing: MessageCircle, mingle: Coffee, partner: Mic, custom: Clock,
};

// Luxury wellness palette
const C = {
  cream: "#faf5ee",
  card: "#fdfaf4",
  blush: "#f5e6e0",
  blushDeep: "#ecd4cc",
  rose: "#c87a6f",      // primary CTA - dusty rose
  roseHover: "#b66a5f",
  champagne: "#e8d5b8",
  butter: "#f0dca0",
  sage: "#b8c4a8",
  taupe: "#8a7a6c",
  ink: "#3a2e26",       // body text deep brown
  inkSoft: "#5a4a3e",
  hairline: "#e8ddd0",
};

const EventDetail = () => {
  const { id } = useParams();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: event, isLoading } = useQuery({
    queryKey: ["public-event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).eq("status", "active").maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["public-segments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_flow_segments").select("*").eq("event_id", id!).order("segment_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: guestCount = 0 } = useQuery({
    queryKey: ["public-guest-count", id],
    queryFn: async () => {
      const { count, error } = await supabase.from("guests").select("*", { count: "exact", head: true }).eq("event_id", id!).in("status", ["confirmed", "checked_in"]);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const { data: sponsorsEnabled = true } = useQuery({
    queryKey: ["public-sponsors-enabled", id],
    queryFn: async () => {
      const { data } = await supabase.from("event_settings").select("setting_value").eq("event_id", id!).eq("setting_key", "sponsors_enabled").maybeSingle();
      return (data?.setting_value as boolean) !== false;
    },
    enabled: !!id,
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ["public-sponsors", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_sponsors").select("*").eq("event_id", id!).order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id && sponsorsEnabled,
  });

  const { data: ticketTiers = [] } = useQuery({
    queryKey: ["public-ticket-tiers", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket_tiers").select("*").eq("event_id", id!).in("status", ["active", "sold_out"]).order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: waiverSettings } = useQuery({
    queryKey: ["public-waiver", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_settings").select("setting_key, setting_value").eq("event_id", id!).in("setting_key", ["waiver_enabled", "waiver_type", "waiver_content", "waiver_required"]);
      if (error) throw error;
      const map: Record<string, any> = {};
      data?.forEach((row) => { map[row.setting_key] = row.setting_value; });
      return map;
    },
    enabled: !!id,
  });

  const waiverEnabled = waiverSettings?.waiver_enabled === true;
  const waiverRequired = waiverSettings?.waiver_required === true;
  const waiverType = waiverSettings?.waiver_type;
  const waiverContent = typeof waiverSettings?.waiver_content === "string" ? waiverSettings.waiver_content : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.taupe }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: C.cream }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: C.inkSoft }}>Event not found or not active</p>
          <Link to="/" className="text-sm mt-4 inline-block hover:opacity-80" style={{ color: C.rose }}>Back to home</Link>
        </div>
      </div>
    );
  }

  const totalMinutes = segments.reduce((sum, s: any) => sum + (s.duration_minutes || 0), 0);
  const spotsLeft = Math.max((event.max_guests || 100) - guestCount, 0);
  const highlights: { label: string; value: string }[] = Array.isArray((event as any).highlights) ? (event as any).highlights : [];
  const coverImage = (event as any).cover_image || heroFloral;

  const formatTime12 = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${m} ${hour < 12 ? "AM" : "PM"}`;
  };

  const getSegmentTime = (segIndex: number) => {
    if (!(event as any).time) return null;
    const [startH, startM] = (event as any).time.split(":").map(Number);
    let totalMins = startH * 60 + startM;
    for (let i = 0; i < segIndex; i++) totalMins += (segments[i] as any).duration_minutes || 0;
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return formatTime12(`${h}:${String(m).padStart(2, "0")}`);
  };

  const dateObj = event.date ? new Date(event.date + "T00:00:00") : null;
  const dateLong = dateObj?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const dateShort = dateObj?.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const faqs = [
    { q: "What should I bring?", a: "Just yourself, comfortable clothing, and an open heart. We provide everything else — mats, blankets, eye pillows, refreshments, and all journey materials." },
    { q: "What is the cancellation policy?", a: "Full refund up to 14 days before the event. Within 14 days, your ticket can be transferred to a future experience. Spaces are intimate and limited." },
    { q: "Is this beginner friendly?", a: "Absolutely. Our experiences are held with care for all levels — first-timers and seasoned practitioners alike. Facilitators guide you gently throughout." },
    { q: "Are food and drinks provided?", a: "Yes. Welcome drinks, light bites, and a closing tea are included. Please share any dietary preferences when you RSVP." },
    { q: "Can I come with a friend?", a: "Of course. Many guests come solo and leave with new connections, but you're welcome to invite someone special. Each guest needs their own ticket." },
  ];

  // -- decorative inline botanical marker (small sage flower)
  const Bloom = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2" fill={C.butter} />
      <g stroke={C.sage} strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 4 L12 8" /><path d="M12 16 L12 20" />
        <path d="M4 12 L8 12" /><path d="M16 12 L20 12" />
        <path d="M6.5 6.5 L9 9" /><path d="M15 15 L17.5 17.5" />
        <path d="M17.5 6.5 L15 9" /><path d="M9 15 L6.5 17.5" />
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.cream, color: C.ink, fontFamily: "'Inter', sans-serif" }}>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[88vh] flex flex-col">
        <img
          src={coverImage}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Soft cream wash + bottom fade */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.cream}cc 0%, ${C.blush}33 35%, ${C.cream}f5 100%)` }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 80% 20%, ${C.butter}30, transparent 50%)` }} />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
          <Link to="/" className="font-serif text-lg tracking-wide" style={{ color: C.ink }}>
            Breathe & Bloom
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.18em] uppercase" style={{ color: C.inkSoft }}>
            <a href="#experience" className="hover:opacity-70">Experience</a>
            <a href="#hosts" className="hover:opacity-70">Hosts</a>
            <a href="#pricing" className="hover:opacity-70">Pricing</a>
            <a href="#faq" className="hover:opacity-70">FAQ</a>
          </div>
          <Link
            to="/rsvp"
            className="text-xs tracking-[0.18em] uppercase px-5 py-2.5 rounded-full text-white transition-colors"
            style={{ backgroundColor: C.rose }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.roseHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.rose)}
          >
            Reserve
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-20 pb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Bloom className="w-4 h-4" />
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.taupe }}>
                A Curated Wellness Experience
              </p>
            </div>

            <h1 className="font-serif font-light leading-[0.95] tracking-tight mb-8" style={{ color: C.ink, fontSize: "clamp(3rem, 8vw, 6rem)" }}>
              <span>{event.name.split(" ").slice(0, -2).join(" ")} </span>
              <span style={{ color: C.rose }}>{event.name.split(" ").slice(-2, -1)[0]}</span>
              <br />
              <em className="italic font-light" style={{ color: C.rose }}>
                {event.name.split(" ").slice(-1)[0]}
              </em>
            </h1>

            {event.description && (
              <p className="text-base sm:text-lg leading-relaxed max-w-xl mb-10" style={{ color: C.inkSoft }}>
                {event.description}
              </p>
            )}

            {/* Detail pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {dateObj && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: `${C.card}b3`, border: `1px solid ${C.hairline}` }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: C.rose }} />
                  <span className="text-xs tracking-wide" style={{ color: C.ink }}>
                    {dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
              {(event as any).time && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: `${C.card}b3`, border: `1px solid ${C.hairline}` }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: C.rose }} />
                  <span className="text-xs tracking-wide" style={{ color: C.ink }}>{formatTime12((event as any).time)}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm" style={{ backgroundColor: `${C.card}b3`, border: `1px solid ${C.hairline}` }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: C.rose }} />
                  <span className="text-xs tracking-wide" style={{ color: C.ink }}>{event.location}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/rsvp"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-sm tracking-wide transition-all shadow-lg"
                style={{ backgroundColor: C.rose, boxShadow: `0 20px 40px -15px ${C.rose}66` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.roseHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.rose)}
              >
                Reserve Your Seat
              </Link>
              {dateObj && (
                <button
                  onClick={() => downloadICS({
                    name: event.name, date: event.date!,
                    time: (event as any).time, endTime: (event as any).end_time,
                    location: event.location, description: event.description,
                  })}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm tracking-wide transition-colors"
                  style={{ color: C.ink, border: `1px solid ${C.taupe}66`, backgroundColor: `${C.card}99` }}
                >
                  <CalendarPlus className="w-4 h-4" /> Save the Date
                </button>
              )}
            </div>

            {/* tiny meta row */}
            <div className="mt-10 flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase" style={{ color: C.taupe }}>
              <span>Intimate · {event.max_guests || 25} Seats</span>
              <span style={{ color: C.hairline }}>·</span>
              <span>All Levels Welcome</span>
              {spotsLeft > 0 && spotsLeft <= 20 && (
                <>
                  <span style={{ color: C.hairline }}>·</span>
                  <span style={{ color: C.rose }}>{spotsLeft} Spots Remaining</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ INTRO / ELEVATED ESCAPE ============ */}
      <section id="experience" className="px-6 sm:px-10 lg:px-20 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px w-8" style={{ backgroundColor: C.rose }} />
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.taupe }}>The Vision</p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05] mb-6" style={{ color: C.ink }}>
              An elevated wellness escape with{" "}
              <em className="italic" style={{ color: C.rose }}>tulum style + biohacking</em> energy.
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkSoft }}>
              A guided morning of somatic practices, movement, and recovery. In a private studio at SILA Miami, you'll move through breathwork, yoga, and contrast therapy.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkSoft }}>
              Tried and true methods for regulating the nervous system, lowering stress, and improving how you feel in your body.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: C.inkSoft }}>
              The session is structured to build resilience and help you manage stress under pressure. Each activity is designed to calm the nervous system, sharpen focus, and leave you feeling steadier and more grounded.
            </p>
            <p className="text-base leading-relaxed mb-10" style={{ color: C.inkSoft }}>
              Your reservation includes access to the red light therapy room, sauna, and cold plunge — recovery tools that support circulation, muscle recovery, and stress reduction.
            </p>

            {/* stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 pt-8 gap-y-6" style={{ borderTop: `1px solid ${C.hairline}` }}>
              {[
                { value: "4.5", suffix: "hrs", label: "Experience" },
                { value: "10", label: "Guests" },
                { value: "Women", label: "Only" },
                { value: "$150", label: "Investment" },

              ].map((s, i) => (
                <div
                  key={i}
                  className="px-5 py-2 text-center min-w-0"
                  style={{
                    borderLeft: i % 2 === 0 ? "none" : `1px solid ${C.hairline}`,
                  }}
                >
                  <p
                    className="font-serif font-light mb-2 leading-none flex items-baseline justify-center gap-1 whitespace-nowrap"
                    style={{ color: C.rose, fontSize: "clamp(1.55rem, 2.2vw, 1.9rem)" }}
                  >
                    <span>{s.value}</span>
                    {s.suffix && <span className="font-sans text-[0.42em] uppercase tracking-[0.16em]" style={{ color: C.taupe }}>{s.suffix}</span>}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.16em] uppercase leading-relaxed whitespace-nowrap"
                    style={{ color: C.taupe }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>


          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem]" style={{ background: `linear-gradient(135deg, ${C.blush} 0%, ${C.champagne} 100%)`, opacity: 0.5 }} />
            <img
              src={teaDetail}
              alt="Curated wellness detail"
              loading="lazy"
              className="relative rounded-[1.5rem] w-full aspect-[4/5] object-cover shadow-2xl"
            />
            {/* floating quote card */}
            <div className="absolute -bottom-6 -left-6 sm:-left-10 max-w-[260px] p-5 rounded-2xl shadow-xl" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
              <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: C.rose }}>Felt by Past Guests</p>
              <p className="font-serif italic text-sm leading-snug" style={{ color: C.ink }}>
                "I forgot the city existed. I'll be back for every single one."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE GRID — DESIGNED TO FEEL ============ */}
      <section className="px-6 sm:px-10 lg:px-20 py-24" style={{ backgroundColor: C.blush + "55" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-5">
              <Bloom className="w-4 h-4" />
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.taupe }}>The Experience</p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05]" style={{ color: C.ink }}>
              Designed to feel restorative, feminine, and{" "}
              <em className="italic" style={{ color: C.rose }}>beautifully considered.</em>
            </h2>
          </div>

          {highlights.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {highlights.map((h, i) => (
                <div key={i} className="p-7 rounded-2xl transition-transform hover:-translate-y-1" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: C.blush }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.rose }} />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.rose }}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-serif text-xl mb-2" style={{ color: C.ink }}>{h.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{h.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { t: "Breathwork", d: "A guided journey through somatic breath to release what no longer serves." },
                { t: "Red Light Therapy", d: "Cellular renewal in a soft, immersive glow before integration." },
                { t: "Sauna & Cold Plunge", d: "A contrast practice for clarity, vitality, and presence." },
                { t: "Guided Practices", d: "Held meditation, journaling prompts, and intention setting." },
                { t: "Welcome Drinks", d: "Botanical tonics and adaptogenic elixirs on arrival." },
                { t: "Silk Robes", d: "Slip into something soft. We've thought of everything." },
              ].map((s, i) => (
                <div key={i} className="p-7 rounded-2xl transition-transform hover:-translate-y-1" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: C.blush }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.rose }} />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.rose }}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-serif text-xl mb-2" style={{ color: C.ink }}>{s.t}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{s.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ AGENDA / GRACEFUL RHYTHM ============ */}
      {segments.length > 0 && (
        <section className="px-6 sm:px-10 lg:px-20 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.taupe }}>The Flow</p>
              <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05]" style={{ color: C.ink }}>
                A graceful rhythm from arrival to <em className="italic" style={{ color: C.rose }}>integration.</em>
              </h2>
            </div>

            <div className="space-y-0">
              {segments.map((seg: any, idx: number) => {
                const startTime = getSegmentTime(idx);
                return (
                  <div
                    key={seg.id}
                    className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-6 py-6"
                    style={{ borderBottom: idx < segments.length - 1 ? `1px solid ${C.hairline}` : "none" }}
                  >
                    <div className="text-xs tracking-wider pt-1" style={{ color: C.rose }}>
                      {startTime || `${seg.duration_minutes}m`}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl mb-1.5" style={{ color: C.ink }}>{seg.title}</h3>
                      {seg.description && (
                        <p className="text-sm leading-relaxed mb-2" style={{ color: C.inkSoft }}>{seg.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: C.taupe }}>
                        <span>{seg.duration_minutes} min</span>
                        {seg.facilitator && (
                          <>
                            <span>·</span>
                            {seg.facilitator_instagram ? (
                              <a
                                href={`https://instagram.com/${seg.facilitator_instagram}`}
                                target="_blank" rel="noopener noreferrer"
                                className="hover:underline italic"
                                style={{ color: C.rose }}
                              >
                                Led by {seg.facilitator}
                              </a>
                            ) : (
                              <span className="italic">Led by {seg.facilitator}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ HOSTS ============ */}
      <section id="hosts" className="px-6 sm:px-10 lg:px-20 py-24" style={{ backgroundColor: C.champagne + "40" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.taupe }}>Your Hosts</p>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05] max-w-3xl mx-auto" style={{ color: C.ink }}>
              Hosted by women who blend emotional depth with{" "}
              <em className="italic" style={{ color: C.rose }}>elevated care.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: "Alejandra Arias",
                role: "Host & Breathwork Guide",
                photo: alejandraAsset.url,
                bio: "Alejandra leads breathwork and somatic sessions with a trauma-informed approach. Her focus is practical: using breath and movement to help women manage stress and feel more at ease in their bodies.",
              },
              {
                name: "Carla Masquida",
                role: "Host & Vinyasa Yoga Teacher",
                photo: carlaAsset.url,
                bio: "Carla teaches vinyasa yoga focused on strength, mobility, and breath. Her classes are approachable and grounded, helping women build physical resilience and move with confidence.",
              },
            ].map((h, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl"
                style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                  <img
                    src={h.photo}
                    alt={`Portrait of ${h.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ filter: "grayscale(20%)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(180deg, transparent 55%, ${C.ink}66 100%)` }}
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-serif text-2xl" style={{ color: C.ink }}>{h.name}</h3>
                  <p className="text-[10px] tracking-[0.25em] uppercase mb-4 mt-1" style={{ color: C.rose }}>{h.role}</p>
                  <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{h.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING + DETAILS ============ */}
      <section id="pricing" className="px-6 sm:px-10 lg:px-20 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
          {/* Pricing cards */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.taupe }}>Reserve Your Seat</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-8 leading-tight" style={{ color: C.ink }}>
              Choose your <em className="italic" style={{ color: C.rose }}>arrival</em>.
            </h2>

            {ticketTiers.length > 0 ? ticketTiers.map((tier: any) => {
              const isSoldOut = tier.status === "sold_out" || (tier.capacity && tier.sold_count >= tier.capacity);
              const spotsRemaining = tier.capacity ? Math.max(tier.capacity - tier.sold_count, 0) : null;
              return (
                <div key={tier.id} className="p-7 rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <div>
                      <h3 className="font-serif text-2xl mb-1" style={{ color: C.ink }}>{tier.name}</h3>
                      {tier.description && <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{tier.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-3xl" style={{ color: C.rose }}>
                        {tier.price > 0 ? `$${Number(tier.price).toFixed(0)}` : "Free"}
                      </p>
                    </div>
                  </div>
                  {spotsRemaining !== null && !isSoldOut && spotsRemaining <= 10 && (
                    <p className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: C.rose }}>
                      Only {spotsRemaining} remaining
                    </p>
                  )}
                  {isSoldOut ? (
                    <span className="inline-block w-full text-center py-3 rounded-full text-sm" style={{ backgroundColor: C.hairline, color: C.taupe }}>
                      Sold Out
                    </span>
                  ) : (
                    <Link
                      to="/rsvp"
                      className="inline-flex items-center justify-center w-full py-3.5 rounded-full text-white text-sm tracking-wide transition-colors"
                      style={{ backgroundColor: C.rose }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.roseHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.rose)}
                    >
                      Claim Your Seat
                    </Link>
                  )}
                </div>
              );
            }) : (
              <div className="p-7 rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.rose }}>General Admission</p>
                <p className="font-serif text-4xl mb-3" style={{ color: C.rose }}>
                  {(event as any).ticket_price ? `$${Number((event as any).ticket_price).toFixed(0)}` : "By Invitation"}
                </p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: C.inkSoft }}>
                  Includes full programming, welcome drinks, refreshments, and all journey materials.
                </p>
                <Link
                  to="/rsvp"
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-full text-white text-sm tracking-wide transition-colors"
                  style={{ backgroundColor: C.rose }}
                >
                  Request Invitation
                </Link>
              </div>
            )}
          </div>

          {/* Thoughtful details */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl h-full" style={{ background: `linear-gradient(160deg, ${C.blush}80, ${C.champagne}50)`, border: `1px solid ${C.hairline}` }}>
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.taupe }}>Included With Care</p>
              <h3 className="font-serif text-2xl sm:text-3xl leading-tight mb-6" style={{ color: C.ink }}>
                Thoughtful details for a <em className="italic" style={{ color: C.rose }}>seamless arrival.</em>
              </h3>
              <ul className="space-y-3">
                {[
                  "Welcome drinks upon arrival",
                  "Adaptogenic tonics and herbal teas",
                  "Silk eye pillows and warm blankets",
                  "Curated playlist & professional sound",
                  "Light, nourishing closing bites",
                  "A small parting gift to take home",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.inkSoft }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.rose }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="px-6 sm:px-10 lg:px-20 py-24" style={{ backgroundColor: C.blush + "30" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: C.taupe }}>Good to Know</p>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05]" style={{ color: C.ink }}>
              Everything you may want to know before <em className="italic" style={{ color: C.rose }}>reserving.</em>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-serif text-lg" style={{ color: C.ink }}>{f.q}</span>
                    {open ? (
                      <Minus className="w-4 h-4 shrink-0" style={{ color: C.rose }} />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0" style={{ color: C.rose }} />
                    )}
                  </button>
                  {open && (
                    <div className="px-6 pb-6 -mt-1">
                      <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SPONSORS (kept, restyled) ============ */}
      {sponsorsEnabled && sponsors.length > 0 && (
        <section className="px-6 sm:px-10 lg:px-20 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: C.taupe }}>In Beautiful Partnership With</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 mt-8">
              {sponsors.map((s: any) => (
                <a
                  key={s.id}
                  href={s.website_url || s.cta_link || undefined}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 transition-opacity hover:opacity-70"
                >
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="h-10 w-auto object-contain opacity-80" />
                  ) : (
                    <span className="font-serif text-xl" style={{ color: C.ink }}>{s.name}</span>
                  )}
                  {s.is_main && (
                    <span className="text-[9px] tracking-[0.3em] uppercase flex items-center gap-1" style={{ color: C.rose }}>
                      <Crown className="w-3 h-3" /> Featured
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ WAIVER (kept, soft restyle) ============ */}
      {waiverEnabled && waiverContent && (
        <section className="px-6 sm:px-10 lg:px-20 py-12">
          <div className="max-w-3xl mx-auto p-6 rounded-2xl flex items-start gap-4" style={{ backgroundColor: C.card, border: `1px solid ${C.hairline}` }}>
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.rose }} />
            <div className="flex-1">
              <p className="font-serif text-lg mb-1" style={{ color: C.ink }}>
                Waiver {waiverRequired && <span className="text-[10px] tracking-[0.25em] uppercase ml-2" style={{ color: C.rose }}>Required</span>}
              </p>
              {waiverType === "link" ? (
                <a href={waiverContent} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline inline-flex items-center gap-1" style={{ color: C.rose }}>
                  Review waiver <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.inkSoft }}>{waiverContent}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ FINAL CTA ============ */}
      <section className="px-6 sm:px-10 lg:px-20 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] px-8 sm:px-16 py-20 text-center"
          style={{ background: `linear-gradient(135deg, ${C.blush} 0%, ${C.champagne} 50%, ${C.butter}80 100%)` }}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: C.rose, opacity: 0.15 }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ backgroundColor: C.sage, opacity: 0.18 }} />

          <div className="relative">
            <Bloom className="w-6 h-6 mx-auto mb-6" />
            <p className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: C.taupe }}>Your Seat Awaits</p>
            <h2 className="font-serif text-4xl sm:text-6xl leading-[0.95] mb-6" style={{ color: C.ink }}>
              Come as you are. <br />
              <em className="italic" style={{ color: C.rose }}>Leave restored.</em>
            </h2>
            <p className="max-w-lg mx-auto text-base leading-relaxed mb-10" style={{ color: C.inkSoft }}>
              Spaces are intimate and held with care. Reserve your seat for {event.name}
              {dateShort && <> on <span style={{ color: C.ink }}>{dateShort}</span></>}.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/rsvp"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white text-sm tracking-wide transition-colors shadow-xl"
                style={{ backgroundColor: C.rose, boxShadow: `0 20px 40px -15px ${C.rose}99` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.roseHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.rose)}
              >
                Reserve Your Seat
              </Link>
              {dateObj && (
                <button
                  onClick={() => downloadICS({
                    name: event.name, date: event.date!,
                    time: (event as any).time, endTime: (event as any).end_time,
                    location: event.location, description: event.description,
                  })}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide transition-colors"
                  style={{ color: C.ink, border: `1px solid ${C.taupe}66`, backgroundColor: `${C.card}99` }}
                >
                  <CalendarPlus className="w-4 h-4" /> Save the Date
                </button>
              )}
            </div>

            {spotsLeft > 0 && spotsLeft <= 20 && (
              <p className="mt-8 text-[10px] tracking-[0.35em] uppercase" style={{ color: C.rose }}>
                <Users className="w-3 h-3 inline mr-1.5" />
                Only {spotsLeft} {spotsLeft === 1 ? "Seat" : "Seats"} Remaining
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="px-6 sm:px-10 lg:px-20 py-14 text-center" style={{ borderTop: `1px solid ${C.hairline}` }}>
        <p className="font-serif text-2xl mb-2" style={{ color: C.ink }}>
          Breathe <em className="italic" style={{ color: C.rose }}>&</em> Bloom
        </p>
        <p className="text-[10px] tracking-[0.35em] uppercase mb-6" style={{ color: C.taupe }}>
          Curated Wellness · Held with Intention
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-xs hover:opacity-70" style={{ color: C.inkSoft }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all experiences
        </Link>
      </footer>
    </div>
  );
};

export default EventDetail;
