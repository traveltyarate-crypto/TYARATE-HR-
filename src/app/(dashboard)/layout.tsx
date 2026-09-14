import { requireUser } from "@/lib/dal";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <DashboardShell
      role={user.role}
      userName={user.employee?.fullName ?? user.email}
      canManageIssuances={user.canManageIssuances}
    >
      {children}
    </DashboardShell>
  );
}
