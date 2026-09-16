import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getEmployeeForCurrentUser } from "@/app/actions/employees";
import { listRewardDeductionsForEmployee } from "@/app/actions/rewards";
import { listPromotionsForEmployee } from "@/app/actions/promotions";
import { listIssuanceRecordsForEmployee } from "@/app/actions/issuance";
import { EmploymentStatusBadge } from "@/components/status-badge";
import { StatusControl } from "./status-control";
import { ContractForm } from "./contract-form";
import { DocumentForm } from "./document-form";
import { RewardForm } from "./reward-form";
import { PromotionForm } from "./promotion-form";
import { IssuanceForm } from "./issuance-form";
import { IssuancePermissionToggle } from "./issuance-permission-toggle";
import { SetPasswordForm } from "./set-password-form";

const REWARD_TYPE_LABELS: Record<string, string> = { REWARD: "مكافأة", DEDUCTION: "خصم" };
const ISSUANCE_PERIOD_LABELS: Record<string, string> = { WEEKLY: "أسبوعي", MONTHLY: "شهري" };

const DOC_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "بطاقة شخصية",
  PASSPORT: "جواز سفر",
  VISA: "تأشيرة",
  RESIDENCY: "إقامة",
  PROFESSIONAL_LICENSE: "رخصة مهنية",
  CERTIFICATE: "شهادة",
  CV: "سيرة ذاتية",
  OTHER: "أخرى",
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  TEMPORARY: "مؤقت",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await requireUser();
  const employee = await getEmployeeForCurrentUser(id);

  if (!employee) notFound();

  const isAdmin = currentUser.role === "ADMIN";
  const canRecordIssuance =
    isAdmin || currentUser.role === "MANAGER" || currentUser.canManageIssuances;
  const activeContract = employee.contracts.find((c) => c.status === "ACTIVE");

  const [rewardDeductions, promotions, issuanceRecords] = await Promise.all([
    listRewardDeductionsForEmployee(employee.id),
    listPromotionsForEmployee(employee.id),
    listIssuanceRecordsForEmployee(employee.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{employee.fullName}</h1>
          <p className="text-sm text-slate-500">{employee.jobTitle} · {employee.department?.name ?? "بدون قسم"}</p>
        </div>
        <div className="flex items-center gap-3">
          <EmploymentStatusBadge status={employee.employmentStatus} />
          {isAdmin && <StatusControl employeeId={employee.id} currentStatus={employee.employmentStatus} />}
          {isAdmin && (
            <Link
              href={`/employees/${employee.id}/edit`}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              تعديل البيانات
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">البيانات الشخصية</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="الرقم الوطني" value={employee.nationalId} />
            <InfoRow label="تاريخ الميلاد" value={new Date(employee.birthDate).toLocaleDateString("ar-EG")} />
            <InfoRow label="الجنسية" value={employee.nationality} />
            <InfoRow label="الهاتف" value={employee.phone} />
            <InfoRow label="العنوان" value={employee.address || "—"} />
            <InfoRow label="جهة اتصال للطوارئ" value={employee.emergencyContactName || "—"} />
            <InfoRow label="هاتف الطوارئ" value={employee.emergencyContactPhone || "—"} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">بيانات التوظيف</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="تاريخ التعيين" value={new Date(employee.hireDate).toLocaleDateString("ar-EG")} />
            <InfoRow label="القسم" value={employee.department?.name ?? "—"} />
            <InfoRow label="المسمى الوظيفي" value={employee.jobTitle} />
            <InfoRow
              label="العقد الحالي"
              value={
                activeContract
                  ? `${CONTRACT_TYPE_LABELS[activeContract.contractType]} · ${activeContract.baseSalary} `
                  : "لا يوجد عقد نشط"
              }
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">رصيد الإجازات</h2>
          <div className="grid grid-cols-2 gap-3">
            {employee.leaveBalances.map((b) => (
              <div key={b.id} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{b.leaveType.name} ({b.year})</p>
                <p className="text-sm font-bold text-slate-900">{b.totalDays - b.usedDays} / {b.totalDays} يوم</p>
              </div>
            ))}
            {employee.leaveBalances.length === 0 && (
              <p className="text-sm text-slate-400">لا يوجد رصيد مسجَّل بعد</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">المستندات</h2>
          <ul className="space-y-2">
            {employee.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>{DOC_TYPE_LABELS[doc.docType] ?? doc.docType} · {doc.fileName}</span>
                {doc.expiryDate && (
                  <span className="text-xs text-slate-400">
                    ينتهي في {new Date(doc.expiryDate).toLocaleDateString("ar-EG")}
                  </span>
                )}
              </li>
            ))}
            {employee.documents.length === 0 && (
              <p className="text-sm text-slate-400">لا توجد مستندات مرفوعة</p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">المكافآت والخصومات</h2>
          <ul className="space-y-2">
            {rewardDeductions.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>
                  <span className={r.type === "REWARD" ? "text-emerald-600" : "text-red-600"}>
                    {REWARD_TYPE_LABELS[r.type]}
                  </span>
                  {" · "}{r.reason}
                </span>
                <span className={`font-semibold ${r.type === "REWARD" ? "text-emerald-600" : "text-red-600"}`}>
                  {r.type === "REWARD" ? "+" : "-"}{r.amount.toString()}
                </span>
              </li>
            ))}
            {rewardDeductions.length === 0 && (
              <p className="text-sm text-slate-400">لا توجد حركات مسجَّلة</p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">الترقيات</h2>
          <ul className="space-y-2">
            {promotions.map((p) => (
              <li key={p.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <p>
                  من <span className="font-medium">{p.previousTitle}</span> إلى{" "}
                  <span className="font-medium">{p.newTitle}</span>
                </p>
                <p className="text-xs text-slate-400">{new Date(p.effectiveDate).toLocaleDateString("ar-EG")}</p>
              </li>
            ))}
            {promotions.length === 0 && (
              <p className="text-sm text-slate-400">لا توجد ترقيات مسجَّلة</p>
            )}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">عدد الإصدارات</h2>
          <div className="grid grid-cols-2 gap-3">
            {issuanceRecords.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  {ISSUANCE_PERIOD_LABELS[r.periodType]} · {new Date(r.periodStart).toLocaleDateString("ar-EG")}
                </p>
                <p className="text-sm font-bold text-slate-900">{r.count}</p>
              </div>
            ))}
            {issuanceRecords.length === 0 && (
              <p className="text-sm text-slate-400">لا توجد سجلات بعد</p>
            )}
          </div>
        </section>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ContractForm employeeId={employee.id} />
          <DocumentForm employeeId={employee.id} />
          <RewardForm employeeId={employee.id} />
          <PromotionForm employeeId={employee.id} currentTitle={employee.jobTitle} />
          {employee.user && <SetPasswordForm userId={employee.user.id} />}
        </div>
      )}
      {canRecordIssuance && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <IssuanceForm employeeId={employee.id} />
          {isAdmin && employee.user && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">صلاحية خاصة</h2>
              <IssuancePermissionToggle
                userId={employee.user.id}
                initialValue={employee.user.canManageIssuances}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
