import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TimeEntry } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useTimeTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Transform database response to TimeEntry interface
  const transformEntry = useCallback((entry: any): TimeEntry => ({
    id: entry.id,
    userId: entry.user_id,
    projectId: entry.project_id,
    taskId: entry.task_id,
    description: entry.description,
    startTime: entry.start_time,
    endTime: entry.end_time,
    duration: entry.duration || 0,
    isBillable: entry.is_billable || false,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  }), []);

  // Fetch time entries
  const fetchTimeEntries = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (startDate) {
        query = query.gte("start_time", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("start_time", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedEntries = (data || []).map(transformEntry);
      setTimeEntries(transformedEntries);

      // Check for running timer
      const running = transformedEntries.find(entry => !entry.endTime);
      setActiveEntry(running || null);

    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, transformEntry, toast]);

  // Start timer
  const startTimer = useCallback(async (projectId: string, taskId?: string, description?: string) => {
    if (!user || activeEntry) return;

    try {
      const startTime = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          user_id: user.id,
          project_id: projectId,
          task_id: taskId || null,
          description: description || null,
          start_time: startTime,
          is_billable: false
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = transformEntry(data);
      setActiveEntry(newEntry);
      setTimeEntries(prev => [newEntry, ...prev]);
      setElapsedTime(0);

      toast({
        title: "Timer started",
        description: "Time tracking has begun",
      });

    } catch (error) {
      console.error("Error starting timer:", error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  }, [user, activeEntry, transformEntry, toast]);

  // Stop timer
  const stopTimer = useCallback(async () => {
    if (!activeEntry) return;

    try {
      const endTime = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("time_entries")
        .update({
          end_time: endTime,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeEntry.id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry = transformEntry(data);
      setActiveEntry(null);
      setElapsedTime(0);
      setTimeEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      );

      toast({
        title: "Timer stopped",
        description: `Tracked ${formatDuration(updatedEntry.duration)}`,
      });

    } catch (error) {
      console.error("Error stopping timer:", error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  }, [activeEntry, transformEntry, toast]);

  // Add manual time entry
  const addTimeEntry = useCallback(async (entry: {
    projectId: string;
    taskId?: string | null;
    description?: string | null;
    startTime: string;
    endTime: string;
    isBillable?: boolean;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          user_id: user.id,
          project_id: entry.projectId,
          task_id: entry.taskId,
          description: entry.description,
          start_time: entry.startTime,
          end_time: entry.endTime,
          is_billable: entry.isBillable || false
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = transformEntry(data);
      setTimeEntries(prev => [newEntry, ...prev.filter(e => e.id !== newEntry.id)]);

      toast({
        title: "Time entry added",
        description: `Added ${formatDuration(newEntry.duration)}`,
      });

      return newEntry;

    } catch (error) {
      console.error("Error adding time entry:", error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive",
      });
    }
  }, [user, transformEntry, toast]);

  // Update time entry
  const updateTimeEntry = useCallback(async (id: string, updates: {
    projectId?: string;
    taskId?: string | null;
    description?: string | null;
    startTime?: string;
    endTime?: string | null;
    isBillable?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .update({
          project_id: updates.projectId,
          task_id: updates.taskId,
          description: updates.description,
          start_time: updates.startTime,
          end_time: updates.endTime,
          is_billable: updates.isBillable,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry = transformEntry(data);
      setTimeEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      );

      toast({
        title: "Time entry updated",
        description: "Changes saved successfully",
      });

      return updatedEntry;

    } catch (error) {
      console.error("Error updating time entry:", error);
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    }
  }, [transformEntry, toast]);

  // Delete time entry
  const deleteTimeEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTimeEntries(prev => prev.filter(entry => entry.id !== id));
      
      if (activeEntry?.id === id) {
        setActiveEntry(null);
        setElapsedTime(0);
      }

      toast({
        title: "Time entry deleted",
        description: "Entry removed successfully",
      });

    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  }, [activeEntry, toast]);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Update elapsed time for running timer
  useEffect(() => {
    if (!activeEntry) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(activeEntry.startTime).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchTimeEntries();
    }
  }, [user, fetchTimeEntries]);

  return {
    timeEntries,
    loading,
    activeEntry,
    elapsedTime,
    fetchTimeEntries,
    startTimer,
    stopTimer,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    formatDuration,
  };
}