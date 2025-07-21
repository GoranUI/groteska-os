
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
import { cn } from "@/lib/utils";

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
  const [category, setCategory] = useState<"main-bank" | "savings" | "cash" | "one-time">("one-time");
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
    <div className="animate-fade-in">
      <Card className="card-elevated border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-success/5 to-success-light/5 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              {initialData ? <Edit3 className="h-6 w-6 text-success" /> : <Plus className="h-6 w-6 text-success" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? "Edit Income Entry" : "Add New Income"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {initialData ? "Update your income details" : "Record a new income source and track your earnings"}
              </p>
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Income Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Income Category <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: "freelance", label: "Freelance Work", icon: "💼", description: "Independent project work" },
                { value: "salary", label: "Salary", icon: "💰", description: "Regular employment income" },
                { value: "consulting", label: "Consulting", icon: "🎯", description: "Advisory services" },
                { value: "investment", label: "Investment", icon: "📈", description: "Returns from investments" },
                { value: "main-bank", label: "Main Bank", icon: "🏦", description: "Primary bank account" },
                { value: "savings", label: "Savings", icon: "🐷", description: "Savings account income" },
                { value: "cash", label: "Cash", icon: "💵", description: "Cash payments" },
                { value: "one-time", label: "One-time Project", icon: "➕", description: "Single project payment" }
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value as any)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02]",
                    category === cat.value
                      ? "border-success bg-success/5 shadow-md"
                      : "border-border hover:border-success/30 hover:bg-success/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Amount <span className="text-destructive">*</span>
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
                className="focus-ring h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-foreground">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select value={currency} onValueChange={(value: "USD" | "EUR" | "RSD") => setCurrency(value)}>
                <SelectTrigger className="focus-ring h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RSD">🇷🇸 RSD</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Selection with Enhanced UI */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-foreground">
              Client <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Popover open={showClientPopover} onOpenChange={setShowClientPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showClientPopover}
                  className="h-11 w-full justify-between focus-ring"
                >
                  {clientId
                    ? clients.find((client) => client.id === clientId)?.name
                    : "Select client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
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
                              <span className="text-xs text-muted-foreground">{client.company}</span>
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
                        className="focus-ring"
                      />
                      <Input
                        placeholder="Email (optional)"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        className="focus-ring"
                      />
                      <Input
                        placeholder="Company (optional)"
                        value={newClientCompany}
                        onChange={(e) => setNewClientCompany(e.target.value)}
                        className="focus-ring"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateClient}
                          className="flex-1 btn-success"
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
                          className="focus-ring"
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
            <Label htmlFor="date" className="text-sm font-medium text-foreground">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="focus-ring h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Add details about this income source..."
              className="focus-ring min-h-[100px] resize-none"
              maxLength={1000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="btn-success flex-1 h-11"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Income" : "Add Income"}
            </Button>
            {initialData && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="focus-ring h-11 px-6"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};
