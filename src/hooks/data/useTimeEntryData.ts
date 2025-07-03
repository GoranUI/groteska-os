
import { useEffect, useRef } from "react";
import { useTimeEntryCore } from "./useTimeEntryCore";
import { useTimeEntryFetch } from "./useTimeEntryFetch";
import { useTimeEntryMutations } from "./useTimeEntryMutations";

// Global fetch state to coordinate between components
let globalFetchState = {
  lastFetchParams: null as string | null,
  lastFetchTime: 0,
  isFetching: false,
  fetchPromise: null as Promise<any> | null,
};

export function useTimeEntryData() {
  const { timeEntries, loading, error } = useTimeEntryCore();
  const { fetchTimeEntries } = useTimeEntryFetch();
  const { addTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations();
  
  // Track if this component has already fetched
  const hasFetchedRef = useRef(false);

  // Centralized fetch function that prevents duplicate calls
  const fetchTimeEntriesWithCache = async (filters?: {
    userId?: string;
    projectId?: string;
    taskId?: string;
    from?: string;
    to?: string;
  }) => {
    const fetchKey = JSON.stringify(filters || {});
    const now = Date.now();
    
    // If we're already fetching with the same parameters, return the existing promise
    if (globalFetchState.isFetching && globalFetchState.lastFetchParams === fetchKey) {
      console.log('useTimeEntryData: Returning existing fetch promise for same parameters');
      return globalFetchState.fetchPromise;
    }
    
    // If we fetched recently with the same parameters, skip
    if (globalFetchState.lastFetchParams === fetchKey && 
        now - globalFetchState.lastFetchTime < 1000) { // 1 second cache
      console.log('useTimeEntryData: Skipping fetch - recent fetch with same parameters');
      return { data: timeEntries, error: null };
    }
    
    console.log('useTimeEntryData: Starting new fetch with parameters:', fetchKey);
    
    globalFetchState.isFetching = true;
    globalFetchState.lastFetchParams = fetchKey;
    globalFetchState.lastFetchTime = now;
    
    const promise = fetchTimeEntries(filters);
    globalFetchState.fetchPromise = promise;
    
    try {
      const result = await promise;
      return result;
    } finally {
      globalFetchState.isFetching = false;
      globalFetchState.fetchPromise = null;
    }
  };

  return {
    timeEntries,
    loading,
    error,
    fetchTimeEntries: fetchTimeEntriesWithCache,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}
