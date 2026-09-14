"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { updateEmployee } from "@/app/actions/employees";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function toDateInputValue(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export function EditEmployeeForm({
  employee,
  departments,
}: {
  employee: {
    id: string;
    fullName: string;
    nationalId: string;
    birthDate: Date | string;
    nationality: string;
    phone: string;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    departmentId: string | null;
    jobTitle: string;
    hireDate: Date | string;
  };
  departments: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateEmployee, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timeout = setTimeout(() => router.push(`/employees/${employee.id}`), 900);
      return () => clearTimeout(timeout);
    }
  }, [state?.success, employee.id, router]);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <input type="hidden" name="employeeId" value={employee.id} />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">البيانات الشخصية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fullName">الاسم الكامل</label>
            <input id="fullName" name="fullName" defaultValue={employee.fullName} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nationalId">الرقم الوطني</label>
            <input id="nationalId" name="nationalId" defaultValue={employee.nationalId} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="birthDate">تاريخ الميلاد</label>
            <input id="birthDate" name="birthDate" type="date" defaultValue={toDateInputValue(employee.birthDate)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="nationality">الجنسية</label>
            <input id="nationality" name="nationality" defaultValue={employee.nationality} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">رقم الهاتف</label>
            <input id="phone" name="phone" defaultValue={employee.phone} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="address">العنوان</label>
            <input id="address" name="address" defaultValue={employee.address ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="emergencyContactName">جهة اتصال للطوارئ (الاسم)</label>
            <input id="emergencyContactName" name="emergencyContactName" defaultValue={employee.emergencyContactName ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="emergencyContactPhone">جهة اتصال للطوارئ (الهاتف)</label>
            <input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={employee.emergencyContactPhone ?? ""} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-100 pt-5">
        <h2 className="text-sm font-semibold text-slate-700">بيانات التوظيف</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="jobTitle">المسمى الوظيفي</label>
            <input id="jobTitle" name="jobTitle" defaultValue={employee.jobTitle} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="hireDate">تاريخ التعيين</label>
            <input id="hireDate" name="hireDate" type="date" defaultValue={toDateInputValue(employee.hireDate)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="departmentId">القسم</label>
            <select id="departmentId" name="departmentId" defaultValue={employee.departmentId ?? ""} className={inputClass}>
              <option value="">بدون قسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
