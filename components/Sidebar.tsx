"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  accentColor?: string;
  secondaryColor?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  navItems,
  accentColor = "#1B2B6B",
  secondaryColor = "#CC1116",
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const content = (
    <aside
      className="w-72 h-full flex flex-col pb-4"
      style={{ background: accentColor }}
    >
      {/* Brand / Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Image
              src="/logo/iesdtp-logo.png"
              alt="IESTP Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">IESTP</p>
            <p className="text-white/60 text-xs leading-snug">Andrés Avelino C.D.</p>
          </div>
        </div>
      </div>

      {/* System name */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-white/70 text-[10px] uppercase tracking-wider font-semibold">AsistQR</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-white shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              style={isActive ? { background: secondaryColor } : {}}
            >
              <span className="w-4 h-4 shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pt-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:w-72 md:shrink-0 md:min-h-screen">
        {content}
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 min-h-screen shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
}
