
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
  const [company_name, setCompanyName] = useState("");
  const [contact_person, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.company_name);
      setContactPerson(initialData.contact_person || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setStatus(initialData.status);
    } else {
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setAddress("");
      setStatus("active");
    }
  }, [initialData]);

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    // Validate required company name
    if (!company_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
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
      const sanitizedCompanyName = sanitizeInput(company_name);
      const sanitizedContactPerson = contact_person ? sanitizeInput(contact_person) : undefined;
      const sanitizedEmail = email ? sanitizeInput(email) : undefined;
      const sanitizedPhone = phone ? sanitizeInput(phone) : undefined;
      const sanitizedAddress = address ? sanitizeInput(address) : undefined;

      onSubmit({
        company_name: sanitizedCompanyName,
        contact_person: sanitizedContactPerson,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        address: sanitizedAddress,
        status,
      });

      if (!initialData) {
        setCompanyName("");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setAddress("");
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

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactPerson(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={company_name}
                  onChange={handleCompanyNameChange}
                  placeholder="Enter company name"
                  className="h-10"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">
                  Contact Person <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="contact_person"
                  value={contact_person}
                  onChange={handleContactPersonChange}
                  placeholder="Enter contact person name"
                  className="h-10"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="company@example.com"
                  className="h-10"
                  maxLength={254}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 555 123 4567"
                  className="h-10"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={handleAddressChange}
                placeholder="Enter company address"
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
            </div>
          </div>

          {/* Status */}
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

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="btn-primary focus-ring flex-1"
            >
              {initialData ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {initialData ? "Update Client" : "Add Client"}
            </Button>
            {initialData && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                className="btn-secondary focus-ring px-6"
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
