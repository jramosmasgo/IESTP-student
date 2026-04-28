"use client";

import React from "react";

const timeSlots = [
  "8:15 - 9:00",
  "9:00 - 9:45",
  "9:45 - 10:30",
  "10:30 - 11:15",
  "11:15 - 12:00",
  "12:00 - 12:45"
];

const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
const semesters = ["I", "III", "V"];

interface ScheduleCell {
  name: string;
  teacher: string;
  room: string;
  type: string;
  color: string;
}

const scheduleData: Record<string, ScheduleCell> = {
  "Lunes-V-1": { name: "OPORTUNIDADES Y PLANES DE NEGOCIO", teacher: "L. SERRANO", room: "AULA 10", type: "1H TEÓRICO, 2H PRÁCTICO", color: "bg-[#FFDAB9]" },
  "Lunes-V-4": { name: "PROTOCOLO Y CEREMONIAL P EVENTOS", teacher: "L. SERRANO", room: "AULA 10", type: "3 H TEORÍA", color: "bg-[#E0FFFF]" },
  "Martes-V-1": { name: "ABASTECIMIENTO", teacher: "J. FLORES", room: "AULA 22", type: "2H TEÓRICO, 2H PRÁCTICO", color: "bg-[#FF6347]" },
  "Martes-V-3": { name: "GESTIÓN DEL TAL. HUMANO", teacher: "V. ORDOÑEZ", room: "AULA 22", type: "", color: "bg-[#4682B4]" },
  "Miércoles-V-1": { name: "IMAGEN ORGANIZACIONAL", teacher: "L. RODRIGO", room: "AULA 10", type: "2H TEÓRICO, 2H PRÁCTICO", color: "bg-[#DDA0DD]" },
  "Jueves-V-1": { name: "EXCEL PARA LA GESTIÓN", teacher: "R. CASTILLO", room: "LAB. COMPUTACIÓN", type: "1H TEÓRICO, 2H PRÁCTICO", color: "bg-[#FF69B4]" },
  "Viernes-V-1": { name: "ORGANIZACIÓN DE EVENTOS", teacher: "L. BALDEÓN", room: "AULA 10", type: "1H TEÓRICO, 2H PRÁCTICO", color: "bg-[#00CED1]" },
  // ... adding more for visual effect
  "Lunes-I-1": { name: "PROCESOS DE DIGITACIÓN", teacher: "L. RODRIGO", room: "LAB DE DIGITACIÓN", type: "1H TEÓRICO, 2H PRÁCTICO", color: "bg-[#F0E68C]" },
  "Martes-III-1": { name: "APLICACIONES EN INTERNET", teacher: "R. CASTILLO", room: "LAB COMPUTACIÓN", type: "1H TEÓRICO, 2H PRÁCTICO", color: "bg-[#EE82EE]" },
};

export default function SchedulePage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto overflow-x-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Horario Académico</h1>
          <p className="text-sm text-gray-500">Ciclo Académico 2024 - II</p>
        </div>
        <div className="px-6 py-2 bg-[#1B2B6B] text-white rounded-full font-bold text-sm tracking-widest">
          TURNO DIURNO
        </div>
      </div>

      <div className="min-w-[1000px] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Header Grid */}
        <div className="grid grid-cols-[100px_repeat(15,1fr)] border-b border-gray-200 bg-[#F8FAFC]">
          <div className="p-4 flex items-center justify-center border-r border-gray-200 font-bold text-[#4A5680] text-xs">
            HORA
          </div>
          {days.map((day) => (
            <div key={day} className="col-span-3 border-r border-gray-200 last:border-0">
              <div className="py-2 text-center font-black text-[10px] text-[#1B2B6B] uppercase tracking-tighter border-b border-gray-100">
                {day}
              </div>
              <div className="grid grid-cols-3">
                {semesters.map((s) => (
                  <div key={s} className="py-1 text-center font-bold text-[9px] text-[#4A5680] border-r border-gray-50 last:border-0">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {timeSlots.map((time, rowIdx) => (
            <div key={time} className="grid grid-cols-[100px_repeat(15,1fr)] min-h-[100px]">
              {/* Time Label */}
              <div className="p-3 flex items-center justify-center border-r border-gray-100 bg-[#F8FAFC] font-bold text-[11px] text-[#4A5680] text-center">
                {time}
              </div>

              {/* Day/Semester Cells */}
              {days.map((day) => (
                <React.Fragment key={day}>
                  {semesters.map((sem) => {
                    const key = `${day.charAt(0) + day.slice(1).toLowerCase()}-${sem}-${rowIdx + 1}`;
                    const item = scheduleData[key];

                    return (
                      <div key={sem} className="border-r border-gray-50 last:border-r-gray-200 p-1 group">
                        {item ? (
                          <div className={`${item.color} h-full w-full rounded-lg p-2 flex flex-col justify-between shadow-sm border border-black/5 hover:scale-[1.02] transition-transform cursor-pointer`}>
                            <div>
                              <p className="text-[8px] font-black leading-tight text-black/80 line-clamp-3 uppercase">
                                {item.name}
                              </p>
                              <p className="text-[7px] font-bold mt-1 text-black/60 italic">
                                {item.teacher}
                              </p>
                            </div>
                            <div className="mt-2">
                              <p className="text-[7px] font-black text-black/70">
                                ({item.room})
                              </p>
                              <p className="text-[6px] font-medium text-black/50 leading-[8px] mt-0.5 uppercase">
                                {item.type}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full rounded-lg bg-gray-50/30"></div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 items-center justify-center text-[10px] font-bold text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#FFDAB9]"></div>
          <span>ASISTENCIA ADM.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#FF6347]"></div>
          <span>COMPUTACIÓN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#4682B4]"></div>
          <span>TEÓRICO</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#DDA0DD]"></div>
          <span>PRÁCTICO</span>
        </div>
      </div>
    </div>
  );
}
