"use client";

import { useState } from "react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import Header from "@/components/Header";

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  accentColor?: string;
  secondaryColor?: string;
  userName: string;
  userCode: string;
  userRole: string;
  avatarInitials: string;
  avatarColor?: string;
}

export default function AppShell({
  children,
  navItems,
  accentColor = "#1B2B6B",
  secondaryColor = "#CC1116",
  userName,
  userCode,
  userRole,
  avatarInitials,
  avatarColor = "#CC1116",
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F0F2F8]">
      <Sidebar
        navItems={navItems}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          userName={userName}
          userCode={userCode}
          userRole={userRole}
          avatarInitials={avatarInitials}
          avatarColor={avatarColor}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
