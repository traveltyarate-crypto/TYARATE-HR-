"use client";

import { useActionState } from "react";
import { uploadEmployeeDocument } from "@/app/actions/documents";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const DOC_TYPES = [
  { value: "NATIONAL_ID", label: "بطاقة شخصية" },
  { value: "PASSPORT", label: "جواز سفر" },
  { value: "VISA", label: "تأشيرة" },
  { value: "RESIDENCY", label: "إقامة" },
  { value: "PROFESSIONAL_LICENSE", label: "رخصة مهنية" },
  { value: "CERTIFICATE", label: "شهادة" },
  { value: "CV", label: "سيرة ذاتية" },
  { value: "OTHER", label: "أخرى" },
] as const;

export function DocumentForm({ employeeId }: { employeeId: string }) {
  const [state, formAction, pending] = useActionState(uploadEmployeeDocument, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">رفع مستند</h2>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="employeeId" value={employeeId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="docType">نوع المستند</label>
            <select id="docType" name="docType" className={inputClass} defaultValue="NATIONAL_ID">
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="expiryDate">تاريخ الانتهاء (إن وجد)</label>
            <input id="expiryDate" name="expiryDate" type="date" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="file">الملف</label>
            <input id="file" name="file" type="file" required className={inputClass} />
          </div>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الرفع..." : "رفع المستند"}
        </button>
      </form>
    </section>
  );
}
