import { requireUser } from "@/lib/dal";
import { listIssuanceRecordsForEmployee } from "@/app/actions/issuance";

const PERIOD_LABELS: Record<string, string> = { WEEKLY: "أسبوعي", MONTHLY: "شهري" };

export default async function MyIssuancePage() {
  const user = await requireUser();
  const records = user.employee ? await listIssuanceRecordsForEmployee(user.employee.id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">عدد إصداراتي</h1>
        <p className="text-sm text-slate-500">سجلّ عدد الإصدارات الأسبوعية والشهرية المسجَّلة لك</p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              <th className="px-4 py-3 font-medium">الفترة</th>
              <th className="px-4 py-3 font-medium">تبدأ من</th>
              <th className="px-4 py-3 font-medium">العدد</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-slate-600">{PERIOD_LABELS[r.periodType] ?? r.periodType}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.periodStart).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{r.count}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-400">لا توجد سجلات بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
