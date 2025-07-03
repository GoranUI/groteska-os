
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";
import { Loader2 } from "lucide-react";
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
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Clients</h1>
        <p className="text-gray-600">
          {filteredClientId ? 'Filtered client view' : 'Manage your client relationships'}
        </p>
        {filteredClientId && (
          <button 
            onClick={() => window.history.replaceState({}, '', '/clients')}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
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
  );
};

export default ClientsPage;
