
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, Edit, Trash2, CheckCircle } from "lucide-react";
import { SubTask, Project, Client } from "@/types";

interface SubTaskListProps {
  subTasks: SubTask[];
  projects: Project[];
  clients: Client[];
  onEdit: (subTask: SubTask) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string, clientName: string) => void;
  filteredProjectId?: string;
  filteredClientId?: string;
  filteredStatus?: string;
  filteredPriority?: string;
}

export const SubTaskList = ({ 
  subTasks, 
  projects, 
  clients, 
  onEdit, 
  onDelete, 
  onMarkAsPaid,
  filteredProjectId,
  filteredClientId,
  filteredStatus,
  filteredPriority
}: SubTaskListProps) => {
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getClientName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Unknown Client';
    const client = clients.find(c => c.id === project.clientId);
    return client?.name || 'Unknown Client';
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
  };

  // Filter sub-tasks based on provided filters
  const filteredSubTasks = subTasks.filter(subTask => {
    const project = projects.find(p => p.id === subTask.projectId);
    
    if (filteredProjectId && subTask.projectId !== filteredProjectId) return false;
    if (filteredClientId && project?.clientId !== filteredClientId) return false;
    if (filteredStatus && subTask.status !== filteredStatus) return false;
    // Note: Sub-tasks don't have priority in current schema, so we skip this filter
    
    return true;
  });

  return (
    <Card className="border-0 shadow-sm ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <ListTodo className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {filteredProjectId || filteredClientId || filteredStatus ? 'Filtered Sub-tasks' : 'All Sub-tasks'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {filteredSubTasks.length} of {subTasks.length} sub-tasks
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSubTasks.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {subTasks.length === 0 ? 'No sub-tasks yet' : 'No sub-tasks match your filters'}
            </h3>
            <p className="text-gray-600">
              {subTasks.length === 0 
                ? 'Create your first sub-task to get started' 
                : 'Try adjusting your filters or create a new sub-task'
              }
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Task</TableHead>
                  <TableHead className="font-semibold text-gray-900">Project</TableHead>
                  <TableHead className="font-semibold text-gray-900">Client</TableHead>
                  <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Due Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubTasks.map((subTask) => (
                  <TableRow key={subTask.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      <div>
                        <div className="font-medium">{subTask.name}</div>
                        {subTask.description && (
                          <div className="text-sm text-gray-600 line-clamp-1">{subTask.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {getProjectName(subTask.projectId)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {getClientName(subTask.projectId)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {subTask.amount.toLocaleString()} {subTask.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium border ${getStatusColor(subTask.status)} px-2 py-1`}>
                        {formatStatus(subTask.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {subTask.dueDate ? new Date(subTask.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {subTask.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsPaid(subTask.id, getClientName(subTask.projectId))}
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(subTask)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(subTask.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
