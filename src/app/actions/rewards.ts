"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, canAccessEmployee } from "@/lib/dal";
import type { RewardDeductionType } from "@/generated/prisma/enums";
import type { ActionState } from "./employees";

export async function listRewardDeductionsForEmployee(employeeId: string) {
  const user = await requireUser();
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, departmentId: true },
  });
  if (!employee || !canAccessEmployee(user, employee)) return [];

  return prisma.rewardDeduction.findMany({
    where: { employeeId },
    orderBy: { date: "desc" },
  });
}

export async function createRewardDeduction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("ADMIN");

  const employeeId = String(formData.get("employeeId") ?? "");
  const type = String(formData.get("type") ?? "") as RewardDeductionType;
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();
  const date = String(formData.get("date") ?? "");

  if (!employeeId || !["REWARD", "DEDUCTION"].includes(type) || !Number.isFinite(amount) || amount <= 0 || !reason || !date) {
    return { error: "الرجاء تعبئة كل الحقول بشكل صحيح" };
  }

  await prisma.rewardDeduction.create({
    data: {
      employeeId,
      type,
      amount,
      reason,
      date: new Date(date),
      recordedById: admin.id,
    },
  });

  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/rewards");
  return { success: "تم تسجيل الحركة المالية بنجاح" };
}
