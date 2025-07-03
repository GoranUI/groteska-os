
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTimeEntryCore } from "./useTimeEntryCore";

export function useTimeEntryFetch() {
  const { setTimeEntries, setLoadingState, handleApiError, transformEntry } = useTimeEntryCore();

  const fetchTimeEntries = useCallback(async (filters?: {
    userId?: string;
    projectId?: string;
    taskId?: string;
    from?: string;
    to?: string;
  }) => {
    setLoadingState(true);
    
    try {
      let query = supabase
        .from("time_entries")
        .select("*")
        .order("start_time", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId);
      }
      if (filters?.taskId) {
        query = query.eq("task_id", filters.taskId);
      }
      if (filters?.from) {
        query = query.gte("start_time", filters.from);
      }
      if (filters?.to) {
        query = query.lte("start_time", filters.to);
      }

      const { data, error } = await query;

      if (error) {
        return handleApiError(error, 'fetchTimeEntries');
      }

      const transformedEntries = (data || []).map(transformEntry);
      setTimeEntries(transformedEntries);
      
      return { data: transformedEntries, error: null };
    } catch (err) {
      return handleApiError(err, 'fetchTimeEntries');
    } finally {
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError, transformEntry]);

  return {
    fetchTimeEntries,
  };
}
