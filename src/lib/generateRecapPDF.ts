import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface RecapData {
  id: string;
  photos_count: number;
  impressions: number;
  engagement_rate: number;
  social_mentions: number;
  notes: string | null;
  recap_url: string | null;
  partners: { company_name: string; contact_name: string };
  events: { name: string; date: string; location: string };
}

export async function generateRecapPDF(recap: RecapData, assets: any[], siteUrl: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = w - margin * 2;
  let y = 0;

  // --- Header band ---
  doc.setFillColor(2, 39, 1); // #022701
  doc.rect(0, 0, w, 55, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("POST-EVENT PARTNERSHIP RECAP", w / 2, 20, { align: "center" });

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(recap.events?.name || "Event", w / 2, 33, { align: "center" });

  if (recap.events?.date) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const date = new Date(recap.events.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    doc.text(date, w / 2, 42, { align: "center" });
  }

  if (recap.events?.location) {
    doc.setFontSize(8);
    doc.text(recap.events.location, w / 2, 49, { align: "center" });
  }

  // --- Prepared for ---
  y = 70;
  doc.setTextColor(2, 39, 1);
  doc.setFontSize(8);
  doc.text("PREPARED FOR", w / 2, y, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(recap.partners?.company_name || "Partner", w / 2, y + 10, { align: "center" });
  if (recap.partners?.contact_name) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(recap.partners.contact_name, w / 2, y + 18, { align: "center" });
  }

  // --- Metrics ---
  y = 105;
  const metrics = [
    { label: "PHOTOS DELIVERED", value: String(recap.photos_count || 0) },
    { label: "IMPRESSIONS", value: (recap.impressions || 0).toLocaleString() },
    { label: "ENGAGEMENT RATE", value: `${recap.engagement_rate || 0}%` },
    { label: "SOCIAL MENTIONS", value: String(recap.social_mentions || 0) },
  ];

  const boxW = (contentW - 12) / 4;
  const boxH = 30;

  metrics.forEach((m, i) => {
    const x = margin + i * (boxW + 4);

    // Box background
    doc.setFillColor(198, 210, 193); // light green
    doc.roundedRect(x, y, boxW, boxH, 3, 3, "F");

    // Value
    doc.setTextColor(2, 39, 1);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(m.value, x + boxW / 2, y + 14, { align: "center" });

    // Label
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(2, 39, 1);
    doc.text(m.label, x + boxW / 2, y + 22, { align: "center" });
  });

  // --- Notes ---
  y += boxH + 15;
  if (recap.notes) {
    doc.setFontSize(8);
    doc.setTextColor(2, 39, 1);
    doc.text("NOTES", margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(recap.notes, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;
  }

  // --- Recap URL ---
  if (recap.recap_url) {
    doc.setFontSize(8);
    doc.setTextColor(2, 39, 1);
    doc.text("FULL RECAP", margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(0, 102, 204);
    doc.textWithLink(recap.recap_url, margin, y, { url: recap.recap_url });
    doc.setTextColor(2, 39, 1);
    y += 10;
  }

  // --- Media Assets ---
  if (assets.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(2, 39, 1);
    doc.text("MEDIA ASSETS", margin, y);
    y += 8;

    assets.forEach((asset: any) => {
      if (y > h - 30) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(9);
      doc.setTextColor(0, 102, 204);
      doc.textWithLink(`📎 ${asset.file_name}`, margin + 2, y, { url: asset.file_url });
      y += 6;
    });
  }

  // --- Shareable web link ---
  y = Math.max(y + 10, h - 40);
  if (y > h - 20) { doc.addPage(); y = margin; }
  doc.setFontSize(8);
  doc.setTextColor(2, 39, 1);
  doc.text("VIEW ONLINE", margin, y);
  y += 5;
  const webUrl = `${siteUrl}/recap/${recap.id}`;
  doc.setFontSize(9);
  doc.setTextColor(0, 102, 204);
  doc.textWithLink(webUrl, margin, y, { url: webUrl });

  // --- Footer ---
  doc.setFillColor(2, 39, 1);
  doc.rect(0, h - 12, w, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Breathe & Bloom · Post-Event Partnership Recap", w / 2, h - 5, { align: "center" });

  // Save
  const fileName = `Recap-${recap.partners?.company_name?.replace(/\s/g, "_")}-${recap.events?.name?.replace(/\s/g, "_")}.pdf`;
  doc.save(fileName);
}
