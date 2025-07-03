
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export function useTimeEntryData() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // Fetch time entries (optionally by filters)
  const fetchTimeEntries = useCallback(async (filters?: {
    projectId?: string;
    taskId?: string;
    userId?: string;
    from?: string; // ISO date
    to?: string;   // ISO date
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from("time_entries").select("*");
      
      if (filters?.projectId) query = query.eq("project_id", filters.projectId);
      if (filters?.taskId) query = query.eq("task_id", filters.taskId);
      if (filters?.userId) query = query.eq("user_id", filters.userId);
      if (filters?.from) query = query.gte("start_time", filters.from);
      if (filters?.to) query = query.lte("end_time", filters.to);
      
      const { data, error } = await query.order("start_time", { ascending: false });
      
      if (error) {
        handleError(error, { operation: 'fetchTimeEntries' });
        setError(error.message);
        return;
      }
      
      // Transform database response to match TimeEntry interface
      const transformedData = data?.map(entry => ({
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
      })) || [];
      
      setTimeEntries(transformedData);
    } catch (err) {
      handleError(err, { operation: 'fetchTimeEntries' });
      setError('Failed to fetch time entries');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Add a new time entry
  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform TimeEntry to database format
      const dbEntry = {
        project_id: entry.projectId || null,
        task_id: entry.taskId || null,
        user_id: entry.userId,
        start_time: entry.startTime,
        end_time: entry.endTime || null,
        duration: entry.duration,
        description: entry.note || null
      };
      
      const { data, error } = await supabase
        .from("time_entries")
        .insert([dbEntry])
        .select()
        .single();
      
      if (error) {
        handleError(error, { operation: 'addTimeEntry' });
        setError(error.message);
        return { data: null, error };
      }
      
      if (data) {
        const transformedEntry: TimeEntry = {
          id: data.id.toString(),
          projectId: data.project_id || '',
          taskId: data.task_id,
          userId: data.user_id,
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration || 0,
          note: data.description || '',
          isBillable: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        setTimeEntries((prev) => [transformedEntry, ...prev]);
      }
      
      return { data, error: null };
    } catch (err) {
      handleError(err, { operation: 'addTimeEntry' });
      const errorMessage = 'Failed to add time entry';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update a time entry
  const updateTimeEntry = useCallback(async (id: string, updates: Partial<Omit<TimeEntry, "id" | "createdAt" | "updatedAt">>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform updates to database format
      const dbUpdates: any = {};
      if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId || null;
      if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId || null;
      if (updates.userId) dbUpdates.user_id = updates.userId;
      if (updates.startTime) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.note !== undefined) dbUpdates.description = updates.note || null;
      
      const { data, error } = await supabase
        .from("time_entries")
        .update(dbUpdates)
        .eq("id", parseInt(id))
        .select()
        .single();
      
      if (error) {
        handleError(error, { operation: 'updateTimeEntry' });
        setError(error.message);
        return { data: null, error };
      }
      
      if (data) {
        const transformedEntry: TimeEntry = {
          id: data.id.toString(),
          projectId: data.project_id || '',
          taskId: data.task_id,
          userId: data.user_id,
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration || 0,
          note: data.description || '',
          isBillable: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        setTimeEntries((prev) => prev.map((t) => (t.id === id ? transformedEntry : t)));
      }
      
      return { data, error: null };
    } catch (err) {
      handleError(err, { operation: 'updateTimeEntry' });
      const errorMessage = 'Failed to update time entry';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete a time entry
  const deleteTimeEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", parseInt(id));
      
      if (error) {
        handleError(error, { operation: 'deleteTimeEntry' });
        setError(error.message);
        return { error };
      }
      
      setTimeEntries((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err) {
      handleError(err, { operation: 'deleteTimeEntry' });
      const errorMessage = 'Failed to delete time entry';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}
