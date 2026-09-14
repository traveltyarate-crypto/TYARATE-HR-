"use server";

import { startOfWeek, startOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, canAccessEmployee, type CurrentUser } from "@/lib/dal";
import type { IssuancePeriodType } from "@/generated/prisma/enums";
import type { ActionState } from "./employees";

function canManageIssuanceFor(
  user: CurrentUser,
  employee: { id: string; departmentId: string | null },
) {
  return user.canManageIssuances || canAccessEmployee(user, employee);
}

async function assertCanRecordFor(employeeId: string) {
  const user = await requireUser();
  if (user.canManageIssuances) return user;
  if (user.role === "EMPLOYEE") throw new Error("غير مصرّح لك بهذا الإجراء");
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canManageIssuanceFor(user, employee)) {
    throw new Error("غير مصرّح لك بهذا الإجراء");
  }
  return user;
}

export async function listIssuanceRecordsForEmployee(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canManageIssuanceFor(user, employee)) return [];

  return prisma.issuanceRecord.findMany({
    where: { employeeId },
    orderBy: { periodStart: "desc" },
  });
}

// أحدث عدّاد أسبوعي وشهري للموظف، لعرضه في نظرته العامة
export async function getCurrentIssuanceCounts(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canManageIssuanceFor(user, employee)) return { weekly: null, monthly: null };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // السبت بداية الأسبوع
  const monthStart = startOfMonth(new Date());

  const [weekly, monthly] = await Promise.all([
    prisma.issuanceRecord.findUnique({
      where: { employeeId_periodType_periodStart: { employeeId, periodType: "WEEKLY", periodStart: weekStart } },
    }),
    prisma.issuanceRecord.findUnique({
      where: { employeeId_periodType_periodStart: { employeeId, periodType: "MONTHLY", periodStart: monthStart } },
    }),
  ]);

  return { weekly: weekly?.count ?? null, monthly: monthly?.count ?? null };
}

// قائمة موظفين مبسّطة (اسم + قسم + عدّادات الفترة الحالية) لمن يملك صلاحية إدارة الإصدارات
// دون كشف بقية بياناتهم الشخصية — لهذا لا تُستخدم canAccessEmployee/getEmployeeForCurrentUser هنا
export async function listEmployeesForIssuanceManagement() {
  const user = await requireUser();
  if (!user.canManageIssuances && user.role === "EMPLOYEE") return [];

  const where =
    user.role === "ADMIN" || user.canManageIssuances
      ? {}
      : { departmentId: user.employee?.managedDepartment?.id ?? "__none__" };

  const employees = await prisma.employee.findMany({
    where,
    select: { id: true, fullName: true, department: { select: { name: true } } },
    orderBy: { fullName: "asc" },
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 });
  const monthStart = startOfMonth(new Date());
  const employeeIds = employees.map((e) => e.id);

  const records = await prisma.issuanceRecord.findMany({
    where: {
      employeeId: { in: employeeIds },
      OR: [
        { periodType: "WEEKLY", periodStart: weekStart },
        { periodType: "MONTHLY", periodStart: monthStart },
      ],
    },
  });

  return employees.map((emp) => ({
    ...emp,
    weekly: records.find((r) => r.employeeId === emp.id && r.periodType === "WEEKLY")?.count ?? null,
    monthly: records.find((r) => r.employeeId === emp.id && r.periodType === "MONTHLY")?.count ?? null,
  }));
}

// يمنح/يسحب صلاحية استثنائية لتحديث عدد الإصدارات لأي موظف، بصرف النظر عن القسم
export async function setIssuanceManagerPermission(userId: string, value: boolean) {
  await requireRole("ADMIN");
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { canManageIssuances: value },
  });
  if (updated.employeeId) revalidatePath(`/employees/${updated.employeeId}`);
}

export async function upsertIssuanceRecord(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const employeeId = String(formData.get("employeeId") ?? "");
  const periodType = String(formData.get("periodType") ?? "") as IssuancePeriodType;
  const count = Number(formData.get("count"));

  if (!employeeId || !["WEEKLY", "MONTHLY"].includes(periodType) || !Number.isFinite(count) || count < 0) {
    return { error: "الرجاء إدخال عدد صحيح" };
  }

  const user = await assertCanRecordFor(employeeId);

  const periodStart =
    periodType === "WEEKLY" ? startOfWeek(new Date(), { weekStartsOn: 6 }) : startOfMonth(new Date());

  await prisma.issuanceRecord.upsert({
    where: { employeeId_periodType_periodStart: { employeeId, periodType, periodStart } },
    update: { count, recordedById: user.id },
    create: { employeeId, periodType, periodStart, count, recordedById: user.id },
  });

  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/issuance");
  return { success: "تم تحديث عدد الإصدارات بنجاح" };
}
