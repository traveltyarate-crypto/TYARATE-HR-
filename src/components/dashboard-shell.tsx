"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Building2, Clock, CalendarDays, Gift, TrendingUp, Ticket, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { Role } from "@/generated/prisma/enums";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "إدارة عليا",
  MANAGER: "مدير قسم",
  EMPLOYEE: "موظف",
};

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

function navForRole(role: Role, canManageIssuances: boolean): NavItem[] {
  const common: NavItem[] = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  ];
  const issuanceItem: NavItem[] = canManageIssuances
    ? [{ href: "/issuance", label: "عدد الإصدارات", icon: Ticket }]
    : [];

  if (role === "ADMIN") {
    return [
      ...common,
      { href: "/employees", label: "الموظفون", icon: Users },
      { href: "/departments", label: "الأقسام", icon: Building2 },
      { href: "/attendance", label: "الحضور والانصراف", icon: Clock },
      { href: "/leave", label: "الإجازات", icon: CalendarDays },
      { href: "/issuance", label: "عدد الإصدارات", icon: Ticket },
    ];
  }

  if (role === "MANAGER") {
    return [
      ...common,
      { href: "/employees", label: "موظفو القسم", icon: Users },
      { href: "/attendance", label: "الحضور والانصراف", icon: Clock },
      { href: "/leave", label: "طلبات الإجازة", icon: CalendarDays },
      { href: "/issuance", label: "عدد الإصدارات", icon: Ticket },
    ];
  }

  return [
    ...common,
    { href: "/attendance", label: "حضوري", icon: Clock },
    { href: "/leave", label: "إجازاتي", icon: CalendarDays },
    { href: "/rewards", label: "مكافآتي وخصوماتي", icon: Gift },
    { href: "/promotions", label: "ترقياتي", icon: TrendingUp },
    ...issuanceItem,
  ];
}

export function DashboardShell({
  role,
  userName,
  canManageIssuances = false,
  children,
}: {
  role: Role;
  userName: string;
  canManageIssuances?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navForRole(role, canManageIssuances);

  return (
    <div className="flex min-h-screen">
      {open && (
        <button
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 shrink-0 transform border-l border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <span className="text-base font-bold text-brand-700">طيارتي</span>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800">{userName}</p>
              <p className="text-xs text-slate-400">{ROLE_LABELS[role]}</p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="حسابي وكلمة المرور"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
