import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  color?: string;
}

export function ProgressBar({ label, value, color = "bg-zinc-800" }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
