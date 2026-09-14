import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedLeaveTypes() {
  await prisma.leaveType.upsert({
    where: { name: "سنوية" },
    update: {},
    create: { name: "سنوية", defaultAnnualDays: 21 },
  });
  await prisma.leaveType.upsert({
    where: { name: "مرضية" },
    update: {},
    create: { name: "مرضية", defaultAnnualDays: 15 },
  });
  console.log("✔ أنواع الإجازات جاهزة");
}

async function seedAlertSettings() {
  const types = ["CONTRACT_END", "VISA_EXPIRY", "PASSPORT_EXPIRY", "RESIDENCY_EXPIRY", "LICENSE_EXPIRY"] as const;
  for (const alertType of types) {
    await prisma.alertSetting.upsert({
      where: { alertType },
      update: {},
      create: { alertType, thresholdDays: 30 },
    });
  }
  console.log("✔ إعدادات التنبيهات جاهزة (افتراضيًا 30 يومًا)");
}

async function seedFirstAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME ?? "مدير النظام";

  if (!email || !password) {
    console.log(
      "↷ تخطي إنشاء حساب الإدارة الأولي (حدّد SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD في .env لإنشائه تلقائيًا)",
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("↷ يوجد مستخدم بهذا البريد مسبقًا، تم التخطي");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "ADMIN" },
  });

  if (error || !data.user) {
    console.error("✗ تعذّر إنشاء حساب الإدارة عبر Supabase:", error?.message);
    return;
  }

  const employee = await prisma.employee.create({
    data: {
      fullName,
      nationalId: `ADMIN-${Date.now()}`,
      birthDate: new Date("1990-01-01"),
      nationality: "غير محدد",
      phone: "0000000000",
      jobTitle: "مدير النظام",
      hireDate: new Date(),
    },
  });

  await prisma.user.create({
    data: { id: data.user.id, email, role: "ADMIN", employeeId: employee.id },
  });

  console.log(`✔ تم إنشاء حساب الإدارة الأولي: ${email}`);
}

async function main() {
  await seedLeaveTypes();
  await seedAlertSettings();
  await seedFirstAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
