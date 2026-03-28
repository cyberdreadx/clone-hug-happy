import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Download, Pencil, Trash2, CheckCircle, XCircle, Clock, UserCheck, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import GuestForm from "@/components/admin/GuestForm";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

const AdminGuests = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [guestModal, setGuestModal] = useState<{ open: boolean; guest?: any }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const { data: guests = [] } = useQuery({
    queryKey: ["admin-guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const updateData: Record<string, any> = { status };
    if (status === "checked_in") updateData.check_in_time = new Date().toISOString();
    const { error } = await supabase.from("guests").update(updateData).eq("id", id);
    if (error) { toast.error("Failed"); return; }
    toast.success(`Guest ${status.replace("_", " ")}`);
    queryClient.invalidateQueries({ queryKey: ["admin-guests"] });
  };

  const bulkUpdateStatus = async (status: string) => {
    if (bulkSelected.size === 0) return;
    const ids = Array.from(bulkSelected);
    const { error } = await supabase.from("guests").update({ status }).in("id", ids);
    if (error) { toast.error("Bulk update failed"); return; }
    toast.success(`${ids.length} guest(s) → ${status.replace("_", " ")}`);
    setBulkSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ["admin-guests"] });
  };

  const filtered = guests
    .filter((g) => statusFilter === "all" || g.status === statusFilter)
    .filter((g) => `${g.first_name} ${g.last_name} ${g.email} ${g.company}`.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = guests.filter((g) => g.status === "pending").length;

  const statuses = ["all", "pending", "confirmed", "checked_in", "declined", "waitlisted", "no_show", "attended"];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-500/20 text-green-400",
      checked_in: "bg-emerald-500/20 text-emerald-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      waitlisted: "bg-blue-500/20 text-blue-400",
      declined: "bg-red-500/20 text-red-400",
      no_show: "bg-red-500/20 text-red-400",
      attended: "bg-purple-500/20 text-purple-400",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${colors[status] || "bg-sidebar-accent text-sidebar-foreground"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const toggleBulk = (id: string) => {
    const next = new Set(bulkSelected);
    next.has(id) ? next.delete(id) : next.add(id);
    setBulkSelected(next);
  };

  const toggleAll = () => {
    if (bulkSelected.size === filtered.length) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(filtered.map((g) => g.id)));
    }
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["first_name", "last_name", "email", "phone", "company", "dietary_requirements", "status", "rsvp_date", "check_in_time"];
    const csv = [headers.join(","), ...filtered.map((r: any) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `guests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported!");
  };

  return (
    <AdminLayout
      title="Guests"
      actions={
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {pendingCount} pending approval
            </span>
          )}
          <button onClick={() => setGuestModal({ open: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guests..."
            className="pl-9 pr-4 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-sidebar-border flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  statusFilter === s ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
                }`}>
                {s === "all" ? `All (${guests.length})` : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-sidebar-border text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
          <span className="text-sm text-sidebar-foreground">{bulkSelected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkUpdateStatus("confirmed")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
            <button onClick={() => bulkUpdateStatus("waitlisted")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30">
              <Clock className="w-3.5 h-3.5" /> Waitlist
            </button>
            <button onClick={() => bulkUpdateStatus("declined")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30">
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-sidebar-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sidebar-border">
              <th className="px-3 py-3 w-10">
                <input type="checkbox" checked={bulkSelected.size === filtered.length && filtered.length > 0} onChange={toggleAll}
                  className="rounded border-sidebar-border" />
              </th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Name</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Email</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Company</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Status</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Quick Actions</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className={`border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors ${g.status === "pending" ? "bg-yellow-500/5" : ""}`}>
                <td className="px-3 py-4">
                  <input type="checkbox" checked={bulkSelected.has(g.id)} onChange={() => toggleBulk(g.id)}
                    className="rounded border-sidebar-border" />
                </td>
                <td className="px-5 py-4">
                  <p className="text-sidebar-foreground font-medium">{g.first_name} {g.last_name}</p>
                  {g.dietary_requirements && <p className="text-yellow-400 text-[10px] mt-0.5">{g.dietary_requirements}</p>}
                </td>
                <td className="px-5 py-4 text-sidebar-foreground/60 text-xs">{g.email}</td>
                <td className="px-5 py-4 text-sidebar-foreground/60 text-xs">{g.company || "—"}</td>
                <td className="px-5 py-4">{statusBadge(g.status)}</td>
                <td className="px-5 py-4">
                  {g.status === "pending" ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateStatus(g.id, "confirmed")} title="Approve"
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-sidebar-foreground/40 hover:text-green-400 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus(g.id, "waitlisted")} title="Waitlist"
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-sidebar-foreground/40 hover:text-blue-400 transition-colors">
                        <Clock className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatus(g.id, "declined")} title="Decline"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-sidebar-foreground/40 hover:text-red-400 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select value={g.status} onChange={(e) => updateStatus(g.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-sidebar-accent border border-sidebar-border text-sidebar-foreground">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="checked_in">Checked In</option>
                      <option value="no_show">No Show</option>
                      <option value="attended">Attended</option>
                    </select>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setGuestModal({ open: true, guest: g })}
                      className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal({ open: true, id: g.id })}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sidebar-foreground/40 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sidebar-foreground/30">No guests found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <GuestForm open={guestModal.open} onClose={() => setGuestModal({ open: false })} guest={guestModal.guest} events={events} />
      <DeleteConfirm open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: "" })}
        table="guests" id={deleteModal.id} label="Guest" queryKey="admin-guests" />
    </AdminLayout>
  );
};

export default AdminGuests;
