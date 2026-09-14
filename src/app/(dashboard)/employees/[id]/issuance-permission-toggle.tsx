"use client";

import { useState, useTransition } from "react";
import { setIssuanceManagerPermission } from "@/app/actions/issuance";

export function IssuancePermissionToggle({
  userId,
  initialValue,
}: {
  userId: string;
  initialValue: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.checked;
          setChecked(value);
          startTransition(() => setIssuanceManagerPermission(userId, value));
        }}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      السماح بتحديث عدد الإصدارات لجميع الموظفين (بلا حدود القسم)
    </label>
  );
}
