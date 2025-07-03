import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";

export function useTimeEntryData() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    let query = supabase.from("time_entries").select("*");
    if (filters?.projectId) query = query.eq("project_id", filters.projectId);
    if (filters?.taskId) query = query.eq("task_id", filters.taskId);
    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.from) query = query.gte("start_time", filters.from);
    if (filters?.to) query = query.lte("end_time", filters.to);
    const { data, error } = await query.order("start_time", { ascending: false });
    if (error) setError(error.message);
    
    // Transform database response to match TimeEntry interface
    const transformedData = data?.map(entry => ({
      id: entry.id.toString(),
      projectId: entry.project_id || '',
      taskId: entry.task_id,
      userId: entry.user_id,
      startTime: entry.start_time,
      endTime: entry.end_time,
      duration: entry.duration || 0,
      note: entry.description,
      isBillable: false, // Default value since not in DB yet
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    })) || [];
    
    setTimeEntries(transformedData);
    setLoading(false);
  }, []);

  // Add a new time entry
  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    setError(null);
    
    // Transform TimeEntry to database format
    const dbEntry = {
      project_id: entry.projectId,
      task_id: entry.taskId,
      user_id: entry.userId,
      start_time: entry.startTime,
      end_time: entry.endTime,
      duration: entry.duration,
      description: entry.note
    };
    
    const { data, error } = await supabase.from("time_entries").insert([dbEntry]).select().single();
    if (error) setError(error.message);
    if (data) {
      const transformedEntry = {
        id: data.id.toString(),
        projectId: data.project_id || '',
        taskId: data.task_id,
        userId: data.user_id,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration || 0,
        note: data.description,
        isBillable: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      setTimeEntries((prev) => [transformedEntry, ...prev]);
    }
    setLoading(false);
    return { data, error };
  }, []);

  // Update a time entry
  const updateTimeEntry = useCallback(async (id: string, updates: Partial<Omit<TimeEntry, "id" | "createdAt" | "updatedAt">>) => {
    setLoading(true);
    setError(null);
    
    // Transform updates to database format
    const dbUpdates: any = {};
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId;
    if (updates.userId) dbUpdates.user_id = updates.userId;
    if (updates.startTime) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.note !== undefined) dbUpdates.description = updates.note;
    
    const { data, error } = await supabase.from("time_entries").update(dbUpdates).eq("id", parseInt(id)).select().single();
    if (error) setError(error.message);
    if (data) {
      const transformedEntry = {
        id: data.id.toString(),
        projectId: data.project_id || '',
        taskId: data.task_id,
        userId: data.user_id,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration || 0,
        note: data.description,
        isBillable: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      setTimeEntries((prev) => prev.map((t) => (t.id === id ? transformedEntry : t)));
    }
    setLoading(false);
    return { data, error };
  }, []);

  // Delete a time entry
  const deleteTimeEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("time_entries").delete().eq("id", parseInt(id));
    if (error) setError(error.message);
    setTimeEntries((prev) => prev.filter((t) => t.id !== id));
    setLoading(false);
    return { error };
  }, []);

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