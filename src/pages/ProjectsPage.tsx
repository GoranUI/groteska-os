
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { ProjectList } from "@/components/ProjectList";
import { PaymentTracker } from "@/components/PaymentTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const ProjectsPage = () => {
  const { clients, loading: clientsLoading } = useSupabaseData();
  const { projects, loading: projectsLoading } = useProjectData();
  const { subTasks, markAsPaid, loading: subTasksLoading } = useSubTaskData();
  
  const loading = clientsLoading || projectsLoading || subTasksLoading;

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">Project Management</h1>
        <p className="text-gray-600">Manage your clients, projects, and track payments</p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Projects & Tasks</TabsTrigger>
          <TabsTrigger value="payments">Payment Tracker</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-6 lg:space-y-8">
          <ProjectList 
            clients={clients}
            projects={projects}
            subTasks={subTasks}
          />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentTracker 
            subTasks={subTasks}
            projects={projects}
            clients={clients}
            onMarkAsPaid={markAsPaid}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsPage;
