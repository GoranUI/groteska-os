
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { Project, SubTask } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Play, Square, Clock } from "lucide-react";

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
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center py-6">
          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            {formatElapsed(elapsed)}
          </div>
          {running && projectId && (
            <div className="text-sm text-gray-600">
              Tracking: {projects.find(p => p.id === projectId)?.name}
            </div>
          )}
        </div>

        {/* Project Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              disabled={running}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task (Optional)
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What are you working on?"
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={running}
              maxLength={255}
            />
          </div>
        </div>

        {/* Start/Stop Button */}
        <div className="pt-2">
          {running ? (
            <Button 
              onClick={handleStop} 
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Timer
            </Button>
          ) : (
            <Button 
              onClick={handleStart} 
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              disabled={!projectId}
            >
              <Play className="h-4 w-4" />
              Start Timer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
