"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentType } from "@/generated/prisma/enums";
import type { ActionState } from "./employees";

const BUCKET = "employee-documents";
const DOC_TYPES: DocumentType[] = [
  "NATIONAL_ID",
  "PASSPORT",
  "VISA",
  "RESIDENCY",
  "PROFESSIONAL_LICENSE",
  "CERTIFICATE",
  "CV",
  "OTHER",
];

export async function uploadEmployeeDocument(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const employeeId = String(formData.get("employeeId") ?? "");
  const docType = String(formData.get("docType") ?? "") as DocumentType;
  const expiryDateRaw = String(formData.get("expiryDate") ?? "");
  const file = formData.get("file") as File | null;

  if (!employeeId || !DOC_TYPES.includes(docType) || !file || file.size === 0) {
    return { error: "الرجاء اختيار نوع المستند وملف صالح" };
  }

  const supabase = createAdminClient();
  const path = `${employeeId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (uploadError) {
    return { error: `تعذّر رفع الملف: ${uploadError.message}` };
  }

  await prisma.employeeDocument.create({
    data: {
      employeeId,
      docType,
      fileUrl: path,
      fileName: file.name,
      expiryDate: expiryDateRaw ? new Date(expiryDateRaw) : null,
    },
  });

  revalidatePath(`/employees/${employeeId}`);
  return { success: "تم رفع المستند بنجاح" };
}

export async function getSignedDocumentUrl(storagePath: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 5);
  return data?.signedUrl ?? null;
}
