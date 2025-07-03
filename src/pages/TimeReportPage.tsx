import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { TimeReport } from "@/components/TimeReport";

export default function TimeReportPage() {
  const { clients } = useSupabaseData();
  const { projects } = useProjectData();
  const { subTasks } = useSubTaskData();

  // Mock users for now (replace with real user fetching if available)
  const users = clients.map(c => ({ id: c.id, name: c.name }));

  return (
    <div className="p-4 md:p-8">
      <TimeReport projects={projects} subTasks={subTasks} users={users} />
    </div>
  );
} 