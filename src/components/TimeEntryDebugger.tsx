import { useEffect, useState } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { TimeEntry } from "@/types";

export const TimeEntryDebugger = () => {
  const { timeEntries } = useTimeEntryData();
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    const handleTimeEntryAdded = (event: CustomEvent) => {
      const log = `[${new Date().toISOString()}] timeEntryAdded event received: ${JSON.stringify(event.detail)}`;
      setDebugLog(prev => [...prev.slice(-9), log]);
    };

    window.addEventListener('timeEntryAdded', handleTimeEntryAdded as EventListener);
    return () => window.removeEventListener('timeEntryAdded', handleTimeEntryAdded as EventListener);
  }, []);

  useEffect(() => {
    const log = `[${new Date().toISOString()}] timeEntries updated: ${timeEntries.length} entries`;
    setDebugLog(prev => [...prev.slice(-9), log]);
  }, [timeEntries]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <div className="font-bold mb-2">Time Entry Debugger</div>
      <div className="space-y-1">
        {debugLog.map((log, index) => (
          <div key={index} className="text-green-400">{log}</div>
        ))}
      </div>
      <div className="mt-2 text-gray-300">
        Current entries: {timeEntries.length}
      </div>
    </div>
  );
}; 