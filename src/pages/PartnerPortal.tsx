import { useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  LogOut,
  Handshake,
} from "lucide-react";
import { Link } from "react-router-dom";

const PartnerPortal = () => {
  const { user, signOut } = useRequireAuth("partner");
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: partner } = useQuery({
    queryKey: ["partner-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["partner-deliverables", partner?.id],
    queryFn: async () => {
      if (!partner) return [];
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("partner_id", partner.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!partner,
  });

  const handleFileUpload = async (deliverableId: string, file: File) => {
    setUploading(true);
    try {
      const filePath = `${partner?.id}/${deliverableId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("partner-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("partner-assets")
        .getPublicUrl(filePath);

      await supabase
        .from("deliverables")
        .update({ file_url: urlData.publicUrl, status: "submitted" })
        .eq("id", deliverableId);

      toast.success("File uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["partner-deliverables"] });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600";
      case "submitted": return "text-blue-600";
      case "revision_needed": return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  if (!partner) {
    return (
      <div className="min-h-screen bg-section-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No partner profile found for your account.</p>
          <button onClick={signOut} className="text-gold text-sm hover:opacity-80">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-light">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake className="w-5 h-5 text-gold" />
          <h1 className="font-serif text-lg text-foreground">Partner Portal</h1>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Partner Info */}
        <div className="bg-card rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl text-foreground">{partner.company_name}</h2>
              <p className="text-muted-foreground text-sm">{partner.contact_name} · {partner.email}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground capitalize">
              {partner.tier.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Deliverables */}
        <h3 className="font-serif text-lg text-foreground mb-4">Your Deliverables</h3>
        {deliverables.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-sm">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No deliverables assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliverables.map((d) => (
              <div key={d.id} className="bg-card rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{d.title}</h4>
                    {d.description && (
                      <p className="text-muted-foreground text-sm mt-1">{d.description}</p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium capitalize ${statusColor(d.status)}`}>
                    {d.status === "approved" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {d.status.replace("_", " ")}
                  </span>
                </div>

                {d.due_date && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Due: {new Date(d.due_date).toLocaleDateString()}
                  </p>
                )}

                {d.file_url && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-sm hover:opacity-80 transition-opacity inline-flex items-center gap-1 mb-3"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View uploaded file
                  </a>
                )}

                {d.status !== "approved" && (
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:opacity-80 transition-opacity">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload File"}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(d.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPortal;
