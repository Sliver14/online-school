'use client';

import React from 'react';
import { colors, navItems } from '@/lib/constants';
import { useAppContext } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const { activeTab, sidebarOpen, handleNavClick } = useAppContext();

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} 
      style={{ backgroundColor: colors.tertiary }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold mb-2" style={{ color: colors.accent }}>
            Foundation School
          </h1>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Year of Completeness!
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border-l-4 ${
                  activeTab === item.id
                    ? 'border-cyan-400 text-cyan-400' 
                    : 'border-transparent hover:bg-slate-700'
                }`}
                style={
                  activeTab === item.id 
                    ? { backgroundColor: colors.primary, color: colors.accent } 
                    : { color: colors.textMuted }
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;