import { requireRole } from "@/lib/dal";
import { listDepartments } from "@/app/actions/departments";
import { NewEmployeeForm } from "./form";

export default async function NewEmployeePage() {
  await requireRole("ADMIN");
  const departments = await listDepartments();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-slate-900">إضافة موظف جديد</h1>
      <NewEmployeeForm departments={departments.map((d) => ({ id: d.id, name: d.name }))} />
    </div>
  );
}
