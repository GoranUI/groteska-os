import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTimeEntryCore } from "./useTimeEntryCore";

export function useTimeEntryFetch() {
  const { setTimeEntries, setLoadingState, handleApiError, transformEntry } = useTimeEntryCore();

  const fetchTimeEntries = useCallback(async (filters?: {
    projectId?: string;
    taskId?: string;
    userId?: string;
    from?: string; // ISO date
    to?: string;   // ISO date
  }) => {
    setLoadingState(true);
    
    try {
      let query = supabase.from("time_entries").select("*");
      
      if (filters?.projectId) query = query.eq("project_id", filters.projectId);
      if (filters?.taskId) query = query.eq("task_id", filters.taskId);
      if (filters?.userId) query = query.eq("user_id", filters.userId);
      if (filters?.from) query = query.gte("start_time", filters.from);
      if (filters?.to) query = query.lte("end_time", filters.to);
      
      const { data, error } = await query.order("start_time", { ascending: false });
      
      if (error) {
        return handleApiError(error, 'fetchTimeEntries');
      }
      
      const transformedData = data?.map(transformEntry) || [];
      setTimeEntries(transformedData);
      return { data: transformedData, error: null };
    } catch (err) {
      return handleApiError(err, 'fetchTimeEntries');
    } finally {
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError, transformEntry]);

  return { fetchTimeEntries };
}