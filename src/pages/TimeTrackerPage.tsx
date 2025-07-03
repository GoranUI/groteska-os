import { useState } from "react";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeTrackerWidget } from "@/components/TimeTrackerWidget";
import { TimeEntryTable } from "@/components/TimeEntryTable";
import { ManualTimeEntryForm } from "@/components/ManualTimeEntryForm";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";

export default function TimeTrackerPage() {
  const { projects } = useProjectData();
  const { subTasks } = useSubTaskData();
  const { timeEntries, formatDuration } = useTimeTracker();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeTab, setActiveTab] = useState("tracker");

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Calculate week summary
  const weekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  const totalWeekTime = weekEntries.reduce((total, entry) => total + entry.duration, 0);
  const billableWeekTime = weekEntries
    .filter(entry => entry.isBillable)
    .reduce((total, entry) => total + entry.duration, 0);

  const previousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const nextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToCurrentWeek = () => setCurrentWeek(new Date());

  // Group entries by project for the week
  const projectSummary = weekEntries.reduce((acc, entry) => {
    const projectId = entry.projectId;
    if (!acc[projectId]) {
      acc[projectId] = {
        duration: 0,
        billableDuration: 0,
        entries: 0,
      };
    }
    acc[projectId].duration += entry.duration;
    if (entry.isBillable) {
      acc[projectId].billableDuration += entry.duration;
    }
    acc[projectId].entries += 1;
    return acc;
  }, {} as Record<string, { duration: number; billableDuration: number; entries: number }>);

  const getProjectColor = (projectId: string): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#DC2626'
    ];
    const index = projects.findIndex(p => p.id === projectId);
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Time Tracker</h1>
              <p className="text-sm text-gray-600">Track your time across projects and tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ManualTimeEntryForm projects={projects} subTasks={subTasks} />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timer Widget */}
        <TimeTrackerWidget projects={projects} subTasks={subTasks} />

        {/* Week Navigation */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Week Overview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={previousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </Button>
                <Button variant="outline" size="sm" onClick={nextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Week Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Total Time</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatDuration(totalWeekTime)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Billable Time</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatDuration(billableWeekTime)}
                  </div>
                </div>
              </div>

              {/* Project Breakdown */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Project Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(projectSummary).map(([projectId, summary]) => {
                    const project = projects.find(p => p.id === projectId);
                    const color = getProjectColor(projectId);
                    
                    return (
                      <div key={projectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <div className="font-medium">{project?.name || 'Unknown Project'}</div>
                            <div className="text-sm text-gray-500">
                              {summary.entries} {summary.entries === 1 ? 'entry' : 'entries'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium">
                            {formatDuration(summary.duration)}
                          </div>
                          {summary.billableDuration > 0 && (
                            <div className="text-sm text-green-600">
                              {formatDuration(summary.billableDuration)} billable
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(projectSummary).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No time entries for this week</p>
                      <p className="text-sm">Start tracking time to see the breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tracker">Time Tracker</TabsTrigger>
            <TabsTrigger value="entries">Time Entries</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6">
            <TimeEntryTable 
              projects={projects} 
              subTasks={subTasks}
              startDate={weekStart}
              endDate={weekEnd}
            />
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <TimeEntryTable 
              projects={projects} 
              subTasks={subTasks}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Reports Coming Soon</p>
                  <p className="text-sm">Detailed time tracking reports and analytics will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}