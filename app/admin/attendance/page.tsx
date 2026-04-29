"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { showError } from "@/lib/swal";


interface AttendanceRecord {
  id: string;
  dateTime: Timestamp;
  dniStudent: string;
  registeredBy: string;
  studentName?: string;
  studentDegree?: string;
}

interface Student {
  id: string;
  name: string;
  surname: string;
  dni: string;
  degree?: string;
  phone?: string;
  emergency_phone?: string;
  semester?: string;
  [key: string]: unknown;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Student Search & Modal states
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalRecords, setModalRecords] = useState<AttendanceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "info">("history");

  // Initial loading state for students

  // Filtered students computed (avoids setState-in-effect anti-pattern)
  const filteredStudents = useMemo(() => {
    if (searchTerm.trim().length === 0) return [];
    return allStudents.filter(s =>
      `${s.name} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dni.includes(searchTerm)
    );
  }, [searchTerm, allStudents]);


  // Fetch all students for searching
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snap = await getDocs(collection(db, "student"));
        const studentsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllStudents(studentsList as Student[]);
        // filteredStudents is computed via useMemo, no setState needed here
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);


  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalRecords([]); // Reset records
    setActiveTab("history"); // Default tab

    try {
      // Intentamos primero con la consulta completa
      // NOTA: Si esto falla, puede ser porque falta un índice compuesto en Firestore
      // para dniStudent (asc) y dateTime (desc).
      const q = query(
        collection(db, "attendance"),
        where("dniStudent", "==", String(student.dni).trim()),
        orderBy("dateTime", "desc")
      );
      
      let snap;
      try {
        snap = await getDocs(q);
      } catch (indexError) {
        console.warn("Posible falta de índice, reintentando sin ordenamiento:", indexError);
        // Fallback: buscar sin orderBy para verificar si es un problema de índices
        const fallbackQ = query(
          collection(db, "attendance"),
          where("dniStudent", "==", String(student.dni).trim())
        );
        snap = await getDocs(fallbackQ);
      }

      const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      
      // Si no hay orderBy en la consulta fallback, ordenamos en el cliente
      if (records.length > 0 && !records[0].dateTime?.nanoseconds) {
        // Simple sort if needed
      }
      
      setModalRecords(records);
    } catch (error) {
      console.error("Error fetching student records:", error);
      showError("Error de carga", "No se pudieron obtener los registros de asistencia.");
    } finally {
      setIsModalLoading(false);
    }
  };

  // No client-side filtering needed for records anymore as we show students

  const formatTime = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return "--:--";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Monitoreo de Estudiantes</h1>
          <p className="text-sm text-[#4A5680] mt-1">
            Visualiza los registros de entrada y perfiles de los alumnos en tiempo real.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end relative">
        <div className="flex-1 min-w-[300px] relative">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Buscar Alumno</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] transition outline-none"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 text-xs font-bold text-[#CC1116] hover:bg-red-50 rounded-xl transition"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden sm:table-cell">DNI</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden md:table-cell">Carrera / Programa</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No se encontraron alumnos con ese criterio." : "Escriba el nombre de un alumno para buscar."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50/50 transition cursor-pointer group"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F0F2F8] text-[#1B2B6B] flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name[0]}{student.surname?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{student.name} {student.surname}</p>
                          <p className="text-[10px] text-gray-500 sm:hidden">{student.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-xs text-gray-500 font-mono">{student.dni}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[10px] font-bold text-[#1B2B6B] bg-[#F0F2F8] px-2 py-0.5 rounded-md uppercase">
                        {student.degree || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-[#1B2B6B] hover:underline flex items-center gap-1 ml-auto">
                        Ver Historial
                        <svg className="w-3 h-3 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Student Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1B2B6B] text-white flex items-center justify-center text-xl font-bold">
                  {selectedStudent?.name[0]}{selectedStudent?.surname?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0D1A3E]">
                    {selectedStudent?.name} {selectedStudent?.surname}
                  </h3>
                  <p className="text-sm text-[#4A5680]">DNI: {selectedStudent?.dni} • {selectedStudent?.degree}</p>
                  <p className="text-[10px] text-gray-400">Buscando: {String(selectedStudent?.dni).trim()}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === "history" 
                    ? "text-[#1B2B6B] border-b-2 border-[#1B2B6B] bg-white" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Historial Asistencia
              </button>
              <button 
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === "info" 
                    ? "text-[#1B2B6B] border-b-2 border-[#1B2B6B] bg-white" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Información Personal
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === "history" ? (
                <>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Registro de Entradas</h4>
                  {isModalLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-3 border-[#1B2B6B] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm text-gray-500">Cargando registros...</p>
                    </div>
                  ) : modalRecords.length > 0 ? (
                    <div className="space-y-3">
                      {modalRecords.map((record) => (
                        <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{formatDateLabel(record.dateTime)}</p>
                              <p className="text-[10px] text-gray-400">ID Registro: {record.id.substring(0,8)}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right pl-6 sm:pl-0">
                            <p className="text-sm font-bold text-[#1B2B6B]">{formatTime(record.dateTime)}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Entrada Validada</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No hay registros de asistencia.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                      <p className="text-sm font-bold text-[#1B2B6B]">{selectedStudent?.name} {selectedStudent?.surname}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DNI / Documento</p>
                      <p className="text-sm font-bold text-[#1B2B6B] font-mono">{selectedStudent?.dni}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Programa de Estudios</p>
                      <p className="text-sm font-bold text-[#1B2B6B]">{selectedStudent?.degree}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Semestre Actual</p>
                      <p className="text-sm font-bold text-[#1B2B6B]">{selectedStudent?.semester || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Teléfono Personal</p>
                          <p className="text-sm font-bold text-blue-900">{selectedStudent?.phone || "No registrado"}</p>
                        </div>
                      </div>
                      {selectedStudent?.phone && (
                        <a href={`tel:${selectedStudent.phone}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/20">Llamar</a>
                      )}
                    </div>

                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Emergencia</p>
                          <p className="text-sm font-bold text-orange-900">{selectedStudent?.emergency_phone || "No registrado"}</p>
                        </div>
                      </div>
                      {selectedStudent?.emergency_phone && (
                        <a href={`tel:${selectedStudent.emergency_phone}`} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-900/20">Llamar</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 sticky bottom-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-[#1B2B6B] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#14205A] transition"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
