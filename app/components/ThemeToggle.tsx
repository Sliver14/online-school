"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-backgroundgray dark:bg-mediumgray hover:bg-lightgray dark:hover:bg-textgray transition-colors font-inter"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5 text-primary" />
            ) : (
                <Sun className="w-5 h-5 text-secondary" />
            )}
        </button>
    );
}