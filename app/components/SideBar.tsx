"use client";

import React from "react";
import Image from "next/image"; // ✅ use Next.js optimized Image
import { useAppContext } from "../context/AppContext";
import { BookOpen, ClipboardList } from "lucide-react"; // removed GraduationCap

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "classes", label: "Classes", icon: <BookOpen className="w-5 h-5" /> },
  { id: "examinations", label: "Examinations", icon: <ClipboardList className="w-5 h-5" /> },
];

interface SideBarProps {
  handleNavClick: (tab: string) => void;
  sidebarOpen: boolean;
  activeTab: string;
  sidebarCollapsed: boolean;
}

const Sidebar: React.FC<SideBarProps> = ({
  handleNavClick,
  sidebarOpen,
  activeTab,
  sidebarCollapsed,
}) => {
  const { selectedClassId } = useAppContext();
  const effectiveActiveTab = selectedClassId ? "classes" : activeTab;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
      bg-neutral-50 dark:bg-dark-bg-tertiary border-r border-neutral-200 dark:border-dark-border-primary
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0 ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-neutral-200 dark:border-dark-border-primary flex items-center gap-3">
          {/* ✅ Replace GraduationCap with logo.png */}
          <Image
            src="/logo.png"
            alt="Foundation School Logo"
            width={40}
            height={40}
            className="shrink-0"
          />
          {!sidebarCollapsed && (
            <div>
              <h1 className="desktop_h2 tablet_h2 mobile_h2 font-bold mb-1 text-primary-400 dark:text-primary-400">
                Foundation School
              </h1>
              <p className="text-sm desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
                Year of Completeness!
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border-l-4 
                  ${
                    effectiveActiveTab === item.id
                      ? "border-primary-400 dark:border-primary-400 text-primary-400 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
                      : "border-transparent text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-100 dark:hover:bg-dark-bg-secondary"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {/* Hide label when collapsed */}
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
