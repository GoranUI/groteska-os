
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice, InvoiceItem, Client, Project, SubTask } from "@/types";
import { Plus, Trash2, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface InvoiceFormProps {
  clients: Client[];
  projects: Project[];
  subTasks: SubTask[];
  onSubmit: (invoice: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
  initialInvoice?: Invoice;
  generateInvoiceNumber: () => string;
}

export const InvoiceForm = ({ 
  clients, 
  projects,
  subTasks,
  onSubmit, 
  onCancel, 
  initialInvoice,
  generateInvoiceNumber 
}: InvoiceFormProps) => {
  const { user, profile } = useAuth();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    invoiceNumber: initialInvoice?.invoiceNumber || generateInvoiceNumber(),
    clientId: initialInvoice?.clientId || '',
    clientName: initialInvoice?.clientName || '',
    clientEmail: initialInvoice?.clientEmail || '',
    clientAddress: initialInvoice?.clientAddress || '',
    invoiceDate: initialInvoice?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialInvoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: initialInvoice?.status || 'draft' as const,
    billingType: initialInvoice?.billingType || 'project' as const,
    taxRate: initialInvoice?.taxRate || 0,
    currency: initialInvoice?.currency || 'USD' as const,
    notes: initialInvoice?.notes || '',
    projectId: '',
    subTaskId: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items || [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
  );

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
      clientEmail: client?.email || '',
      clientAddress: '',
    }));
    handleFormChange();
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const client = clients.find(c => c.id === project.clientId);
      setFormData(prev => ({
        ...prev,
        projectId,
        clientId: project.clientId,
        clientName: client?.name || '',
        clientEmail: client?.email || '',
        clientAddress: '',
        currency: project.currency,
      }));
      // Clear items when switching to project-based billing
      setItems([{ description: project.name, quantity: 1, unitPrice: project.budget || 0, totalPrice: project.budget || 0 }]);
      handleFormChange();
    }
  };

  const handleSubTaskChange = (subTaskId: string) => {
    const subTask = subTasks.find(st => st.id === subTaskId);
    if (subTask) {
      const project = projects.find(p => p.id === subTask.projectId);
      const client = project ? clients.find(c => c.id === project.clientId) : null;
      
      setFormData(prev => ({
        ...prev,
        subTaskId,
        projectId: subTask.projectId,
        clientId: project?.clientId || '',
        clientName: client?.name || '',
        clientEmail: client?.email || '',
        clientAddress: '',
        currency: subTask.currency,
      }));
      // Set item based on subtask
      setItems([{ 
        description: `${project?.name || 'Project'}: ${subTask.name}`, 
        quantity: 1, 
        unitPrice: subTask.amount, 
        totalPrice: subTask.amount 
      }]);
      handleFormChange();
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
    handleFormChange();
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    handleFormChange();
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      handleFormChange();
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { subtotal, taxAmount, total } = calculateTotals();
    
    onSubmit({
      ...formData,
      subtotal,
      taxAmount,
      totalAmount: total,
      items: items.filter(item => item.description.trim() !== ''),
    });
    
    setHasUnsavedChanges(false);
  };

  const handleDownloadPDF = () => {
    // Placeholder for PDF download functionality
    console.log('PDF download functionality to be implemented');
    alert('PDF download feature will be implemented next');
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {initialInvoice ? 'Edit Invoice' : 'Create New Invoice'}
            </CardTitle>
          </div>
          {initialInvoice && (
            <Button
              type="button"
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Profile Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {profile?.phone || 'Not set'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">
                Invoice Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }));
                  handleFormChange();
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => {
                  setFormData(prev => ({ ...prev, status: value }));
                  handleFormChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Select Client</Label>
                <Select value={formData.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="clientName">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, clientName: e.target.value }));
                    handleFormChange();
                  }}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, clientEmail: e.target.value }));
                    handleFormChange();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, clientAddress: e.target.value }));
                    handleFormChange();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Optional Project/SubTask Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Fill Options</h3>
            <p className="text-sm text-gray-600">Optionally select a project or sub-task to auto-populate invoice details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Select Project (Optional)</Label>
                <Select value={formData.projectId} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      return (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({client?.name || 'Unknown Client'})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subTask">Select Sub-task (Optional)</Label>
                <Select value={formData.subTaskId} onValueChange={handleSubTaskChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-task" />
                  </SelectTrigger>
                  <SelectContent>
                    {subTasks.filter(st => st.status === 'pending').map((subTask) => {
                      const project = projects.find(p => p.id === subTask.projectId);
                      const client = project ? clients.find(c => c.id === project.clientId) : null;
                      return (
                        <SelectItem key={subTask.id} value={subTask.id}>
                          {subTask.name} - {subTask.amount} {subTask.currency} ({client?.name || 'Unknown Client'})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="invoiceDate">
                Invoice Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, invoiceDate: e.target.value }));
                  handleFormChange();
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dueDate: e.target.value }));
                  handleFormChange();
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="billingType">
                Billing Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.billingType} 
                onValueChange={(value: any) => {
                  setFormData(prev => ({ ...prev, billingType: value }));
                  handleFormChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">
                Currency <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value: any) => {
                  setFormData(prev => ({ ...prev, currency: value }));
                  handleFormChange();
                }}
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>
                    Unit Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Total</Label>
                  <Input
                    type="number"
                    value={item.totalPrice.toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, notes: e.target.value }));
                  handleFormChange();
                }}
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }));
                    handleFormChange();
                  }}
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{taxAmount.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} {formData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialInvoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
