"use client";
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditorSettings, type EditorTheme, type EditorFontSize, type EditorTabSize } from '../_context/EditorSettingsContext';

/**
 * Settings panel for customizing the code editor
 * Includes theme, font size, tab size, and various toggles
 */
export function EditorSettingsPanel( { setIsEditorSettingsPanelOpen }: { setIsEditorSettingsPanelOpen: (isOpen: boolean) => void }) {
  const settings = useEditorSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-end p-4 mt-16"
      onClick={() => setIsEditorSettingsPanelOpen(false)}
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="bg-card/95 backdrop-blur-sm rounded-lg max-w-md w-full border border-border/50 shadow-2xl transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border/30 bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Editor Settings</h3>
          <button
            onClick={() => setIsEditorSettingsPanelOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-all duration-200"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => settings.setTheme(e.target.value as EditorTheme)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            >
              <option value="vs-dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="hc-black">High Contrast Black</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="20"
              step="2"
              value={settings.fontSize}
              onChange={(e) => settings.setFontSize(Number(e.target.value) as EditorFontSize)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-colors duration-200"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>12px</span>
              <span>20px</span>
            </div>
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tab Size
            </label>
            <select
              value={settings.tabSize}
              onChange={(e) => settings.setTabSize(Number(e.target.value) as EditorTabSize)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces (Recommended)</option>
              <option value="8">8 spaces</option>
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3 pt-2">
            <ToggleOption
              label="Show Minimap"
              description="Display code overview on the right"
              checked={settings.minimap}
              onChange={settings.toggleMinimap}
            />
            <ToggleOption
              label="Show Line Numbers"
              description="Display line numbers in the editor"
              checked={settings.lineNumbers}
              onChange={settings.toggleLineNumbers}
            />
            <ToggleOption
              label="Word Wrap"
              description="Wrap long lines automatically"
              checked={settings.wordWrap}
              onChange={settings.toggleWordWrap}
            />
            <ToggleOption
              label="Auto Format"
              description="Format code on paste and type"
              checked={settings.autoFormat}
              onChange={settings.toggleAutoFormat}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-border/30 bg-muted/30">
          <button
            onClick={settings.resetToDefaults}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-muted/50 px-2 py-1 rounded"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => setIsEditorSettingsPanelOpen(false)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-md text-sm text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body level, completely outside Monaco's stacking context
  return mounted && typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}

interface ToggleOptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-start justify-between cursor-pointer group">
      <div className="flex-1">
        <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
          {label}
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="relative ml-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 peer-checked:bg-primary" />
      </div>
    </label>
  );
}
