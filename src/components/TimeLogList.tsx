import { useState, useEffect } from "react";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { Project, SubTask, TimeEntry } from "@/types";
import { Button } from "@/components/ui/button";

interface TimeLogListProps {
  projects: Project[];
  subTasks: SubTask[];
  userId?: string;
  filterProjectId?: string;
  filterUserId?: string;
  filterFrom?: string;
  filterTo?: string;
}

export const TimeLogList = ({ projects, subTasks, userId, filterProjectId, filterUserId, filterFrom, filterTo }: TimeLogListProps) => {
  const { timeEntries, fetchTimeEntries, updateTimeEntry, deleteTimeEntry, loading, error } = useTimeEntryData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    fetchTimeEntries({
      projectId: filterProjectId,
      userId: filterUserId,
      from: filterFrom,
      to: filterTo,
    });
  }, [filterProjectId, filterUserId, filterFrom, filterTo, fetchTimeEntries]);

  const handleEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditNote(entry.note || "");
  };

  const handleSave = async (entry: TimeEntry) => {
    await updateTimeEntry(entry.id, { note: editNote });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this time entry?")) {
      await deleteTimeEntry(id);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Time Logs</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-2 text-left">Project</th>
            <th className="px-2 py-2 text-left">Task</th>
            <th className="px-2 py-2 text-left">Start</th>
            <th className="px-2 py-2 text-left">End</th>
            <th className="px-2 py-2 text-left">Duration</th>
            <th className="px-2 py-2 text-left">Note</th>
            <th className="px-2 py-2 text-left">Billable</th>
            <th className="px-2 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timeEntries.map((entry) => {
            const project = projects.find(p => p.id === entry.projectId);
            const task = subTasks.find(t => t.id === entry.taskId);
            return (
              <tr key={entry.id} className="border-b hover:bg-gray-50">
                <td className="px-2 py-1">{project ? project.name : "-"}</td>
                <td className="px-2 py-1">{task ? task.name : "-"}</td>
                <td className="px-2 py-1 font-mono">{formatDate(entry.startTime)}</td>
                <td className="px-2 py-1 font-mono">{entry.endTime ? formatDate(entry.endTime) : <span className="text-orange-600">Running</span>}</td>
                <td className="px-2 py-1 font-mono">{formatDuration(entry.duration)}</td>
                <td className="px-2 py-1">
                  {editingId === entry.id ? (
                    <input
                      className="border rounded px-1 py-0.5 w-32"
                      value={editNote}
                      onChange={e => setEditNote(e.target.value)}
                      maxLength={255}
                    />
                  ) : (
                    entry.note || "-"
                  )}
                </td>
                <td className="px-2 py-1">{entry.isBillable ? <span className="text-green-600">Yes</span> : "No"}</td>
                <td className="px-2 py-1 flex gap-1">
                  {editingId === entry.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(entry)} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                      <Button size="sm" onClick={() => setEditingId(null)} className="bg-gray-200">Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => handleEdit(entry)} className="bg-blue-50 hover:bg-blue-100 text-blue-700">Edit</Button>
                      <Button size="sm" onClick={() => handleDelete(entry.id)} className="bg-red-50 hover:bg-red-100 text-red-700">Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {timeEntries.length === 0 && !loading && <div className="text-gray-500 py-4">No time entries found.</div>}
    </div>
  );
}; 