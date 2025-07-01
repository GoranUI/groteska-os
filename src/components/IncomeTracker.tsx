
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign } from "lucide-react";
import { Income } from "@/hooks/useFinancialData";

interface IncomeTrackerProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, "id">) => void;
}

const IncomeTracker = ({ incomes, onAddIncome }: IncomeTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD" as "USD" | "EUR" | "RSD",
    client: "",
    date: new Date().toISOString().split('T')[0],
    category: "one-time" as "full-time" | "one-time",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.client) return;

    onAddIncome({
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      client: formData.client,
      date: formData.date,
      category: formData.category,
      description: formData.description
    });

    setFormData({
      amount: "",
      currency: "USD",
      client: "",
      date: new Date().toISOString().split('T')[0],
      category: "one-time",
      description: ""
    });
    setShowForm(false);
  };

  const totalByCategory = incomes.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Full-Time Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(totalByCategory['full-time'] || 0).toFixed(2)}
            </div>
            <p className="text-gray-500">Total from full-time work</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">One-Time Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {(totalByCategory['one-time'] || 0).toFixed(2)}
            </div>
            <p className="text-gray-500">Total from projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Income Button */}
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Income Records</CardTitle>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Income Form */}
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
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client name"
                    required
                  />
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
                    onValueChange={(value: "full-time" | "one-time") => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="one-time">One-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Add Income
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Income List */}
          <div className="space-y-3">
            {incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No income records yet. Add your first income above!</p>
            ) : (
              incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{income.client}</h3>
                      <p className="text-sm text-gray-500">{income.description || "No description"}</p>
                      <p className="text-xs text-gray-400">{income.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{income.amount} {income.currency}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      income.category === 'full-time' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {income.category}
                    </span>
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

export default IncomeTracker;
