
import { useEffect, useState } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask, TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getWeeksInMonth } from "date-fns";

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

  // Day view - hourly timeline
  const renderDayView = () => {
    const getEntryPosition = (entry: TimeEntry) => {
      const startTime = new Date(entry.startTime);
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const duration = entry.duration / 3600; // Convert to hours
      
      return {
        left: `${(startHour / 24) * 100}%`,
        width: `${Math.max((duration / 24) * 100, 1)}%`, // Minimum 1% width
      };
    };

    const generateTimeLabels = () => {
      const labels = [];
      for (let i = 0; i <= 23; i += 3) {
        labels.push(
          <div key={i} className="text-xs text-gray-500 text-center" style={{ left: `${(i / 24) * 100}%` }}>
            {i.toString().padStart(2, '0')}:00
          </div>
        );
      }
      return labels;
    };

    return (
      <div className="space-y-4">
        {/* Time Labels */}
        <div className="relative h-4">
          {generateTimeLabels()}
        </div>

        {/* Timeline Grid */}
        <div className="relative bg-gray-50 rounded-lg p-4 min-h-[200px]">
          {/* Grid Lines */}
          <div className="absolute inset-4 grid grid-cols-8 gap-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-r border-gray-200 last:border-r-0" />
            ))}
          </div>

          {/* Time Entries */}
          <div className="relative space-y-2">
            {displayEntries.map((entry, index) => {
              const position = getEntryPosition(entry);
              const projectName = getProjectName(entry.projectId);
              const taskName = getTaskName(entry.taskId);
              
              return (
                <div
                  key={entry.id}
                  className="absolute rounded px-2 flex items-center text-white text-xs font-medium shadow-sm hover:shadow-md cursor-pointer transition-all"
                  style={{
                    ...position,
                    top: `${index * 36 + 8}px`,
                    height: '28px',
                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                  }}
                  title={`${projectName}${taskName ? ` - ${taskName}` : ''}\n${format(new Date(entry.startTime), 'HH:mm')} - ${entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'Running'}`}
                >
                  <span className="truncate">
                    {projectName}{taskName ? ` - ${taskName}` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Time Indicator */}
          {isSameDay(selectedDate, new Date()) && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{
                left: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%`,
              }}
            >
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Week view - daily aggregation
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyData = days.map(day => {
      const dayEntries = displayEntries.filter(entry => 
        isSameDay(new Date(entry.startTime), day)
      );
      const totalTime = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      return {
        date: day,
        entries: dayEntries,
        totalTime,
        formattedTime: Math.floor(totalTime / 3600) + 'h ' + Math.floor((totalTime % 3600) / 60) + 'm'
      };
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {dailyData.map((dayData, index) => (
            <div key={index} className="text-center">
              <div className="text-xs font-medium text-gray-600 mb-2">
                {format(dayData.date, 'EEE')}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {format(dayData.date, 'dd')}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 min-h-[120px] space-y-1">
                {dayData.entries.slice(0, 3).map((entry, entryIndex) => {
                  const projectName = getProjectName(entry.projectId);
                  return (
                    <div
                      key={entry.id}
                      className="text-xs p-1 rounded text-white truncate"
                      style={{
                        backgroundColor: `hsl(${(entryIndex * 137.5) % 360}, 70%, 50%)`,
                      }}
                      title={projectName}
                    >
                      {projectName}
                    </div>
                  );
                })}
                {dayData.entries.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayData.entries.length - 3} more
                  </div>
                )}
                {dayData.totalTime > 0 && (
                  <div className="text-xs font-medium text-gray-700 pt-1 border-t border-gray-200">
                    {dayData.formattedTime}
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
    const weeks = [];
    
    let current = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    while (current <= end) {
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
      const weekEntries = displayEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= current && entryDate <= weekEnd;
      });
      
      weeks.push({
        start: current,
        end: weekEnd,
        entries: weekEntries,
        totalTime: weekEntries.reduce((sum, entry) => sum + entry.duration, 0)
      });
      
      current = new Date(current);
      current.setDate(current.getDate() + 7);
    }

    return (
      <div className="space-y-4">
        <div className="text-center text-lg font-semibold mb-4">
          {format(selectedDate, 'MMMM yyyy')}
        </div>
        <div className="space-y-3">
          {weeks.map((week, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Week {index + 1}: {format(week.start, 'MMM dd')} - {format(week.end, 'MMM dd')}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.floor(week.totalTime / 3600)}h {Math.floor((week.totalTime % 3600) / 60)}m
                </span>
              </div>
              {week.entries.length > 0 && (
                <div className="text-xs text-gray-500">
                  {week.entries.length} time {week.entries.length === 1 ? 'entry' : 'entries'}
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
