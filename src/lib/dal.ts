import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

// يوثّق الجلسة عبر Supabase Auth ثم يجلب ملف الصلاحيات (role + employeeId) من قاعدة البيانات
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const profile = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      employee: { include: { department: true, managedDepartment: true } },
    },
  });

  if (!profile || !profile.isActive) return null;

  return profile;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

// يتحقق أن الموظف المستهدف ضمن نطاق رؤية المستخدم الحالي (admin: الكل، manager: قسمه، employee: نفسه فقط)
export function canAccessEmployee(
  currentUser: CurrentUser,
  targetEmployee: { id: string; departmentId: string | null },
) {
  if (currentUser.role === "ADMIN") return true;
  if (currentUser.role === "MANAGER") {
    const managedDepartmentId = currentUser.employee?.managedDepartment?.id;
    return (
      managedDepartmentId != null &&
      managedDepartmentId === targetEmployee.departmentId
    );
  }
  return currentUser.employee?.id === targetEmployee.id;
}
