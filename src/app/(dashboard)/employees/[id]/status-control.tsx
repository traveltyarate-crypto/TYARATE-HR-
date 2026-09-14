"use client";

import { useTransition } from "react";
import { updateEmployeeStatus } from "@/app/actions/employees";

const OPTIONS = [
  { value: "ACTIVE", label: "نشط" },
  { value: "ON_LEAVE", label: "في إجازة" },
  { value: "TERMINATED", label: "منتهي الخدمة" },
] as const;

export function StatusControl({
  employeeId,
  currentStatus,
}: {
  employeeId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() =>
          updateEmployeeStatus(employeeId, e.target.value as "ACTIVE" | "ON_LEAVE" | "TERMINATED"),
        )
      }
      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
