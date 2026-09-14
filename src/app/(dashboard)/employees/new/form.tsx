"use client";

import { useActionState } from "react";
import { createEmployee } from "@/app/actions/employees";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function NewEmployeeForm({ departments }: { departments: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createEmployee, undefined);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">البيانات الشخصية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fullName">الاسم الكامل</label>
            <input id="fullName" name="fullName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nationalId">الرقم الوطني</label>
            <input id="nationalId" name="nationalId" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="birthDate">تاريخ الميلاد</label>
            <input id="birthDate" name="birthDate" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nationality">الجنسية</label>
            <input id="nationality" name="nationality" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">رقم الهاتف</label>
            <input id="phone" name="phone" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="address">العنوان</label>
            <input id="address" name="address" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="emergencyContactName">جهة اتصال للطوارئ (الاسم)</label>
            <input id="emergencyContactName" name="emergencyContactName" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="emergencyContactPhone">جهة اتصال للطوارئ (الهاتف)</label>
            <input id="emergencyContactPhone" name="emergencyContactPhone" className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-100 pt-5">
        <h2 className="text-sm font-semibold text-slate-700">بيانات التوظيف والدخول</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="jobTitle">المسمى الوظيفي</label>
            <input id="jobTitle" name="jobTitle" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="hireDate">تاريخ التعيين</label>
            <input id="hireDate" name="hireDate" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="departmentId">القسم</label>
            <select id="departmentId" name="departmentId" className={inputClass}>
              <option value="">بدون قسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="role">الصلاحية</label>
            <select id="role" name="role" className={inputClass} defaultValue="EMPLOYEE">
              <option value="EMPLOYEE">موظف</option>
              <option value="MANAGER">مدير قسم</option>
              <option value="ADMIN">إدارة عليا</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="email">البريد الإلكتروني (لتسجيل الدخول)</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </div>
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "جارِ الحفظ..." : "حفظ الموظف"}
      </button>
    </form>
  );
}
