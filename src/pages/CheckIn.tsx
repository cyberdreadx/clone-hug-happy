import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckInHeader from "@/components/checkin/CheckInHeader";
import GuestRow from "@/components/checkin/GuestRow";
import QrScanner from "@/components/checkin/QrScanner";

const CheckIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

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

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["checkin-guests", activeEvent?.id],
    queryFn: async () => {
      if (!activeEvent?.id) return [];
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", activeEvent.id)
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!activeEvent?.id,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!activeEvent?.id) return;
    const channel = supabase
      .channel("checkin-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "guests", filter: `event_id=eq.${activeEvent.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["checkin-guests", activeEvent.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeEvent?.id, queryClient]);

  const stats = useMemo(() => {
    const checkedIn = guests.filter((g: any) => g.status === "checked_in").length;
    const confirmed = guests.filter((g: any) => g.status === "confirmed").length;
    return { checkedIn, confirmed, total: guests.length, capacity: activeEvent?.max_guests || 100 };
  }, [guests, activeEvent]);

  const filtered = useMemo(() => {
    if (!search.trim()) return guests;
    const q = search.toLowerCase();
    return guests.filter((g: any) =>
      `${g.first_name} ${g.last_name} ${g.email} ${g.company || ""}`.toLowerCase().includes(q)
    );
  }, [guests, search]);

  const performCheckIn = useCallback(async (guestId: string) => {
    const guest = guests.find((g: any) => g.id === guestId);
    if (!guest || guest.status === "checked_in") {
      if (guest?.status === "checked_in") toast.info(`${guest.first_name} is already checked in`);
      return;
    }
    setCheckingIn(guestId);
    try {
      const { error } = await supabase
        .from("guests")
        .update({ status: "checked_in", check_in_time: new Date().toISOString() })
        .eq("id", guestId);
      if (error) throw error;
      toast.success(`${guest.first_name} ${guest.last_name} checked in!`);
      queryClient.invalidateQueries({ queryKey: ["checkin-guests", activeEvent?.id] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingIn(null);
    }
  }, [guests, activeEvent?.id, queryClient]);

  const handleUndoCheckIn = useCallback(async (guest: any) => {
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
  }, [activeEvent?.id, queryClient]);

  const handleQrScan = useCallback((guestId: string) => {
    performCheckIn(guestId);
  }, [performCheckIn]);

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
      <CheckInHeader
        eventName={activeEvent.name}
        stats={stats}
        search={search}
        onSearchChange={setSearch}
        onOpenScanner={() => setScannerOpen(true)}
      />

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
            {filtered.map((guest: any) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                isLoading={checkingIn === guest.id}
                onCheckIn={() => performCheckIn(guest.id)}
                onUndo={() => handleUndoCheckIn(guest)}
              />
            ))}
          </div>
        )}
      </main>

      <QrScanner isOpen={scannerOpen} onScan={handleQrScan} onClose={() => setScannerOpen(false)} />
    </div>
  );
};

export default CheckIn;
