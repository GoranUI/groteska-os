import { useState } from "react";
import { Play, Square, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { Project, SubTask } from "@/types";

interface TimeTrackerWidgetProps {
  projects: Project[];
  subTasks: SubTask[];
  className?: string;
}

export function TimeTrackerWidget({ projects, subTasks, className }: TimeTrackerWidgetProps) {
  const {
    activeEntry,
    elapsedTime,
    startTimer,
    stopTimer,
    formatDuration,
  } = useTimeTracker();

  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [isBillable, setIsBillable] = useState(false);

  const handleStart = async () => {
    if (!selectedProjectId) return;
    
    await startTimer(
      selectedProjectId, 
      selectedTaskId || undefined, 
      description || undefined
    );
  };

  const handleStop = async () => {
    await stopTimer();
    // Reset form
    setDescription("");
    setSelectedProjectId("");
    setSelectedTaskId("");
    setIsBillable(false);
  };

  const filteredTasks = subTasks.filter(task => task.projectId === selectedProjectId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const displayTime = activeEntry ? formatDuration(elapsedTime) : "00:00:00";

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Description Input */}
          <div className="relative">
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-lg h-12"
              disabled={!!activeEntry}
            />
          </div>

          {/* Project and Task Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Project
              </Label>
              <Select 
                value={selectedProjectId} 
                onValueChange={setSelectedProjectId}
                disabled={!!activeEntry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: getProjectColor(project.id, projects) 
                          }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Task (Optional)</Label>
              <Select 
                value={selectedTaskId} 
                onValueChange={setSelectedTaskId}
                disabled={!!activeEntry || !selectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timer Display and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-mono font-bold text-blue-600">
                {displayTime}
              </div>
              
              {activeEntry && selectedProject && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: getProjectColor(selectedProject.id, projects) 
                    }}
                  />
                  <span>{selectedProject.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Billable Toggle */}
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <Switch
                  id="billable"
                  checked={isBillable}
                  onCheckedChange={setIsBillable}
                  disabled={!!activeEntry}
                />
                <Label htmlFor="billable" className="text-sm">
                  Billable
                </Label>
              </div>

              {/* Start/Stop Button */}
              {activeEntry ? (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="h-5 w-5" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={handleStart}
                  disabled={!selectedProjectId}
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              )}
            </div>
          </div>

          {/* Active Timer Info */}
          {activeEntry && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">
                  Started at {new Date(activeEntry.startTime).toLocaleTimeString()}
                </span>
                <span className="text-blue-600">
                  Timer is running...
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get consistent project colors
function getProjectColor(projectId: string, projects: Project[]): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#DC2626'
  ];
  const index = projects.findIndex(p => p.id === projectId);
  return colors[index % colors.length];
}