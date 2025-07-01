
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Expense } from "@/types";

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  initialData?: Expense | null;
  onCancel?: () => void;
}

export const ExpenseForm = ({ onSubmit, initialData, onCancel }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Recurring" | "Food" | "Work Food" | "External Food" | "Transport" | "Holiday" | "Utilities" | "Software" | "Marketing" | "Office">("Food");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setDate(initialData.date);
    } else {
      setAmount("");
      setDescription("");
      setDate("");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    onSubmit({
      amount: parseFloat(amount),
      currency,
      description,
      category,
      date,
    });

    if (!initialData) {
      setAmount("");
      setDescription("");
      setDate("");
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
              {initialData ? "Edit Expense" : "Add New Expense"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update expense entry" : "Record a new expense entry"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</Label>
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
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
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
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recurring">Recurring</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Work Food">Work Food</SelectItem>
                  <SelectItem value="External Food">External Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Holiday">Holiday</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your expense..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Expense" : "Add Expense"}
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
