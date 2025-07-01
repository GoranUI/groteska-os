
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Client } from "@/types";

interface ClientFormProps {
  onSubmit: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  initialData?: Client | null;
  onCancel?: () => void;
}

export const ClientForm = ({ onSubmit, initialData, onCancel }: ClientFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email || "");
      setCompany(initialData.company || "");
      setStatus(initialData.status);
    } else {
      setName("");
      setEmail("");
      setCompany("");
      setStatus("active");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      name,
      email: email || undefined,
      company: company || undefined,
      status,
    });

    if (!initialData) {
      setName("");
      setEmail("");
      setCompany("");
      setStatus("active");
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
              {initialData ? "Edit Client" : "Add New Client"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {initialData ? "Update client information" : "Add a new client to your database"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@email.com"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Client" : "Add Client"}
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
