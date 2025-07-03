import { useState } from "react";
import { CalendarDays, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Project, SubTask } from "@/types";

interface TimeEntryFiltersProps {
  projects: Project[];
  subTasks: SubTask[];
  onFiltersChange: (filters: {
    search: string;
    projectId: string;
    taskId: string;
    billable: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => void;
}

export function TimeEntryFilters({ projects, subTasks, onFiltersChange }: TimeEntryFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    projectId: "all",
    taskId: "all",
    billable: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    const cleared = {
      search: "",
      projectId: "all",
      taskId: "all",
      billable: "all",
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  const filteredTasks = subTasks.filter(task => 
    filters.projectId === "all" || task.projectId === filters.projectId
  );

  const hasActiveFilters = filters.search !== "" || 
    filters.projectId !== "all" || 
    filters.taskId !== "all" || 
    filters.billable !== "all" || 
    filters.startDate !== undefined || 
    filters.endDate !== undefined;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Project Filter */}
          <Select 
            value={filters.projectId} 
            onValueChange={(value) => updateFilters({ projectId: value, taskId: "all" })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Task Filter */}
          <Select 
            value={filters.taskId} 
            onValueChange={(value) => updateFilters({ taskId: value })}
            disabled={filters.projectId === "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tasks</SelectItem>
              {filteredTasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Billable Filter */}
          <Select 
            value={filters.billable} 
            onValueChange={(value) => updateFilters({ billable: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All entries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              <SelectItem value="billable">Billable only</SelectItem>
              <SelectItem value="non-billable">Non-billable only</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                {filters.startDate || filters.endDate ? (
                  <span>
                    {filters.startDate ? format(filters.startDate, 'MMM dd') : '...'} - {' '}
                    {filters.endDate ? format(filters.endDate, 'MMM dd') : '...'}
                  </span>
                ) : (
                  'Date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => updateFilters({ startDate: date })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => updateFilters({ endDate: date })}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => updateFilters({ startDate: undefined, endDate: undefined })}
                  >
                    Clear dates
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}