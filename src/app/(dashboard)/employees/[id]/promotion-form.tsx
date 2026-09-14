"use client";

import { useActionState } from "react";
import { createPromotion } from "@/app/actions/promotions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function PromotionForm({ employeeId, currentTitle }: { employeeId: string; currentTitle: string }) {
  const [state, formAction, pending] = useActionState(createPromotion, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">تسجيل ترقية</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="employeeId" value={employeeId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="p-prev">المسمى السابق</label>
            <input id="p-prev" name="previousTitle" type="text" defaultValue={currentTitle} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="p-new">المسمى الجديد</label>
            <input id="p-new" name="newTitle" type="text" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="p-date">تاريخ السريان</label>
            <input id="p-date" name="effectiveDate" type="date" required className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="p-note">ملاحظة (اختياري)</label>
            <input id="p-note" name="note" type="text" className={inputClass} />
          </div>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "حفظ الترقية"}
        </button>
      </form>
    </section>
  );
}
