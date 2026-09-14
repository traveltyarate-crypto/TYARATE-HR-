"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser, canAccessEmployee } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { employeeSchema, employeeEditSchema } from "@/lib/validations/employee";
import type { Role } from "@/generated/prisma/enums";

export type ActionState = { error?: string; success?: string } | undefined;

function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

// قائمة الموظفين حسب نطاق رؤية المستخدم الحالي
export async function listEmployeesForCurrentUser() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    return prisma.employee.findMany({
      include: { department: true },
      orderBy: { fullName: "asc" },
    });
  }

  if (user.role === "MANAGER") {
    const managedDepartmentId = user.employee?.managedDepartment?.id;
    if (!managedDepartmentId) return [];
    return prisma.employee.findMany({
      where: { departmentId: managedDepartmentId },
      include: { department: true },
      orderBy: { fullName: "asc" },
    });
  }

  if (!user.employee) return [];
  return prisma.employee.findMany({
    where: { id: user.employee.id },
    include: { department: true },
  });
}

export async function getEmployeeForCurrentUser(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      department: true,
      user: true,
      contracts: { orderBy: { startDate: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      leaveBalances: { include: { leaveType: true } },
    },
  });

  if (!employee || !canAccessEmployee(user, employee)) return null;
  return employee;
}

export async function createEmployee(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = employeeSchema.safeParse({
    fullName: formData.get("fullName"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
    nationality: formData.get("nationality"),
    phone: formData.get("phone"),
    address: formData.get("address") || undefined,
    emergencyContactName: formData.get("emergencyContactName") || undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    jobTitle: formData.get("jobTitle"),
    hireDate: formData.get("hireDate"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const role = String(formData.get("role") ?? "EMPLOYEE") as Role;
  const data = parsed.data;

  const existing = await prisma.employee.findUnique({
    where: { nationalId: data.nationalId },
  });
  if (existing) {
    return { error: "يوجد موظف مسجّل مسبقًا بنفس الرقم الوطني" };
  }

  const tempPassword = generateTempPassword();
  const adminClient = createAdminClient();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      app_metadata: { role },
    });

  if (authError || !authData.user) {
    return { error: `تعذّر إنشاء حساب الدخول: ${authError?.message ?? ""}` };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          fullName: data.fullName,
          nationalId: data.nationalId,
          birthDate: new Date(data.birthDate),
          nationality: data.nationality,
          phone: data.phone,
          address: data.address,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          departmentId: data.departmentId || null,
          jobTitle: data.jobTitle,
          hireDate: new Date(data.hireDate),
        },
      });

      await tx.user.create({
        data: {
          id: authData.user.id,
          email: data.email,
          role,
          employeeId: employee.id,
        },
      });

      const leaveTypes = await tx.leaveType.findMany();
      const currentYear = new Date().getFullYear();
      await tx.leaveBalance.createMany({
        data: leaveTypes.map((lt) => ({
          employeeId: employee.id,
          leaveTypeId: lt.id,
          year: currentYear,
          totalDays: lt.defaultAnnualDays,
        })),
      });
    });
  } catch {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: "تعذّر حفظ بيانات الموظف، حاول مرة أخرى" };
  }

  revalidatePath("/employees");
  return {
    success: `تم إنشاء الموظف بنجاح. كلمة المرور المؤقتة: ${tempPassword} (شاركها مع الموظف بأمان)`,
  };
}

export async function updateEmployee(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const employeeId = String(formData.get("employeeId") ?? "");
  if (!employeeId) return { error: "معرّف الموظف مفقود" };

  const parsed = employeeEditSchema.safeParse({
    fullName: formData.get("fullName"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
    nationality: formData.get("nationality"),
    phone: formData.get("phone"),
    address: formData.get("address") || undefined,
    emergencyContactName: formData.get("emergencyContactName") || undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    jobTitle: formData.get("jobTitle"),
    hireDate: formData.get("hireDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const data = parsed.data;

  const duplicateNationalId = await prisma.employee.findFirst({
    where: { nationalId: data.nationalId, NOT: { id: employeeId } },
  });
  if (duplicateNationalId) {
    return { error: "يوجد موظف آخر بنفس الرقم الوطني" };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      fullName: data.fullName,
      nationalId: data.nationalId,
      birthDate: new Date(data.birthDate),
      nationality: data.nationality,
      phone: data.phone,
      address: data.address,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      departmentId: data.departmentId || null,
      jobTitle: data.jobTitle,
      hireDate: new Date(data.hireDate),
    },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { success: "تم تحديث بيانات الموظف بنجاح" };
}

export async function updateEmployeeStatus(
  employeeId: string,
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED",
) {
  await requireRole("ADMIN");
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      employmentStatus: status,
      terminationDate: status === "TERMINATED" ? new Date() : null,
    },
  });
  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
}
