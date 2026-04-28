"use client";

import { useState, useEffect, useCallback } from "react";
import { useZxing } from "react-zxing";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ScanState = "idle" | "scanning" | "result" | "error";

interface StudentInfo {
  name: string;
  surname?: string;
  degree?: string;
  Semester?: string;
  dni: string;
}

export default function AdminScanPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Protección de ruta por rol
  useEffect(() => {
    if (!loading && userData && userData.role !== "security") {
      if (userData.role === "administrador" || userData.role === "superadministrador") {
        router.replace("/admin/attendance");
      } else if (userData.role === "profesor") {
        router.replace("/admin/teacher/courses");
      } else {
        router.replace("/login");
      }
    }
  }, [userData, loading, router]);

  const handleScanResult = useCallback(async (scannedData: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Si el QR es una URL (emergencia), extraemos solo el ID final
      let identifier = scannedData;
      if (scannedData.includes("/emergency/")) {
        identifier = scannedData.split("/emergency/").pop() || scannedData;
      }

      const studentQuery = query(
        collection(db, "student"),
        where("qr_data", "==", identifier)
      );
      
      let studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        const dniQuery = query(collection(db, "student"), where("dni", "==", identifier));
        studentSnapshot = await getDocs(dniQuery);
      }

      if (studentSnapshot.empty) {
        setError("Estudiante no encontrado o código inválido.");
        setScanState("error");
        setIsProcessing(false);
        return;
      }

      const data = studentSnapshot.docs[0].data() as StudentInfo;
      setStudentInfo(data);
      
      await addDoc(collection(db, "attendance"), {
        dateTime: serverTimestamp(),
        dniStudent: data.dni,
        registeredBy: userData?.dni || (userData as unknown as { code?: string })?.code || "Desconocido"
      });

      setScanState("result");
    } catch (err) {
      console.error("Scan processing error:", err);
      setError("Error al procesar el código. Reintenta.");
      setScanState("error");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, userData]);

  const startScanning = useCallback(() => {
    setScanState("scanning");
    setStudentInfo(null);
    setError(null);
  }, []);

  const resetScanner = useCallback(() => {
    setScanState("idle");
    setStudentInfo(null);
    setError(null);
  }, []);

  // useZxing MUST be called before any early return (Rules of Hooks)
  const { ref } = useZxing({
    onDecodeResult(result) {
      handleScanResult(result.getText());
    },
    paused: scanState !== "scanning" || isProcessing,
  });

  if (loading || (userData && userData.role !== "security")) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold text-[#0D1A3E]">Control de Acceso</h1>
        <p className="text-sm text-[#4A5680] mt-1">
          Escanea el código QR del estudiante para validar su identidad y registrar ingreso.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Vista de Cámara / Scanner Area */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0D1A3E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Escáner de Identidad
            </h2>
            {scanState === "scanning" && (
              <button 
                onClick={resetScanner}
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Detener
              </button>
            )}
          </div>

          <div className="relative aspect-square md:aspect-video bg-gray-900 flex items-center justify-center">
            {scanState === "scanning" ? (
              <>
                <video ref={ref} className="w-full h-full object-cover" />
                {/* Overlay del Scanner */}
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-400 relative shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
                    
                    {/* Línea de escaneo animada */}
                    <div className="absolute left-0 right-0 h-1 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan-line"></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 p-10 text-center">
                {scanState === "idle" && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-[#F0F2F8] flex items-center justify-center text-[#1B2B6B]">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p className="text-[#4A5680] text-sm max-w-[240px]">
                      Presiona el botón para activar la cámara y escanear el carnet del alumno.
                    </p>
                  </>
                )}

                {scanState === "result" && studentInfo && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 mx-auto border-4 border-white shadow-lg">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Identidad Validada</h3>
                    <p className="text-emerald-400 font-medium">Ingreso registrado correctamente</p>
                  </div>
                )}

                {scanState === "error" && (
                  <div className="animate-in shake duration-300">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto border-4 border-white shadow-lg">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-400 font-bold">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 bg-gray-50/50">
            {scanState !== "result" ? (
              <button 
                onClick={startScanning}
                disabled={scanState === "scanning" || isProcessing}
                className="w-full py-4 bg-[#1B2B6B] hover:bg-[#14205A] disabled:bg-gray-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transition active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {scanState === "scanning" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Esperando lectura...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Escanear QR
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={startScanning}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Escanear Siguiente
              </button>
            )}
          </div>
        </div>

        {/* Panel de Información del Alumno */}
        {studentInfo && (
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-4">
                Información del Estudiante
              </span>
              <h3 className="text-2xl font-extrabold text-[#0D1A3E]">
                {studentInfo.name} {studentInfo.surname}
              </h3>
              <div className="w-16 h-1 rounded-full bg-emerald-500 my-4"></div>
              <p className="text-lg font-semibold text-[#1B2B6B] mb-1">
                {studentInfo.degree}
              </p>
              <p className="text-sm text-[#4A5680]">
                {studentInfo.Semester ? `Semestre ${studentInfo.Semester}` : "Semestre no especificado"}
              </p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 w-full flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">DNI</p>
                  <p className="text-sm font-bold text-gray-700">{studentInfo.dni}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
