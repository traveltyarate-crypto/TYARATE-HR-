import { requireUser } from "@/lib/dal";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">حسابي</h1>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
