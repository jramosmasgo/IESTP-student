"use client";

import AppShell from "@/components/AppShell";
import type { NavItem } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const studentNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Mi Horario",
    href: "/student/schedule",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Avisos",
    href: "/student/posts",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B2B6B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#1B2B6B] font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Extraer iniciales y datos reales según el esquema proporcionado
  const firstName = userData?.name || "Estudiante";
  const lastName = userData?.surname || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = (firstName[0] + (lastName[0] || "")).toUpperCase();

  return (
    <AppShell
      navItems={studentNav}
      accentColor="#1B2B6B"
      secondaryColor="#CC1116"
      userName={fullName}
      userCode={userData?.dni || "S/DNI"}
      userRole={userData?.degree ? `${userData.degree} — Semestre ${userData.Semester || ""}` : "Estudiante"}
      avatarInitials={initials}
      avatarColor="#1B2B6B"
    >
      {children}
    </AppShell>
  );
}
