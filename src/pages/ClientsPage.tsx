
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, UserPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient, loading } = useSupabaseData();
  const [editingClient, setEditingClient] = useState(null);
  const [searchParams] = useSearchParams();
  const filteredClientId = searchParams.get('filter');

  // Filter clients if there's a filter parameter
  const filteredClients = filteredClientId 
    ? clients.filter(client => client.id === filteredClientId)
    : clients;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your client data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Client Management
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {filteredClientId ? 'Filtered client view' : 'Manage your client relationships and build strong partnerships'}
          </p>
          {filteredClientId && (
            <button 
              onClick={() => window.history.replaceState({}, '', '/clients')}
              className="text-primary hover:text-primary/80 text-sm underline"
            >
              Show all clients
            </button>
          )}
        </div>

      <ClientForm
        onSubmit={editingClient ? 
          (data) => {
            updateClient(editingClient.id, data);
            setEditingClient(null);
          } :
          addClient
        }
        initialData={editingClient}
        onCancel={() => setEditingClient(null)}
      />

      <ClientList
        clients={filteredClients}
        onEdit={setEditingClient}
        onDelete={deleteClient}
      />
      </div>
    </div>
  );
};

export default ClientsPage;
