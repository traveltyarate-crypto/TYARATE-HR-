"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, canAccessEmployee } from "@/lib/dal";
import type { ActionState } from "./employees";

export async function listPromotionsForEmployee(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canAccessEmployee(user, employee)) return [];

  return prisma.promotion.findMany({
    where: { employeeId },
    orderBy: { effectiveDate: "desc" },
  });
}

export async function createPromotion(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("ADMIN");

  const employeeId = String(formData.get("employeeId") ?? "");
  const previousTitle = String(formData.get("previousTitle") ?? "").trim();
  const newTitle = String(formData.get("newTitle") ?? "").trim();
  const effectiveDate = String(formData.get("effectiveDate") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!employeeId || !previousTitle || !newTitle || !effectiveDate) {
    return { error: "الرجاء تعبئة كل الحقول المطلوبة" };
  }

  await prisma.$transaction([
    prisma.promotion.create({
      data: {
        employeeId,
        previousTitle,
        newTitle,
        effectiveDate: new Date(effectiveDate),
        note,
        recordedById: admin.id,
      },
    }),
    prisma.employee.update({
      where: { id: employeeId },
      data: { jobTitle: newTitle },
    }),
  ]);

  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/promotions");
  return { success: "تم تسجيل الترقية وتحديث المسمى الوظيفي بنجاح" };
}
