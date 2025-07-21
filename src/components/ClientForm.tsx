
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3 } from "lucide-react";
import { Client } from "@/types";
import { sanitizeInput, sanitizeClientName } from "@/utils/securityUtils";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  onSubmit: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  initialData?: Client | null;
  onCancel?: () => void;
}

export const ClientForm = ({ onSubmit, initialData, onCancel }: ClientFormProps) => {
  const { toast } = useToast();
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

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    // Validate required name
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    try {
      const sanitizedName = sanitizeClientName(name);
      const sanitizedEmail = email ? sanitizeInput(email) : undefined;
      const sanitizedCompany = company ? sanitizeInput(company) : undefined;

      onSubmit({
        name: sanitizedName,
        email: sanitizedEmail,
        company: sanitizedCompany,
        status,
      });

      if (!initialData) {
        setName("");
        setEmail("");
        setCompany("");
        setStatus("active");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process client data. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany(e.target.value);
  };


  return (
    <Card className="card-elevated bg-card/50 backdrop-blur-sm border-border/20">
      <CardHeader className="bg-gradient-to-r from-accent/5 to-accent-light/5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-xl">
              {initialData ? <Edit3 className="h-6 w-6 text-accent" /> : <Plus className="h-6 w-6 text-accent" />}
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {initialData ? "Edit Client" : "Add New Client"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {initialData ? "Update client information" : "Add a new client to your database"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Client name"
              className="h-10"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="client@email.com"
              className="h-10"
              maxLength={254}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={handleCompanyChange}
              placeholder="Company name"
              className="h-10"
              maxLength={200}
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </Label>
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
              className="btn-primary focus-ring"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Client" : "Add Client"}
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
