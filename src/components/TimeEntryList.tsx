
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask, TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, MoreHorizontal, Edit, Copy, Split, Trash2 } from "lucide-react";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Debug render counter - only log every 10th render to reduce noise
  const renderCount = useRef(0);
  renderCount.current += 1;
  if (renderCount.current % 10 === 0) {
    console.log(`TimeEntryList: Render #${renderCount.current} - timeEntries: ${timeEntries.length}, groupedEntries: ${Object.keys(groupedEntries).length} groups`);
  }

  // Listen for custom events to force refresh
  useEffect(() => {
    const handleTimeEntryAdded = () => {
      console.log('Custom event received in TimeEntryList - refreshing');
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('timeEntryAdded', handleTimeEntryAdded);
    return () => window.removeEventListener('timeEntryAdded', handleTimeEntryAdded);
  }, []);

  // TimeEntryList now uses the same data as TimelineView - no separate fetch needed
  // The timeEntries state is shared globally and will be updated by TimelineView's fetch
  useEffect(() => {
    console.log('TimeEntryList: Component mounted/updated, using shared timeEntries state');
    console.log('TimeEntryList: Current timeEntries count:', timeEntries.length);
  }, [timeEntries.length]);

  // Memoize grouped entries to prevent unnecessary re-renders
  const groupedEntriesMemo = useMemo(() => {
    console.log('TimeEntryList: Processing', timeEntries.length, 'entries');
    console.log('TimeEntryList: Entry details:', timeEntries.map(e => ({
      id: e.id,
      startTime: e.startTime,
      projectId: e.projectId,
      date: format(new Date(e.startTime), 'yyyy-MM-dd')
    })));
    
    // Group entries by date
    const grouped = timeEntries.reduce((acc, entry) => {
      const date = format(new Date(entry.startTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      
      console.log('TimeEntryList: Grouping entry:', {
        id: entry.id,
        startTime: entry.startTime,
        date: date,
        projectId: entry.projectId
      });
      
      return acc;
    }, {} as Record<string, TimeEntry[]>);

    // Sort entries within each day by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    console.log('TimeEntryList: Grouped entries:', Object.keys(grouped).map(date => ({
      date,
      count: grouped[date].length,
      entryIds: grouped[date].map(e => e.id)
    })));
    
    return grouped;
  }, [timeEntries]);

  // Update grouped entries when memoized value changes
  useEffect(() => {
    setGroupedEntries(groupedEntriesMemo);
  }, [groupedEntriesMemo]);

  const getProjectColor = useCallback((projectId: string) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    const index = projects.findIndex(p => p.id === projectId);
    return colors[index % colors.length];
  }, [projects]);

  const getProjectName = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  }, [projects]);

  const getTaskName = useCallback((taskId: string | null) => {
    if (!taskId) return null;
    const task = subTasks.find(t => t.id === taskId);
    return task?.name || "Unknown Task";
  }, [subTasks]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  const getTotalForDate = useCallback((entries: TimeEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.duration, 0);
  }, []);

  const handleDelete = useCallback(async (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      await deleteTimeEntry(entryId);
    }
  }, [deleteTimeEntry]);

  const handleEdit = useCallback((entry: TimeEntry) => {
    // TODO: Implement edit functionality
    console.log("Edit entry:", entry);
  }, []);

  const handleDuplicate = useCallback((entry: TimeEntry) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate entry:", entry);
  }, []);

  const handleSplit = useCallback((entry: TimeEntry) => {
    // TODO: Implement split functionality
    console.log("Split entry:", entry);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedEntries)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, entries]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center justify-between border-b pb-3 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="font-semibold text-gray-900">
                  {format(new Date(date), 'EEEE, dd MMM yyyy')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-800">
                  Total: {formatDuration(getTotalForDate(entries))}
                </span>
              </div>
            </div>

            {/* Time Entries */}
            <div className="space-y-2">
              {entries.map((entry) => {
                const projectName = getProjectName(entry.projectId);
                const taskName = getTaskName(entry.taskId);
                const color = getProjectColor(entry.projectId);
                
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate">
                            {projectName}
                          </span>
                          {taskName && (
                            <span className="text-sm text-gray-600 truncate">
                              • {taskName}
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600 truncate">{entry.note}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            {format(new Date(entry.startTime), 'HH:mm')} - {' '}
                            {entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'Running'}
                          </span>
                          <span className="font-medium">
                            {formatDuration(entry.duration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(entry)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSplit(entry)}>
                          <Split className="h-4 w-4 mr-2" />
                          Split
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedEntries).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No time entries found</p>
            <p className="text-sm">Start tracking time or add entries manually to see them here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
