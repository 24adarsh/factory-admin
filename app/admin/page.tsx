export default function AdminDashboard() {
  return (
    <div className="relative h-[calc(100vh-4rem)] rounded-2xl overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('/dashboard-bg.jpg')",
        }}
      />

      {/* Gradient Overlay (READABILITY) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-700/40 backdrop-blur-sm" />

      {/* Grain Effect (LUXURY TOUCH) */}
      <div className="grain" />

      {/* Content */}
      <div className="relative z-10 p-10 text-white max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Admin Dashboard
        </h1>

        <p className="text-slate-200 text-lg leading-relaxed">
          Welcome to{" "}
          <span className="text-indigo-400 font-semibold">
            FactoryAdmin
          </span>
          . Manage plants, employees, attendance, and payroll from a unified
          control panel.
        </p>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-sm text-slate-300">System</p>
            <p className="text-lg font-semibold">
              Multi-Plant Admin
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-sm text-slate-300">Architecture</p>
            <p className="text-lg font-semibold">
              Serverless Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
