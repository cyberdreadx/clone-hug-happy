import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Camera, Eye, Heart, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import logoSrc from "@/assets/breathe-bloom-logo.png";

const PartnerRecap = () => {
  const { recapId } = useParams<{ recapId: string }>();

  const { data: recap, isLoading } = useQuery({
    queryKey: ["public-recap", recapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_recaps")
        .select("*, partners(company_name, contact_name, email, instagram), events(name, date, location, cover_image)")
        .eq("id", recapId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!recapId,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["public-recap-assets", recap?.partner_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_assets")
        .select("*")
        .eq("partner_id", recap!.partner_id)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!recap?.partner_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/40">Recap not found</p>
      </div>
    );
  }

  const partner = recap.partners as any;
  const event = recap.events as any;
  const eventDate = event?.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  const metrics = [
    { label: "Photos Delivered", value: recap.photos_count || 0, icon: Camera, color: "text-purple-500" },
    { label: "Impressions", value: (recap.impressions || 0).toLocaleString(), icon: Eye, color: "text-blue-500" },
    { label: "Engagement Rate", value: `${recap.engagement_rate || 0}%`, icon: Heart, color: "text-pink-500" },
    { label: "Social Mentions", value: recap.social_mentions || 0, icon: MessageSquare, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3ed" }}>
      {/* Hero */}
      <div className="relative h-48 sm:h-64 overflow-hidden" style={{ backgroundColor: "#c6d2c1" }}>
        {event?.cover_image && (
          <img src={event.cover_image} alt="" className="w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img src={logoSrc} alt="Breathe & Bloom" className="h-10 sm:h-14 mb-3 object-contain" />
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#022701", opacity: 0.5 }}>Post-Event Recap</p>
          <h1 className="font-serif text-3xl sm:text-4xl" style={{ color: "#022701" }}>{event?.name || "Event"}</h1>
          {eventDate && <p className="text-sm mt-2" style={{ color: "#022701", opacity: 0.6 }}>{eventDate}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Partner Info */}
        <div className="text-center mb-10">
          <p className="text-foreground/40 text-xs uppercase tracking-widest mb-1">Prepared for</p>
          <h2 className="text-foreground font-serif text-2xl">{partner?.company_name}</h2>
          {partner?.contact_name && <p className="text-foreground/50 text-sm mt-1">{partner.contact_name}</p>}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border p-5 text-center bg-card">
              <m.icon className={`w-5 h-5 mx-auto mb-2 ${m.color}`} />
              <p className="text-foreground text-2xl font-serif">{m.value}</p>
              <p className="text-foreground/40 text-[10px] uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {recap.notes && (
          <div className="mb-10 p-5 rounded-xl border border-border bg-card">
            <p className="text-foreground/40 text-xs uppercase tracking-wider mb-2">Notes</p>
            <p className="text-foreground/70 text-sm leading-relaxed">{recap.notes}</p>
          </div>
        )}

        {/* Recap URL */}
        {recap.recap_url && (
          <div className="mb-10 p-5 rounded-xl border border-border bg-card">
            <p className="text-foreground/40 text-xs uppercase tracking-wider mb-2">Full Recap</p>
            <a href={recap.recap_url} target="_blank" rel="noopener"
              className="text-foreground/70 text-sm hover:text-foreground underline flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> View Full Recap
            </a>
          </div>
        )}

        {/* Media Assets */}
        {assets.length > 0 && (
          <div>
            <p className="text-foreground/40 text-xs uppercase tracking-wider mb-4">Media Assets</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets.map((asset: any) => (
                <a key={asset.id} href={asset.file_url} target="_blank" rel="noopener"
                  className="group rounded-xl border border-border overflow-hidden bg-card hover:border-foreground/30 transition-colors">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {asset.file_type === "image" ? (
                      <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <ExternalLink className="w-6 h-6 text-foreground/20" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-foreground text-xs font-medium truncate">{asset.file_name}</p>
                    <p className="text-foreground/30 text-[10px] group-hover:text-foreground/50 flex items-center gap-1 mt-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> Download
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-foreground/30 text-xs">Breathe & Bloom · Post-Event Partnership Recap</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerRecap;
