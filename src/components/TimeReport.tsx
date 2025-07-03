import { useState, useEffect } from "react";
import { Project, SubTask, TimeEntry } from "@/types";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

interface TimeReportProps {
  projects: Project[];
  subTasks: SubTask[];
  users: { id: string; name: string }[];
}

export const TimeReport = ({ projects, subTasks, users }: TimeReportProps) => {
  const { timeEntries, fetchTimeEntries, loading } = useTimeEntryData();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetchTimeEntries({
      userId: selectedUser || undefined,
      projectId: selectedProject || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  }, [selectedUser, selectedProject, from, to, fetchTimeEntries]);

  // Calculate totals
  const totalSeconds = timeEntries.reduce((sum, t) => sum + t.duration, 0);
  const billableSeconds = timeEntries.filter(t => t.isBillable).reduce((sum, t) => sum + t.duration, 0);
  // Calculate billable amount (using project or task rate)
  const billableAmount = timeEntries.filter(t => t.isBillable).reduce((sum, t) => {
    const project = projects.find(p => p.id === t.projectId);
    const task = subTasks.find(st => st.id === t.taskId);
    const rate = (task?.hourlyRate || project?.hourlyRate || 0);
    return sum + (rate * (t.duration / 3600));
  }, 0);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ["Project", "Task", "User", "Start", "End", "Duration (h)", "Billable", "Amount"],
      ...timeEntries.map(t => {
        const project = projects.find(p => p.id === t.projectId);
        const task = subTasks.find(st => st.id === t.taskId);
        const user = users.find(u => u.id === t.userId);
        const rate = (task?.hourlyRate || project?.hourlyRate || 0);
        const amount = t.isBillable ? (rate * (t.duration / 3600)) : 0;
        return [
          project?.name || "-",
          task?.name || "-",
          user?.name || t.userId,
          t.startTime,
          t.endTime || "-",
          (t.duration / 3600).toFixed(2),
          t.isBillable ? "Yes" : "No",
          amount.toFixed(2),
        ];
      })
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "time_report.csv");
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Time Report", 10, 10);
    let y = 20;
    timeEntries.forEach(t => {
      const project = projects.find(p => p.id === t.projectId);
      const task = subTasks.find(st => st.id === t.taskId);
      const user = users.find(u => u.id === t.userId);
      const rate = (task?.hourlyRate || project?.hourlyRate || 0);
      const amount = t.isBillable ? (rate * (t.duration / 3600)) : 0;
      doc.text(
        `${project?.name || "-"} | ${task?.name || "-"} | ${user?.name || t.userId} | ${(t.duration / 3600).toFixed(2)}h | ${t.isBillable ? "Billable" : "Non-billable"} | $${amount.toFixed(2)}`,
        10,
        y
      );
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("time_report.pdf");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Time Report</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <select className="border rounded px-2 py-1" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="date" className="border rounded px-2 py-1" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" className="border rounded px-2 py-1" value={to} onChange={e => setTo(e.target.value)} />
        <Button onClick={handleExportCSV} className="bg-blue-50 hover:bg-blue-100 text-blue-700">Export CSV</Button>
        <Button onClick={handleExportPDF} className="bg-blue-50 hover:bg-blue-100 text-blue-700">Export PDF</Button>
      </div>
      <div className="flex gap-8 mb-4">
        <div>
          <div className="text-gray-600">Total Time</div>
          <div className="font-mono text-xl">{formatDuration(totalSeconds)}</div>
        </div>
        <div>
          <div className="text-gray-600">Billable Time</div>
          <div className="font-mono text-xl">{formatDuration(billableSeconds)}</div>
        </div>
        <div>
          <div className="text-gray-600">Billable Amount</div>
          <div className="font-mono text-xl">${billableAmount.toFixed(2)}</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left">Project</th>
              <th className="px-2 py-2 text-left">Task</th>
              <th className="px-2 py-2 text-left">User</th>
              <th className="px-2 py-2 text-left">Start</th>
              <th className="px-2 py-2 text-left">End</th>
              <th className="px-2 py-2 text-left">Duration (h)</th>
              <th className="px-2 py-2 text-left">Billable</th>
              <th className="px-2 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map(t => {
              const project = projects.find(p => p.id === t.projectId);
              const task = subTasks.find(st => st.id === t.taskId);
              const user = users.find(u => u.id === t.userId);
              const rate = (task?.hourlyRate || project?.hourlyRate || 0);
              const amount = t.isBillable ? (rate * (t.duration / 3600)) : 0;
              return (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1">{project?.name || "-"}</td>
                  <td className="px-2 py-1">{task?.name || "-"}</td>
                  <td className="px-2 py-1">{user?.name || t.userId}</td>
                  <td className="px-2 py-1 font-mono">{t.startTime}</td>
                  <td className="px-2 py-1 font-mono">{t.endTime || "-"}</td>
                  <td className="px-2 py-1 font-mono">{(t.duration / 3600).toFixed(2)}</td>
                  <td className="px-2 py-1">{t.isBillable ? <span className="text-green-600">Yes</span> : "No"}</td>
                  <td className="px-2 py-1 font-mono">${amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {timeEntries.length === 0 && !loading && <div className="text-gray-500 py-4">No time entries found.</div>}
    </div>
  );
}; 