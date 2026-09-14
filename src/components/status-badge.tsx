const EMPLOYMENT_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "نشط", className: "bg-emerald-50 text-emerald-700" },
  ON_LEAVE: { label: "في إجازة", className: "bg-amber-50 text-amber-700" },
  TERMINATED: { label: "منتهي الخدمة", className: "bg-slate-100 text-slate-500" },
};

const LEAVE_REQUEST_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700" },
  APPROVED: { label: "موافَق عليها", className: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "مرفوضة", className: "bg-red-50 text-red-700" },
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function EmploymentStatusBadge({ status }: { status: string }) {
  const cfg = EMPLOYMENT_LABELS[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return <Badge {...cfg} />;
}

export function LeaveRequestStatusBadge({ status }: { status: string }) {
  const cfg = LEAVE_REQUEST_LABELS[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return <Badge {...cfg} />;
}
