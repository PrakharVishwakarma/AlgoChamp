// apps/web/context/ThemeContext.tsx

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

export const ThemeProvider = ({ 
  children, 
  defaultTheme = "dark", // AlgoChamp defaults to dark theme
  storageKey = "algochamp-theme",
  enableSystem = true 
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  };

  // Apply theme to document
  const applyTheme = (newTheme: ResolvedTheme) => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      
      // Remove existing theme classes
      root.removeAttribute("data-theme");
      root.classList.remove("light", "dark");
      
      // Apply new theme
      root.setAttribute("data-theme", newTheme);
      root.classList.add(newTheme);
      
      setResolvedTheme(newTheme);
    }
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error);
      }
    }

    // Resolve theme
    let resolvedNewTheme: ResolvedTheme;
    if (newTheme === "system") {
      resolvedNewTheme = getSystemTheme();
    } else {
      resolvedNewTheme = newTheme;
    }

    applyTheme(resolvedNewTheme);
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    const currentResolved = theme === "system" ? resolvedTheme : theme;
    setTheme(currentResolved === "light" ? "dark" : "light");
  };

  // Initialize theme on mount
  useEffect(() => {
    let savedTheme = defaultTheme;
    
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && ["light", "dark", "system"].includes(stored)) {
          savedTheme = stored as Theme;
        }
      } catch (error) {
        console.warn("Failed to read theme from localStorage:", error);
      }
    }

    setThemeState(savedTheme);

    // Resolve initial theme
    let initialResolvedTheme: ResolvedTheme;
    if (savedTheme === "system") {
      initialResolvedTheme = getSystemTheme();
    } else {
      initialResolvedTheme = savedTheme;
    }

    applyTheme(initialResolvedTheme);
    setMounted(true);
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newSystemTheme = e.matches ? "dark" : "light";
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider 
        value={{ 
          theme: defaultTheme, 
          resolvedTheme: "dark", 
          setTheme: () => {}, 
          toggleTheme: () => {} 
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};