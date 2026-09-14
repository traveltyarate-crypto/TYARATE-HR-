import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listEmployeesForCurrentUser } from "@/app/actions/employees";
import { EmploymentStatusBadge } from "@/components/status-badge";

export default async function EmployeesPage() {
  const user = await requireUser();
  const employees = await listEmployeesForCurrentUser();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">
          {user.role === "MANAGER" ? "موظفو القسم" : "الموظفون"}
        </h1>
        <div className="flex gap-2">
          <a
            href="/api/exports/employees"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            تصدير Excel
          </a>
          {user.role === "ADMIN" && (
            <Link
              href="/employees/new"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              + إضافة موظف
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">القسم</th>
              <th className="px-4 py-3 font-medium">المسمى الوظيفي</th>
              <th className="px-4 py-3 font-medium">تاريخ التعيين</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/employees/${emp.id}`} className="font-medium text-brand-700 hover:underline">
                    {emp.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{emp.department?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{emp.jobTitle}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(emp.hireDate).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-4 py-3">
                  <EmploymentStatusBadge status={emp.employmentStatus} />
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  لا يوجد موظفون لعرضهم
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
