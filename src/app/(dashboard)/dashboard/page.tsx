import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { listEmployeesForCurrentUser } from "@/app/actions/employees";
import { listLeaveRequestsForCurrentUser, getLeaveBalancesForEmployee } from "@/app/actions/leave";
import { getTodayAttendance } from "@/app/actions/attendance";
import { getCurrentIssuanceCounts } from "@/app/actions/issuance";
import { AttendanceWidget } from "./attendance-widget";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const employees = await listEmployeesForCurrentUser();
  const leaveRequests = await listLeaveRequestsForCurrentUser();
  const pendingLeave = leaveRequests.filter((r) => r.status === "PENDING");

  if (user.role === "ADMIN") {
    const departmentsCount = await prisma.department.count();
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-900">مرحبًا، {user.employee?.fullName ?? user.email}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي الموظفين" value={employees.length} />
          <StatCard label="الأقسام" value={departmentsCount} />
          <StatCard label="طلبات إجازة معلّقة" value={pendingLeave.length} />
          <StatCard
            label="الموظفون النشطون"
            value={employees.filter((e) => e.employmentStatus === "ACTIVE").length}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/employees/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + إضافة موظف جديد
          </Link>
          <Link href="/leave" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            مراجعة طلبات الإجازة
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "MANAGER") {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-900">مرحبًا، {user.employee?.fullName}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="موظفو القسم" value={employees.length} />
          <StatCard label="طلبات إجازة معلّقة" value={pendingLeave.length} />
          <StatCard
            label="نشطون"
            value={employees.filter((e) => e.employmentStatus === "ACTIVE").length}
          />
        </div>
        <Link href="/leave" className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          مراجعة طلبات الإجازة
        </Link>
      </div>
    );
  }

  // EMPLOYEE
  const employeeId = user.employee?.id;
  const today = employeeId ? await getTodayAttendance(employeeId) : null;
  const balances = employeeId ? await getLeaveBalancesForEmployee(employeeId) : [];
  const issuance = employeeId ? await getCurrentIssuanceCounts(employeeId) : { weekly: null, monthly: null };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">مرحبًا، {user.employee?.fullName}</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="عدد الإصدارات هذا الأسبوع" value={issuance.weekly ?? 0} />
        <StatCard label="عدد الإصدارات هذا الشهر" value={issuance.monthly ?? 0} />
      </div>

      {employeeId && <AttendanceWidget employeeId={employeeId} initialAttendance={today} />}

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">رصيد الإجازات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {balances.map((b) => (
            <div key={b.id} className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-500">{b.leaveType.name}</p>
              <p className="text-lg font-bold text-slate-900">
                {b.totalDays - b.usedDays} <span className="text-sm font-normal text-slate-400">/ {b.totalDays} يوم متبقي</span>
              </p>
            </div>
          ))}
        </div>
        <Link href="/leave" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          طلب إجازة جديدة
        </Link>
      </div>
    </div>
  );
}
