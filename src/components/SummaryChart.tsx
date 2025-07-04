import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, TimeEntry } from "@/types";

interface SummaryChartProps {
  timeEntries: TimeEntry[];
  projects: Project[];
  formatDuration: (seconds: number) => string;
}

export function SummaryChart({ timeEntries, projects, formatDuration }: SummaryChartProps) {
  const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#DC2626'
  ];

  const getProjectColor = (projectId: string, projects: Project[]): string => {
    const index = projects.findIndex(p => p.id === projectId);
    return COLORS[index % COLORS.length];
  };

  // Prepare data for charts
  const projectData = timeEntries.reduce((acc, entry) => {
    const project = projects.find(p => p.id === entry.projectId);
    const projectName = project?.name || 'Unknown Project';
    
    if (!acc[projectName]) {
      acc[projectName] = {
        name: projectName,
        duration: 0,
        billableDuration: 0,
        color: getProjectColor(entry.projectId, projects),
      };
    }
    
    acc[projectName].duration += entry.duration;
    if (entry.isBillable) {
      acc[projectName].billableDuration += entry.duration;
    }
    
    return acc;
  }, {} as Record<string, { name: string; duration: number; billableDuration: number; color: string }>);

  const chartData = Object.values(projectData).map(item => ({
    ...item,
    hours: Math.round((item.duration / 3600) * 100) / 100,
    billableHours: Math.round((item.billableDuration / 3600) * 100) / 100,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Total: {formatDuration(payload[0].payload.duration)}
          </p>
          {payload[0].payload.billableDuration > 0 && (
            <p className="text-green-600">
              Billable: {formatDuration(payload[0].payload.billableDuration)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No time entries to display</p>
          </div>
        ) : (
          <Tabs defaultValue="pie" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pie" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="bar" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="hours" fill="#3B82F6" name="Total Hours" />
                  <Bar dataKey="billableHours" fill="#10B981" name="Billable Hours" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}