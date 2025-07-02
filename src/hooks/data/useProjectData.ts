
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformProject = (dbProject: any): Project => ({
  id: dbProject.id,
  clientId: dbProject.client_id,
  name: dbProject.name,
  description: dbProject.description,
  status: dbProject.status as "negotiation" | "pending" | "in_progress" | "waiting_on_client" | "done" | "canceled",
  priority: dbProject.priority as "low" | "medium" | "high" | "urgent",
  startDate: dbProject.start_date,
  endDate: dbProject.end_date,
  budget: dbProject.budget ? Number(dbProject.budget) : undefined,
  billingType: dbProject.billing_type as "fixed" | "hourly",
  hourlyRate: dbProject.hourly_rate ? Number(dbProject.hourly_rate) : undefined,
  currency: dbProject.currency as "USD" | "EUR" | "RSD",
  userId: dbProject.user_id,
  createdAt: dbProject.created_at,
  updatedAt: dbProject.updated_at,
});

export const useProjectData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((projectsData || []).map(transformProject));
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          currency: project.currency,
          client_id: project.clientId,
          start_date: project.startDate,
          end_date: project.endDate,
          billing_type: project.billingType,
          hourly_rate: project.hourlyRate,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [transformProject(data), ...prev]);
      toast({
        title: "Success",
        description: "Project has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.billingType !== undefined) dbUpdates.billing_type = updates.billingType;
      if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(project => project.id === id ? transformProject(data) : project));
      toast({
        title: "Success",
        description: "Project has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
      toast({
        title: "Success",
        description: "Project has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};
