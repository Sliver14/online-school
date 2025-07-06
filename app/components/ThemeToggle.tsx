'use client';

import { useTheme } from '../ThemeProvider';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
        theme === 'dark' 
          ? 'bg-primary-400' 
          : 'bg-neutral-300 dark:bg-neutral-600'
      }`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        <div className="flex h-full w-full items-center justify-center">
          {theme === 'light' ? (
            <Moon className="h-2.5 w-2.5 text-neutral-600" />
          ) : (
            <Sun className="h-2.5 w-2.5 text-primary-400" />
          )}
        </div>
      </span>
    </button>
  );
};

export default ThemeToggle;