"use client";

import { useActionState } from "react";
import { createDepartment } from "@/app/actions/departments";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function DepartmentForm({ employees }: { employees: { id: string; fullName: string }[] }) {
  const [state, formAction, pending] = useActionState(createDepartment, undefined);

  return (
    <section className="max-w-md rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">إضافة قسم جديد</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">اسم القسم</label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="managerId">مدير القسم (اختياري)</label>
          <select id="managerId" name="managerId" className={inputClass} defaultValue="">
            <option value="">بدون مدير حاليًا</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "حفظ القسم"}
        </button>
      </form>
    </section>
  );
}
