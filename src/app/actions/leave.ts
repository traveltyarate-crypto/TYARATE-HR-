"use server";

import { differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, canAccessEmployee } from "@/lib/dal";
import { leaveRequestSchema } from "@/lib/validations/leave";
import type { ActionState } from "./employees";

async function ensureLeaveBalance(employeeId: string, leaveTypeId: string, year: number) {
  const existing = await prisma.leaveBalance.findUnique({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
  });
  if (existing) return existing;

  const leaveType = await prisma.leaveType.findUniqueOrThrow({
    where: { id: leaveTypeId },
  });

  return prisma.leaveBalance.create({
    data: {
      employeeId,
      leaveTypeId,
      year,
      totalDays: leaveType.defaultAnnualDays,
      usedDays: 0,
    },
  });
}

export async function listLeaveTypes() {
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } });
}

export async function getLeaveBalancesForEmployee(employeeId: string, year = new Date().getFullYear()) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canAccessEmployee(user, employee)) return [];

  const leaveTypes = await listLeaveTypes();
  return Promise.all(
    leaveTypes.map((lt) => ensureLeaveBalance(employeeId, lt.id, year)),
  ).then((balances) =>
    balances.map((b, i) => ({ ...b, leaveType: leaveTypes[i] })),
  );
}

export async function listLeaveRequestsForCurrentUser() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    return prisma.leaveRequest.findMany({
      include: { employee: true, leaveType: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "MANAGER") {
    const managedDepartmentId = user.employee?.managedDepartment?.id;
    if (!managedDepartmentId) return [];
    return prisma.leaveRequest.findMany({
      where: { employee: { departmentId: managedDepartmentId } },
      include: { employee: true, leaveType: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!user.employee) return [];
  return prisma.leaveRequest.findMany({
    where: { employeeId: user.employee.id },
    include: { employee: true, leaveType: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestLeave(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!user.employee) {
    return { error: "لا يوجد سجل موظف مرتبط بحسابك" };
  }

  const parsed = leaveRequestSchema.safeParse({
    leaveTypeId: formData.get("leaveTypeId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const { leaveTypeId, startDate, endDate, reason } = parsed.data;
  const daysCount = differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
  const year = new Date(startDate).getFullYear();

  const balance = await ensureLeaveBalance(user.employee.id, leaveTypeId, year);
  const remaining = balance.totalDays - balance.usedDays;

  if (daysCount > remaining) {
    return { error: `رصيدك المتبقي (${remaining} يوم) لا يكفي لهذا الطلب (${daysCount} يوم)` };
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.employee.id,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysCount,
      reason,
    },
  });

  revalidatePath("/leave");
  return { success: "تم إرسال طلب الإجازة بنجاح، بانتظار موافقة المدير" };
}

export async function decideLeaveRequest(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  managerNotes?: string,
) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error("غير مصرّح لك بهذا الإجراء");
  }

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { employee: true },
  });
  if (!request) throw new Error("طلب الإجازة غير موجود");
  if (!canAccessEmployee(user, request.employee)) {
    throw new Error("غير مصرّح لك بهذا الإجراء");
  }
  if (request.status !== "PENDING") {
    throw new Error("تم البت في هذا الطلب مسبقًا");
  }

  if (decision === "APPROVED") {
    const year = request.startDate.getFullYear();
    const balance = await ensureLeaveBalance(request.employeeId, request.leaveTypeId, year);
    const remaining = balance.totalDays - balance.usedDays;
    if (request.daysCount > remaining) {
      throw new Error("رصيد الموظف لم يعد كافيًا للموافقة على هذا الطلب");
    }

    await prisma.$transaction([
      prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: { increment: request.daysCount } },
      }),
      prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedById: user.id,
          decidedAt: new Date(),
          managerNotes,
        },
      }),
    ]);
  } else {
    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        approvedById: user.id,
        decidedAt: new Date(),
        managerNotes,
      },
    });
  }

  revalidatePath("/leave");
}
