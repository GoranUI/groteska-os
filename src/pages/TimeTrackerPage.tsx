import { useState, useMemo, useCallback } from "react";
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeTrackerWidget } from "@/components/TimeTrackerWidget";
import { TimeEntryTable } from "@/components/TimeEntryTable";
import { ManualTimeEntryForm } from "@/components/ManualTimeEntryForm";
import { SummaryChart } from "@/components/SummaryChart";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";

export default function TimeTrackerPage() {
  const { projects } = useProjectData();
  const { subTasks } = useSubTaskData();
  const { timeEntries, formatDuration } = useTimeTracker();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);

  // Calculate week summary with memoization
  const weekEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
  }, [timeEntries, weekStart, weekEnd]);

  const weekSummary = useMemo(() => {
    const totalWeekTime = weekEntries.reduce((total, entry) => total + entry.duration, 0);
    const billableWeekTime = weekEntries
      .filter(entry => entry.isBillable)
      .reduce((total, entry) => total + entry.duration, 0);
    
    return { totalWeekTime, billableWeekTime };
  }, [weekEntries]);

  // Week navigation with useCallback to prevent re-renders
  const previousWeek = useCallback(() => setCurrentWeek(prev => subWeeks(prev, 1)), []);
  const nextWeek = useCallback(() => setCurrentWeek(prev => addWeeks(prev, 1)), []);
  const goToCurrentWeek = useCallback(() => setCurrentWeek(new Date()), []);

  // Quick week selection
  const quickSelectWeek = useCallback((weeksFromNow: number) => {
    const targetDate = addWeeks(new Date(), weeksFromNow);
    setCurrentWeek(targetDate);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Actions */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Time Tracker</h1>
              <p className="text-sm text-muted-foreground">Track your time across projects and tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timer Widget */}
        <TimeTrackerWidget projects={projects} subTasks={subTasks} />

        {/* Manual Entry Section */}
        <ManualTimeEntryForm projects={projects} subTasks={subTasks} />

        {/* Week Overview */}
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
            
            {/* Quick Week Selection */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Quick select:</span>
              <Button variant="ghost" size="sm" onClick={() => quickSelectWeek(-1)}>
                Last week
              </Button>
              <Button variant="ghost" size="sm" onClick={() => quickSelectWeek(0)}>
                This week
              </Button>
              <Button variant="ghost" size="sm" onClick={() => quickSelectWeek(1)}>
                Next week
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Week Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-primary font-medium">Total Time</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatDuration(weekSummary.totalWeekTime)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">Billable Time</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatDuration(weekSummary.billableWeekTime)}
                  </div>
                </div>
              </div>

              {/* Summary Chart */}
              <div className="lg:col-span-2">
                <SummaryChart 
                  timeEntries={weekEntries}
                  projects={projects}
                  formatDuration={formatDuration}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Table */}
        <TimeEntryTable 
          projects={projects} 
          subTasks={subTasks}
          startDate={weekStart}
          endDate={weekEnd}
        />
      </div>
    </div>
  );
}