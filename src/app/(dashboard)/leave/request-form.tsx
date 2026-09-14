"use client";

import { useActionState } from "react";
import { requestLeave } from "@/app/actions/leave";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function RequestLeaveForm({ leaveTypes }: { leaveTypes: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(requestLeave, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">طلب إجازة جديدة</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="leaveTypeId">نوع الإجازة</label>
          <select id="leaveTypeId" name="leaveTypeId" required className={inputClass}>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="startDate">من تاريخ</label>
            <input id="startDate" name="startDate" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endDate">إلى تاريخ</label>
            <input id="endDate" name="endDate" type="date" required className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="reason">السبب (اختياري)</label>
          <textarea id="reason" name="reason" rows={2} className={inputClass} />
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الإرسال..." : "إرسال الطلب"}
        </button>
      </form>
    </section>
  );
}
