
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { SubTask, Project } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface SubTaskFormProps {
  onSubmit: (data: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'completedAt' | 'invoiceId' | 'incomeId'>) => void;
  initialData?: SubTask | null;
  onCancel?: () => void;
  projects: Project[];
}

export const SubTaskForm = ({ onSubmit, initialData, onCancel, projects }: SubTaskFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [hours, setHours] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RSD">("USD");
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setProjectId(initialData.projectId);
      setAmount(initialData.amount.toString());
      setHours(initialData.hours?.toString() || "");
      setCurrency(initialData.currency);
      setStatus(initialData.status);
      setDueDate(initialData.dueDate || "");
    } else {
      setName("");
      setDescription("");
      setProjectId("");
      setAmount("");
      setHours("");
      setCurrency("USD");
      setStatus("pending");
      setDueDate("");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Task name is required",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Validation Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      projectId,
      amount: Number(amount),
      hours: hours ? Number(hours) : undefined,
      currency,
      status,
      dueDate: dueDate || undefined,
    });

    if (!initialData) {
      setName("");
      setDescription("");
      setProjectId("");
      setAmount("");
      setHours("");
      setCurrency("USD");
      setStatus("pending");
      setDueDate("");
    }
  };

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 rounded-lg">
            {initialData ? <Edit3 className="h-5 w-5 text-green-600" /> : <Plus className="h-5 w-5 text-green-600" />}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {initialData ? "Edit Sub-task" : "Create New Sub-task"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update sub-task information" : "Add a new sub-task to a project"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Task Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium text-gray-700">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
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
              placeholder="Task description..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours" className="text-sm font-medium text-gray-700">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.1"
              className="h-10"
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
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">Payment Status</Label>
            <Select value={status} onValueChange={(value: "pending" | "paid") => setStatus(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Sub-task" : "Create Sub-task"}
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
