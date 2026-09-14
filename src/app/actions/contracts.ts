"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import type { ContractType } from "@/generated/prisma/enums";
import type { ActionState } from "./employees";

export async function createContract(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const employeeId = String(formData.get("employeeId") ?? "");
  const contractType = String(formData.get("contractType") ?? "") as ContractType;
  const startDate = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");
  const baseSalaryRaw = String(formData.get("baseSalary") ?? "");
  const allowancesRaw = String(formData.get("allowances") ?? "");

  const baseSalary = Number(baseSalaryRaw);
  if (!employeeId || !startDate || !Number.isFinite(baseSalary) || baseSalary <= 0) {
    return { error: "الرجاء تعبئة بيانات العقد بشكل صحيح" };
  }

  const allowancesValue = Number(allowancesRaw);
  const allowances =
    Number.isFinite(allowancesValue) && allowancesValue > 0
      ? [{ name: "بدلات عامة", amount: allowancesValue }]
      : undefined;

  await prisma.$transaction([
    prisma.contract.updateMany({
      where: { employeeId, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    }),
    prisma.contract.create({
      data: {
        employeeId,
        contractType,
        startDate: new Date(startDate),
        endDate: endDateRaw ? new Date(endDateRaw) : null,
        baseSalary,
        allowances,
      },
    }),
  ]);

  revalidatePath(`/employees/${employeeId}`);
  return { success: "تم إضافة العقد بنجاح" };
}
