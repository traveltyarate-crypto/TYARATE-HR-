import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getEmployeeForCurrentUser } from "@/app/actions/employees";
import { listDepartments } from "@/app/actions/departments";
import { EditEmployeeForm } from "./form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("ADMIN");

  const [employee, departments] = await Promise.all([
    getEmployeeForCurrentUser(id),
    listDepartments(),
  ]);

  if (!employee) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">تعديل بيانات {employee.fullName}</h1>
        <Link href={`/employees/${employee.id}`} className="text-sm text-slate-500 hover:underline">
          إلغاء والعودة
        </Link>
      </div>
      <EditEmployeeForm
        employee={employee}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
      />
    </div>
  );
}
