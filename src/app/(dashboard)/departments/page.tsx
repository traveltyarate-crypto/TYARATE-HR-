import { requireRole } from "@/lib/dal";
import { listDepartments } from "@/app/actions/departments";
import { prisma } from "@/lib/prisma";
import { DepartmentForm } from "./form";

export default async function DepartmentsPage() {
  await requireRole("ADMIN");
  const [departments, employees] = await Promise.all([
    listDepartments(),
    prisma.employee.findMany({ select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">الأقسام</h1>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              <th className="px-4 py-3 font-medium">القسم</th>
              <th className="px-4 py-3 font-medium">المدير</th>
              <th className="px-4 py-3 font-medium">عدد الموظفين</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-600">{d.manager?.fullName ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{d._count.employees}</td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-400">لا توجد أقسام بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DepartmentForm employees={employees} />
    </div>
  );
}
