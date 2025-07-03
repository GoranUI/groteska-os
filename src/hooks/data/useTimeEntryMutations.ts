
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";
import { useTimeEntryCore } from "./useTimeEntryCore";

// Import global state from core
declare global {
  var globalTimeEntries: TimeEntry[];
}

// Initialize global state if not exists
if (typeof globalThis.globalTimeEntries === 'undefined') {
  globalThis.globalTimeEntries = [];
}

export function useTimeEntryMutations() {
  const { setTimeEntries, setLoadingState, handleApiError, transformEntry, transformForDB } = useTimeEntryCore();

  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">) => {
    console.log('Adding time entry:', entry);
    setLoadingState(true);
    
    try {
      const dbEntry = transformForDB(entry);
      console.log('Transformed DB entry:', dbEntry);
      
      const { data, error } = await supabase
        .from("time_entries")
        .insert([dbEntry])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return handleApiError(error, 'addTimeEntry');
      }
      
      if (data) {
        console.log('Entry created successfully:', data);
        const transformedEntry = transformEntry(data);
        console.log('Transformed entry:', transformedEntry);
        
        // Immediately update the state to include the new entry at the top
        setTimeEntries((prev) => {
          console.log('Mutations: setTimeEntries callback triggered');
          console.log('Mutations: Previous state has', prev.length, 'entries');
          console.trace('Mutations: Stack trace for setTimeEntries call');
          
          const updated = [transformedEntry, ...prev];
          console.log('Mutations: Updated entries state:', updated.length, 'entries');
          console.log('Mutations: Previous entries:', prev.length);
          console.log('Mutations: New entry details:', {
            id: transformedEntry.id,
            projectId: transformedEntry.projectId,
            startTime: transformedEntry.startTime,
            duration: transformedEntry.duration
          });
          
          // Update global state immediately
          globalThis.globalTimeEntries = updated;
          console.log('Mutations: Updated global state with', updated.length, 'entries');
          console.log('Mutations: Global state now contains:', globalThis.globalTimeEntries.map(e => e.id));
          
          // Force a small delay to ensure state propagation
          setTimeout(() => {
            console.log('Mutations: Dispatching timeEntryAdded event after delay');
            window.dispatchEvent(new CustomEvent('timeEntryAdded', { detail: transformedEntry }));
          }, 50);
          
          return updated;
        });
        
        // Event is now dispatched after the timeout above
        console.log('Mutations: State update complete, event will be dispatched shortly');
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Catch block error:', err);
      return handleApiError(err, 'addTimeEntry');
    } finally {
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError, transformEntry, transformForDB]);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<Omit<TimeEntry, "id" | "createdAt" | "updatedAt">>) => {
    setLoadingState(true);
    
    try {
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
        return handleApiError(error, 'updateTimeEntry');
      }
      
      if (data) {
        const transformedEntry = transformEntry(data);
        setTimeEntries((prev) => prev.map((t) => (t.id === id ? transformedEntry : t)));
      }
      
      return { data, error: null };
    } catch (err) {
      return handleApiError(err, 'updateTimeEntry');
    } finally {
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError, transformEntry]);

  const deleteTimeEntry = useCallback(async (id: string) => {
    setLoadingState(true);
    
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", parseInt(id));
      
      if (error) {
        return handleApiError(error, 'deleteTimeEntry');
      }
      
      setTimeEntries((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    } catch (err) {
      return handleApiError(err, 'deleteTimeEntry');
    } finally {
      setLoadingState(false);
    }
  }, [setTimeEntries, setLoadingState, handleApiError]);

  return {
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
}
