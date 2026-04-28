import { MOCK_ATTENDANCE, STUDENT_SUMMARY, MOCK_STUDENT } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";

// Records of the logged-in student, sorted newest first
const myRecords = MOCK_ATTENDANCE
  .filter((r) => r.studentId === MOCK_STUDENT.id)
  .sort((a, b) => b.date.localeCompare(a.date));

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" });
};

export default function StudentAttendancePage() {
  const summary = STUDENT_SUMMARY;
  const pct = summary.percentage;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Mi Asistencia</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro diario — Semestre 2026-I</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total días", value: summary.total, bg: "bg-gray-50", text: "text-gray-900", border: "border-gray-200" },
          { label: "Presentes", value: summary.present, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
          { label: "Tardanzas", value: summary.late, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
          { label: "Faltas", value: summary.absent, bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Global percentage bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Porcentaje de asistencia</span>
          <span
            className="text-sm font-bold"
            style={{ color: pct >= 80 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444" }}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>
        {pct < 75 && (
          <p className="text-xs text-red-500 mt-2 font-medium">
            ⚠ Tu asistencia está por debajo del umbral mínimo requerido (75%)
          </p>
        )}
      </div>

      {/* Daily attendance list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Historial por día</h3>
          <span className="text-xs text-gray-400">{myRecords.length} días registrados</span>
        </div>

        <ul className="divide-y divide-gray-50">
          {myRecords.map((r) => (
            <li key={r.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              {/* Day indicator */}
              <div className="shrink-0 w-20 text-right">
                <p className="text-xs font-medium text-gray-700 capitalize">{dayLabel(r.date)}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{r.date}</p>
              </div>

              {/* Timeline dot */}
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    r.status === "presente"
                      ? "bg-emerald-500 border-emerald-200"
                      : r.status === "tardanza"
                      ? "bg-amber-400 border-amber-200"
                      : "bg-red-400 border-red-200"
                  }`}
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                <div className="p-5 sm:p-6 md:p-8">
                  <StatusBadge status={r.status} />
                  {r.note && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{r.note}</p>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-500 shrink-0">{r.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
