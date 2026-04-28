import type { AttendanceStatus } from "@/lib/mockData";

interface StatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const CONFIG: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  presente: {
    label: "Presente",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  tardanza: {
    label: "Tardanza",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  falta: {
    label: "Falta",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
