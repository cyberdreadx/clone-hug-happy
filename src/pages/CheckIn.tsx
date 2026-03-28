import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search, CheckCircle2, Users, Clock, ArrowLeft, Loader2, UserCheck, XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Get the active event
  const { data: activeEvent } = useQuery({
    queryKey: ["checkin-active-event"],
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

  // Get guests for the active event
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["checkin-guests", activeEvent?.id],
    queryFn: async () => {
      if (!activeEvent?.id) return [];
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", activeEvent.id)
        .order("last_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!activeEvent?.id,
    refetchInterval: 10000, // Auto-refresh every 10s
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!activeEvent?.id) return;
    const channel = supabase
      .channel("checkin-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guests", filter: `event_id=eq.${activeEvent.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["checkin-guests", activeEvent.id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeEvent?.id, queryClient]);

  const stats = useMemo(() => {
    const checkedIn = guests.filter((g: any) => g.status === "checked_in").length;
    const confirmed = guests.filter((g: any) => g.status === "confirmed").length;
    const total = guests.length;
    const capacity = activeEvent?.max_guests || 100;
    return { checkedIn, confirmed, total, capacity };
  }, [guests, activeEvent]);

  const filtered = useMemo(() => {
    if (!search.trim()) return guests;
    const q = search.toLowerCase();
    return guests.filter((g: any) =>
      `${g.first_name} ${g.last_name} ${g.email} ${g.company || ""}`.toLowerCase().includes(q)
    );
  }, [guests, search]);

  const handleCheckIn = async (guest: any) => {
    if (guest.status === "checked_in") return;
    setCheckingIn(guest.id);
    try {
      const { error } = await supabase
        .from("guests")
        .update({ status: "checked_in", check_in_time: new Date().toISOString() })
        .eq("id", guest.id);
      if (error) throw error;
      toast.success(`${guest.first_name} ${guest.last_name} checked in!`);
      queryClient.invalidateQueries({ queryKey: ["checkin-guests", activeEvent?.id] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleUndoCheckIn = async (guest: any) => {
    setCheckingIn(guest.id);
    try {
      const { error } = await supabase
        .from("guests")
        .update({ status: "confirmed", check_in_time: null })
        .eq("id", guest.id);
      if (error) throw error;
      toast.success(`Reverted ${guest.first_name}'s check-in`);
      queryClient.invalidateQueries({ queryKey: ["checkin-guests", activeEvent?.id] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingIn(null);
    }
  };

  const progressPercent = stats.capacity > 0 ? Math.min((stats.checkedIn / stats.capacity) * 100, 100) : 0;

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-[hsl(var(--sidebar-background))] flex items-center justify-center p-6">
        <div className="text-center">
          <Users className="w-12 h-12 text-[hsl(var(--sidebar-foreground))]/20 mx-auto mb-4" />
          <p className="text-[hsl(var(--sidebar-foreground))]/40 text-lg">No active event</p>
          <button onClick={() => navigate("/admin")} className="mt-4 text-sm text-[hsl(var(--sidebar-ring))] hover:underline">
            Go to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--sidebar-background))] flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-2 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]/40">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg text-[hsl(var(--sidebar-foreground))]">Check-In</h1>
              <p className="text-[hsl(var(--sidebar-foreground))]/40 text-xs">{activeEvent.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif text-[hsl(var(--sidebar-foreground))]">
              {stats.checkedIn}<span className="text-[hsl(var(--sidebar-foreground))]/30">/{stats.capacity}</span>
            </p>
            <p className="text-[hsl(var(--sidebar-foreground))]/40 text-[10px] uppercase tracking-wider">Checked In</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-[hsl(var(--sidebar-accent))] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: progressPercent > 90 ? "hsl(0, 72%, 51%)" : progressPercent > 70 ? "hsl(45, 93%, 47%)" : "hsl(142, 71%, 45%)",
            }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Checked In", value: stats.checkedIn, icon: UserCheck, color: "hsl(142, 71%, 45%)" },
            { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "hsl(217, 91%, 60%)" },
            { label: "Total RSVPs", value: stats.total, icon: Users, color: "hsl(var(--sidebar-foreground))" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[hsl(var(--sidebar-accent))] p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-xl font-serif text-[hsl(var(--sidebar-foreground))]">{s.value}</p>
              <p className="text-[hsl(var(--sidebar-foreground))]/30 text-[10px] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--sidebar-foreground))]/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[hsl(var(--sidebar-accent))] border border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))] text-base placeholder:text-[hsl(var(--sidebar-foreground))]/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))]/50"
          />
        </div>
      </header>

      {/* Guest List */}
      <main className="flex-1 overflow-auto px-4 sm:px-6 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--sidebar-foreground))]/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[hsl(var(--sidebar-foreground))]/30">
              {search ? "No guests match your search" : "No guests for this event"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((guest: any) => {
              const isCheckedIn = guest.status === "checked_in";
              const isLoading = checkingIn === guest.id;
              return (
                <button
                  key={guest.id}
                  onClick={() => isCheckedIn ? handleUndoCheckIn(guest) : handleCheckIn(guest)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] text-left ${
                    isCheckedIn
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))]/50 active:bg-[hsl(var(--sidebar-accent))]"
                  }`}
                >
                  {/* Status indicator */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    isCheckedIn ? "bg-green-500/20" : "bg-[hsl(var(--sidebar-accent))]"
                  }`}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--sidebar-foreground))]/40" />
                    ) : isCheckedIn ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <span className="text-[hsl(var(--sidebar-foreground))] font-serif text-sm">
                        {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Guest info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-base ${isCheckedIn ? "text-green-400" : "text-[hsl(var(--sidebar-foreground))]"}`}>
                      {guest.first_name} {guest.last_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {guest.company && (
                        <span className="text-[hsl(var(--sidebar-foreground))]/40 text-xs truncate">{guest.company}</span>
                      )}
                      {guest.dietary_requirements && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                          {guest.dietary_requirements}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Check-in time */}
                  {isCheckedIn && guest.check_in_time && (
                    <div className="text-right shrink-0">
                      <p className="text-green-400/60 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(guest.check_in_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  )}

                  {/* Tap hint */}
                  {!isCheckedIn && !isLoading && (
                    <span className="text-[hsl(var(--sidebar-foreground))]/20 text-xs shrink-0">Tap to check in</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckIn;
