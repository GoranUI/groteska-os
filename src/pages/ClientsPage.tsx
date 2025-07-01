
import { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";

const ClientsPage = () => {
  const { clients, addClient, updateClient, deleteClient } = useFinancialData();
  const [editingClient, setEditingClient] = useState(null);

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
