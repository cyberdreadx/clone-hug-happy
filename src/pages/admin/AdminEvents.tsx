import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search, Plus, Download, Pencil, Trash2, CheckCircle, Clock, XCircle,
  Send, Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import EventForm from "@/components/admin/EventForm";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [eventModal, setEventModal] = useState<{ open: boolean; event?: any }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [followUpLoading, setFollowUpLoading] = useState<string | null>(null);

  const runFollowUp = async (eventId: string, eventName: string) => {
    if (!confirm(`Run post-event follow-up for "${eventName}"?\n\nThis will:\n• Mark confirmed/checked-in guests as "attended"\n• Mark pending guests as "no-show"\n• Set event status to "completed"`)) return;
    setFollowUpLoading(eventId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("post-event-followup", {
        body: { event_id: eventId },
      });
      if (error) throw error;
      toast.success(data.message || "Follow-up complete!");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-guest-counts"] });
    } catch (err: any) {
      toast.error(err.message || "Follow-up failed");
    } finally {
      setFollowUpLoading(null);
    }
  };

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: guestCounts = {} } = useQuery({
    queryKey: ["admin-guest-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("event_id, status");
      if (error) throw error;
      const counts: Record<string, { total: number; confirmed: number }> = {};
      data.forEach((g) => {
        if (!g.event_id) return;
        if (!counts[g.event_id]) counts[g.event_id] = { total: 0, confirmed: 0 };
        counts[g.event_id].total++;
        if (["confirmed", "checked_in"].includes(g.status)) counts[g.event_id].confirmed++;
      });
      return counts;
    },
  });

  const now = new Date().toISOString().split("T")[0];
  const filtered = events
    .filter((ev) => {
      if (timeFilter === "upcoming") return ev.status !== "cancelled" && (!ev.date || ev.date >= now);
      if (timeFilter === "past") return ev.status !== "cancelled" && ev.date && ev.date < now;
      if (timeFilter === "cancelled") return ev.status === "cancelled";
      return true;
    })
    .filter((ev) => `${ev.name} ${ev.location}`.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      draft: "bg-yellow-500/20 text-yellow-400",
      completed: "bg-blue-500/20 text-blue-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${colors[status] || "bg-sidebar-accent text-sidebar-foreground"}`}>
        {status}
      </span>
    );
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["name", "date", "location", "status", "max_guests"];
    const csv = [headers.join(","), ...filtered.map((ev) => headers.map((h) => `"${ev[h as keyof typeof ev] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `events-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported!");
  };

  return (
    <AdminLayout
      title="Events"
      actions={
        <button
          onClick={() => setEventModal({ open: true })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      }
    >
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="pl-9 pr-4 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-sidebar-border">
            {(["upcoming", "past", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${
                  timeFilter === f
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-sidebar-border text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-sidebar-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sidebar-border">
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Event Info</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Date</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">RSVPs</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Status</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => {
              const counts = guestCounts[ev.id as keyof typeof guestCounts] as { total: number; confirmed: number } | undefined;
              return (
                <tr key={ev.id} className="border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sidebar-foreground font-medium">{ev.name}</p>
                    <p className="text-sidebar-foreground/40 text-xs mt-0.5">{ev.location || "No location"}</p>
                  </td>
                  <td className="px-5 py-4 text-sidebar-foreground/60">
                    {ev.date ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-5 py-4 text-sidebar-foreground/60">
                    {counts ? `${counts.confirmed}/${counts.total}` : "0"} / {ev.max_guests}
                  </td>
                  <td className="px-5 py-4">{statusBadge(ev.status)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {ev.status === "active" && (
                        <button
                          onClick={() => runFollowUp(ev.id, ev.name)}
                          disabled={followUpLoading === ev.id}
                          title="Run Post-Event Follow-Up"
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-sidebar-foreground/40 hover:text-emerald-400 disabled:opacity-50"
                        >
                          {followUpLoading === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => setEventModal({ open: true, event: ev })}
                        className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: ev.id })}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sidebar-foreground/40 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sidebar-foreground/30">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EventForm open={eventModal.open} onClose={() => setEventModal({ open: false })} event={eventModal.event} />
      <DeleteConfirm
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "" })}
        table="events" id={deleteModal.id} label="Event" queryKey="admin-events"
      />
    </AdminLayout>
  );
};

export default AdminEvents;
