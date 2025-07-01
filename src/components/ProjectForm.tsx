
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Project, Client } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  initialData?: Project | null;
  onCancel?: () => void;
  clients: Client[];
}

export const ProjectForm = ({ onSubmit, initialData, onCancel, clients }: ProjectFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "on_hold" | "cancelled">("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setClientId(initialData.clientId);
      setStatus(initialData.status);
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setBudget(initialData.budget?.toString() || "");
      setCurrency(initialData.currency);
    } else {
      setName("");
      setDescription("");
      setClientId("");
      setStatus("active");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setCurrency("USD");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      clientId,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budget ? Number(budget) : undefined,
      currency,
    });

    if (!initialData) {
      setName("");
      setDescription("");
      setClientId("");
      setStatus("active");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setCurrency("USD");
    }
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            {initialData ? <Edit3 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {initialData ? "Edit Project" : "Create New Project"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update project information" : "Add a new project to your portfolio"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium text-gray-700">
              Client <span className="text-red-500">*</span>
            </Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={status} onValueChange={(value: "active" | "completed" | "on_hold" | "cancelled") => setStatus(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium text-gray-700">Budget</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="h-10"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Project" : "Create Project"}
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
