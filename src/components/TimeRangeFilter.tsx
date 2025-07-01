
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type TimeRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface TimeRangeFilterProps {
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

export const TimeRangeFilter = ({ onRangeChange, className }: TimeRangeFilterProps) => {
  const [range, setRange] = useState<TimeRange>({
    from: undefined,
    to: undefined,
  });

  const handleRangeSelect = (newRange: TimeRange) => {
    setRange(newRange);
    onRangeChange(newRange);
  };

  const handlePresetRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    const newRange = { from, to };
    setRange(newRange);
    onRangeChange(newRange);
  };

  const clearRange = () => {
    const newRange = { from: undefined, to: undefined };
    setRange(newRange);
    onRangeChange(newRange);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetRange(7)}
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetRange(30)}
        >
          Last 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetRange(90)}
        >
          Last 3 months
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal min-w-[120px]",
                !range.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range.from ? (
                range.to ? (
                  <>
                    {format(range.from, "MMM dd")} -{" "}
                    {format(range.to, "MMM dd")}
                  </>
                ) : (
                  format(range.from, "MMM dd, yyyy")
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={range.from}
              selected={{ from: range.from, to: range.to }}
              onSelect={(selectedRange) => {
                if (selectedRange) {
                  handleRangeSelect({
                    from: selectedRange.from,
                    to: selectedRange.to,
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {(range.from || range.to) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearRange}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
