
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Savings } from "@/types";

interface SavingsFormProps {
  onSubmit: (data: Omit<Savings, 'id'>) => void;
  initialData?: Savings | null;
  onCancel?: () => void;
}

export const SavingsForm = ({ onSubmit, initialData, onCancel }: SavingsFormProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setDate(initialData.date);
      setType(initialData.type);
      setDescription(initialData.description);
    } else {
      setAmount("");
      setDate("");
      setDescription("");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return; // Removed description requirement

    onSubmit({
      amount: parseFloat(amount),
      currency,
      date,
      type,
      description: description.trim() || `${type} transaction`, // Provide default if empty
    });

    if (!initialData) {
      setAmount("");
      setDate("");
      setDescription("");
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
              {initialData ? "Edit Savings Entry" : "Add New Savings Entry"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update savings entry" : "Record a new savings transaction"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
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
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(value: "deposit" | "withdrawal") => setType(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
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

          <div className="md:col-span-2 lg:col-span-4 space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-xs text-gray-500">(optional)</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this savings transaction (optional)"
              className="h-10"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex gap-3">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Entry" : "Add Entry"}
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
