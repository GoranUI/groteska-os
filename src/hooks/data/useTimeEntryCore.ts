
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useTimeEntryCore() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

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
    setLoading(isLoading);
    if (isLoading) setError(null);
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
