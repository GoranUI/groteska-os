
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, ListTodo, DollarSign } from "lucide-react";
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
  const { clients } = useSupabaseData();
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowProjectForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button
            onClick={() => setShowSubTaskForm(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <ListTodo className="h-4 w-4" />
            <span>All Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Payment Tracker</span>
          </TabsTrigger>
        </TabsList>

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
  );
}
