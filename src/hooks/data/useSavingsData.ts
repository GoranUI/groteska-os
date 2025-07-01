
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Savings } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformSaving = (dbSaving: any): Savings => ({
  id: dbSaving.id,
  amount: Number(dbSaving.amount),
  currency: dbSaving.currency as "USD" | "EUR" | "RSD",
  date: dbSaving.date,
  type: dbSaving.type as "deposit" | "withdrawal",
  description: dbSaving.description,
});

export const useSavingsData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savings, setSavings] = useState<Savings[]>([]);

  const fetchSavings = useCallback(async () => {
    if (!user) return;

    const { data: savingsData, error: savingsError } = await supabase
      .from('savings')
      .select('*')
      .order('date', { ascending: false });

    if (savingsError) throw savingsError;
    setSavings((savingsData || []).map(transformSaving));
  }, [user]);

  const addSavings = useCallback(async (saving: Omit<Savings, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('savings')
      .insert([{ ...saving, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => [transformSaving(data), ...prev]);
    toast({
      title: "Savings added",
      description: "Savings entry has been added successfully.",
    });
  }, [user, toast]);

  const updateSavings = useCallback(async (id: string, updates: Partial<Savings>) => {
    const { data, error } = await supabase
      .from('savings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => prev.map(saving => saving.id === id ? transformSaving(data) : saving));
    toast({
      title: "Savings updated",
      description: "Savings has been updated successfully.",
    });
  }, [toast]);

  const deleteSavings = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('savings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting savings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSavings(prev => prev.filter(saving => saving.id !== id));
    toast({
      title: "Savings deleted",
      description: "Savings has been deleted successfully.",
    });
  }, [toast]);

  return {
    savings,
    fetchSavings,
    addSavings,
    updateSavings,
    deleteSavings,
  };
};
