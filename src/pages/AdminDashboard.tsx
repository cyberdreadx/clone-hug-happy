import { useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  Download,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Handshake,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { signOut } = useRequireAuth("admin");
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"guests" | "partners">("guests");
  const [search, setSearch] = useState("");

  const { data: guests = [] } = useQuery({
    queryKey: ["admin-guests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateGuestStatus = async (id: string, status: string) => {
    const updateData: Record<string, any> = { status };
    if (status === "checked_in") updateData.check_in_time = new Date().toISOString();

    const { error } = await supabase.from("guests").update(updateData).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Guest ${status.replace("_", " ")}`);
    queryClient.invalidateQueries({ queryKey: ["admin-guests"] });
  };

  const exportCSV = () => {
    const data = tab === "guests" ? guests : partners;
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row: any) =>
        headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const filteredGuests = guests.filter(
    (g) =>
      `${g.first_name} ${g.last_name} ${g.email} ${g.company}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const filteredPartners = partners.filter(
    (p) =>
      `${p.company_name} ${p.contact_name} ${p.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "checked_in":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
      case "waitlisted":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "declined":
      case "no_show":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    checkedIn: guests.filter((g) => g.status === "checked_in").length,
    pending: guests.filter((g) => g.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-section-light">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-gold" />
          <h1 className="font-serif text-lg text-foreground">Breathe &amp; Bloom Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            View Site
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total RSVPs", value: stats.total, icon: Users },
            { label: "Confirmed", value: stats.confirmed, icon: CheckCircle },
            { label: "Checked In", value: stats.checkedIn, icon: UserCheck },
            { label: "Pending", value: stats.pending, icon: Clock },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-gold" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-serif text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search + Export */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("guests")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === "guests" ? "bg-gold text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              Guests ({guests.length})
            </button>
            <button
              onClick={() => setTab("partners")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === "partners" ? "bg-gold text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Handshake className="w-4 h-4" />
              Partners ({partners.length})
            </button>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 w-48"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Guest Table */}
        {tab === "guests" && (
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Company</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((g) => (
                    <tr key={g.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-foreground">{g.first_name} {g.last_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.company || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          {statusIcon(g.status)}
                          <span className="capitalize text-foreground">{g.status.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={g.status}
                          onChange={(e) => updateGuestStatus(g.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded bg-section-light border border-border text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                          <option value="waitlisted">Waitlisted</option>
                          <option value="checked_in">Checked In</option>
                          <option value="no_show">No Show</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No guests yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Partners Table */}
        {tab === "partners" && (
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Company</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Contact</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tier</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-foreground">{p.company_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.contact_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground capitalize">
                          {p.tier.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          {statusIcon(p.status)}
                          <span className="capitalize text-foreground">{p.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredPartners.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No partners yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
