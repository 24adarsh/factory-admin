import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Plants", href: "/admin/plants" },
    { name: "Employees", href: "/admin/employees" },
    { name: "Attendance", href: "/admin/attendance" },
    { name: "Payroll", href: "/admin/payroll" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-2xl sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Factory<span className="text-indigo-400">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-Plant Control Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-4 py-2 rounded-lg
                  transition-colors duration-200
                  ${isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 text-slate-900 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
