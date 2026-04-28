"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface Course {
  id: string;
  name: string;
  degree: string;
  semester: string;
  schedule: { day: string; startTime: string; endTime: string }[];
}

export default function MyCoursesPage() {
  const { userData, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userData) return;

    // Buscamos cursos donde el path del profesor coincida con el ID del usuario actual
    const q = query(
      collection(db, "course"),
      where("professor", "==", `/staff/${userData.id || userData.dni}`) 
    );

    // NOTA: Si el ID en Auth no coincide con el DNI, debemos usar el ID correcto de Firestore.
    // En este proyecto, los documentos de staff se crearon con IDs generados o DNI.
    // Intentaremos ambos si es necesario, pero usualmente userData.id contiene el doc ID.

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(courseList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1A3E]">Mis Cursos Asignados</h1>
        <p className="text-sm text-[#4A5680] mt-1">
          Visualiza los cursos y horarios que tienes a cargo para este ciclo.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tienes cursos asignados actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2F8] text-[#1B2B6B] uppercase">
                    Semestre {course.semester}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0D1A3E] leading-tight mb-2">
                  {course.name}
                </h3>
                <p className="text-xs text-[#4A5680] font-medium uppercase tracking-tight mb-4">
                  {course.degree}
                </p>

                <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Horario</p>
                  {course.schedule && course.schedule.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CC1116]"></div>
                      <span className="text-xs font-bold text-gray-700">{s.day}:</span>
                      <span className="text-xs text-gray-500">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                <button className="text-xs font-bold text-[#1B2B6B] hover:underline">
                  Ver Alumnos
                </button>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Activo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
