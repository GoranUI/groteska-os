
import { useEffect, useState } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask, TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addHours } from "date-fns";

interface TimelineViewProps {
  selectedDate: Date;
  view: "day" | "week" | "month";
  projects: Project[];
  subTasks: SubTask[];
}

export const TimelineView = ({ selectedDate, view, projects, subTasks }: TimelineViewProps) => {
  const { user } = useAuth();
  const { timeEntries, fetchTimeEntries } = useTimeEntryData();
  const [displayEntries, setDisplayEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    if (!user) return;

    let from: string, to: string;
    
    if (view === "day") {
      from = startOfDay(selectedDate).toISOString();
      to = endOfDay(selectedDate).toISOString();
    } else {
      from = startOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
      to = endOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
    }

    fetchTimeEntries({
      userId: user.id,
      from,
      to,
    });
  }, [selectedDate, view, user, fetchTimeEntries]);

  useEffect(() => {
    setDisplayEntries(timeEntries);
  }, [timeEntries]);

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getTaskName = (taskId: string | null) => {
    if (!taskId) return null;
    const task = subTasks.find(t => t.id === taskId);
    return task?.name || "Unknown Task";
  };

  const getEntryPosition = (entry: TimeEntry) => {
    const startTime = new Date(entry.startTime);
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const duration = entry.duration / 3600; // Convert to hours
    
    return {
      left: `${(startHour / 24) * 100}%`,
      width: `${(duration / 24) * 100}%`,
    };
  };

  const generateTimeLabels = () => {
    const labels = [];
    for (let i = 0; i <= 24; i += 4) {
      labels.push(
        <div key={i} className="text-xs text-gray-500 text-center">
          {i.toString().padStart(2, '0')}:00
        </div>
      );
    }
    return labels;
  };

  if (view === "month") {
    return (
      <div className="text-center py-8 text-gray-500">
        Timeline view is not available for month view. Please switch to day or week view.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Labels */}
      <div className="grid grid-cols-7 gap-0 px-4">
        {generateTimeLabels()}
      </div>

      {/* Timeline Grid */}
      <div className="relative bg-gray-50 rounded-lg p-4 min-h-[200px]">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-7 gap-0">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r border-gray-200 last:border-r-0" />
          ))}
        </div>

        {/* Time Entries */}
        <div className="relative space-y-2">
          {displayEntries.map((entry) => {
            const position = getEntryPosition(entry);
            const projectName = getProjectName(entry.projectId);
            const taskName = getTaskName(entry.taskId);
            
            return (
              <div
                key={entry.id}
                className="absolute h-8 bg-blue-500 rounded px-2 flex items-center text-white text-xs font-medium shadow-sm hover:bg-blue-600 cursor-pointer transition-colors"
                style={position}
                title={`${projectName}${taskName ? ` - ${taskName}` : ''}`}
              >
                <span className="truncate">
                  {projectName}{taskName ? ` - ${taskName}` : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{
            left: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%`,
          }}
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
