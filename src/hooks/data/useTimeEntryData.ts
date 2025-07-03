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
    setTimeEntries(data || []);
    setLoading(false);
  }, []);

  // Add a new time entry
  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("time_entries").insert([entry]).select().single();
    if (error) setError(error.message);
    if (data) setTimeEntries((prev) => [data, ...prev]);
    setLoading(false);
    return { data, error };
  }, []);

  // Update a time entry
  const updateTimeEntry = useCallback(async (id: string, updates: Partial<Omit<TimeEntry, "id" | "createdAt" | "updatedAt">>) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("time_entries").update(updates).eq("id", id).select().single();
    if (error) setError(error.message);
    if (data) setTimeEntries((prev) => prev.map((t) => (t.id === id ? data : t)));
    setLoading(false);
    return { data, error };
  }, []);

  // Delete a time entry
  const deleteTimeEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
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