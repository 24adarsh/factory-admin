import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Factory<span className="text-indigo-400">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-Plant Control Panel
          </p>
        </div>

        <nav className="p-4 space-y-1 text-sm">
          {[
            { name: "Dashboard", href: "/admin" },
            { name: "Plants", href: "/admin/plants" },
            { name: "Employees", href: "/admin/employees" },
            { name: "Attendance", href: "/admin/attendance" },
            { name: "Payroll", href: "/admin/payroll" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="
                block px-4 py-2 rounded-lg
                text-slate-200
                hover:bg-slate-700 hover:text-white
                transition-colors duration-200
              "
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 text-slate-900">
        {children}
      </main>
    </div>
  );
}
