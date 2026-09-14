import * as z from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(3, { error: "الاسم الكامل مطلوب (3 أحرف على الأقل)" }),
  nationalId: z.string().min(5, { error: "الرقم الوطني مطلوب" }),
  birthDate: z.string().min(1, { error: "تاريخ الميلاد مطلوب" }),
  nationality: z.string().min(2, { error: "الجنسية مطلوبة" }),
  phone: z.string().min(6, { error: "رقم الهاتف مطلوب" }),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  departmentId: z.string().optional(),
  jobTitle: z.string().min(2, { error: "المسمى الوظيفي مطلوب" }),
  hireDate: z.string().min(1, { error: "تاريخ التعيين مطلوب" }),
  email: z.email({ error: "بريد إلكتروني غير صالح" }),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// لتعديل بيانات موظف موجود — بدون البريد الإلكتروني (حساب الدخول لا يُعدَّل من هنا)
export const employeeEditSchema = employeeSchema.omit({ email: true });
export type EmployeeEditInput = z.infer<typeof employeeEditSchema>;
