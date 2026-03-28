import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminModal from "./AdminModal";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  table: string;
  id: string;
  label: string;
  queryKey: string;
}

const DeleteConfirm = ({ open, onClose, table, id, label, queryKey }: DeleteConfirmProps) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    toast.success(`${label} deleted`);
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    onClose();
  };

  return (
    <AdminModal open={open} onClose={onClose} title="Confirm Delete">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-foreground mb-2">Are you sure you want to delete this {label.toLowerCase()}?</p>
        <p className="text-muted-foreground text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Delete
          </button>
        </div>
      </div>
    </AdminModal>
  );
};

export default DeleteConfirm;
