
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTimeEntryData } from "@/hooks/data/useTimeEntryData";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, subWeeks } from "date-fns";

interface TimeSummaryCardsProps {
  selectedDate: Date;
  activeView: "day" | "week" | "month";
}

export const TimeSummaryCards = ({ selectedDate, activeView }: TimeSummaryCardsProps) => {
  const { user } = useAuth();
  const { timeEntries, fetchTimeEntries } = useTimeEntryData();
  const [totalTime, setTotalTime] = useState(0);
  const [lastWeekTime, setLastWeekTime] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when timeEntries change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [timeEntries]);

  useEffect(() => {
    if (!user) return;

    let from: string, to: string;
    
    switch (activeView) {
      case "day":
        from = startOfDay(selectedDate).toISOString();
        to = endOfDay(selectedDate).toISOString();
        break;
      case "week":
        from = startOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
        to = endOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
        break;
      case "month":
        from = startOfMonth(selectedDate).toISOString();
        to = endOfMonth(selectedDate).toISOString();
        break;
    }

    // Fetch current period data
    fetchTimeEntries({
      userId: user.id,
      from,
      to,
    });

    // Fetch last week's data for comparison
    const lastWeekStart = startOfWeek(subWeeks(selectedDate, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(selectedDate, 1), { weekStartsOn: 1 });
    
    fetchTimeEntries({
      userId: user.id,
      from: lastWeekStart.toISOString(),
      to: lastWeekEnd.toISOString(),
    }).then(result => {
      if (result?.data) {
        const lastWeekTotal = result.data.reduce((sum: number, entry: any) => sum + entry.duration, 0);
        setLastWeekTime(lastWeekTotal);
      }
    });
  }, [selectedDate, activeView, user, fetchTimeEntries, refreshKey]);

  useEffect(() => {
    const total = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    setTotalTime(total);
  }, [timeEntries]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPeriodLabel = () => {
    switch (activeView) {
      case "day":
        return format(selectedDate, "EEEE, MMM dd");
      case "week":
        return `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM dd")}`;
      case "month":
        return format(selectedDate, "MMMM yyyy");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total time</p>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(totalTime)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">This {activeView}</p>
            <p className="text-2xl font-bold text-blue-600">{formatDuration(totalTime)}</p>
            <p className="text-xs text-gray-500">{getCurrentPeriodLabel()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Last week</p>
            <p className="text-2xl font-bold text-gray-700">{formatDuration(lastWeekTime)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
