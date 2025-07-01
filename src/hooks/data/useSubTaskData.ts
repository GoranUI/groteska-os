
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SubTask } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformSubTask = (dbSubTask: any): SubTask => ({
  id: dbSubTask.id,
  projectId: dbSubTask.project_id,
  name: dbSubTask.name,
  description: dbSubTask.description,
  amount: Number(dbSubTask.amount),
  currency: dbSubTask.currency as "USD" | "EUR" | "RSD",
  status: dbSubTask.status as "pending" | "paid",
  dueDate: dbSubTask.due_date,
  completedAt: dbSubTask.completed_at,
  invoiceId: dbSubTask.invoice_id,
  incomeId: dbSubTask.income_id,
  userId: dbSubTask.user_id,
  createdAt: dbSubTask.created_at,
  updatedAt: dbSubTask.updated_at,
});

export const useSubTaskData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: subTasksData, error } = await supabase
        .from('sub_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubTasks((subTasksData || []).map(transformSubTask));
    } catch (error: any) {
      console.error('Error fetching sub-tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load sub-tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSubTasks();
  }, [fetchSubTasks]);

  const addSubTask = useCallback(async (subTask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sub_tasks')
        .insert([{ 
          ...subTask,
          project_id: subTask.projectId,
          due_date: subTask.dueDate,
          completed_at: subTask.completedAt,
          invoice_id: subTask.invoiceId,
          income_id: subTask.incomeId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setSubTasks(prev => [transformSubTask(data), ...prev]);
      toast({
        title: "Success",
        description: "Sub-task has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error adding sub-task:', error);
      toast({
        title: "Error",
        description: "Failed to create sub-task. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateSubTask = useCallback(async (id: string, updates: Partial<SubTask>) => {
    try {
      const dbUpdates = {
        ...updates,
        project_id: updates.projectId,
        due_date: updates.dueDate,
        completed_at: updates.completedAt,
        invoice_id: updates.invoiceId,
        income_id: updates.incomeId,
      };

      const { data, error } = await supabase
        .from('sub_tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSubTasks(prev => prev.map(subTask => subTask.id === id ? transformSubTask(data) : subTask));
      toast({
        title: "Success",
        description: "Sub-task has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating sub-task:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-task. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const markAsPaid = useCallback(async (id: string, clientName: string) => {
    if (!user) return;

    try {
      // First get the sub-task details
      const { data: subTask, error: fetchError } = await supabase
        .from('sub_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create income entry
      const { data: income, error: incomeError } = await supabase
        .from('incomes')
        .insert([{
          amount: subTask.amount,
          currency: subTask.currency,
          client: clientName,
          client_id: null, // We'll need to get this from the project
          project_id: subTask.project_id,
          sub_task_id: id,
          date: new Date().toISOString().split('T')[0],
          category: 'one-time',
          description: `Payment for: ${subTask.name}`,
          status: 'paid',
          user_id: user.id
        }])
        .select()
        .single();

      if (incomeError) throw incomeError;

      // Update sub-task to paid status
      const { data: updatedSubTask, error: updateError } = await supabase
        .from('sub_tasks')
        .update({ 
          status: 'paid',
          completed_at: new Date().toISOString(),
          income_id: income.id
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSubTasks(prev => prev.map(st => st.id === id ? transformSubTask(updatedSubTask) : st));
      
      toast({
        title: "Success",
        description: "Payment marked as paid and recorded in income history.",
      });
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark payment as paid. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const deleteSubTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubTasks(prev => prev.filter(subTask => subTask.id !== id));
      toast({
        title: "Success",
        description: "Sub-task has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting sub-task:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-task. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    subTasks,
    loading,
    fetchSubTasks,
    addSubTask,
    updateSubTask,
    markAsPaid,
    deleteSubTask,
  };
};
