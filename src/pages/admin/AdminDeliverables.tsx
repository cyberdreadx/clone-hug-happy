import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, FileText as FileIcon } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminModal from "@/components/admin/AdminModal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

const AdminDeliverables = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<{ open: boolean; deliverable?: any }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["admin-deliverables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deliverables").select("*, partners(company_name)").order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("id, company_name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = deliverables.filter((d: any) =>
    `${d.title} ${d.partners?.company_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-500/20 text-green-400",
      submitted: "bg-blue-500/20 text-blue-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      in_progress: "bg-cyan-500/20 text-cyan-400",
      revision_needed: "bg-orange-500/20 text-orange-400",
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${colors[status] || "bg-sidebar-accent text-sidebar-foreground"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <AdminLayout
      title="Deliverables"
      actions={
        <button onClick={() => setFormModal({ open: true })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Deliverable
        </button>
      }
    >
      <div className="mb-6">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deliverables..."
            className="pl-9 pr-4 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 w-full" />
        </div>
      </div>

      <div className="rounded-xl border border-sidebar-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sidebar-border">
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Title</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Partner</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Due Date</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Status</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">File</th>
              <th className="text-left px-5 py-3 text-sidebar-foreground/40 font-medium text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d: any) => (
              <tr key={d.id} className="border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sidebar-foreground font-medium">{d.title}</p>
                  {d.description && <p className="text-sidebar-foreground/40 text-xs mt-0.5 truncate max-w-[200px]">{d.description}</p>}
                </td>
                <td className="px-5 py-4 text-sidebar-foreground/60">{d.partners?.company_name || "—"}</td>
                <td className="px-5 py-4 text-sidebar-foreground/60">
                  {d.due_date ? new Date(d.due_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">{statusBadge(d.status)}</td>
                <td className="px-5 py-4">
                  {d.file_url ? (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-sidebar-ring text-xs hover:underline inline-flex items-center gap-1">
                      <FileIcon className="w-3 h-3" /> View
                    </a>
                  ) : <span className="text-sidebar-foreground/30 text-xs">—</span>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setFormModal({ open: true, deliverable: d })}
                      className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal({ open: true, id: d.id })}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sidebar-foreground/40 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sidebar-foreground/30">No deliverables found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deliverable Form Modal */}
      <DeliverableForm open={formModal.open} onClose={() => setFormModal({ open: false })} deliverable={formModal.deliverable} partners={partners} />
      <DeleteConfirm open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: "" })}
        table="deliverables" id={deleteModal.id} label="Deliverable" queryKey="admin-deliverables" />
    </AdminLayout>
  );
};

// Inline deliverable form
function DeliverableForm({ open, onClose, deliverable, partners }: { open: boolean; onClose: () => void; deliverable?: any; partners: any[] }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", partner_id: "", due_date: "", status: "pending" });

  React.useEffect(() => {
    if (deliverable) {
      setForm({
        title: deliverable.title || "", description: deliverable.description || "",
        partner_id: deliverable.partner_id || "", due_date: deliverable.due_date || "", status: deliverable.status || "pending",
      });
    } else {
      setForm({ title: "", description: "", partner_id: partners[0]?.id || "", due_date: "", status: "pending" });
    }
  }, [deliverable, open, partners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (deliverable) {
        const { error } = await supabase.from("deliverables").update(form).eq("id", deliverable.id);
        if (error) throw error;
        toast.success("Updated!");
      } else {
        const { error } = await supabase.from("deliverables").insert(form);
        if (error) throw error;
        toast.success("Created!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-deliverables"] });
      onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border text-sidebar-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50";

  return (
    <AdminModal open={open} onClose={onClose} title={deliverable ? "Edit Deliverable" : "Add Deliverable"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Title *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Partner *</label>
          <select required value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })} className={inputClass}>
            <option value="">Select partner</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Due Date</label>
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="revision_needed">Revision Needed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-sidebar-border text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-sidebar-primary text-sidebar-primary-foreground py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : deliverable ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

export default AdminDeliverables;
