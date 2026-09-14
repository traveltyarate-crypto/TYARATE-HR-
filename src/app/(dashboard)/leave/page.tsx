import { requireUser } from "@/lib/dal";
import { listLeaveRequestsForCurrentUser, listLeaveTypes, getLeaveBalancesForEmployee } from "@/app/actions/leave";
import { LeaveRequestStatusBadge } from "@/components/status-badge";
import { RequestLeaveForm } from "./request-form";
import { DecisionButtons } from "./decision-buttons";

export default async function LeavePage() {
  const user = await requireUser();
  const requests = await listLeaveRequestsForCurrentUser();
  const leaveTypes = await listLeaveTypes();
  const balances = user.employee ? await getLeaveBalancesForEmployee(user.employee.id) : [];

  const canDecide = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">الإجازات</h1>

      {user.employee && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RequestLeaveForm leaveTypes={leaveTypes.map((t) => ({ id: t.id, name: t.name }))} />

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">رصيدي الحالي</h2>
            <div className="grid grid-cols-2 gap-3">
              {balances.map((b) => (
                <div key={b.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{b.leaveType.name}</p>
                  <p className="text-lg font-bold text-slate-900">{b.totalDays - b.usedDays} / {b.totalDays}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              {user.role !== "EMPLOYEE" && <th className="px-4 py-3 font-medium">الموظف</th>}
              <th className="px-4 py-3 font-medium">نوع الإجازة</th>
              <th className="px-4 py-3 font-medium">من</th>
              <th className="px-4 py-3 font-medium">إلى</th>
              <th className="px-4 py-3 font-medium">عدد الأيام</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              {canDecide && <th className="px-4 py-3 font-medium">إجراء</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                {user.role !== "EMPLOYEE" && (
                  <td className="px-4 py-3 font-medium text-slate-800">{r.employee.fullName}</td>
                )}
                <td className="px-4 py-3 text-slate-600">{r.leaveType.name}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.startDate).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.endDate).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 text-slate-600">{r.daysCount}</td>
                <td className="px-4 py-3"><LeaveRequestStatusBadge status={r.status} /></td>
                {canDecide && (
                  <td className="px-4 py-3">
                    {r.status === "PENDING" && <DecisionButtons requestId={r.id} />}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">لا توجد طلبات إجازة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
