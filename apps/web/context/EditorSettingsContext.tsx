"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EditorTheme = 'vs-dark' | 'light' | 'hc-black';
export type EditorFontSize = 12 | 14 | 16 | 18 | 20;
export type EditorTabSize = 2 | 4 | 8;

interface EditorSettings {
  theme: EditorTheme;
  fontSize: EditorFontSize;
  tabSize: EditorTabSize;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  autoFormat: boolean;
}

interface EditorSettingsContextType extends EditorSettings {
  setTheme: (theme: EditorTheme) => void;
  setFontSize: (size: EditorFontSize) => void;
  setTabSize: (size: EditorTabSize) => void;
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;
  toggleWordWrap: () => void;
  toggleAutoFormat: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 4,
  minimap: false,
  lineNumbers: true,
  wordWrap: false,
  autoFormat: true,
};

const EditorSettingsContext = createContext<EditorSettingsContextType | null>(null);

export function EditorSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('algochamp-editor-settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load editor settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('algochamp-editor-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save editor settings:', error);
    }
  }, [settings]);

  const contextValue: EditorSettingsContextType = {
    ...settings,
    setTheme: (theme) => setSettings((prev) => ({ ...prev, theme })),
    setFontSize: (fontSize) => setSettings((prev) => ({ ...prev, fontSize })),
    setTabSize: (tabSize) => setSettings((prev) => ({ ...prev, tabSize })),
    toggleMinimap: () => setSettings((prev) => ({ ...prev, minimap: !prev.minimap })),
    toggleLineNumbers: () => setSettings((prev) => ({ ...prev, lineNumbers: !prev.lineNumbers })),
    toggleWordWrap: () => setSettings((prev) => ({ ...prev, wordWrap: !prev.wordWrap })),
    toggleAutoFormat: () => setSettings((prev) => ({ ...prev, autoFormat: !prev.autoFormat })),
    resetToDefaults: () => setSettings(DEFAULT_SETTINGS),
  };

  return (
    <EditorSettingsContext.Provider value={contextValue}>
      {children}
    </EditorSettingsContext.Provider>
  );
}

export function useEditorSettings() {
  const context = useContext(EditorSettingsContext);
  if (!context) {
    throw new Error('useEditorSettings must be used within EditorSettingsProvider');
  }
  return context;
}
