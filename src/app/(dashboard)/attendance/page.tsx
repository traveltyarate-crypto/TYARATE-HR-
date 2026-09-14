import { requireUser } from "@/lib/dal";
import { listAttendanceForCurrentUser, getTodayAttendance } from "@/app/actions/attendance";
import { AttendanceWidget } from "@/app/(dashboard)/dashboard/attendance-widget";

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "حاضر",
  ABSENT: "غائب",
  LATE: "متأخر",
  ON_LEAVE: "في إجازة",
};

function formatTime(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export default async function AttendancePage() {
  const user = await requireUser();
  const records = await listAttendanceForCurrentUser(30);
  const today = user.employee ? await getTodayAttendance(user.employee.id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">الحضور والانصراف</h1>

      {user.role === "EMPLOYEE" && user.employee && (
        <AttendanceWidget employeeId={user.employee.id} initialAttendance={today} />
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-right text-slate-500">
              {user.role !== "EMPLOYEE" && <th className="px-4 py-3 font-medium">الموظف</th>}
              <th className="px-4 py-3 font-medium">التاريخ</th>
              <th className="px-4 py-3 font-medium">الحضور</th>
              <th className="px-4 py-3 font-medium">الانصراف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                {user.role !== "EMPLOYEE" && (
                  <td className="px-4 py-3 font-medium text-slate-800">{r.employee.fullName}</td>
                )}
                <td className="px-4 py-3 text-slate-600">{new Date(r.date).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 text-slate-600">{formatTime(r.checkIn)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTime(r.checkOut)}</td>
                <td className="px-4 py-3 text-slate-600">{STATUS_LABELS[r.status] ?? r.status}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">لا توجد سجلات حضور بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
