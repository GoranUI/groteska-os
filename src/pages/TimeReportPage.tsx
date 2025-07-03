
import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useProjectData } from "@/hooks/data/useProjectData";
import { useSubTaskData } from "@/hooks/data/useSubTaskData";
import { useAuth } from "@/hooks/useAuth";
import { TimeTracker } from "@/components/TimeTracker";
import { TimelineView } from "@/components/TimelineView";
import { TimeEntryList } from "@/components/TimeEntryList";
import { TimeSummaryCards } from "@/components/TimeSummaryCards";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { TimeEntryDebugger } from "@/components/TimeEntryDebugger";
import { TimeEntryStateInspector } from "@/components/TimeEntryStateInspector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart3 } from "lucide-react";

export default function TimeReportPage() {
  const { user } = useAuth();
  const { clients } = useSupabaseData();
  const { projects } = useProjectData();
  const { subTasks } = useSubTaskData();
  const [activeView, setActiveView] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access time tracking</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Time Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <TimeEntryForm projects={projects} subTasks={subTasks} />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Time Summary Cards */}
        <TimeSummaryCards 
          selectedDate={selectedDate}
          activeView={activeView}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Timeline and Entry List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline View */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Timeline</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeView === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveView("day")}
                    >
                      Day
                    </Button>
                    <Button
                      variant={activeView === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveView("week")}
                    >
                      Week
                    </Button>
                    <Button
                      variant={activeView === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveView("month")}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TimelineView 
                  selectedDate={selectedDate}
                  view={activeView}
                  projects={projects}
                  subTasks={subTasks}
                />
              </CardContent>
            </Card>

            {/* Time Entry List */}
            <TimeEntryList 
              projects={projects}
              subTasks={subTasks}
              selectedDate={selectedDate}
              view={activeView}
            />
          </div>

          {/* Timer Widget */}
          <div className="lg:col-span-1">
            <TimeTracker projects={projects} subTasks={subTasks} />
          </div>
        </div>
      </div>
      
      {/* Debug Components */}
      <TimeEntryDebugger />
      <TimeEntryStateInspector selectedDate={selectedDate} view={activeView} />
    </div>
  );
}
