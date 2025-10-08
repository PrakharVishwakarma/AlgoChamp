// apps/web/components/theme/ThemeToggle.tsx

"use client";

import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState } from "react";

interface ThemeToggleProps {
  variant?: "button" | "dropdown";
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle = ({ 
  variant = "button", 
  showLabel = false, 
  className = "" 
}: ThemeToggleProps) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  if (variant === "button") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg 
          bg-secondary hover:bg-accent transition-colors duration-200
          border border-border text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${className}
        `}
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="w-4 h-4" />}
        {theme === "dark" && <Moon className="w-4 h-4" />}
        {theme === "system" && <Monitor className="w-4 h-4" />}
        {showLabel && (
          <span className="text-sm font-medium">
            {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 px-3 py-2 rounded-lg 
          bg-secondary hover:bg-accent transition-colors duration-200
          border border-border text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        "
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        {theme === "light" && <Sun className="w-4 h-4" />}
        {theme === "dark" && <Moon className="w-4 h-4" />}
        {theme === "system" && <Monitor className="w-4 h-4" />}
        {showLabel && (
          <span className="text-sm font-medium">
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="
            absolute right-0 top-full mt-1 z-50
            bg-popover border border-border rounded-lg shadow-lg
            min-w-[120px] p-1
          ">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md
                  text-sm transition-colors duration-200
                  hover:bg-accent hover:text-accent-foreground
                  ${theme === value 
                    ? 'bg-accent text-accent-foreground font-medium' 
                    : 'text-popover-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};