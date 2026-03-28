import { CheckCircle2, Clock, Loader2 } from "lucide-react";

interface GuestRowProps {
  guest: any;
  isLoading: boolean;
  onCheckIn: () => void;
  onUndo: () => void;
}

const GuestRow = ({ guest, isLoading, onCheckIn, onUndo }: GuestRowProps) => {
  const isCheckedIn = guest.status === "checked_in";

  return (
    <button
      onClick={() => (isCheckedIn ? onUndo() : onCheckIn())}
      disabled={isLoading}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] text-left ${
        isCheckedIn
          ? "border-green-500/30 bg-green-500/5"
          : "border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))]/50 active:bg-[hsl(var(--sidebar-accent))]"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          isCheckedIn ? "bg-green-500/20" : "bg-[hsl(var(--sidebar-accent))]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--sidebar-foreground))]/40" />
        ) : isCheckedIn ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <span className="text-[hsl(var(--sidebar-foreground))] font-serif text-sm">
            {guest.first_name.charAt(0)}
            {guest.last_name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-base ${isCheckedIn ? "text-green-400" : "text-[hsl(var(--sidebar-foreground))]"}`}>
          {guest.first_name} {guest.last_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {guest.company && (
            <span className="text-[hsl(var(--sidebar-foreground))]/40 text-xs truncate">{guest.company}</span>
          )}
          {guest.dietary_requirements && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
              {guest.dietary_requirements}
            </span>
          )}
        </div>
      </div>

      {isCheckedIn && guest.check_in_time && (
        <div className="text-right shrink-0">
          <p className="text-green-400/60 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(guest.check_in_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      )}

      {!isCheckedIn && !isLoading && (
        <span className="text-[hsl(var(--sidebar-foreground))]/20 text-xs shrink-0">Tap to check in</span>
      )}
    </button>
  );
};

export default GuestRow;
