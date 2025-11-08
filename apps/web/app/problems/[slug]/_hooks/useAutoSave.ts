"use client";

import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  key: string;
  value: string;
  delay?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Hook for auto-saving code to localStorage
 * Debounces saves to avoid excessive writes
 */
export function useAutoSave({ key, value, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to auto-save code:', error);
      }
    }, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay, enabled]);

  // Function to manually save immediately
  const saveNow = () => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to save code:', error);
      return false;
    }
  };

  // Function to clear saved data
  const clearSaved = () => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to clear saved code:', error);
      return false;
    }
  };

  // Function to load saved data
  const loadSaved = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved;
    } catch (error) {
      console.error('Failed to load saved code:', error);
      return null;
    }
  };

  return { saveNow, clearSaved, loadSaved };
}
