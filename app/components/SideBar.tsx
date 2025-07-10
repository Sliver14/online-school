'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'classes', label: 'Classes', icon: '📚' },
  { id: 'examinations', label: 'Examinations', icon: '📝' },
];

interface SideBarProps {
  handleNavClick: (tab: string) => void;
  sidebarOpen: boolean;
  activeTab: string;
}

const Sidebar: React.FC<SideBarProps> = ({ handleNavClick, sidebarOpen, activeTab }) => {
  // Get selectedClassId from context to determine if we're in ClassView
  const { selectedClassId } = useAppContext();
  
  // If we're in ClassView, show "Classes" as active since that's where we came from
  const effectiveActiveTab = selectedClassId ? 'classes' : activeTab;
  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 bg-neutral-50 dark:bg-dark-bg-tertiary border-r border-neutral-200 dark:border-dark-border-primary ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} 
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200 dark:border-dark-border-primary">
          <h1 className="desktop_h2 tablet_h2 mobile_h2 font-bold mb-2 text-primary-400 dark:text-primary-400">
            Foundation School
          </h1>
          <p className="text-sm desktop_paragraph tablet_paragraph mobile_paragraph text-neutral-500 dark:text-dark-text-muted">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border-l-4 desktop_paragraph tablet_paragraph mobile_paragraph ${
                  effectiveActiveTab === item.id
                    ? 'border-primary-400 dark:border-primary-400 text-primary-400 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                    : 'border-transparent text-neutral-950 dark:text-dark-text-primary hover:bg-neutral-100 dark:hover:bg-dark-bg-secondary'
                }`}
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