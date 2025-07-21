
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Savings } from "@/types";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SavingsFormProps {
  onSubmit: (saving: Omit<Savings, 'id'>) => void;
  initialData?: Savings | null;
  onCancel?: () => void;
}

export const SavingsForm = ({ onSubmit, initialData, onCancel }: SavingsFormProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      setDate(initialData.date);
      setType(initialData.type);
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    onSubmit({
      amount: parseFloat(amount),
      currency,
      date,
      type,
      description: description.trim() || `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${new Date().toLocaleDateString()}`,
    });

    if (!initialData) {
      // Reset form only if not editing
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <Card className="card-elevated bg-card/50 backdrop-blur-sm border-border/20">
      <CardHeader className="bg-gradient-to-r from-success/5 to-success-light/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-xl">
              <PlusIcon className="h-6 w-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? 'Edit Savings Entry' : 'Add Savings Entry'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {initialData ? 'Update your savings record' : 'Record a new deposit or withdrawal'}
              </p>
            </div>
          </div>
          {initialData && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground focus-ring"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
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

          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="h-10"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-5">
            <Button 
              type="submit" 
              className="w-full md:w-auto btn-primary focus-ring"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {initialData ? 'Update Savings' : 'Add Savings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
