"use client";

import { useState, useTransition } from "react";
import { checkIn, checkOut } from "@/app/actions/attendance";

type Attendance = {
  checkIn: Date | string | null;
  checkOut: Date | string | null;
} | null;

function formatTime(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export function AttendanceWidget({
  employeeId,
  initialAttendance,
}: {
  employeeId: string;
  initialAttendance: Attendance;
}) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">حضور اليوم</h2>
      <div className="mb-4 flex gap-6 text-sm">
        <div>
          <p className="text-slate-500">وقت الحضور</p>
          <p className="font-bold text-slate-900">{formatTime(attendance?.checkIn ?? null)}</p>
        </div>
        <div>
          <p className="text-slate-500">وقت الانصراف</p>
          <p className="font-bold text-slate-900">{formatTime(attendance?.checkOut ?? null)}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          disabled={isPending || Boolean(attendance?.checkIn)}
          onClick={() =>
            startTransition(async () => {
              await checkIn(employeeId);
              setAttendance({ checkIn: new Date(), checkOut: attendance?.checkOut ?? null });
            })
          }
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          تسجيل الحضور
        </button>
        <button
          disabled={isPending || !attendance?.checkIn || Boolean(attendance?.checkOut)}
          onClick={() =>
            startTransition(async () => {
              await checkOut(employeeId);
              setAttendance({ checkIn: attendance?.checkIn ?? null, checkOut: new Date() });
            })
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          تسجيل الانصراف
        </button>
      </div>
    </div>
  );
}
