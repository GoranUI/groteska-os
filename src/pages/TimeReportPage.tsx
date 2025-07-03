
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { TimeReport } from "@/components/TimeReport";
import { TimeTracker } from "@/components/TimeTracker";
import { useAuth } from "@/hooks/useAuth";

export default function TimeReportPage() {
  const { user } = useAuth();
  const { clients } = useSupabaseData();
  const { projects } = useProjectData();
  const { subTasks } = useSubTaskData();

  // Mock users for now (replace with real user fetching if available)
  const users = clients.map(c => ({ id: c.id, name: c.name }));

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access time tracking</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <TimeReport projects={projects} subTasks={subTasks} users={users} />
      <TimeTracker projects={projects} subTasks={subTasks} />
    </div>
  );
}
