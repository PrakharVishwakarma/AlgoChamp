// apps/web/components/theme/ThemeScript.tsx

"use client";

// This script runs before React hydration to prevent theme flash
export const ThemeScript = () => {
  const script = `
    (function() {
      const storageKey = 'algochamp-theme';
      const defaultTheme = 'dark';
      
      function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function applyTheme(theme) {
        const root = document.documentElement;
        root.removeAttribute('data-theme');
        root.classList.remove('light', 'dark');
        root.setAttribute('data-theme', theme);
        root.classList.add(theme);
      }
      
      try {
        const savedTheme = localStorage.getItem(storageKey) || defaultTheme;
        let resolvedTheme;
        
        if (savedTheme === 'system') {
          resolvedTheme = getSystemTheme();
        } else {
          resolvedTheme = savedTheme;
        }
        
        applyTheme(resolvedTheme);
      } catch (error) {
        console.warn('Failed to apply theme:', error);
        applyTheme(defaultTheme);
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};