import { requireUser } from "@/lib/dal";
import { listPromotionsForEmployee } from "@/app/actions/promotions";

export default async function MyPromotionsPage() {
  const user = await requireUser();
  const promotions = user.employee ? await listPromotionsForEmployee(user.employee.id) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">ترقياتي</h1>
        <p className="text-sm text-slate-500">سجلّك الوظيفي منذ تاريخ التعيين</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <ul className="space-y-4">
          {promotions.map((p) => (
            <li key={p.id} className="border-r-2 border-brand-200 pr-4">
              <p className="text-xs text-slate-400">{new Date(p.effectiveDate).toLocaleDateString("ar-EG")}</p>
              <p className="text-sm font-medium text-slate-800">
                من &quot;{p.previousTitle}&quot; إلى &quot;{p.newTitle}&quot;
              </p>
              {p.note && <p className="text-xs text-slate-500">{p.note}</p>}
            </li>
          ))}
          {promotions.length === 0 && (
            <p className="text-sm text-slate-400">لا توجد ترقيات مسجَّلة بعد</p>
          )}
        </ul>
      </div>
    </div>
  );
}
