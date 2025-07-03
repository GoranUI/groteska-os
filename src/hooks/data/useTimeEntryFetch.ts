
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTimeEntryCore } from "./useTimeEntryCore";

// Global fetch state to prevent multiple simultaneous fetches
let isFetching = false;
let lastFetchParams: string | null = null;

export function useTimeEntryFetch() {
  const { setTimeEntries, setLoadingState, handleApiError, transformEntry } = useTimeEntryCore();

  const fetchTimeEntries = useCallback(async (filters?: {
    userId?: string;
    projectId?: string;
    taskId?: string;
    from?: string;
    to?: string;
  }) => {
    // Create a unique key for this fetch request
    const fetchKey = JSON.stringify(filters || {});
    
    // Prevent duplicate fetches with same parameters
    if (isFetching && lastFetchParams === fetchKey) {
      console.log('useTimeEntryFetch: Skipping duplicate fetch with same parameters');
      return { data: null, error: null };
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('useTimeEntryFetch: Another fetch in progress, skipping');
      return { data: null, error: null };
    }
    
    console.log('useTimeEntryFetch: Starting fetch with filters:', filters);
    console.trace('useTimeEntryFetch: Stack trace for fetch call');
    
    isFetching = true;
    lastFetchParams = fetchKey;
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
        // Ensure we're filtering on the date part correctly
        query = query.gte("start_time", filters.from);
      }
      if (filters?.to) {
        // Include the full end of day for the 'to' date
        query = query.lte("start_time", filters.to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useTimeEntryFetch: Supabase error:', error);
        return handleApiError(error, 'fetchTimeEntries');
      }

      console.log('useTimeEntryFetch: Raw data from Supabase:', data?.length || 0, 'entries');
      const transformedEntries = (data || []).map(transformEntry);
      console.log('useTimeEntryFetch: Transformed entries:', transformedEntries.length, 'entries');
      console.log('useTimeEntryFetch: Setting state with', transformedEntries.length, 'entries');
      console.trace('useTimeEntryFetch: Stack trace for setTimeEntries call');
      
      setTimeEntries(transformedEntries);
      
      return { data: transformedEntries, error: null };
    } catch (err) {
      console.error('useTimeEntryFetch: Catch error:', err);
      return handleApiError(err, 'fetchTimeEntries');
    } finally {
      isFetching = false;
      lastFetchParams = null;
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError, transformEntry]);

  return {
    fetchTimeEntries,
  };
}
