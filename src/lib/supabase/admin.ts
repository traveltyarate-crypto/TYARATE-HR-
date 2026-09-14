import "server-only";
import { createClient } from "@supabase/supabase-js";

// عميل بصلاحية Service Role — للعمليات الإدارية فقط (إنشاء/تعطيل حسابات الموظفين)
// لا يُستورد أبدًا في مكوّن عميل (Client Component)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
