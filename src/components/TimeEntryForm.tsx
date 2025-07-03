
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
    const regex = /(?:(\d+)h)?(?:\s*(\d+)m)?/;
    const match = durationStr.match(regex);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 3600 + minutes * 60;
  };

  const calculateEndTimeFromDuration = (startTime: string, durationSeconds: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationSeconds * 1000);
    return format(endDate, 'HH:mm');
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
        duration = parseDuration(formData.duration);
        if (duration <= 0) {
          alert("Please enter a valid duration (e.g., 2h30m)");
          return;
        }
        
        // Calculate end time from duration
        startTime = `${formData.date}T${formData.startTime}`;
        const calculatedEndTime = calculateEndTimeFromDuration(formData.startTime, duration);
        endTime = `${formData.date}T${calculatedEndTime}`;
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

      console.log('Add time entry result:', result);

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
        onSuccess?.(); // Trigger refresh
        
        console.log('Time entry added successfully');
      } else {
        console.error("Failed to add time entry:", result?.error);
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
        <Button variant="outline" size="sm" className="gap-2">
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
                    placeholder="e.g., 2h30m"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
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
