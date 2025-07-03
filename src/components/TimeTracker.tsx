import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { Project, SubTask } from "@/types";

interface TimeTrackerProps {
  projects: Project[];
  subTasks: SubTask[];
  userId: string;
}

export const TimeTracker = ({ projects, subTasks, userId }: TimeTrackerProps) => {
  const { addTimeEntry } = useTimeEntryData();
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [projectId, setProjectId] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  const [note, setNote] = useState("");
  const [isBillable, setIsBillable] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sf-timer");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.running && data.startTime) {
        setRunning(true);
        setStartTime(data.startTime);
        setProjectId(data.projectId || "");
        setTaskId(data.taskId || "");
        setNote(data.note || "");
        setIsBillable(!!data.isBillable);
        setElapsed(Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000));
      }
    }
  }, []);

  // Persist timer state
  useEffect(() => {
    if (running && startTime) {
      localStorage.setItem(
        "sf-timer",
        JSON.stringify({ running, startTime, projectId, taskId, note, isBillable })
      );
    } else {
      localStorage.removeItem("sf-timer");
    }
  }, [running, startTime, projectId, taskId, note, isBillable]);

  // Timer interval
  useEffect(() => {
    if (running && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current!);
    } else {
      setElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [running, startTime]);

  const handleStart = () => {
    if (!projectId) return alert("Select a project to start tracking.");
    const now = new Date().toISOString();
    setStartTime(now);
    setRunning(true);
  };

  const handleStop = async () => {
    if (!startTime) return;
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
    await addTimeEntry({
      projectId,
      taskId: taskId || null,
      userId,
      startTime,
      endTime,
      duration,
      note,
      isBillable,
    });
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setProjectId("");
    setTaskId("");
    setNote("");
    setIsBillable(false);
  };

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-xl rounded-lg p-4 flex flex-col gap-2 w-80 border border-gray-200">
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1 flex-1"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          disabled={running}
        >
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1 flex-1"
          value={taskId}
          onChange={e => setTaskId(e.target.value)}
          disabled={running || !projectId}
        >
          <option value="">Select Task</option>
          {subTasks.filter(t => t.projectId === projectId).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <input
        className="border rounded px-2 py-1 w-full"
        placeholder="Note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        disabled={running}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isBillable}
          onChange={e => setIsBillable(e.target.checked)}
          disabled={running}
        />
        Billable
      </label>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-2xl">{formatElapsed(elapsed)}</span>
        {running ? (
          <Button onClick={handleStop} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Stop
          </Button>
        ) : (
          <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Start
          </Button>
        )}
      </div>
    </div>
  );
}; 