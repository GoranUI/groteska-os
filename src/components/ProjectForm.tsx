
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
  const [status, setStatus] = useState<"negotiation" | "pending" | "in_progress" | "waiting_on_client" | "done" | "canceled">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [billingType, setBillingType] = useState<"fixed" | "hourly">("fixed");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setClientId(initialData.clientId);
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setBudget(initialData.budget?.toString() || "");
      setBillingType(initialData.billingType);
      setHourlyRate(initialData.hourlyRate?.toString() || "");
      setCurrency(initialData.currency);
    } else {
      setName("");
      setDescription("");
      setClientId("");
      setStatus("pending");
      setPriority("medium");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setBillingType("fixed");
      setHourlyRate("");
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
      priority,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budget ? Number(budget) : undefined,
      billingType,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      currency,
    });

    if (!initialData) {
      setName("");
      setDescription("");
      setClientId("");
      setStatus("pending");
      setPriority("medium");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setBillingType("fixed");
      setHourlyRate("");
      setCurrency("USD");
    }
  };

  return (
    <Card className="card-elevated bg-card/50 backdrop-blur-sm border-border/20">
      <CardHeader className="bg-gradient-to-r from-info/5 to-info-light/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info/10 rounded-xl">
              {initialData ? <Edit3 className="h-6 w-6 text-info" /> : <Plus className="h-6 w-6 text-info" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? "Edit Project" : "Create New Project"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {initialData ? "Update project information" : "Add a new project to your portfolio"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Select value={status} onValueChange={(value: "negotiation" | "pending" | "in_progress" | "waiting_on_client" | "done" | "canceled") => setStatus(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
            <Select value={priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setPriority(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
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
            <Label htmlFor="billingType" className="text-sm font-medium text-gray-700">Billing Type</Label>
            <Select value={billingType} onValueChange={(value: "fixed" | "hourly") => setBillingType(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {billingType === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium text-gray-700">Total Budget</Label>
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
          )}

          {billingType === "hourly" && (
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="h-10"
              />
            </div>
          )}

          <div className="md:col-span-2 flex gap-3">
            <Button 
              type="submit" 
              className="btn-primary focus-ring"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Project" : "Create Project"}
            </Button>
            {initialData && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="btn-secondary focus-ring"
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
