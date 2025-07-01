
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, DollarSign } from "lucide-react";
import { Project, SubTask, Client } from "@/types";

interface ProjectListProps {
  clients: Client[];
  projects: Project[];
  subTasks: SubTask[];
}

export const ProjectList = ({ clients, projects, subTasks }: ProjectListProps) => {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getProjectSubTasks = (projectId: string) => {
    return subTasks.filter(task => task.projectId === projectId);
  };

  const getProjectTotal = (projectId: string) => {
    const projectSubTasks = getProjectSubTasks(projectId);
    return projectSubTasks.reduce((sum, task) => sum + task.amount, 0);
  };

  const getProjectPending = (projectId: string) => {
    const projectSubTasks = getProjectSubTasks(projectId);
    return projectSubTasks.filter(task => task.status === 'pending').reduce((sum, task) => sum + task.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'negotiation': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'in_progress': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'waiting_on_client': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'done': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'canceled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Projects Overview</CardTitle>
              <p className="text-sm text-gray-600">{projects.length} total projects</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectSubTasks = getProjectSubTasks(project.id);
                const totalAmount = getProjectTotal(project.id);
                const pendingAmount = getProjectPending(project.id);
                
                return (
                  <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {getClientName(project.clientId)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Sub-tasks:</span>
                          <span className="font-medium">{projectSubTasks.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-medium text-green-600">
                            {totalAmount.toLocaleString()} {project.currency}
                          </span>
                        </div>
                        
                        {pendingAmount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-orange-600">
                              {pendingAmount.toLocaleString()} {project.currency}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
