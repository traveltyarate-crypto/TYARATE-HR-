import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { listEmployeesForCurrentUser } from "@/app/actions/employees";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  ON_LEAVE: "في إجازة",
  TERMINATED: "منتهي الخدمة",
};

export async function GET() {
  const employees = await listEmployeesForCurrentUser();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("الموظفون", { views: [{ rightToLeft: true }] });

  sheet.columns = [
    { header: "الاسم الكامل", key: "fullName", width: 28 },
    { header: "الرقم الوطني", key: "nationalId", width: 18 },
    { header: "القسم", key: "department", width: 20 },
    { header: "المسمى الوظيفي", key: "jobTitle", width: 22 },
    { header: "تاريخ التعيين", key: "hireDate", width: 16 },
    { header: "الحالة", key: "status", width: 16 },
    { header: "الهاتف", key: "phone", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const emp of employees) {
    sheet.addRow({
      fullName: emp.fullName,
      nationalId: emp.nationalId,
      department: emp.department?.name ?? "",
      jobTitle: emp.jobTitle,
      hireDate: new Date(emp.hireDate).toLocaleDateString("ar-EG"),
      status: STATUS_LABELS[emp.employmentStatus] ?? emp.employmentStatus,
      phone: emp.phone,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="employees.xlsx"`,
    },
  });
}
