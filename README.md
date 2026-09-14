# طيارتي — نظام إدارة الشؤون الإدارية للموظفين

نظام ويب لإدارة بيانات الموظفين والحضور والإجازات لصالح "طيارتي للاستثمار والخدمات السياحية".

المرحلة الحالية (MVP): تسجيل الدخول بالأدوار (Admin / Manager / Employee)، بيانات
الموظفين (شخصية + توظيف + عقود + مستندات)، الأقسام، الحضور والانصراف، والإجازات
(طلب/موافقة/رصيد تلقائي).

## المتطلبات

- Node.js 20+
- مشروع [Supabase](https://supabase.com) مجاني (Auth + Postgres + Storage)

## 1) إعداد مشروع Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. من **Project Settings > API Keys** انسخ: `Project URL`، `Publishable key`، `Secret key`
   (تُستخدم بدل anon/service_role القديمة، وتعمل بنفس الطريقة).
3. من زر **Connect** أعلى الصفحة اختر تبويب **Session pooler** وانسخ رابط الاتصال —
   موصى به بدل Direct connection (متوافق مع IPv4 ويعمل بشكل موثوق على منصات مثل Vercel).
4. من **Storage** أنشئ Bucket خاص (Private) باسم `employee-documents` لتخزين مستندات
   الموظفين (البطاقة، الجواز، الشهادات...).
5. من **Authentication > URL Configuration**: اجعل **Site URL** يساوي رابط موقعك المنشور
   (مثلًا `https://your-app.vercel.app`)، وأضف نفس الرابط ضمن **Redirect URLs**.
6. من **Authentication > Email Templates > Reset Password**: استبدل الرابط الافتراضي
   بالتالي (مطلوب لعمل صفحة "نسيت كلمة المرور" بشكل صحيح):
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
   ```

## 2) إعداد المتغيرات البيئية

```bash
cp .env.example .env
```

ثم املأ القيم في `.env`:

- `DATABASE_URL`: رابط الاتصال بقاعدة البيانات (Connection pooling من الخطوة السابقة)
- `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY`: من Project Settings > API
- `SUPABASE_SERVICE_ROLE_KEY`: **سرّي جدًا**، يُستخدم فقط في كود السيرفر لإنشاء حسابات الموظفين
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME`: بيانات أول حساب إدارة عليا (اختياري لكن موصى به)

## 3) تثبيت الحزم وتهيئة قاعدة البيانات

```bash
npm install
npx prisma migrate dev --name init   # ينشئ الجداول في قاعدة بيانات Supabase
npx prisma db seed                   # ينشئ أنواع الإجازات + إعدادات التنبيهات + أول حساب إدارة
```

## 4) تشغيل النظام محليًا

```bash
npm run dev
```

افتح http://localhost:3000 وسجّل الدخول بحساب الإدارة الذي أنشأته (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

من حساب الإدارة يمكنك:

- إضافة أقسام (`/departments`)
- إضافة موظفين جدد (`/employees/new`) — يُنشأ لكل موظف تلقائيًا حساب دخول (يظهر لك
  كلمة مرور مؤقتة عند الإنشاء، شاركها مع الموظف بأمان)
- تعيين مدير لكل قسم (المدير = المدير المباشر لكل موظفي القسم تلقائيًا)

## الأدوار والصلاحيات

| الدور | الصلاحية |
|---|---|
| Admin | كل البيانات: الموظفون، الأقسام، الحضور، الإجازات |
| Manager | قراءة موظفي قسمه فقط + الموافقة/الرفض على طلبات إجازاتهم |
| Employee | بياناته فقط + تسجيل حضوره + تقديم طلبات إجازة |

## ملاحظات

- تصدير Excel متاح لقائمة الموظفين من زر "تصدير Excel" (`/api/exports/employees`)، وسيُضاف
  لبقية الجداول الرئيسية في المراحل القادمة.
- الوحدات القادمة (غير مبنية بعد): الأهداف وتقييم الأداء، التدريب، الرواتب، التنبيهات، التقارير.
