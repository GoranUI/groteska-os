
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Client, Income } from "@/types";
import { sanitizeInput, sanitizeDescription, validateAmount } from "@/utils/securityUtils";
import { useToast } from "@/hooks/use-toast";

interface IncomeFormProps {
  clients: Client[];
  onSubmit: (data: Omit<Income, 'id'>) => void;
  initialData?: Income | null;
  onCancel?: () => void;
}

export const IncomeForm = ({ clients, onSubmit, initialData, onCancel }: IncomeFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<"full-time" | "one-time">("one-time");
  const [status, setStatus] = useState<"paid" | "pending">("pending");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setClientId(initialData.clientId || "");
      setDate(initialData.date);
      setCategory(initialData.category);
      setStatus(initialData.status || "pending");
      setDescription(initialData.description || "");
    } else {
      setAmount("");
      setClientId("");
      setDate("");
      setStatus("pending");
      setDescription("");
    }
  }, [initialData]);

  const validateInputs = () => {
    // Validate amount
    if (!amount) {
      toast({
        title: "Validation Error",
        description: "Amount is required",
        variant: "destructive",
      });
      return false;
    }

    try {
      const validatedAmount = validateAmount(amount);
      if (validatedAmount <= 0) {
        toast({
          title: "Validation Error",
          description: "Amount must be greater than zero",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    // Validate client selection
    if (!clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return false;
    }

    // Validate date
    if (!date) {
      toast({
        title: "Validation Error",
        description: "Date is required",
        variant: "destructive",
      });
      return false;
    }

    const selectedDate = new Date(date);
    const futureLimit = new Date();
    futureLimit.setFullYear(futureLimit.getFullYear() + 1);
    
    if (selectedDate > futureLimit) {
      toast({
        title: "Validation Error",
        description: "Date cannot be more than 1 year in the future",
        variant: "destructive",
      });
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
        status,
        description: sanitizedDescription,
      });

      if (!initialData) {
        setAmount("");
        setClientId("");
        setDate("");
        setStatus("pending");
        setDescription("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process income data. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setDescription(sanitizedValue);
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
              {initialData ? "Update income entry" : "Record a new income entry"}
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
              Client <span className="text-red-500">*</span>
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.filter(client => client.status === "active").map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={status} onValueChange={(value: "paid" | "pending") => setStatus(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-6 space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Optional description"
              className="h-10"
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
