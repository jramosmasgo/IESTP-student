"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userData, loading: authLoading } = useAuth();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && userData) {
      if (userData.type === 'student') {
        router.replace("/student");
      } else {
        // Staff
        if (userData.role === 'security') {
          router.replace("/admin");
        } else if (userData.role === 'profesor') {
          router.replace("/admin/teacher/courses");
        } else {
          router.replace("/admin/attendance");
        }
      }
    }
  }, [userData, authLoading, router]);

  const handleStudent = async (e: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setError(null);
    setLoading(true);

    // 1. Validar dominio
    if (!email.endsWith("@institutocajas.edu.pe")) {
      setError("Solo se permiten correos institucionales (@institutocajas.edu.pe)");
      setLoading(false);
      return;
    }

    try {
      // 2. Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      void userCredential; // used only to authenticate, data fetched from Firestore below

      // 3. Validar existencia en Firestore (colección 'student')
      const studentQuery = query(
        collection(db, "student"),
        where("email", "==", email.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(studentQuery);

      if (querySnapshot.empty) {
        // No existe en firestore, cerrar sesión inmediatamente
        await signOut(auth);
        setError("Acceso denegado: No estás registrado como estudiante en el sistema.");
        setLoading(false);
        return;
      }

      // Guardar datos en localStorage para acceso inmediato
      const doc = querySnapshot.docs[0];
      const studentData = { id: doc.id, ...doc.data() };
      localStorage.setItem('user_data', JSON.stringify(studentData));

      // Éxito
      router.push("/student");
    } catch (err) {
      const firebaseErr = err as { code?: string; message?: string };
      console.error("Login error:", err);
      // Depuración para móvil
      alert("Error Firebase: " + (firebaseErr.code || "unknown") + "\n" + firebaseErr.message);

      let message = "Error al iniciar sesión. Verifica tus credenciales.";

      if (firebaseErr.code === "auth/user-not-found" || firebaseErr.code === "auth/wrong-password" || firebaseErr.code === "auth/invalid-credential") {
        message = "Correo o contraseña incorrectos.";
      } else if (firebaseErr.code === "auth/too-many-requests") {
        message = "Demasiados intentos. Inténtalo más tarde.";
      }

      setError(message);
      setLoading(false);
    }
  };

  const handleAdmin = async (e?: React.MouseEvent | React.FormEvent) => {
    console.log("aasdfsdf")
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      void userCredential;

      // 2. Validar existencia en Firestore (colección 'staff')
      const staffQuery = query(
        collection(db, "staff"),
        where("email", "==", email.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(staffQuery);

      if (querySnapshot.empty) {
        await signOut(auth);
        setError("Acceso denegado: No tienes permisos administrativos.");
        setLoading(false);
        return;
      }

      // Guardar datos en localStorage
      const doc = querySnapshot.docs[0];
      const staffData = { id: doc.id, ...doc.data() };
      localStorage.setItem('user_data', JSON.stringify(staffData));

      // Éxito
      router.push("/admin");
    } catch (err) {
      const firebaseErr = err as { code?: string; message?: string };
      console.error("Admin login error:", firebaseErr);
      alert("Error Admin Firebase: " + (firebaseErr.code || "unknown") + "\n" + firebaseErr.message);

      let message = "Error al iniciar sesión administrativa.";
      if (firebaseErr.code === "auth/invalid-credential") message = "Credenciales incorrectas.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left panel: branding ── */}
      <div
        className="md:w-1/2 flex flex-col items-center justify-center px-6 py-10 md:px-10 md:py-14 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#14205A 0%,#1B2B6B 60%,#2D4499 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "#CC1116" }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "#F5C518" }} />
        <div className="absolute top-1/2 -right-10 w-48 h-48 rounded-full opacity-5"
          style={{ background: "#fff" }} />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ background: "#CC1116", transform: "scale(1.3)" }} />
            <Image
              src="/logo/iesdtp-logo.png"
              alt="Logo IESTP Andrés Avelino Cáceres Dorregaray"
              width={180}
              height={180}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
            IESTP Andrés Avelino
          </h1>
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
            Cáceres Dorregaray
          </h1>

          <div className="mt-3 w-12 h-1 rounded-full" style={{ background: "#CC1116" }} />

        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="md:w-1/2 flex items-center justify-center px-6 py-12 bg-[#F0F2F8]">
        <div className="w-full max-w-sm">
          {/* Mobile logo (only visible on small screens) */}
          <div className="flex flex-col items-center mb-6 md:hidden">
            <Image
              src="/logo/iesdtp-logo.png"
              alt="Logo IESTP"
              width={88}
              height={88}
              className="drop-shadow"
              priority
            />
            <p className="mt-3 font-bold text-[#1B2B6B] text-center text-sm leading-tight">
              IESTP Andrés Avelino Cáceres Dorregaray
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D6DBF0] p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0D1A3E]">Bienvenido</h2>
              <p className="text-xs text-[#4A5680] mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleStudent} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#4A5680] mb-1.5">
                  Correo o código de estudiante
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@iestp.edu.pe o 2021050123"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-[#D6DBF0] bg-[#F0F2F8] text-[#0D1A3E] placeholder-[#8A95B8] focus:outline-none focus:ring-2 transition"
                  style={{ "--tw-ring-color": "#1B2B6B" } as React.CSSProperties}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-[#4A5680] mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm border border-[#D6DBF0] bg-[#F0F2F8] text-[#0D1A3E] placeholder-[#8A95B8] focus:outline-none focus:ring-2 transition"
                    style={{ "--tw-ring-color": "#1B2B6B" } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95B8] hover:text-[#4A5680] transition"
                    aria-label="Mostrar contraseña"
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium hover:underline" style={{ color: "#1B2B6B" }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Student login button */}
              <button
                id="btn-login-student"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-150 active:scale-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "#1B2B6B" }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#14205A")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#1B2B6B")}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5 gap-3">
              <div className="flex-1 h-px bg-[#D6DBF0]" />
              <span className="text-xs text-[#8A95B8]">o</span>
              <div className="flex-1 h-px bg-[#D6DBF0]" />
            </div>

            {/* Admin button */}
            <button
              id="btn-login-admin"
              type="button"
              onClick={(e) => handleAdmin(e)}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 border disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ borderColor: "#CC1116", color: "#CC1116", background: "transparent" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#FFF0F0"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "transparent"; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#CC1116]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Ingresar como docente / administrador
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#8A95B8] mt-6">
            © 2026 IESTP &ldquo;Andrés Avelino Cáceres Dorregaray&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
