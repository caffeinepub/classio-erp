import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: "blue" | "green" | "orange" | "purple" | "red";
  isLoading?: boolean;
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              {value}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3 border", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  ocid,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  ocid?: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="bg-muted rounded-full p-4 mb-4">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          role="presentation"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: { rows?: number; cols?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `row-${i}`);
  const colKeys = Array.from({ length: cols }, (_, j) => `col-${j}`);
  return (
    <div className="space-y-2">
      {rowKeys.map((rowKey) => (
        <div
          key={rowKey}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {colKeys.map((colKey) => (
            <Skeleton key={colKey} className="h-10 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-gray-50 text-gray-600 border-gray-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    unpaid: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        styles[status.toLowerCase()] ??
          "bg-gray-50 text-gray-600 border-gray-200",
      )}
    >
      {label}
    </span>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <div
            data-ocid="confirm.dialog"
            className="relative bg-card border border-border rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-10"
          >
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm mt-2">{description}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                data-ocid="confirm.cancel_button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="confirm.confirm_button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
