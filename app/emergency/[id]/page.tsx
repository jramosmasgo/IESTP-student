"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";

interface StudentInfo {
  name: string;
  surname?: string;
  degree?: string;
  semester?: string;
  dni: string;
  photoUrl?: string;
  emergencyContact?: string;
  bloodType?: string;
}

export default function EmergencyPage() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Intentar buscar por qr_data primero, luego por dni
        let q = query(collection(db, "student"), where("qr_data", "==", id));
        let snap = await getDocs(q);

        if (snap.empty) {
          q = query(collection(db, "student"), where("dni", "==", id));
          snap = await getDocs(q);
        }

        if (snap.empty) {
          setError("Estudiante no encontrado.");
        } else {
          setStudent(snap.docs[0].data() as StudentInfo);
        }
      } catch (err) {
        console.error("Error fetching student:", err);
        setError("Error al cargar la información.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#1B2B6B] font-medium animate-pulse">Cargando información de emergencia...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F8] p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error de Identificación</h1>
          <p className="text-gray-500 mb-6">{error || "No se pudo encontrar al estudiante."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[#1B2B6B] text-white rounded-xl font-bold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F8] flex flex-col items-center p-4 md:p-8">
      {/* Emergency Header */}
      <div className="w-full max-w-lg bg-[#CC1116] text-white p-4 rounded-t-3xl flex items-center justify-center gap-3 shadow-lg">
        <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h1 className="font-black uppercase tracking-widest text-sm">Ficha de Emergencia</h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-lg bg-white rounded-b-3xl shadow-2xl overflow-hidden border-x border-b border-gray-100">
        <div className="p-8 flex flex-col items-center">
          {/* Institution Logo */}
          <div className="mb-6">
            <Image 
              src="/logo/iesdtp-logo.png" 
              alt="IESTP Logo" 
              width={80} 
              height={80} 
              className="drop-shadow-sm"
            />
          </div>

          {/* Student Photo or Initials */}
          <div className="w-32 h-32 rounded-3xl bg-[#F0F2F8] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-6">
            {student.photoUrl ? (
              <Image src={student.photoUrl} alt={student.name} width={128} height={128} className="object-cover w-full h-full" />
            ) : (
              <span className="text-4xl font-black text-[#1B2B6B]">
                {student.name[0]}{student.surname?.[0]}
              </span>
            )}
          </div>

          {/* Student Name */}
          <h2 className="text-2xl font-black text-[#0D1A3E] text-center leading-tight mb-1">
            {student.name} {student.surname}
          </h2>
          <div className="w-12 h-1 bg-[#CC1116] rounded-full mb-6"></div>

          {/* Details Grid */}
          <div className="w-full grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DNI / Identificación</p>
              <p className="text-lg font-bold text-[#1B2B6B] font-mono">{student.dni}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Programa de Estudios</p>
              <p className="text-sm font-bold text-gray-700">{student.degree}</p>
              <p className="text-xs text-gray-500 mt-0.5">Semestre {student.semester || "No especificado"}</p>
            </div>

            <div className="bg-[#FFF0F0] p-4 rounded-2xl border border-red-50">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Institución</p>
              <p className="text-sm font-bold text-red-700">IESTP &quot;Andrés Avelino Cáceres Dorregaray&quot;</p>
              <p className="text-xs text-red-600 mt-0.5 underline">Llamar a la institución: (064) 244191</p>
            </div>
          </div>

          {/* Call button */}
          <a 
            href="tel:064244191"
            className="w-full py-4 bg-[#1B2B6B] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 active:scale-95 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contactar Instituto
          </a>
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Esta información es de carácter público para uso exclusivo en situaciones de emergencia.
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">© 2026 Sistema de Asistencia IESTP AACD</p>
    </div>
  );
}
