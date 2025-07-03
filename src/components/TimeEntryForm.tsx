
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { Project, SubTask } from "@/types";
import { Plus } from "lucide-react";

interface TimeEntryFormProps {
  projects: Project[];
  subTasks: SubTask[];
}

export const TimeEntryForm = ({ projects, subTasks }: TimeEntryFormProps) => {
  const { user } = useAuth();
  const { addTimeEntry } = useTimeEntryData();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    startTime: "",
    endTime: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.projectId || !formData.startTime || !formData.endTime) return;

    const startTime = new Date(formData.startTime).toISOString();
    const endTime = new Date(formData.endTime).toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);

    if (duration <= 0) {
      alert("End time must be after start time");
      return;
    }

    try {
      await addTimeEntry({
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        userId: user.id,
        startTime,
        endTime,
        duration,
        note: formData.note,
        isBillable: false,
      });

      setFormData({
        projectId: "",
        taskId: "",
        startTime: "",
        endTime: "",
        note: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding time entry:", error);
      alert("Failed to add time entry. Please try again.");
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Entry</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
