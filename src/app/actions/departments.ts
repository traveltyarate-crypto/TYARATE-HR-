"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import type { ActionState } from "./employees";

export async function listDepartments() {
  return prisma.department.findMany({
    include: { manager: true, _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const name = String(formData.get("name") ?? "").trim();
  const managerId = String(formData.get("managerId") ?? "").trim() || undefined;

  if (!name) {
    return { error: "اسم القسم مطلوب" };
  }

  try {
    await prisma.department.create({ data: { name, managerId } });
  } catch {
    return { error: "يوجد قسم بنفس الاسم، أو أن المدير المختار يدير قسمًا آخر بالفعل" };
  }

  revalidatePath("/departments");
  return { success: "تم إنشاء القسم بنجاح" };
}
