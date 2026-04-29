"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

interface Professor {
  id: string;
  name: string;
  surname: string;
}

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

interface Course {
  id: string;
  name: string;
  degree: string;
  semester: string;
  professor: string | { path: string }; // Firestore ref or string path
  professorName?: string; // Resolved name for display
  schedule?: ScheduleItem[];
  shift?: "diurno" | "vespertino";
}

const DEGREES = [
  "ASISTENCIA ADMINISTRATIVA",
  "DISEÑO Y PROGRAMACIÓN WEB",
  "ELECTRICIDAD INDUSTRIAL",
  "ELECTRÓNICA INDUSTRIAL",
  "MANTENIMIENTO DE MAQUINARIA PESADA",
  "MECATRÓNICA AUTOMOTRIZ",
  "MECÁNICA DE PRODUCCIÓN INDUSTRIAL",
  "METALURGIA",
  "TECNOLOGÍA DE ANÁLISIS QUÍMICO"
];
const SEMESTERS = ["I", "II", "III", "IV", "V", "VI"];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const SHIFTS = ["diurno", "vespertino"];

export default function CoursesPage() {
  useAuth(); // ensure auth context is initialized
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    degree: "DISEÑO Y PROGRAMACIÓN WEB",
    semester: "I",
    professorId: "",
    schedule: [] as ScheduleItem[],
    shift: "diurno" as "diurno" | "vespertino",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("TODOS");
  const [semesterFilter, setSemesterFilter] = useState("TODOS");
  const [shiftFilter, setShiftFilter] = useState("TODOS");

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesName = course.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDegree = degreeFilter === "TODOS" || course.degree === degreeFilter;
      const matchesSemester = semesterFilter === "TODOS" || course.semester === semesterFilter;
      const matchesShift = shiftFilter === "TODOS" || course.shift === shiftFilter;
      return matchesName && matchesDegree && matchesSemester && matchesShift;
    });
  }, [courses, searchTerm, degreeFilter, semesterFilter, shiftFilter]);

  // Load Professors
  useEffect(() => {
    const q = query(collection(db, "staff"), where("role", "==", "profesor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        surname: doc.data().surname,
      })) as Professor[];
      setProfessors(profList);
    });
    return () => unsubscribe();
  }, []);

  // Load Courses and Resolve Professor Names
  useEffect(() => {
    const q = collection(db, "course");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const courseList = await Promise.all(snapshot.docs.map(async (courseDoc) => {
        const data = courseDoc.data();
        let professorName = "No asignado";

        // Intentar resolver el nombre del profesor si es una referencia o path
        try {
          if (data.professor) {
            // Si es un string tipo "/staff/ID"
            const path = typeof data.professor === 'string' ? data.professor : data.professor.path;
            const id = path.split('/').pop();
            if (id) {
              const pDoc = await getDoc(doc(db, "staff", id));
              if (pDoc.exists()) {
                const pData = pDoc.data();
                professorName = `${pData.name} ${pData.surname}`;
              }
            }
          }
        } catch (e) {
          console.error("Error resolving professor name:", e);
        }

        return {
          id: courseDoc.id,
          name: data.name,
          degree: data.degree,
          semester: data.semester,
          professor: data.professor,
          schedule: data.schedule || [],
          shift: data.shift || "diurno",
          professorName
        } as Course;
      }));
      
      setCourses(courseList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await showConfirm("¿Eliminar curso?", "Se borrarán todos los datos vinculados a este curso.");
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "course", id));
      showSuccess("Eliminado", "El curso ha sido eliminado.");
    } catch (error) {
      console.error("Error deleting course:", error);
      showError("Error", "No se pudo eliminar el curso.");
    }
  };

  const openEditModal = (course: Course) => {
    let profId = "";
    if (course.professor) {
      const path = typeof course.professor === 'string' ? course.professor : course.professor.path;
      profId = path.split('/').pop() || "";
    }

    setFormData({
      name: course.name,
      degree: course.degree,
      semester: course.semester,
      professorId: profId,
      schedule: course.schedule || [],
      shift: course.shift || "diurno",
    });
    setEditId(course.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({
      name: "",
      degree: "DISEÑO Y PROGRAMACIÓN WEB",
      semester: "I",
      professorId: "",
      schedule: [],
      shift: "diurno",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professorId) return showError("Faltan datos", "Debes seleccionar un profesor para el curso.");
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        degree: formData.degree,
        semester: formData.semester,
        professor: `/staff/${formData.professorId}`,
        schedule: formData.schedule,
        shift: formData.shift,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        await updateDoc(doc(db, "course", editId), payload);
      } else {
        await addDoc(collection(db, "course"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      
      showSuccess(editId ? "Actualizado" : "Creado", editId ? "El curso ha sido actualizado correctamente." : "El curso ha sido registrado exitosamente.");
      closeModal();
    } catch (error) {
      console.error("Error saving course:", error);
      showError("Error al guardar", "Hubo un problema al guardar los datos del curso.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-[#0D1A3E]">Gestión de Cursos</h1>
          <p className="text-sm text-[#4A5680] mt-1">
            Administra los cursos, asigna docentes y vincula con semestres.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2B6B] hover:bg-[#14205A] text-white rounded-xl font-semibold transition shadow-lg shadow-blue-900/10 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Curso
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Buscar por nombre</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej. Programación..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] transition outline-none"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="w-full sm:w-auto min-w-[180px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Carrera</label>
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none"
          >
            <option value="TODOS">Todas las carreras</option>
            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[140px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Semestre</label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none"
          >
            {SEMESTERS.map(s => <option key={s} value={s}>Semestre {s}</option>)}
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[120px]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Turno</label>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white outline-none"
          >
            <option value="TODOS">Todos</option>
            <option value="diurno">Diurno</option>
            <option value="vespertino">Vespertino</option>
          </select>
        </div>

        {(searchTerm || degreeFilter !== "TODOS" || semesterFilter !== "TODOS" || shiftFilter !== "TODOS") && (
          <button 
            onClick={() => {
              setSearchTerm("");
              setDegreeFilter("TODOS");
              setSemesterFilter("TODOS");
              setShiftFilter("TODOS");
            }}
            className="px-4 py-2.5 text-xs font-bold text-[#CC1116] hover:bg-red-50 rounded-xl transition mb-0.5"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table of Courses */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Curso</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden sm:table-cell">Carrera / Semestre</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider">Turno</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden md:table-cell">Docente</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider hidden lg:table-cell">Horario</th>
                <th className="px-6 py-4 text-xs font-bold text-[#4A5680] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || degreeFilter !== "TODOS" || semesterFilter !== "TODOS" 
                      ? "No se encontraron cursos con los filtros aplicados." 
                      : "No hay cursos registrados todavía."}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{course.name}</p>
                      <p className="text-[10px] text-gray-400 sm:hidden uppercase font-bold tracking-tight mt-1">
                        {course.degree} • Sem {course.semester}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight truncate max-w-[150px]">
                          {course.degree}
                        </span>
                        <span className="w-fit px-2 py-0.5 bg-[#F0F2F8] text-[#1B2B6B] text-[9px] font-bold uppercase rounded-md">
                          Semestre {course.semester}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        course.shift === "vespertino" 
                          ? "bg-orange-50 text-orange-600 border border-orange-100" 
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {course.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FFF0F0] text-[#CC1116] flex items-center justify-center font-bold text-[10px] shrink-0">
                          {course.professorName?.[0]}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                          {course.professorName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        {course.schedule && course.schedule.length > 0 ? (
                          course.schedule.slice(0, 2).map((s, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="font-bold text-[#1B2B6B] min-w-[35px]">{s.day}:</span>
                              <span>{s.startTime}-{s.endTime}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">No asignado</span>
                        )}
                        {course.schedule && course.schedule.length > 2 && (
                          <span className="text-[9px] text-gray-400">+ {course.schedule.length - 2} más</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => openEditModal(course)}
                          className="p-2 text-gray-400 hover:text-[#1B2B6B] hover:bg-gray-100 rounded-xl transition-all"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-gray-400 hover:text-[#CC1116] hover:bg-red-50 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0D1A3E]">
                {editId ? "Editar Curso" : "Nuevo Curso"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre del Curso</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B2B6B] outline-none"
                  placeholder="Ej. Programación Web II"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Carrera</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                  >
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Semestre</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Turno</label>
                <div className="flex gap-4">
                  {SHIFTS.map(s => (
                    <label key={s} className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition">
                      <input 
                        type="radio" 
                        name="shift" 
                        value={s}
                        checked={formData.shift === s}
                        onChange={(e) => setFormData({...formData, shift: e.target.value as any})}
                        className="text-[#1B2B6B] focus:ring-[#1B2B6B]"
                      />
                      <span className="text-sm font-semibold capitalize text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asignar Docente</label>
                <select
                  required
                  value={formData.professorId}
                  onChange={(e) => setFormData({...formData, professorId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                >
                  <option value="">Selecciona un profesor...</option>
                  {professors.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.surname}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Schedule Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Horarios</label>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData, 
                      schedule: [...formData.schedule, { day: "Lunes", startTime: "08:15", endTime: "09:45" }]
                    })}
                    className="text-[10px] font-bold text-[#CC1116] hover:underline"
                  >
                    + Agregar Horario
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.schedule.map((item, index) => (
                    <div key={index} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-full sm:col-span-5">
                        <select
                          value={item.day}
                          onChange={(e) => {
                            const newSched = [...formData.schedule];
                            newSched[index].day = e.target.value;
                            setFormData({...formData, schedule: newSched});
                          }}
                          className="w-full bg-transparent text-xs font-semibold outline-none"
                        >
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="w-full sm:col-span-6 flex items-center justify-between sm:justify-start gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={item.startTime}
                            onChange={(e) => {
                              const newSched = [...formData.schedule];
                              newSched[index].startTime = e.target.value;
                              setFormData({...formData, schedule: newSched});
                            }}
                            className="w-12 bg-transparent text-xs outline-none"
                            placeholder="08:15"
                          />
                          <span className="text-gray-400"> – </span>
                          <input
                            type="text"
                            value={item.endTime}
                            onChange={(e) => {
                              const newSched = [...formData.schedule];
                              newSched[index].endTime = e.target.value;
                              setFormData({...formData, schedule: newSched});
                            }}
                            className="w-12 bg-transparent text-xs outline-none"
                            placeholder="09:45"
                          />
                        </div>
                      </div>
                      <div className="w-full sm:col-span-1 text-right mt-1 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            schedule: formData.schedule.filter((_, i) => i !== index)
                          })}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#1B2B6B] text-white rounded-2xl font-bold hover:bg-[#14205A] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : (editId ? "Guardar Cambios" : "Crear Curso")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
