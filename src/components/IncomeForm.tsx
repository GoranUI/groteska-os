
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Edit3, Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { Client, Income } from "@/types";
import { sanitizeDescription, validateAmount } from "@/utils/securityUtils";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useClientData } from "@/hooks/data/useClientData";

interface IncomeFormProps {
  clients: Client[];
  onSubmit: (data: Omit<Income, 'id'>) => void;
  initialData?: Income | null;
  onCancel?: () => void;
}

export const IncomeForm = ({ clients, onSubmit, initialData, onCancel }: IncomeFormProps) => {
  const { showError, showSuccess } = useToastNotifications();
  const { handleAsyncError } = useErrorHandler();
  const { addClient } = useClientData();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<"full-time" | "one-time">("one-time");
  const [description, setDescription] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientPopover, setShowClientPopover] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setClientId(initialData.clientId || "");
      setDate(initialData.date);
      setCategory(initialData.category);
      setDescription(initialData.description || "");
    } else {
      setAmount("");
      setClientId("");
      setDate("");
      setDescription("");
    }
  }, [initialData]);

  const validateInputs = () => {
    // Validate amount
    if (!amount) {
      showError("Validation Error", "Amount is required");
      return false;
    }

    try {
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        showError("Validation Error", "Amount must be greater than zero");
        return false;
      }
    } catch (error: any) {
      showError("Validation Error", error.message);
      return false;
    }

    // Client is optional now, so we skip this validation

    // Validate date
    if (!date) {
      showError("Validation Error", "Date is required");
      return false;
    }

    const selectedDate = new Date(date);
    const futureLimit = new Date();
    futureLimit.setFullYear(futureLimit.getFullYear() + 1);
    
    if (selectedDate > futureLimit) {
      showError("Validation Error", "Date cannot be more than 1 year in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    try {
      const selectedClient = clients.find(c => c.id === clientId);
      const validatedAmount = validateAmount(amount);
      const sanitizedDescription = description.trim() ? sanitizeDescription(description) : undefined;
      
      onSubmit({
        amount: validatedAmount,
        currency,
        client: selectedClient?.name || "",
        clientId,
        date,
        category,
        status: "paid", // All manual income entries are paid
        description: sanitizedDescription,
      });

      if (!initialData) {
        setAmount("");
        setClientId("");
        setDate("");
        setDescription("");
      }
    } catch (error: any) {
      showError("Error", "Failed to process income data. Please check your inputs.");
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const filteredClients = clients.filter(client => 
    client.status === "active" && 
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      showError("Error", "Client name is required");
      return;
    }

    const result = await handleAsyncError(
      () => addClient({
        name: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        company: newClientCompany.trim() || undefined,
        status: "active",
      }),
      { operation: "create client", component: "IncomeForm" }
    );

    if (result !== null) {
      setNewClientName("");
      setNewClientEmail("");
      setNewClientCompany("");
      setShowClientPopover(false);
      setClientSearch("");
      showSuccess("Success", "Client created successfully");
    }
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            {initialData ? <Edit3 className="h-5 w-5 text-orange-600" /> : <Plus className="h-5 w-5 text-orange-600" />}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {initialData ? "Edit Income" : "Add New Income"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update income entry" : "Record a new income entry (already paid)"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="1000000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </Label>
            <Select value={currency} onValueChange={(value: "USD" | "EUR" | "RSD") => setCurrency(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="RSD">RSD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-gray-700">
              Client <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Popover open={showClientPopover} onOpenChange={setShowClientPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showClientPopover}
                  className="h-10 w-full justify-between"
                >
                  {clientId
                    ? clients.find((client) => client.id === clientId)?.name
                    : "Select client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search clients..." 
                    value={clientSearch}
                    onValueChange={setClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-6 text-center text-sm">
                        <p>No client found.</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setNewClientName(clientSearch);
                            setClientSearch("");
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add "{clientSearch}" as new client
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            setClientId(client.id);
                            setShowClientPopover(false);
                            setClientSearch("");
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              clientId === client.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            {client.company && (
                              <span className="text-xs text-gray-500">{client.company}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                
                {newClientName && (
                  <div className="border-t p-4 space-y-3">
                    <div className="font-medium text-sm">Add New Client</div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Client name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                      />
                      <Input
                        placeholder="Email (optional)"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                      />
                      <Input
                        placeholder="Company (optional)"
                        value={newClientCompany}
                        onChange={(e) => setNewClientCompany(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateClient}
                          className="flex-1"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Client
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewClientName("");
                            setNewClientEmail("");
                            setNewClientCompany("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={(value: "full-time" | "one-time") => setCategory(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-6 space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Optional description"
              className="min-h-[80px]"
              maxLength={1000}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-6 flex gap-3">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Income" : "Add Income"}
            </Button>
            {initialData && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
