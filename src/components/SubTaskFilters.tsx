import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { Project, Client } from "@/types";

interface SubTaskFiltersProps {
  clients: Client[];
  projects: Project[];
  selectedProjectId?: string;
  selectedClientId?: string;
  selectedStatus?: string;
  selectedPriority?: string;
  onProjectChange: (projectId?: string) => void;
  onClientChange: (clientId?: string) => void;
  onStatusChange: (status?: string) => void;
  onPriorityChange: (priority?: string) => void;
  onClearFilters: () => void;
}

export const SubTaskFilters = ({
  clients,
  projects,
  selectedProjectId,
  selectedClientId,
  selectedStatus,
  selectedPriority,
  onProjectChange,
  onClientChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}: SubTaskFiltersProps) => {
  const hasFilters = selectedProjectId || selectedClientId || selectedStatus || selectedPriority;

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Sub-tasks</span>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Client</label>
            <Select value={selectedClientId || ""} onValueChange={(value) => onClientChange(value || undefined)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All clients</SelectItem>
                {clients.filter(client => client.status === "active").map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Project</label>
            <Select value={selectedProjectId || ""} onValueChange={(value) => onProjectChange(value || undefined)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <Select value={selectedStatus || ""} onValueChange={(value) => onStatusChange(value || undefined)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Priority</label>
            <Select value={selectedPriority || ""} onValueChange={(value) => onPriorityChange(value || undefined)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};