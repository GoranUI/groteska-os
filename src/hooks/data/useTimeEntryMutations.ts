
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";
import { useTimeEntryCore } from "./useTimeEntryCore";

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
        
        // Update the state to include the new entry
        setTimeEntries((prev) => {
          const updated = [transformedEntry, ...prev];
          console.log('Updated entries:', updated);
          return updated;
        });
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
