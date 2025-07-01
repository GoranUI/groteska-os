
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Income } from "@/hooks/useFinancialData";
import { Plus, DollarSign } from "lucide-react";

interface IncomeTrackerProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => void;
}

const IncomeTracker = ({ incomes, onAddIncome }: IncomeTrackerProps) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<"full-time" | "one-time">("one-time");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !client || !date) return;

    onAddIncome({
      amount: parseFloat(amount),
      currency,
      client,
      date,
      category,
    });

    // Reset form
    setAmount("");
    setClient("");
    setDate("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Income Tracker</h1>
        <p className="text-gray-600">Track your income from clients and projects</p>
      </div>

      {/* Add Income Form */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Plus className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Add New Income</CardTitle>
              <p className="text-sm text-gray-600">Record a new income entry</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="client" className="text-sm font-medium text-gray-700">Client</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Client name"
                className="h-10"
                required
              />
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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
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

            <div className="md:col-span-2 lg:col-span-5">
              <Button 
                type="submit" 
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Income History</CardTitle>
              <p className="text-sm text-gray-600">{incomes.length} total entries</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No income recorded yet</h3>
              <p className="text-gray-600">Add your first income entry to get started</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Client</TableHead>
                    <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Currency</TableHead>
                    <TableHead className="font-semibold text-gray-900">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {new Date(income.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-700">{income.client}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {income.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {income.currency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={income.category === 'full-time' ? 'default' : 'secondary'}
                          className={income.category === 'full-time' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }
                        >
                          {income.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTracker;
