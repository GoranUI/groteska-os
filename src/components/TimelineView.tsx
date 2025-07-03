
import { useEffect, useState } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask, TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, eachWeekOfInterval } from "date-fns";
import { TimeEntryForm } from "./TimeEntryForm";

interface TimelineViewProps {
  selectedDate: Date;
  view: "day" | "week" | "month";
  projects: Project[];
  subTasks: SubTask[];
}

interface DragSelection {
  startY: number;
  endY: number;
  startTime: string;
  endTime: string;
}

export const TimelineView = ({ selectedDate, view, projects, subTasks }: TimelineViewProps) => {
  const { user } = useAuth();
  const { timeEntries, fetchTimeEntries } = useTimeEntryData();
  const [displayEntries, setDisplayEntries] = useState<TimeEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh function
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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

    console.log('Fetching time entries for timeline:', { from, to, userId: user.id });
    fetchTimeEntries({
      userId: user.id,
      from,
      to,
    });
  }, [selectedDate, view, user, fetchTimeEntries, refreshKey]);

  useEffect(() => {
    console.log('Timeline entries updated:', timeEntries);
    setDisplayEntries(timeEntries);
  }, [timeEntries]);

  const getProjectColor = (projectId: string) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    const index = projects.findIndex(p => p.id === projectId);
    return colors[index % colors.length];
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getTaskName = (taskId: string | null) => {
    if (!taskId) return null;
    const task = subTasks.find(t => t.id === taskId);
    return task?.name || "Unknown Task";
  };

  const timeToY = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100; // Convert to percentage
  };

  const yToTime = (y: number) => {
    const totalMinutes = (y / 100) * (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (view !== 'day') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const time = yToTime(y);
    
    setIsDragging(true);
    setDragSelection({
      startY: y,
      endY: y,
      startTime: time,
      endTime: time,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragSelection) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const time = yToTime(y);
    
    setDragSelection({
      ...dragSelection,
      endY: y,
      endTime: time,
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragSelection) return;
    
    setIsDragging(false);
    
    const startTime = dragSelection.startY < dragSelection.endY ? dragSelection.startTime : dragSelection.endTime;
    const endTime = dragSelection.startY < dragSelection.endY ? dragSelection.endTime : dragSelection.startTime;
    
    // Only show form if drag is significant (at least 15 minutes)
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (Math.abs(endMinutes - startMinutes) >= 15) {
      setShowQuickForm(true);
    } else {
      setDragSelection(null);
    }
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Day view - 24-hour timeline
  const renderDayView = () => {
    const generateTimeLabels = () => {
      const labels = [];
      for (let i = 0; i <= 23; i++) {
        labels.push(
          <div key={i} className="absolute text-xs text-gray-500 -left-12 -translate-y-1/2" style={{ top: `${(i / 24) * 100}%` }}>
            {i.toString().padStart(2, '0')}:00
          </div>
        );
      }
      return labels;
    };

    const getEntryPosition = (entry: TimeEntry) => {
      const startTime = new Date(entry.startTime);
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const duration = entry.duration / 3600; // Convert to hours
      
      return {
        top: `${(startHour / 24) * 100}%`,
        height: `${Math.max((duration / 24) * 100, 0.5)}%`, // Minimum 0.5% height
      };
    };

    return (
      <div className="relative pl-16 pr-4">
        {/* Time Labels */}
        <div className="absolute left-0 top-0 bottom-0">
          {generateTimeLabels()}
        </div>

        {/* Timeline Container */}
        <div 
          className="relative bg-gray-50 rounded-lg border-2 border-gray-200 min-h-[600px] cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setDragSelection(null);
          }}
        >
          {/* Hour Grid Lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ top: `${(i / 24) * 100}%` }}
              />
            ))}
          </div>

          {/* Drag Selection Overlay */}
          {isDragging && dragSelection && (
            <div
              className="absolute left-0 right-0 bg-blue-200 bg-opacity-50 border-2 border-blue-400 border-dashed"
              style={{
                top: `${Math.min(dragSelection.startY, dragSelection.endY)}%`,
                height: `${Math.abs(dragSelection.endY - dragSelection.startY)}%`,
              }}
            />
          )}

          {/* Time Entries */}
          {displayEntries.map((entry) => {
            const position = getEntryPosition(entry);
            const projectName = getProjectName(entry.projectId);
            const taskName = getTaskName(entry.taskId);
            const color = getProjectColor(entry.projectId);
            
            return (
              <div
                key={entry.id}
                className="absolute left-2 right-2 rounded px-2 flex items-center text-white text-xs font-medium shadow-sm hover:shadow-md cursor-pointer transition-all"
                style={{
                  ...position,
                  backgroundColor: color,
                  minHeight: '24px',
                }}
                title={`${projectName}${taskName ? ` - ${taskName}` : ''}\n${format(new Date(entry.startTime), 'HH:mm')} - ${entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'Running'}`}
              >
                <span className="truncate">
                  {projectName}{taskName ? ` - ${taskName}` : ''}
                </span>
              </div>
            );
          })}

          {/* Current Time Indicator */}
          {isSameDay(selectedDate, new Date()) && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
              style={{
                top: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%`,
              }}
            >
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>

        {/* Quick Entry Form */}
        {showQuickForm && dragSelection && (
          <TimeEntryForm
            projects={projects}
            subTasks={subTasks}
            prefilledData={{
              startTime: dragSelection.startY < dragSelection.endY ? dragSelection.startTime : dragSelection.endTime,
              endTime: dragSelection.startY < dragSelection.endY ? dragSelection.endTime : dragSelection.startTime,
              date: format(selectedDate, 'yyyy-MM-dd'),
            }}
            onClose={() => {
              setShowQuickForm(false);
              setDragSelection(null);
            }}
            onSuccess={() => {
              forceRefresh(); // Refresh the timeline after successful entry
            }}
          />
        )}
      </div>
    );
  };

  // Week view - daily columns with proper aggregation
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyData = days.map(day => {
      const dayEntries = displayEntries.filter(entry => 
        isSameDay(new Date(entry.startTime), day)
      );
      const totalTime = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      // Group entries by project for better visualization
      const projectGroups = dayEntries.reduce((groups, entry) => {
        const projectId = entry.projectId;
        if (!groups[projectId]) {
          groups[projectId] = [];
        }
        groups[projectId].push(entry);
        return groups;
      }, {} as Record<string, TimeEntry[]>);
      
      return {
        date: day,
        entries: dayEntries,
        projectGroups,
        totalTime,
        formattedTime: Math.floor(totalTime / 3600) + 'h ' + Math.floor((totalTime % 3600) / 60) + 'm'
      };
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-4">
          {dailyData.map((dayData, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {format(dayData.date, 'EEE')}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {format(dayData.date, 'dd')}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] space-y-2">
                {Object.entries(dayData.projectGroups).map(([projectId, entries]) => {
                  const projectName = getProjectName(projectId);
                  const color = getProjectColor(projectId);
                  const projectTotal = entries.reduce((sum, entry) => sum + entry.duration, 0);
                  
                  return (
                    <div
                      key={projectId}
                      className="text-xs p-2 rounded text-white"
                      style={{ backgroundColor: color }}
                      title={`${projectName}: ${Math.floor(projectTotal / 3600)}h ${Math.floor((projectTotal % 3600) / 60)}m`}
                    >
                      <div className="font-medium truncate">{projectName}</div>
                      <div className="text-xs opacity-90">
                        {Math.floor(projectTotal / 3600)}h {Math.floor((projectTotal % 3600) / 60)}m
                      </div>
                    </div>
                  );
                })}
                {dayData.totalTime > 0 && (
                  <div className="text-sm font-medium text-gray-700 pt-2 border-t border-gray-200">
                    Total: {dayData.formattedTime}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Month view - weekly aggregation
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
    
    const weeklyData = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekEntries = displayEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      const totalTime = weekEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      // Group by project for the week
      const projectGroups = weekEntries.reduce((groups, entry) => {
        const projectId = entry.projectId;
        if (!groups[projectId]) {
          groups[projectId] = 0;
        }
        groups[projectId] += entry.duration;
        return groups;
      }, {} as Record<string, number>);
      
      return {
        weekStart,
        weekEnd,
        entries: weekEntries,
        projectGroups,
        totalTime
      };
    });

    return (
      <div className="space-y-4">
        <div className="text-center text-xl font-semibold mb-6">
          {format(selectedDate, 'MMMM yyyy')}
        </div>
        <div className="space-y-4">
          {weeklyData.map((week, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-800">
                  Week {index + 1}: {format(week.weekStart, 'MMM dd')} - {format(week.weekEnd, 'MMM dd')}
                </span>
                <span className="text-lg font-semibold text-blue-600">
                  {Math.floor(week.totalTime / 3600)}h {Math.floor((week.totalTime % 3600) / 60)}m
                </span>
              </div>
              
              {Object.keys(week.projectGroups).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(week.projectGroups).map(([projectId, duration]) => {
                    const projectName = getProjectName(projectId);
                    const color = getProjectColor(projectId);
                    
                    return (
                      <div
                        key={projectId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 truncate">{projectName}</div>
                          <div className="text-sm text-gray-600">
                            {Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {week.entries.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No time entries for this week
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  switch (view) {
    case "day":
      return renderDayView();
    case "week":
      return renderWeekView();
    case "month":
      return renderMonthView();
    default:
      return renderDayView();
  }
};
