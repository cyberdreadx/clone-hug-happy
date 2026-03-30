import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, X, Plus, Trash2 } from "lucide-react";
import AdminModal from "./AdminModal";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import AgendaEditor from "./AgendaEditor";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event?: any;
}

interface Highlight {
  label: string;
  value: string;
}

const HIGHLIGHT_PRESETS = ["Age Info", "Door Time", "Parking", "Dress Code", "What to Bring", "Accessibility"];

const EventForm = ({ open, onClose, event }: EventFormProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [form, setForm] = useState({
    name: "", date: "", time: "", location: "", description: "", status: "draft", max_guests: 100, ticket_price: "",
  });

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name || "", date: event.date || "", time: event.time || "", location: event.location || "",
        description: event.description || "", status: event.status || "draft", max_guests: event.max_guests || 100,
        ticket_price: event.ticket_price != null ? String(event.ticket_price) : "",
      });
      setImagePreview(event.cover_image || null);
      setHighlights(Array.isArray(event.highlights) ? event.highlights : []);
    } else {
      setForm({ name: "", date: "", time: "", location: "", description: "", status: "draft", max_guests: 100, ticket_price: "" });
      setImagePreview(null);
      setHighlights([]);
    }
    setImageFile(null);
  }, [event, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addHighlight = (preset?: string) => {
    setHighlights([...highlights, { label: preset || "", value: "" }]);
  };

  const updateHighlight = (idx: number, field: keyof Highlight, val: string) => {
    const updated = [...highlights];
    updated[idx] = { ...updated[idx], [field]: val };
    setHighlights(updated);
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const uploadImage = async (eventId: string): Promise<string | null> => {
    if (!imageFile) return imagePreview;
    const ext = imageFile.name.split(".").pop() || "jpg";
    const path = `${eventId}.${ext}`;
    const { error } = await supabase.storage.from("event-images").upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const validHighlights = highlights.filter((h) => h.label.trim() && h.value.trim());

      const payload: Record<string, any> = {
        name: form.name,
        date: form.date || null,
        time: form.time || null,
        location: form.location || null,
        description: form.description || null,
        status: form.status,
        max_guests: form.max_guests,
        highlights: validHighlights,
        ticket_price: form.ticket_price ? parseFloat(form.ticket_price) : null,
      };

      if (event) {
        if (imageFile) {
          payload.cover_image = await uploadImage(event.id);
        } else {
          payload.cover_image = imagePreview;
        }

        const { error } = await supabase.from("events").update(payload as any).eq("id", event.id);
        if (error) throw error;
        toast.success("Event updated!");
      } else {
        const eventId = crypto.randomUUID();
        const coverImage = imageFile ? await uploadImage(eventId) : null;

        const { error } = await supabase.from("events").insert({
          ...payload,
          id: eventId,
          cover_image: coverImage,
        } as any);

        if (error) throw error;
        toast.success("Event created!");
      }

      onClose();
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["active-events-carousel"] });
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
        {/* Cover Image */}
        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Cover Image</label>
          {imagePreview ? (
            <div className="relative rounded-lg overflow-hidden h-40">
              <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-sidebar-border hover:border-sidebar-foreground/30 cursor-pointer transition-colors">
              <ImagePlus className="w-8 h-8 text-sidebar-foreground/30 mb-2" />
              <span className="text-xs text-sidebar-foreground/40">Click to upload</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm text-sidebar-foreground mb-1.5">Event Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm text-sidebar-foreground mb-1.5">Ticket Price ($)</label>
            <input type="number" step="0.01" min="0" placeholder="Free" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} className={inputClass} />
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

        {/* Good to Know / Highlights */}
        <div>
          <label className="block text-sm text-sidebar-foreground mb-2">Good to Know</label>
          {highlights.map((h, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                value={h.label}
                onChange={(e) => updateHighlight(idx, "label", e.target.value)}
                placeholder="Label (e.g. Parking)"
                className={`${inputClass} w-1/3`}
              />
              <input
                value={h.value}
                onChange={(e) => updateHighlight(idx, "value", e.target.value)}
                placeholder="Details..."
                className={`${inputClass} flex-1`}
              />
              <button type="button" onClick={() => removeHighlight(idx)} className="p-1.5 text-sidebar-foreground/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 mt-1">
            {HIGHLIGHT_PRESETS.filter(p => !highlights.some(h => h.label === p)).map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => addHighlight(preset)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-sidebar-border text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:border-sidebar-foreground/30 transition-colors"
              >
                <Plus className="w-3 h-3" /> {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => addHighlight()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-sidebar-border text-xs text-sidebar-foreground/30 hover:text-sidebar-foreground/50 transition-colors"
            >
              <Plus className="w-3 h-3" /> Custom
            </button>
          </div>
        </div>

        {/* Agenda — only for existing events */}
        {event && (
          <div className="border-t border-sidebar-border pt-4">
            <AgendaEditor eventId={event.id} />
          </div>
        )}

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
