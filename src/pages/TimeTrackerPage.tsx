import { useState, useMemo, useCallback, useEffect } from "react";
import { startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, addDays, subDays, addMonths, subMonths, format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Download, Settings, Trash2, Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TimeTrackerWidget } from "@/components/TimeTrackerWidget";
import { TimeEntryTable } from "@/components/TimeEntryTable";
import { ManualTimeEntryForm } from "@/components/ManualTimeEntryForm";
import { SummaryChart } from "@/components/SummaryChart";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Error Boundary Component
const ErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Component error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default function TimeTrackerPage() {
  const { projects, loading: projectsLoading } = useProjectData();
  const { subTasks, loading: subTasksLoading } = useSubTaskData();
  const { timeEntries, loading: timeEntriesLoading, formatDuration, deleteTimeEntry } = useTimeTracker();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Show loading state if any data is loading
  const isLoading = projectsLoading || subTasksLoading || timeEntriesLoading;

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('TimeTrackerPage error:', event.error);
      setError(event.error?.message || 'An error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Overview period state
  const [overviewPeriod, setOverviewPeriod] = useState<'day' | 'week' | 'month'>('week');
  // For day and month navigation
  const [currentDay, setCurrentDay] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Period boundaries
  const dayStart = useMemo(() => startOfDay(currentDay), [currentDay]);
  const dayEnd = useMemo(() => endOfDay(currentDay), [currentDay]);
  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek]);
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  // Entries and summary for each period
  const dayEntries = useMemo(() => timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= dayStart && entryDate <= dayEnd;
  }), [timeEntries, dayStart, dayEnd]);
  const weekEntries = useMemo(() => timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= weekStart && entryDate <= weekEnd;
  }), [timeEntries, weekStart, weekEnd]);
  const monthEntries = useMemo(() => timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= monthStart && entryDate <= monthEnd;
  }), [timeEntries, monthStart, monthEnd]);

  const daySummary = useMemo(() => ({
    total: dayEntries.reduce((t, e) => t + e.duration, 0),
    billable: dayEntries.filter(e => e.isBillable).reduce((t, e) => t + e.duration, 0)
  }), [dayEntries]);
  const weekSummary = useMemo(() => ({
    total: weekEntries.reduce((t, e) => t + e.duration, 0),
    billable: weekEntries.filter(e => e.isBillable).reduce((t, e) => t + e.duration, 0)
  }), [weekEntries]);
  const monthSummary = useMemo(() => ({
    total: monthEntries.reduce((t, e) => t + e.duration, 0),
    billable: monthEntries.filter(e => e.isBillable).reduce((t, e) => t + e.duration, 0)
  }), [monthEntries]);

  // Overview data selection
  const overviewEntries = overviewPeriod === 'day' ? dayEntries : overviewPeriod === 'week' ? weekEntries : monthEntries;
  const overviewSummary = overviewPeriod === 'day' ? daySummary : overviewPeriod === 'week' ? weekSummary : monthSummary;
  const overviewLabel = overviewPeriod === 'day'
    ? format(dayStart, 'MMM dd, yyyy')
    : overviewPeriod === 'week'
      ? `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`
      : format(monthStart, 'MMMM yyyy');

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (overviewPeriod === 'day') setCurrentDay(prev => subDays(prev, 1));
    else if (overviewPeriod === 'week') setCurrentWeek(prev => subWeeks(prev, 1));
    else setCurrentMonth(prev => subMonths(prev, 1));
  }, [overviewPeriod]);
  const handleNext = useCallback(() => {
    if (overviewPeriod === 'day') setCurrentDay(prev => addDays(prev, 1));
    else if (overviewPeriod === 'week') setCurrentWeek(prev => addWeeks(prev, 1));
    else setCurrentMonth(prev => addMonths(prev, 1));
  }, [overviewPeriod]);
  const handleToday = useCallback(() => {
    if (overviewPeriod === 'day') setCurrentDay(new Date());
    else if (overviewPeriod === 'week') setCurrentWeek(new Date());
    else setCurrentMonth(new Date());
  }, [overviewPeriod]);
  // When switching period, reset to today/this week/this month
  useEffect(() => {
    if (overviewPeriod === 'day') setCurrentDay(new Date());
    else if (overviewPeriod === 'week') setCurrentWeek(new Date());
    else setCurrentMonth(new Date());
  }, [overviewPeriod]);

  // Week navigation with useCallback to prevent re-renders
  const previousWeek = useCallback(() => setCurrentWeek(prev => subWeeks(prev, 1)), []);
  const nextWeek = useCallback(() => setCurrentWeek(prev => addWeeks(prev, 1)), []);
  const goToCurrentWeek = useCallback(() => setCurrentWeek(new Date()), []);

  // Quick week selection
  const quickSelectWeek = useCallback((weeksFromNow: number) => {
    const targetDate = addWeeks(new Date(), weeksFromNow);
    setCurrentWeek(targetDate);
  }, []);

  // Bulk action handlers
  const handleBulkDelete = useCallback(async () => {
    if (selectedEntries.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedEntries.size} time entries?`)) {
      for (const entryId of selectedEntries) {
        await deleteTimeEntry(entryId);
      }
      setSelectedEntries(new Set());
    }
  }, [selectedEntries, deleteTimeEntry]);

  const handleBulkExport = useCallback(() => {
    if (selectedEntries.size === 0) return;
    
    const selectedTimeEntries = timeEntries.filter(entry => selectedEntries.has(entry.id));
    const csvContent = [
      ['Date', 'Start Time', 'End Time', 'Duration', 'Project', 'Task', 'Description', 'Billable'],
      ...selectedTimeEntries.map(entry => [
        format(new Date(entry.startTime), 'yyyy-MM-dd'),
        format(new Date(entry.startTime), 'HH:mm'),
        entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : '',
        formatDuration(entry.duration),
        projects.find(p => p.id === entry.projectId)?.name || 'Unknown',
        subTasks.find(t => t.id === entry.taskId)?.name || '',
        entry.description || '',
        entry.isBillable ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [selectedEntries, timeEntries, projects, subTasks, formatDuration]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allEntryIds = weekEntries.map(entry => entry.id);
      setSelectedEntries(new Set(allEntryIds));
    } else {
      setSelectedEntries(new Set());
    }
  }, [weekEntries]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Time Tracker</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading time tracker...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleBulkExport} disabled={selectedEntries.size === 0}>
              <Download className="h-4 w-4" />
              Export Selected ({selectedEntries.size})
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={selectedEntries.size === 0}>
                  <Settings className="h-4 w-4" />
                  Bulk Actions ({selectedEntries.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSelectAll.bind(null, true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Select All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSelectAll.bind(null, false)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Clear Selection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timer Widget */}
        <ErrorBoundary fallback={
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Timer widget failed to load</p>
            </CardContent>
          </Card>
        }>
          <TimeTrackerWidget projects={projects} subTasks={subTasks} />
        </ErrorBoundary>

        {/* Manual Entry Section */}
        <ErrorBoundary fallback={
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Manual entry form failed to load</p>
            </CardContent>
          </Card>
        }>
          <ManualTimeEntryForm projects={projects} subTasks={subTasks} />
        </ErrorBoundary>

        {/* Overview Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={overviewPeriod} onValueChange={v => setOverviewPeriod(v as any)}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {overviewLabel}
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-primary font-medium">Total Time</div>
                  <div className="text-2xl font-bold text-primary">{formatDuration(overviewSummary.total)}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">Billable Time</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatDuration(overviewSummary.billable)}</div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <ErrorBoundary fallback={<div className="h-64 flex items-center justify-center"><p className="text-muted-foreground">Chart failed to load</p></div>}>
                  <SummaryChart timeEntries={overviewEntries} projects={projects} formatDuration={formatDuration} />
                </ErrorBoundary>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Table */}
        <ErrorBoundary fallback={
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Time entries table failed to load</p>
            </CardContent>
          </Card>
        }>
          <TimeEntryTable 
            projects={projects} 
            subTasks={subTasks}
            startDate={weekStart}
            endDate={weekEnd}
            selectedEntries={selectedEntries}
            onSelectionChange={setSelectedEntries}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}