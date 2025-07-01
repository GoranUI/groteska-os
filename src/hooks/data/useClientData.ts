
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Client } from '@/types';
import { useToast } from '@/hooks/use-toast';

const transformClient = (dbClient: any): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email,
  company: dbClient.company,
  status: dbClient.status as "active" | "inactive",
  createdAt: dbClient.created_at,
});

export const useClientData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching clients for user:', user.id);
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      console.log('Clients data received:', clientsData);
      setClients((clientsData || []).map(transformClient));
    } catch (error: any) {
      console.error('Error in fetchClients:', error);
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Auto-fetch clients when user changes
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...client, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => [transformClient(data), ...prev]);
    toast({
      title: "Client added",
      description: `${client.name} has been added successfully.`,
    });
  }, [user, toast]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.map(client => client.id === id ? transformClient(data) : client));
    toast({
      title: "Client updated",
      description: "Client has been updated successfully.",
    });
  }, [toast]);

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setClients(prev => prev.filter(client => client.id !== id));
    toast({
      title: "Client deleted",
      description: "Client has been deleted successfully.",
    });
  }, [toast]);

  const getActiveClients = useCallback(() => {
    return clients.filter(client => client.status === "active").length;
  }, [clients]);

  return {
    clients,
    loading,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    getActiveClients,
  };
};
