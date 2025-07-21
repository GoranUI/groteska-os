import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderOpen, ListTodo, DollarSign, Loader2 } from "lucide-react";
import { ProjectForm } from "@/components/ProjectForm";
import { SubTaskForm } from "@/components/SubTaskForm";
import { ProjectList } from "@/components/ProjectList";
import { SubTaskList } from "@/components/SubTaskList";
import { SubTaskFilters } from "@/components/SubTaskFilters";
import { PaymentTracker } from "@/components/PaymentTracker";

import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { Project, SubTask } from "@/types";

export default function ProjectsPage() {
  const { clients, loading } = useSupabaseData();
  const { projects, addProject, updateProject, deleteProject } = useProjectData();
  const { subTasks, addSubTask, updateSubTask, deleteSubTask, markAsPaid } = useSubTaskData();
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSubTaskForm, setShowSubTaskForm] = useState(false);
  
  // Filter states
  const [filteredProjectId, setFilteredProjectId] = useState<string | undefined>();
  const [filteredClientId, setFilteredClientId] = useState<string | undefined>();
  const [filteredStatus, setFilteredStatus] = useState<string | undefined>();
  const [filteredPriority, setFilteredPriority] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("projects");

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    await addProject(projectData);
    setShowProjectForm(false);
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
      setEditingProject(null);
      setShowProjectForm(false);
    }
  };

  const handleAddSubTask = async (subTaskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'completedAt' | 'invoiceId' | 'incomeId'>) => {
    await addSubTask(subTaskData);
    setShowSubTaskForm(false);
  };

  const handleUpdateSubTask = async (subTaskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'completedAt' | 'invoiceId' | 'incomeId'>) => {
    if (editingSubTask) {
      await updateSubTask(editingSubTask.id, subTaskData);
      setEditingSubTask(null);
      setShowSubTaskForm(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleEditSubTask = (subTask: SubTask) => {
    setEditingSubTask(subTask);
    setShowSubTaskForm(true);
  };

  const handleCancelForm = () => {
    setShowProjectForm(false);
    setShowSubTaskForm(false);
    setEditingProject(null);
    setEditingSubTask(null);
  };

  const handleProjectClick = (projectId: string) => {
    setFilteredProjectId(projectId);
    setActiveTab("tasks");
  };

  const handleClearFilters = () => {
    setFilteredProjectId(undefined);
    setFilteredClientId(undefined);
    setFilteredStatus(undefined);
    setFilteredPriority(undefined);
  };

  const handleMarkAsPaid = async (subTaskId: string, clientName: string) => {
    await markAsPaid(subTaskId, clientName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your project data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Project Management
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize your projects, track tasks, and manage payments with powerful tools
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => setShowProjectForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
            <Button
              onClick={() => setShowSubTaskForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-lg grid-cols-3 h-12 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="projects" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <ListTodo className="h-4 w-4" />
                All Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <DollarSign className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="projects" className="space-y-4">
          {showProjectForm && (
            <ProjectForm
              onSubmit={editingProject ? handleUpdateProject : handleAddProject}
              initialData={editingProject}
              onCancel={handleCancelForm}
              clients={clients}
            />
          )}
          <ProjectList 
            clients={clients}
            projects={projects}
            subTasks={subTasks}
            onProjectClick={handleProjectClick}
            onEdit={handleEditProject}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {showSubTaskForm && (
            <SubTaskForm
              onSubmit={editingSubTask ? handleUpdateSubTask : handleAddSubTask}
              initialData={editingSubTask}
              onCancel={handleCancelForm}
              projects={projects}
            />
          )}
          <SubTaskFilters
            clients={clients}
            projects={projects}
            selectedProjectId={filteredProjectId}
            selectedClientId={filteredClientId}
            selectedStatus={filteredStatus}
            selectedPriority={filteredPriority}
            onProjectChange={setFilteredProjectId}
            onClientChange={setFilteredClientId}
            onStatusChange={setFilteredStatus}
            onPriorityChange={setFilteredPriority}
            onClearFilters={handleClearFilters}
          />
          <SubTaskList
            subTasks={subTasks}
            projects={projects}
            clients={clients}
            onEdit={handleEditSubTask}
            onDelete={deleteSubTask}
            onMarkAsPaid={handleMarkAsPaid}
            filteredProjectId={filteredProjectId}
            filteredClientId={filteredClientId}
            filteredStatus={filteredStatus}
            filteredPriority={filteredPriority}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentTracker
            subTasks={subTasks}
            projects={projects}
            clients={clients}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
