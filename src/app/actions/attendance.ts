"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, canAccessEmployee } from "@/lib/dal";

function todayDateOnly() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

async function assertCanRecordFor(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canAccessEmployee(user, employee)) {
    throw new Error("غير مصرّح لك بهذا الإجراء");
  }
  return user;
}

export async function checkIn(employeeId: string) {
  const user = await assertCanRecordFor(employeeId);
  const date = todayDateOnly();

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date } },
    update: { checkIn: new Date(), status: "PRESENT" },
    create: {
      employeeId,
      date,
      checkIn: new Date(),
      status: "PRESENT",
      recordedById: user.id,
    },
  });

  revalidatePath("/attendance");
}

export async function checkOut(employeeId: string) {
  await assertCanRecordFor(employeeId);
  const date = todayDateOnly();

  await prisma.attendance.update({
    where: { employeeId_date: { employeeId, date } },
    data: { checkOut: new Date() },
  });

  revalidatePath("/attendance");
}

export async function getTodayAttendance(employeeId: string) {
  await assertCanRecordFor(employeeId);
  return prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: todayDateOnly() } },
  });
}

export async function listAttendanceForCurrentUser(days = 14) {
  const user = await requireUser();
  const since = new Date();
  since.setDate(since.getDate() - days);

  let employeeIds: string[] | undefined;

  if (user.role === "MANAGER") {
    const managedDepartmentId = user.employee?.managedDepartment?.id;
    if (!managedDepartmentId) return [];
    const employees = await prisma.employee.findMany({
      where: { departmentId: managedDepartmentId },
      select: { id: true },
    });
    employeeIds = employees.map((e) => e.id);
  } else if (user.role === "EMPLOYEE") {
    if (!user.employee) return [];
    employeeIds = [user.employee.id];
  }

  return prisma.attendance.findMany({
    where: {
      date: { gte: since },
      ...(employeeIds ? { employeeId: { in: employeeIds } } : {}),
    },
    include: { employee: { select: { fullName: true } } },
    orderBy: [{ date: "desc" }, { employee: { fullName: "asc" } }],
  });
}
