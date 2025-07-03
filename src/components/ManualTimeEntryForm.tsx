import { useState } from "react";
import { format } from "date-fns";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { Project, SubTask } from "@/types";

interface ManualTimeEntryFormProps {
  projects: Project[];
  subTasks: SubTask[];
}

export function ManualTimeEntryForm({ projects, subTasks }: ManualTimeEntryFormProps) {
  const { addTimeEntry } = useTimeTracker();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: '',
    isBillable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.startTime || !formData.endTime) return;

    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        return;
      }

      await addTimeEntry({
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        description: formData.description || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isBillable: formData.isBillable,
      });

      // Reset form
      setFormData({
        projectId: '',
        taskId: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endTime: '',
        isBillable: false,
      });

      setOpen(false);
    } catch (error) {
      console.error('Error adding time entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = subTasks.filter(task => task.projectId === formData.projectId);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you work on?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                projectId: value, 
                taskId: '' // Reset task when project changes
              }))}
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
                        style={{ backgroundColor: getProjectColor(project.id) }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <Label>Task (Optional)</Label>
            <Select 
              value={formData.taskId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}
              disabled={!formData.projectId}
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
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

          {/* Billable Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="billable" className="text-sm font-medium">
              Billable time
            </Label>
            <Switch
              id="billable"
              checked={formData.isBillable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBillable: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.projectId || !formData.startTime || !formData.endTime || loading}
            >
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}