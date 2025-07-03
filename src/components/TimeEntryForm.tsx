
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask } from "@/types";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface TimeEntryFormProps {
  projects: Project[];
  subTasks: SubTask[];
  prefilledData?: {
    startTime?: string;
    endTime?: string;
    date?: string;
  };
  onClose?: () => void;
  onSuccess?: () => void; // Add callback for successful submission
}

export const TimeEntryForm = ({ projects, subTasks, prefilledData, onClose, onSuccess }: TimeEntryFormProps) => {
  const { user } = useAuth();
  const { addTimeEntry } = useTimeEntryData();
  const [open, setOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"time-range" | "duration">("time-range");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');
  
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    date: prefilledData?.date || currentDate,
    startTime: prefilledData?.startTime || currentTime,
    endTime: prefilledData?.endTime || "",
    duration: "",
    note: "",
  });

  const parseDuration = (durationStr: string): number => {
    // Trim whitespace and convert to lowercase
    const cleanStr = durationStr.trim().toLowerCase();
    
    // More flexible regex that handles various formats
    const regex = /^(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:inutes?)?$|^(\d+)\s*h(?:ours?)?$|^(\d+)\s*m(?:inutes?)?$/;
    const match = cleanStr.match(regex);
    
    if (!match) {
      console.log('TimeEntryForm: Duration parsing failed for:', durationStr);
      return 0;
    }
    
    let hours = 0;
    let minutes = 0;
    
    if (match[1] && match[2]) {
      // Format: "2h30m" or "2 hours 30 minutes"
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
    } else if (match[3]) {
      // Format: "2h" or "2 hours"
      hours = parseInt(match[3], 10);
    } else if (match[4]) {
      // Format: "30m" or "30 minutes"
      minutes = parseInt(match[4], 10);
    }
    
    const totalSeconds = hours * 3600 + minutes * 60;
    console.log('TimeEntryForm: Parsed duration:', { hours, minutes, totalSeconds });
    
    return totalSeconds;
  };

  const calculateEndTimeFromDuration = (startTime: string, durationSeconds: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Calculate total minutes from start time
    const startTotalMinutes = hours * 60 + minutes;
    
    // Add duration in minutes
    const durationMinutes = Math.floor(durationSeconds / 60);
    const endTotalMinutes = startTotalMinutes + durationMinutes;
    
    // Convert back to hours and minutes
    const endHours = Math.floor(endTotalMinutes / 60) % 24; // Handle 24-hour overflow
    const endMinutes = endTotalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.projectId || !formData.date || isSubmitting) return;

    setIsSubmitting(true);
    console.log('Form submission started with data:', formData);

    try {
      let startTime: string;
      let endTime: string;
      let duration: number;

      if (inputMode === "duration" && formData.duration) {
        console.log('TimeEntryForm: Parsing duration:', formData.duration);
        duration = parseDuration(formData.duration);
        console.log('TimeEntryForm: Parsed duration in seconds:', duration);
        
        if (duration <= 0) {
          alert("Please enter a valid duration (e.g., 2h30m)");
          return;
        }
        
        // Calculate end time from duration
        startTime = `${formData.date}T${formData.startTime}`;
        const calculatedEndTime = calculateEndTimeFromDuration(formData.startTime, duration);
        endTime = `${formData.date}T${calculatedEndTime}`;
        
        console.log('TimeEntryForm: Duration calculation:', {
          startTime: formData.startTime,
          duration: formData.duration,
          durationSeconds: duration,
          calculatedEndTime,
          fullStartTime: startTime,
          fullEndTime: endTime
        });
        
        // Validate that the calculated end time is after start time
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        const calculatedDuration = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);
        
        console.log('TimeEntryForm: Final validation:', {
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          calculatedDuration,
          originalDuration: duration
        });
        
        if (calculatedDuration <= 0) {
          alert("Invalid duration calculation. Please check your start time and duration.");
          return;
        }
      } else {
        // Time range mode
        if (!formData.startTime || !formData.endTime) {
          alert("Please provide both start and end times");
          return;
        }
        
        startTime = `${formData.date}T${formData.startTime}`;
        endTime = `${formData.date}T${formData.endTime}`;
        duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
      }

      if (duration <= 0) {
        alert("End time must be after start time");
        return;
      }

      console.log('Submitting time entry:', {
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        userId: user.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        note: formData.note,
        isBillable: false,
      });

      const result = await addTimeEntry({
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        userId: user.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        note: formData.note,
        isBillable: false,
      });

      console.log('TimeEntryForm: Add time entry result:', result);

      if (result && !result.error) {
        // Reset form
        setFormData({
          projectId: "",
          taskId: "",
          date: currentDate,
          startTime: currentTime,
          endTime: "",
          duration: "",
          note: "",
        });
        
        setOpen(false);
        onClose?.();
        
        console.log('TimeEntryForm: Time entry added successfully, calling onSuccess');
        onSuccess?.(); // Trigger refresh
        
        console.log('TimeEntryForm: Form reset and closed');
      } else {
        console.error("TimeEntryForm: Failed to add time entry:", result?.error);
        alert(`Failed to add time entry: ${result?.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding time entry:", error);
      alert("Failed to add time entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTasks = subTasks.filter(task => task.projectId === formData.projectId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project">Project *</Label>
            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value, taskId: "" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="task">Task (Optional)</Label>
            <Select 
              value={formData.taskId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}
              disabled={!formData.projectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={inputMode === "time-range" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("time-range")}
              >
                Time Range
              </Button>
              <Button
                type="button"
                variant={inputMode === "duration" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("duration")}
              >
                Duration
              </Button>
            </div>

            {inputMode === "time-range" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2h30m, 1h, 45m"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: hours (h) and/or minutes (m). Examples: 2h30m, 1h, 45m
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="note">Description</Label>
            <Input
              id="note"
              placeholder="What did you work on?"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
