import { useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Edit, Trash2, Play, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { TimeEntry, Project, SubTask } from "@/types";

interface TimeEntryTableProps {
  projects: Project[];
  subTasks: SubTask[];
  startDate?: Date;
  endDate?: Date;
}

export function TimeEntryTable({ projects, subTasks, startDate, endDate }: TimeEntryTableProps) {
  const {
    timeEntries,
    loading,
    deleteTimeEntry,
    formatDuration,
    startTimer,
  } = useTimeTracker();

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Group entries by date
  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const date = format(parseISO(entry.startTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getTaskName = (taskId: string | null) => {
    if (!taskId) return null;
    return subTasks.find(t => t.id === taskId)?.name || 'Unknown Task';
  };

  const getProjectColor = (projectId: string): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#DC2626'
    ];
    const index = projects.findIndex(p => p.id === projectId);
    return colors[index % colors.length];
  };

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM dd');
  };

  const getTotalForDay = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleDuplicate = async (entry: TimeEntry) => {
    const project = projects.find(p => p.id === entry.projectId);
    if (project) {
      await startTimer(entry.projectId, entry.taskId, entry.description);
    }
  };

  const handleDelete = async (entry: TimeEntry) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      await deleteTimeEntry(entry.id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading time entries...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No time entries found</p>
              <p className="text-sm">Start tracking time to see entries here</p>
            </div>
          ) : (
            sortedDates.map(date => {
              const entries = groupedEntries[date];
              const isExpanded = expandedDays.has(date);
              const totalDuration = getTotalForDay(entries);

              return (
                <div key={date} className="border rounded-lg">
                  {/* Date Header */}
                  <div 
                    className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleDay(date)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{formatDateHeader(date)}</h3>
                        <Badge variant="secondary">
                          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        Total: {formatDuration(totalDuration)}
                      </div>
                    </div>
                  </div>

                  {/* Entries Table */}
                  {isExpanded && (
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Billable</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entries.map(entry => {
                            const projectName = getProjectName(entry.projectId);
                            const taskName = getTaskName(entry.taskId);
                            const projectColor = getProjectColor(entry.projectId);

                            return (
                              <TableRow key={entry.id}>
                                <TableCell>
                                  <div className="max-w-xs truncate">
                                    {entry.description || 'No description'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: projectColor }}
                                    />
                                    <span className="truncate">{projectName}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-gray-500">
                                    {taskName || '-'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {format(parseISO(entry.startTime), 'HH:mm')} - {' '}
                                    {entry.endTime 
                                      ? format(parseISO(entry.endTime), 'HH:mm')
                                      : 'Running'
                                    }
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono">
                                    {formatDuration(entry.duration)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {entry.isBillable ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      Billable
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      Non-billable
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleDuplicate(entry)}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Start timer
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDuplicate(entry)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDelete(entry)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}