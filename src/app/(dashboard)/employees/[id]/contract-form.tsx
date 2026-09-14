"use client";

import { useActionState } from "react";
import { createContract } from "@/app/actions/contracts";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function ContractForm({ employeeId }: { employeeId: string }) {
  const [state, formAction, pending] = useActionState(createContract, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">إضافة عقد جديد</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="employeeId" value={employeeId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="contractType">نوع العقد</label>
            <select id="contractType" name="contractType" className={inputClass} defaultValue="FULL_TIME">
              <option value="FULL_TIME">دوام كامل</option>
              <option value="PART_TIME">دوام جزئي</option>
              <option value="TEMPORARY">مؤقت</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="baseSalary">الراتب الأساسي</label>
            <input id="baseSalary" name="baseSalary" type="number" min="0" step="0.01" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="startDate">تاريخ البداية</label>
            <input id="startDate" name="startDate" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endDate">تاريخ النهاية (اختياري)</label>
            <input id="endDate" name="endDate" type="date" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="allowances">إجمالي البدلات (اختياري)</label>
            <input id="allowances" name="allowances" type="number" min="0" step="0.01" className={inputClass} />
          </div>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "حفظ العقد"}
        </button>
      </form>
    </section>
  );
}
