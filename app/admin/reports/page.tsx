import { MOCK_ATTENDANCE, MOCK_STUDENTS } from "@/lib/mockData";

// ─── Stat calculation helpers ─────────────────────────────────────────────────

const total = MOCK_ATTENDANCE.length;
const present = MOCK_ATTENDANCE.filter((r) => r.status === "presente").length;
const late = MOCK_ATTENDANCE.filter((r) => r.status === "tardanza").length;
const absent = MOCK_ATTENDANCE.filter((r) => r.status === "falta").length;
const pct = Math.round(((present + late) / total) * 100);

// Attendance per day (mock)
const DAYS_DATA = [
  { day: "Lun 21/04", present: 3, late: 1, absent: 0 },
  { day: "Mar 22/04", present: 2, late: 1, absent: 1 },
  { day: "Mié 23/04", present: 2, late: 0, absent: 1 },
  { day: "Jue 24/04", present: 2, late: 1, absent: 0 },
  { day: "Vie 25/04", present: 1, late: 0, absent: 1 },
];

// Per student
const perStudent = MOCK_STUDENTS.map((s) => {
  const records = MOCK_ATTENDANCE.filter((r) => r.studentId === s.id);
  const p = records.filter((r) => r.status === "presente").length;
  const t = records.filter((r) => r.status === "tardanza").length;
  const total = records.length || 1;
  return {
    ...s,
    present: p,
    late: t,
    absent: records.filter((r) => r.status === "falta").length,
    pct: Math.round(((p + t) / total) * 100),
    total: records.length,
  };
});

// ─── Bar chart (pure CSS) ─────────────────────────────────────────────────────

function BarChart() {
  const maxVal = Math.max(...DAYS_DATA.map((d) => d.present + d.late + d.absent));
  return (
    <div className="flex items-end gap-2 h-36">
      {DAYS_DATA.map((d) => {
        const total = d.present + d.late + d.absent;
        const pPct = (d.present / maxVal) * 100;
        const tPct = (d.late / maxVal) * 100;
        const aPct = (d.absent / maxVal) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: 112 }}>
              {/* absent (bottom) */}
              <div
                className="w-full bg-red-400 transition-all"
                style={{ height: `${aPct}%` }}
              />
              {/* late */}
              <div
                className="w-full bg-amber-400 transition-all"
                style={{ height: `${tPct}%` }}
              />
              {/* present */}
              <div
                className="w-full bg-emerald-500 transition-all"
                style={{ height: `${pPct}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Semestre 2026-I — Semana del 21 al 25 de abril</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total registros", value: total, color: "#1B2B6B", icon: "📋" },
          { label: "Asistencias", value: present, color: "#10b981", icon: "✅" },
          { label: "Tardanzas", value: late, color: "#f59e0b", icon: "⏰" },
          { label: "Faltas", value: absent, color: "#ef4444", icon: "❌" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-lg mb-1">{c.icon}</div>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Global attendance percentage */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Tasa de asistencia global</span>
          <span
            className="text-sm font-bold"
            style={{ color: pct >= 80 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444" }}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: "Presente", color: "#10b981" },
            { label: "Tardanza", color: "#f59e0b" },
            { label: "Falta", color: "#ef4444" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance by day chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Asistencia por día</h3>
          <BarChart />
          <div className="flex items-center gap-4 mt-3">
            {[
              { label: "Presentes", color: "#10b981" },
              { label: "Tardanzas", color: "#f5a623" },
              { label: "Faltas", color: "#f87171" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-[10px] text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per student breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Asistencia por estudiante</h3>
          <div className="space-y-3">
            {perStudent.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: s.avatarColor }}
                    >
                      {s.avatarInitials}
                    </div>
                    <span className="text-xs text-gray-700 font-medium truncate max-w-36">
                      {s.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold ml-2 shrink-0"
                    style={{ color: s.pct >= 80 ? "#10b981" : s.pct >= 70 ? "#f59e0b" : "#ef4444" }}
                  >
                    {s.pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${s.pct}%`,
                      background: s.pct >= 80 ? "#10b981" : s.pct >= 70 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-gray-400">{s.present} ✓</span>
                  <span className="text-[10px] text-gray-400">{s.late} ⏰</span>
                  <span className="text-[10px] text-gray-400">{s.absent} ✗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
