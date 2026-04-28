"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import {
  STUDENT_SUMMARY,
} from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";

import { QRCodeSVG } from "qrcode.react";

interface ScheduleEntry {
  id: string;
  course: string;
  day: string;
  time: string;
  room: string;
}

// ─── QR Component ─────────────────────────────────────────────────────────────

function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
      <QRCodeSVG 
        value={value || "no-data"} 
        size={140}
        level="H"
        includeMargin={false}
        imageSettings={{
          src: "/logo/iesdtp-logo.png",
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color + "18" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { userData, loading } = useAuth();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  
  useEffect(() => {
    if (loading || !userData) return;

    // Filtrar cursos por carrera y semestre del alumno
    const q = query(
      collection(db, "course"),
      where("degree", "==", userData.degree),
      where("semester", "==", userData.Semester || userData.semester || "V")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: ScheduleEntry[] = [];
      const courses: any[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        courses.push({ id: doc.id, name: data.name });

        if (data.schedule && Array.isArray(data.schedule)) {
          data.schedule.forEach((s: any, idx: number) => {
            entries.push({
              id: `${doc.id}-${idx}`,
              course: data.name,
              day: s.day,
              time: `${s.startTime} – ${s.endTime}`,
              room: data.room || "Aula B-204" // Fallback si no hay aula
            });
          });
        }
      });

      // Ordenar por día de la semana (opcional)
      const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      entries.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

      setSchedule(entries.slice(0, 10)); // Top 10 próximos
      setCoursesList(courses);
      setLoadingSchedule(false);
    });

    return () => unsubscribe();
  }, [userData, loading]);

  if (loading) return null;

  const student = {
    name: userData?.name ? `${userData.name} ${userData.surname || ""}`.trim() : "Estudiante",
    code: userData?.dni || "S/DNI",
    career: userData?.degree || "Carrera no especificada",
    semester: userData?.Semester ? `Semestre ${userData.Semester}` : "Semestre no especificado",
    email: userData?.email || "",
    avatarColor: "#1B2B6B",
    avatarInitials: (userData?.name?.[0] || "S") + (userData?.surname?.[0] || "T")
  };

  const summary = STUDENT_SUMMARY;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* QR Modal Overlay */}
      {isQRModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsQRModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xl font-bold text-gray-900">Mi código QR</h3>
              <button 
                onClick={() => setIsQRModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-gray-100 shadow-inner">
              <QRCodeSVG 
                value={userData?.qr_data || userData?.dni || ""} 
                size={280}
                level="H"
                className="w-full h-auto max-w-[280px]"
                imageSettings={{
                  src: "/logo/iesdtp-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 60,
                  width: 60,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="text-center">
              <p className="text-lg font-bold text-[#1B2B6B]">{student.name}</p>
              <p className="text-sm font-medium text-gray-500 mt-1">DNI: {student.code}</p>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Asegúrate de que el brillo de tu pantalla sea suficiente para facilitar el escaneo por parte del docente.
              </p>
            </div>
            
            <button 
              onClick={() => setIsQRModalOpen(false)}
              className="w-full py-3 bg-[#1B2B6B] text-white rounded-xl font-semibold hover:bg-[#14205A] transition active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bienvenido de vuelta, {student.name.split(" ")[0]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Student Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md"
                style={{ background: student.avatarColor }}
              >
                {student.avatarInitials}
              </div>
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">{student.name}</h2>
              <p className="text-xs font-medium mt-0.5" style={{color:'#1B2B6B'}}>{student.code}</p>
              <p className="text-xs text-[#4A5680] mt-1">{student.career}</p>
              <span className="mt-2 px-2.5 py-0.5 text-xs rounded-full font-medium" style={{background:'#EDF0FA',color:'#1B2B6B'}}>
                {student.semester}
              </span>
              <div className="mt-3 pt-3 border-t border-gray-100 w-full text-xs text-gray-500">
                {student.email}
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Mi código QR</h3>
              <button 
                onClick={() => setIsQRModalOpen(true)}
                className="text-xs font-medium hover:underline transition-all" 
                style={{color:'#CC1116'}}
              >
                Ver completo
              </button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <QRCodeDisplay value={userData?.qr_data || userData?.dni || ""} />
              <p className="text-xs text-gray-500">DNI: <span className="font-mono font-medium text-gray-700">{student.code}</span></p>
              <p className="text-xs text-gray-400 text-center">Presenta este QR al docente para registrar tu asistencia</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Asistencias"
              value={summary.present}
              color="#10b981"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Faltas"
              value={summary.absent}
              color="#ef4444"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Tardanzas"
              value={summary.late}
              color="#f59e0b"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="% Asistencia"
              value={`${summary.percentage}%`}
              color="#1B2B6B"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>


          {/* Schedule preview */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Horario de esta semana</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-500 font-medium pb-2 pr-3">Curso</th>
                    <th className="text-left text-gray-500 font-medium pb-2 pr-3">Día</th>
                    <th className="text-left text-gray-500 font-medium pb-2 pr-3">Hora</th>
                    <th className="text-left text-gray-500 font-medium pb-2">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingSchedule ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400">Cargando horario...</td></tr>
                  ) : schedule.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-400 italic">No hay clases programadas.</td></tr>
                  ) : (
                    schedule.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3 font-medium text-gray-800">{s.course}</td>
                        <td className="py-2.5 pr-3 text-gray-600">{s.day}</td>
                        <td className="py-2.5 pr-3 text-gray-600">{s.time}</td>
                        <td className="py-2.5 text-gray-600">{s.room}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
