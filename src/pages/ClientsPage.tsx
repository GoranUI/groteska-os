
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";
import { Loader2 } from "lucide-react";

const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient, loading } = useSupabaseData();
  const [editingClient, setEditingClient] = useState(null);

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
        <p className="text-gray-600">Manage your client relationships</p>
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
        clients={clients}
        onEdit={setEditingClient}
        onDelete={deleteClient}
      />
    </div>
  );
};

export default ClientsPage;
