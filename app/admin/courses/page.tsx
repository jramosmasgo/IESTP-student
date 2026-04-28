"use client";

import { useState, useEffect } from "react";
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
  professor: any; // Reference or path
  professorName?: string; // Resolved name for display
  schedule?: ScheduleItem[];
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

export default function CoursesPage() {
  const { userData, loading: authLoading } = useAuth();
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
  });

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
          professorName
        } as Course;
      }));
      
      setCourses(courseList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return;
    try {
      await deleteDoc(doc(db, "course", id));
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error al eliminar el curso.");
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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professorId) return alert("Selecciona un profesor");
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        degree: formData.degree,
        semester: formData.semester,
        professor: `/staff/${formData.professorId}`,
        schedule: formData.schedule,
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
      
      closeModal();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error al guardar el curso.");
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
    <div className="p-6 max-w-6xl mx-auto">
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

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No hay cursos registrados todavía.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[#F0F2F8] text-[#1B2B6B] text-[10px] font-bold uppercase rounded-full tracking-wider">
                  Semestre {course.semester}
                </span>
                <span className="text-xs font-medium text-gray-400 capitalize">
                  {course.degree}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0D1A3E] mb-2">{course.name}</h3>
              
              {/* Schedule Section */}
              <div className="space-y-1 mb-4">
                {course.schedule && course.schedule.length > 0 ? (
                  course.schedule.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="font-bold text-[#1B2B6B]">{s.day}:</span>
                      <span>{s.startTime} – {s.endTime}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-400 italic">Sin horario asignado</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F0] text-[#CC1116] flex items-center justify-center font-bold text-[10px]">
                    {course.professorName?.[0]}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Docente</p>
                    <p className="text-xs font-semibold text-gray-700">{course.professorName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-gray-400 hover:text-[#1B2B6B] hover:bg-gray-100 rounded-lg transition"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="p-1.5 text-gray-400 hover:text-[#CC1116] hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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

              <div className="grid grid-cols-2 gap-4">
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
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="col-span-5">
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
                      <div className="col-span-6 flex items-center gap-1">
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
                      <div className="col-span-1 text-right">
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
