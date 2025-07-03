import { useEffect, useState } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { TimeEntry } from "@/types";
import { format, startOfDay, endOfDay } from "date-fns";

interface TimeEntryStateInspectorProps {
  selectedDate: Date;
  view: "day" | "week" | "month";
}

export const TimeEntryStateInspector = ({ selectedDate, view }: TimeEntryStateInspectorProps) => {
  const { user } = useAuth();
  const { timeEntries, loading, error } = useTimeEntryData();
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [timeEntries]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const getFilteredEntries = () => {
    if (!user) return [];
    
    let from: Date, to: Date;
    
    switch (view) {
      case "day":
        from = startOfDay(selectedDate);
        to = endOfDay(selectedDate);
        break;
      case "week":
        // Simplified for debugging
        from = startOfDay(selectedDate);
        to = endOfDay(selectedDate);
        break;
      case "month":
        // Simplified for debugging
        from = startOfDay(selectedDate);
        to = endOfDay(selectedDate);
        break;
      default:
        from = startOfDay(selectedDate);
        to = endOfDay(selectedDate);
    }

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= from && entryDate <= to;
    });
  };

  const filteredEntries = getFilteredEntries();

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setInspectorOpen(!inspectorOpen)}
        className="bg-red-600 text-white px-3 py-2 rounded text-sm font-mono"
      >
        State Inspector
      </button>
      
      {inspectorOpen && (
        <div className="absolute top-12 left-0 bg-black bg-opacity-95 text-white p-4 rounded-lg max-w-2xl text-xs font-mono">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Time Entry State Inspector</h3>
            <button
              onClick={() => setInspectorOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <div className="text-green-400 font-bold">Basic Info</div>
              <div>User ID: {user?.id || 'Not logged in'}</div>
              <div>Selected Date: {format(selectedDate, 'yyyy-MM-dd')}</div>
              <div>View: {view}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
              <div>Last Update: {format(lastUpdate, 'HH:mm:ss')}</div>
            </div>

            {/* State Counts */}
            <div>
              <div className="text-green-400 font-bold">State Counts</div>
              <div>Total Entries: {timeEntries.length}</div>
              <div>Filtered Entries: {filteredEntries.length}</div>
              <div>Date Range: {format(startOfDay(selectedDate), 'yyyy-MM-dd HH:mm')} to {format(endOfDay(selectedDate), 'yyyy-MM-dd HH:mm')}</div>
            </div>

            {/* All Entries */}
            <div>
              <div className="text-green-400 font-bold">All Entries ({timeEntries.length})</div>
              <div className="max-h-32 overflow-y-auto">
                {timeEntries.length === 0 ? (
                  <div className="text-gray-400">No entries</div>
                ) : (
                  timeEntries.map((entry, index) => (
                    <div key={entry.id} className="border-b border-gray-700 py-1">
                      <div>ID: {entry.id}</div>
                      <div>Project: {entry.projectId}</div>
                      <div>Start: {format(new Date(entry.startTime), 'yyyy-MM-dd HH:mm')}</div>
                      <div>Duration: {Math.floor(entry.duration / 60)}m</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filtered Entries */}
            <div>
              <div className="text-green-400 font-bold">Filtered Entries ({filteredEntries.length})</div>
              <div className="max-h-32 overflow-y-auto">
                {filteredEntries.length === 0 ? (
                  <div className="text-gray-400">No entries in current view</div>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <div key={entry.id} className="border-b border-gray-700 py-1">
                      <div>ID: {entry.id}</div>
                      <div>Project: {entry.projectId}</div>
                      <div>Start: {format(new Date(entry.startTime), 'HH:mm')}</div>
                      <div>Duration: {Math.floor(entry.duration / 60)}m</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filter Analysis */}
            <div>
              <div className="text-green-400 font-bold">Filter Analysis</div>
              {timeEntries.map((entry) => {
                const entryDate = new Date(entry.startTime);
                const from = startOfDay(selectedDate);
                const to = endOfDay(selectedDate);
                const isInRange = entryDate >= from && entryDate <= to;
                
                return (
                  <div key={entry.id} className={`py-1 ${isInRange ? 'text-green-300' : 'text-red-300'}`}>
                    {entry.id}: {isInRange ? 'IN RANGE' : 'OUT OF RANGE'} - {format(entryDate, 'yyyy-MM-dd HH:mm')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 