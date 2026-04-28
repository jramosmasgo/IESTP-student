"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  userCode: string;
  userRole: string;
  avatarInitials: string;
  avatarColor?: string;
  onMenuToggle: () => void;
}

export default function Header({
  userName,
  userCode,
  userRole,
  avatarInitials,
  avatarColor = "#CC1116",
  onMenuToggle,
}: HeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <header className="h-14 bg-white border-b border-[#D6DBF0] flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Hamburger – mobile only */}
      <button
        id="btn-menu-toggle"
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1 rounded-lg text-[#4A5680] hover:bg-[#F0F2F8] transition"
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="btn-user-menu"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F0F2F8] transition"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: avatarColor }}
          >
            {avatarInitials}
          </div>

          {/* Name + role */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[#0D1A3E] leading-tight">{userName}</p>
            <p className="text-[11px] text-[#8A95B8] leading-tight">{userRole}</p>
          </div>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-[#8A95B8] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#D6DBF0] py-1.5 z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-[#D6DBF0]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: avatarColor }}
                >
                  {avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0D1A3E] truncate">{userName}</p>
                  <p className="text-[11px] text-[#8A95B8] truncate">{userCode}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="py-1">
              <button
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-[#4A5680] hover:bg-[#F0F2F8] transition"
                onClick={() => setDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-[#8A95B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi perfil
              </button>
              <button
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-[#4A5680] hover:bg-[#F0F2F8] transition"
                onClick={() => setDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-[#8A95B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-[#D6DBF0] py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-[#CC1116] hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
