import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminModal from "./AdminModal";
import LocationAutocomplete from "@/components/LocationAutocomplete";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event?: any;
}

const EventForm = ({ open, onClose, event }: EventFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", date: "", time: "", location: "", description: "", status: "draft", max_guests: 100,
  });

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name || "", date: event.date || "", time: event.time || "", location: event.location || "",
        description: event.description || "", status: event.status || "draft", max_guests: event.max_guests || 100,
      });
    } else {
      setForm({ name: "", date: "", time: "", location: "", description: "", status: "draft", max_guests: 100 });
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        date: form.date || null,
        time: form.time || null,
        location: form.location || null,
        description: form.description || null,
        status: form.status,
        max_guests: form.max_guests,
      };
      if (event) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
        toast.success("Event updated!");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast.success("Event created!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      onClose();
    } catch (err: any) {
      console.error("Event save error:", err);
      toast.error(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border text-sidebar-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50";

  return (
    <AdminModal open={open} onClose={onClose} title={event ? "Edit Event" : "Create Event"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Event Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-sidebar-foreground mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-sidebar-foreground mb-1.5">Time</label>
            <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass}>
              <option value="">Select time</option>
              {Array.from({ length: 48 }, (_, i) => {
                const h = Math.floor(i / 2);
                const m = i % 2 === 0 ? "00" : "30";
                const val = `${String(h).padStart(2, "0")}:${m}`;
                const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                const ampm = h < 12 ? "AM" : "PM";
                return <option key={val} value={val}>{`${hour12}:${m} ${ampm}`}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm text-sidebar-foreground mb-1.5">Max Guests</label>
            <input type="number" value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: parseInt(e.target.value) || 100 })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Location</label>
          <LocationAutocomplete value={form.location} onChange={(val) => setForm({ ...form, location: val })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-sidebar-border text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-sidebar-primary text-sidebar-primary-foreground py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : event ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default EventForm;
