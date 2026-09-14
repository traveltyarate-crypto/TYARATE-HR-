"use client";

import { useState, useTransition } from "react";
import { upsertIssuanceRecord } from "@/app/actions/issuance";

function CountEditor({
  employeeId,
  periodType,
  initialValue,
}: {
  employeeId: string;
  periodType: "WEEKLY" | "MONTHLY";
  initialValue: number | null;
}) {
  const [value, setValue] = useState(initialValue ?? 0);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function save() {
    const formData = new FormData();
    formData.set("employeeId", employeeId);
    formData.set("periodType", periodType);
    formData.set("count", String(value));
    startTransition(async () => {
      await upsertIssuanceRecord(undefined, formData);
      setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value));
          setSaved(false);
        }}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
      />
      <button
        type="button"
        onClick={save}
        disabled={isPending || saved}
        className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
      >
        {isPending ? "..." : "حفظ"}
      </button>
    </div>
  );
}

export function IssuanceRow({
  employeeId,
  weekly,
  monthly,
}: {
  employeeId: string;
  weekly: number | null;
  monthly: number | null;
}) {
  return (
    <>
      <td className="px-4 py-3">
        <CountEditor employeeId={employeeId} periodType="WEEKLY" initialValue={weekly} />
      </td>
      <td className="px-4 py-3">
        <CountEditor employeeId={employeeId} periodType="MONTHLY" initialValue={monthly} />
      </td>
    </>
  );
}
