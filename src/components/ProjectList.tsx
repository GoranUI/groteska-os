
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users, DollarSign, Flame } from "lucide-react";
import { Project, SubTask, Client } from "@/types";

interface ProjectListProps {
  clients: Client[];
  projects: Project[];
  subTasks: SubTask[];
  onProjectClick?: (projectId: string) => void;
}

export const ProjectList = ({ clients, projects, subTasks, onProjectClick }: ProjectListProps) => {
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

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'negotiation': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      case 'waiting_on_client': return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
      case 'done': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
      case 'canceled': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderPriorityBadge = (priority: string) => {
    const isHigh = priority === 'high';
    const className = `text-xs font-medium border w-fit ml-auto ${getPriorityColor(priority)} px-2 py-1`;
    
    return (
      <Badge variant="outline" className={className}>
        {isHigh && <Flame className="h-3 w-3 mr-1" />}
        {formatPriority(priority)}
      </Badge>
    );
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
                  <Card 
                    key={project.id} 
                    className={`border border-gray-200 transition-all duration-200 ${
                      onProjectClick 
                        ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => onProjectClick?.(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 leading-tight">{project.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                            {getClientName(project.clientId)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-3">
                          <Badge 
                            variant="outline"
                            className={`text-xs font-medium border ${getStatusColor(project.status)} px-2 py-1`}
                          >
                            {formatStatus(project.status)}
                          </Badge>
                          {renderPriorityBadge(project.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-600 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Tasks:
                          </span>
                          <span className="font-semibold text-gray-900">{projectSubTasks.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm bg-green-50 rounded-lg p-2">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-semibold text-green-700">
                            {totalAmount.toLocaleString()} {project.currency}
                          </span>
                        </div>
                        
                        {pendingAmount > 0 && (
                          <div className="flex items-center justify-between text-sm bg-orange-50 rounded-lg p-2">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-semibold text-orange-700">
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
