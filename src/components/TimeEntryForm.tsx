import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Project, SubTask } from "@/types";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";

interface TimeEntryFormProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  projects: Project[];
  subTasks: SubTask[];
}

export const TimeEntryForm = ({ open, onClose, userId, projects, subTasks }: TimeEntryFormProps) => {
  const { addTimeEntry } = useTimeEntryData();
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [isBillable, setIsBillable] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setProjectId("");
      setTaskId("");
      setStartTime("");
      setEndTime("");
      setNote("");
      setIsBillable(false);
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const calcDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.max(0, Math.floor((end - start) / 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!projectId) return setError("Project is required.");
    if (!startTime || !endTime) return setError("Start and end time are required.");
    if (new Date(endTime) <= new Date(startTime)) return setError("End time must be after start time.");
    setSubmitting(true);
    const duration = calcDuration();
    const { error: apiError } = await addTimeEntry({
      projectId,
      taskId: taskId || null,
      userId,
      startTime,
      endTime,
      duration,
      note,
      isBillable,
    });
    setSubmitting(false);
    if (apiError) return setError(apiError.message);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
        <h2 className="text-xl font-semibold mb-4">Log Time Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task (optional)</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              disabled={!projectId}
            >
              <option value="">Select Task</option>
              {subTasks.filter(t => t.projectId === projectId).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 w-full"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="datetime-local"
                className="border rounded px-2 py-1 w-full"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={255}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={e => setIsBillable(e.target.checked)}
            />
            Billable
          </label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration: <span className="font-mono">{calcDuration() ? (Math.floor(calcDuration()/3600)).toString().padStart(2,'0')+":"+ (Math.floor((calcDuration()%3600)/60)).toString().padStart(2,'0')+":"+(calcDuration()%60).toString().padStart(2,'0') : "00:00:00"}</span></span>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}; 