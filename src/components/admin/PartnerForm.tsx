import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminModal from "./AdminModal";

interface PartnerFormProps {
  open: boolean;
  onClose: () => void;
  partner?: any;
}

const PartnerForm = ({ open, onClose, partner }: PartnerFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    tier: "gift_bag",
    status: "prospect",
    notes: "",
  });

  useEffect(() => {
    if (partner) {
      setForm({
        company_name: partner.company_name || "",
        contact_name: partner.contact_name || "",
        email: partner.email || "",
        phone: partner.phone || "",
        tier: partner.tier || "gift_bag",
        status: partner.status || "prospect",
        notes: partner.notes || "",
      });
    } else {
      setForm({ company_name: "", contact_name: "", email: "", phone: "", tier: "gift_bag", status: "prospect", notes: "" });
    }
  }, [partner, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (partner) {
        const { error } = await supabase.from("partners").update(form).eq("id", partner.id);
        if (error) throw error;
        toast.success("Partner updated!");
      } else {
        const { error } = await supabase.from("partners").insert(form);
        if (error) throw error;
        toast.success("Partner added!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-section-light border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50";

  return (
    <AdminModal open={open} onClose={onClose} title={partner ? "Edit Partner" : "Add Partner"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-foreground mb-1.5">Company Name *</label>
          <input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground mb-1.5">Contact Name *</label>
            <input required value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1.5">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-foreground mb-1.5">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground mb-1.5">Tier</label>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={inputClass}>
              <option value="title_sponsor">Title Sponsor</option>
              <option value="premium_partner">Premium Partner</option>
              <option value="activation_partner">Activation Partner</option>
              <option value="gift_bag">Gift Bag</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="prospect">Prospect</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-foreground mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-gold text-primary-foreground py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : partner ? "Update" : "Add Partner"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default PartnerForm;
