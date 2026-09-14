import { requireUser } from "@/lib/dal";
import { listRewardDeductionsForEmployee } from "@/app/actions/rewards";

const REWARD_TYPE_LABELS: Record<string, string> = { REWARD: "مكافأة", DEDUCTION: "خصم" };

export default async function MyRewardsPage() {
  const user = await requireUser();
  const records = user.employee ? await listRewardDeductionsForEmployee(user.employee.id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">مكافآتي وخصوماتي</h1>
        <p className="text-sm text-slate-500">سجل الحركات المالية الاستثنائية على راتبك</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              <th className="px-4 py-3 font-medium">التاريخ</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">المبلغ</th>
              <th className="px-4 py-3 font-medium">السبب</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-slate-600">{new Date(r.date).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3">
                  <span className={r.type === "REWARD" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                    {REWARD_TYPE_LABELS[r.type]}
                  </span>
                </td>
                <td className={`px-4 py-3 font-semibold ${r.type === "REWARD" ? "text-emerald-600" : "text-red-600"}`}>
                  {r.type === "REWARD" ? "+" : "-"}{r.amount.toString()}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.reason}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">لا توجد حركات مسجَّلة بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
