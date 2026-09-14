"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import type { ActionState } from "./employees";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "الرجاء إدخال البريد الإلكتروني" };
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  // رسالة عامة دائمًا (سواء وُجد البريد أم لا) لتفادي كشف قائمة المستخدمين
  return { success: "إن كان البريد الإلكتروني مسجّلاً لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور خلال دقائق" };
}

export async function updatePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" };
  }
  if (password !== confirmPassword) {
    return { error: "كلمتا المرور غير متطابقتين" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "تعذّر تحديث كلمة المرور، حاول مرة أخرى" };
  }

  return { success: "تم تحديث كلمة المرور بنجاح" };
}
