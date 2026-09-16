"use client";

import { useActionState } from "react";
import { setEmployeePassword } from "@/app/actions/employees";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function SetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(setEmployeePassword, undefined);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">تعيين كلمة مرور جديدة يدويًا</h2>
      <p className="mb-4 text-xs text-slate-400">
        يُغيّر كلمة مرور دخول الموظف مباشرة، دون إرسال أي بريد إلكتروني — أخبره بها بنفسك
      </p>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="sp-password">كلمة المرور الجديدة</label>
            <input id="sp-password" name="password" type="text" required minLength={8} className={inputClass} placeholder="8 أحرف على الأقل" />
          </div>
          <div>
            <label className={labelClass} htmlFor="sp-confirm">تأكيد كلمة المرور</label>
            <input id="sp-confirm" name="confirmPassword" type="text" required minLength={8} className={inputClass} />
          </div>
        </div>

        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "جارِ الحفظ..." : "تحديث كلمة المرور"}
        </button>
      </form>
    </section>
  );
}
