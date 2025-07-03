
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask, TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Play, MoreHorizontal, Calendar } from "lucide-react";

interface TimeEntryListProps {
  projects: Project[];
  subTasks: SubTask[];
  selectedDate: Date;
  view: "day" | "week" | "month";
}

export const TimeEntryList = ({ projects, subTasks, selectedDate, view }: TimeEntryListProps) => {
  const { user } = useAuth();
  const { timeEntries, fetchTimeEntries, deleteTimeEntry } = useTimeEntryData();
  const [groupedEntries, setGroupedEntries] = useState<Record<string, TimeEntry[]>>({});

  useEffect(() => {
    if (!user) return;

    let from: string, to: string;
    
    switch (view) {
      case "day":
        from = startOfDay(selectedDate).toISOString();
        to = endOfDay(selectedDate).toISOString();
        break;
      case "week":
        from = startOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
        to = endOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
        break;
      case "month":
        from = startOfMonth(selectedDate).toISOString();
        to = endOfMonth(selectedDate).toISOString();
        break;
    }

    fetchTimeEntries({
      userId: user.id,
      from,
      to,
    });
  }, [selectedDate, view, user, fetchTimeEntries]);

  useEffect(() => {
    // Group entries by date
    const grouped = timeEntries.reduce((acc, entry) => {
      const date = format(new Date(entry.startTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);

    // Sort entries within each day by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    setGroupedEntries(grouped);
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTotalForDate = (entries: TimeEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.duration, 0);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      await deleteTimeEntry(entryId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Total Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedEntries).map(([date, entries]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">
                  {format(new Date(date), 'EEEE, dd MMM yyyy')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  Total: {formatDuration(getTotalForDate(entries))}
                </span>
              </div>
            </div>

            {/* Time Entries */}
            <div className="space-y-2">
              {entries.map((entry) => {
                const projectName = getProjectName(entry.projectId);
                const taskName = getTaskName(entry.taskId);
                
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {projectName}
                          </span>
                          {taskName && (
                            <span className="text-sm text-gray-500 truncate">
                              - {taskName}
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600 truncate">{entry.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {format(new Date(entry.startTime), 'HH:mm')} - {' '}
                          {entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'Running'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDuration(entry.duration)}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedEntries).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No time entries found for the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
