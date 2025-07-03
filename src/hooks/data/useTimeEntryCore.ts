import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// Global state for time entries to ensure all components share the same state
let globalTimeEntries: TimeEntry[] = [];
let globalSetTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>> | null = null;
let globalLoading = false;
let globalError: string | null = null;

// Global state update listeners
let globalStateListeners: Array<() => void> = [];

// State stabilization - prevent rapid state changes
let lastStateUpdate = 0;
const STATE_UPDATE_THROTTLE = 500; // Increased to 500ms throttle

// Track if we're currently updating to prevent loops
let isUpdating = false;

// Function to notify all listeners of state changes
const notifyGlobalStateChange = () => {
  if (isUpdating) {
    console.log('useTimeEntryCore: Skipping update - already updating');
    return;
  }
  
  const now = Date.now();
  if (now - lastStateUpdate < STATE_UPDATE_THROTTLE) {
    console.log('useTimeEntryCore: Throttling state update');
    return;
  }
  
  lastStateUpdate = now;
  isUpdating = true;
  
  if (globalStateListeners.length > 0) {
    console.log('useTimeEntryCore: Notifying', globalStateListeners.length, 'listeners of state change');
    globalStateListeners.forEach(listener => listener());
  }
  
  // Reset updating flag after a short delay
  setTimeout(() => {
    isUpdating = false;
  }, 50);
};

// Create a context for time entries to ensure state sharing across components
const TimeEntryContext = createContext<{
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  loading: boolean;
  error: string | null;
} | null>(null);

export function useTimeEntryCore() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(globalTimeEntries);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);
  const { handleError } = useErrorHandler();

  // Sync with global state - simplified to prevent loops
  useEffect(() => {
    // Only update global state if it's different
    if (globalTimeEntries !== timeEntries) {
      console.log('useTimeEntryCore: Updating global state');
      console.log('useTimeEntryCore: Previous global entries:', globalTimeEntries.length);
      console.log('useTimeEntryCore: New local entries:', timeEntries.length);
      
      globalTimeEntries = timeEntries;
      globalSetTimeEntries = setTimeEntries;
      globalLoading = loading;
      globalError = error;
      
      console.log('useTimeEntryCore: Global state updated:', {
        timeEntriesLength: timeEntries.length,
        loading,
        error
      });
    }
  }, [timeEntries, loading, error]);

  // Simplified state synchronization - only sync on mount and events
  useEffect(() => {
    // Sync with global state on mount
    if (globalTimeEntries.length > 0 && timeEntries.length === 0) {
      console.log('useTimeEntryCore: Syncing with global state on mount');
      setTimeEntries(globalTimeEntries);
    }
    
    // Listen for custom events to sync state
    const handleTimeEntryAdded = (event: CustomEvent) => {
      console.log('useTimeEntryCore: Received timeEntryAdded event');
      // Don't trigger immediate sync - let the fetch handle it
    };
    
    window.addEventListener('timeEntryAdded', handleTimeEntryAdded as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('timeEntryAdded', handleTimeEntryAdded as EventListener);
    };
  }, []); // Only run on mount

  // Transform database response to match TimeEntry interface
  const transformEntry = useCallback((entry: any): TimeEntry => ({
    id: entry.id.toString(),
    projectId: entry.project_id || '',
    taskId: entry.task_id,
    userId: entry.user_id,
    startTime: entry.start_time,
    endTime: entry.end_time,
    duration: entry.duration || 0,
    note: entry.description || '',
    isBillable: false, // Default value since not in DB yet
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  }), []);

  // Transform TimeEntry to database format
  const transformForDB = useCallback((entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">) => ({
    project_id: entry.projectId || null,
    task_id: entry.taskId || null,
    user_id: entry.userId,
    start_time: entry.startTime,
    end_time: entry.endTime || null,
    duration: entry.duration,
    description: entry.note || null
  }), []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    console.log('useTimeEntryCore: Setting loading state:', isLoading);
    setLoading(isLoading);
    globalLoading = isLoading;
    if (isLoading) {
      setError(null);
      globalError = null;
    }
  }, []);

  const handleApiError = useCallback((err: any, operation: string) => {
    console.error(`Error in ${operation}:`, err);
    let errorMessage = `Failed to ${operation}`;
    
    // Better error handling for different error types
    if (err?.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err?.error?.message) {
      errorMessage = err.error.message;
    }
    
    handleError(err, { operation });
    setError(errorMessage);
    globalError = errorMessage;
    return { data: null, error: { message: errorMessage } };
  }, [handleError]);

  return {
    timeEntries,
    setTimeEntries,
    loading,
    error,
    setLoadingState,
    handleApiError,
    transformEntry,
    transformForDB
  };
}
