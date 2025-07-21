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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-info/10 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-info" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary">
              Time Tracker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your time across projects and tasks with precision and insights
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="outline" size="sm" className="gap-2 focus-ring" onClick={handleBulkExport} disabled={selectedEntries.size === 0}>
              <Download className="h-4 w-4" />
              Export Selected ({selectedEntries.size})
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 focus-ring" disabled={selectedEntries.size === 0}>
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
                <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-8">
          {/* Timer Widget */}
          <ErrorBoundary fallback={
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Timer widget failed to load</p>
              </CardContent>
            </Card>
          }>
            <TimeTrackerWidget projects={projects} subTasks={subTasks} />
          </ErrorBoundary>

          {/* Manual Entry Section */}
          <ErrorBoundary fallback={
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Manual entry form failed to load</p>
              </CardContent>
            </Card>
          }>
            <ManualTimeEntryForm projects={projects} subTasks={subTasks} />
          </ErrorBoundary>

          {/* Overview Card */}
          <Card className="card-elevated">
            <CardHeader className="bg-gradient-to-r from-info/5 to-info-light/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info/10 rounded-xl">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">Time Overview</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Tabs value={overviewPeriod} onValueChange={v => setOverviewPeriod(v as any)}>
                    <TabsList className="bg-muted/50">
                      <TabsTrigger value="day">Day</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={handlePrev} className="focus-ring">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday} className="focus-ring">
                      <Calendar className="h-4 w-4 mr-2" />
                      {overviewLabel}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNext} className="focus-ring">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-info/10 to-info-light/10 rounded-xl border border-info/20">
                    <div className="text-sm text-info font-medium">Total Time</div>
                    <div className="text-3xl font-bold text-info mt-2">{formatDuration(overviewSummary.total)}</div>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-success/10 to-success-light/10 rounded-xl border border-success/20">
                    <div className="text-sm text-success font-medium">Billable Time</div>
                    <div className="text-3xl font-bold text-success mt-2">{formatDuration(overviewSummary.billable)}</div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary fallback={
                    <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
                      <p className="text-muted-foreground">Chart failed to load</p>
                    </div>
                  }>
                    <SummaryChart timeEntries={overviewEntries} projects={projects} formatDuration={formatDuration} />
                  </ErrorBoundary>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Entries Table */}
          <ErrorBoundary fallback={
            <Card className="card-elevated">
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
    </div>
  );
}