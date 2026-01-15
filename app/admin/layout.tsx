"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Plants", href: "/admin/plants" },
    { name: "Employees", href: "/admin/employees" },
    { name: "Attendance", href: "/admin/attendance" },
    { name: "Payroll", href: "/admin/payroll" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-slate-200">
      {/* ===== MOBILE OVERLAY ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed md:static z-40 h-screen w-64
          bg-gradient-to-b from-slate-900 to-slate-800
          text-slate-100 shadow-2xl
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">
            Factory<span className="text-indigo-400">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-Plant Control Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  block px-4 py-2 rounded-lg transition
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (mobile only) */}
        <header className="md:hidden flex items-center gap-3 bg-white shadow px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-800"
          >
            ☰
          </button>
          <span className="font-semibold">Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-8 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
