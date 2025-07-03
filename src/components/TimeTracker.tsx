
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { Project, SubTask } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface TimeTrackerProps {
  projects: Project[];
  subTasks: SubTask[];
}

export const TimeTracker = ({ projects, subTasks }: TimeTrackerProps) => {
  const { user } = useAuth();
  const { addTimeEntry } = useTimeEntryData();
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [projectId, setProjectId] = useState<string>("");
  const [taskId, setTaskId] = useState<string>("");
  const [note, setNote] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sf-timer");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.running && data.startTime) {
          setRunning(true);
          setStartTime(data.startTime);
          setProjectId(data.projectId || "");
          setTaskId(data.taskId || "");
          setNote(data.note || "");
          setElapsed(Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000));
        }
      } catch (error) {
        console.error("Error loading timer state:", error);
        localStorage.removeItem("sf-timer");
      }
    }
  }, []);

  // Persist timer state
  useEffect(() => {
    if (running && startTime) {
      localStorage.setItem(
        "sf-timer",
        JSON.stringify({ running, startTime, projectId, taskId, note })
      );
    } else {
      localStorage.removeItem("sf-timer");
    }
  }, [running, startTime, projectId, taskId, note]);

  // Timer interval
  useEffect(() => {
    if (running && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setElapsed(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [running, startTime]);

  const handleStart = () => {
    if (!projectId) {
      alert("Please select a project to start tracking.");
      return;
    }
    if (!user) {
      alert("Please log in to track time.");
      return;
    }
    const now = new Date().toISOString();
    setStartTime(now);
    setRunning(true);
  };

  const handleStop = async () => {
    if (!startTime || !user) return;
    
    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
      
      await addTimeEntry({
        projectId,
        taskId: taskId || null,
        userId: user.id,
        startTime,
        endTime,
        duration,
        note,
        isBillable: false,
      });
      
      // Reset state
      setRunning(false);
      setStartTime(null);
      setElapsed(0);
      setProjectId("");
      setTaskId("");
      setNote("");
    } catch (error) {
      console.error("Error stopping timer:", error);
      alert("Failed to save time entry. Please try again.");
    }
  };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-xl rounded-lg p-4 flex flex-col gap-3 w-80 border border-gray-200">
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1 flex-1 text-sm"
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
          className="border rounded px-2 py-1 flex-1 text-sm"
          value={taskId}
          onChange={e => setTaskId(e.target.value)}
          disabled={running || !projectId}
        >
          <option value="">Select Task (Optional)</option>
          {subTasks.filter(t => t.projectId === projectId).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      
      <input
        className="border rounded px-2 py-1 w-full text-sm"
        placeholder="Add a note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        disabled={running}
        maxLength={255}
      />
      
      <div className="flex items-center justify-between">
        <span className="font-mono text-xl font-bold text-gray-800">
          {formatElapsed(elapsed)}
        </span>
        {running ? (
          <Button 
            onClick={handleStop} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            size="sm"
          >
            Stop Timer
          </Button>
        ) : (
          <Button 
            onClick={handleStart} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            disabled={!projectId}
            size="sm"
          >
            Start Timer
          </Button>
        )}
      </div>
      
      {running && (
        <div className="text-xs text-gray-500 text-center">
          Tracking time for {projects.find(p => p.id === projectId)?.name}
        </div>
      )}
    </div>
  );
};
