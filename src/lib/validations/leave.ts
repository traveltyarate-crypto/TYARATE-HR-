import * as z from "zod";

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, { error: "نوع الإجازة مطلوب" }),
    startDate: z.string().min(1, { error: "تاريخ البداية مطلوب" }),
    endDate: z.string().min(1, { error: "تاريخ النهاية مطلوب" }),
    reason: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["endDate"],
  });

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
