
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
  status: dbProject.status as "active" | "completed" | "on_hold" | "cancelled",
  startDate: dbProject.start_date,
  endDate: dbProject.end_date,
  budget: dbProject.budget ? Number(dbProject.budget) : undefined,
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
          ...project,
          client_id: project.clientId,
          start_date: project.startDate,
          end_date: project.endDate,
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
      const dbUpdates = {
        ...updates,
        client_id: updates.clientId,
        start_date: updates.startDate,
        end_date: updates.endDate,
      };

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
