
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, CreditCard, Upload } from "lucide-react";
import { Expense } from "@/hooks/useFinancialData";

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

const ExpenseTracker = ({ expenses, onAddExpense }: ExpenseTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD" as "USD" | "EUR" | "RSD",
    date: new Date().toISOString().split('T')[0],
    category: "Food" as "Recurring" | "Food" | "Work Food" | "External Food" | "Transport" | "Holiday",
    description: "",
    isRecurring: false,
    recurringFrequency: "monthly" as "weekly" | "monthly" | "yearly"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    onAddExpense({
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined
    });

    setFormData({
      amount: "",
      currency: "USD",
      date: new Date().toISOString().split('T')[0],
      category: "Food",
      description: "",
      isRecurring: false,
      recurringFrequency: "monthly"
    });
    setShowForm(false);
  };

  const totalByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(totalByCategory).map(([category, total]) => (
          <Card key={category} className="border-orange-200">
            <CardContent className="pt-4">
              <div className="text-lg font-bold text-red-600">
                {total.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Expense Button */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Expense Records</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" className="border-orange-200">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Expense Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-orange-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value: "USD" | "EUR" | "RSD") => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="RSD">RSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: "Recurring" | "Food" | "Work Food" | "External Food" | "Transport" | "Holiday") => 
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recurring">Recurring</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Work Food">Work Food</SelectItem>
                      <SelectItem value="External Food">External Food</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expense description"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                  <Label htmlFor="recurring">Recurring expense</Label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={formData.recurringFrequency} 
                      onValueChange={(value: "weekly" | "monthly" | "yearly") => 
                        setFormData({ ...formData, recurringFrequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Add Expense
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Expense List */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expense records yet. Add your first expense above!</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                      <p className="text-xs text-gray-400">{expense.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -{expense.amount} {expense.currency}
                    </p>
                    {expense.isRecurring && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                        {expense.recurringFrequency}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;
