'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import { colors } from '@/lib/constants';
import { useAppContext } from '../context/AppContext';
import ThemeToggle from "@/app/components/ThemeToggle";

const Header: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useAppContext();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header 
      className="p-4 lg:p-6 border-b border-slate-700" 
      style={{ backgroundColor: colors.tertiary }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-white transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.accent }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              Welcome back, Sarah!
            </h2>
            <p style={{ color: colors.textMuted }}>
              Continue your faith-based learning journey
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" 
            style={{ backgroundColor: colors.accent }}
          >
            SJ
          </div>
          <span className="hidden sm:inline" style={{ color: colors.text }}>
            Sarah Johnson
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;