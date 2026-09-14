"use client";

import { useActionState } from "react";
import { upsertIssuanceRecord } from "@/app/actions/issuance";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function IssuanceForm({ employeeId }: { employeeId: string }) {
  const [state, formAction, pending] = useActionState(upsertIssuanceRecord, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">تحديث عدد الإصدارات</h2>
      <p className="mb-4 text-xs text-slate-400">يُحدَّث العدد للأسبوع أو الشهر الحالي تلقائيًا</p>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="employeeId" value={employeeId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="i-period">الفترة</label>
            <select id="i-period" name="periodType" className={inputClass} defaultValue="WEEKLY">
              <option value="WEEKLY">هذا الأسبوع</option>
              <option value="MONTHLY">هذا الشهر</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="i-count">عدد الإصدارات</label>
            <input id="i-count" name="count" type="number" min="0" step="1" required className={inputClass} />
          </div>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "حفظ"}
        </button>
      </form>
    </section>
  );
}
