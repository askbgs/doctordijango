import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variantStyles[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    CONFIRMED: { variant: "info", label: "Confirmed" },
    CHECKED_IN: { variant: "info", label: "Checked In" },
    IN_PROGRESS: { variant: "info", label: "In Progress" },
    COMPLETED: { variant: "success", label: "Completed" },
    CANCELLED: { variant: "danger", label: "Cancelled" },
    NO_SHOW: { variant: "danger", label: "No Show" },
    RESCHEDULED: { variant: "warning", label: "Rescheduled" },
  };
  const config = statusMap[status] || { variant: "default" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
