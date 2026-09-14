import { requireUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { listEmployeesForIssuanceManagement } from "@/app/actions/issuance";
import { IssuanceRow } from "./issuance-row";

export default async function IssuancePage() {
  const user = await requireUser();
  if (user.role === "EMPLOYEE" && !user.canManageIssuances) {
    redirect("/dashboard");
  }

  const employees = await listEmployeesForIssuanceManagement();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">عدد الإصدارات</h1>
        <p className="text-sm text-slate-500">تحديث عدد الإصدارات الأسبوعي والشهري لكل موظف</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              <th className="px-4 py-3 font-medium">الموظف</th>
              <th className="px-4 py-3 font-medium">القسم</th>
              <th className="px-4 py-3 font-medium">هذا الأسبوع</th>
              <th className="px-4 py-3 font-medium">هذا الشهر</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{emp.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{emp.department?.name ?? "—"}</td>
                <IssuanceRow employeeId={emp.id} weekly={emp.weekly} monthly={emp.monthly} />
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">لا يوجد موظفون لعرضهم</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
