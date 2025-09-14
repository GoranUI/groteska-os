import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PeriodFilter as PeriodFilterType } from '@/types/finance';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (filter: PeriodFilterType) => void;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'QTD', label: 'Quarter to date' },
  { value: 'YTD', label: 'Year to date' },
  { value: 'custom', label: 'Custom range' },
];

export const PeriodFilter = ({ value, onChange, className }: PeriodFilterProps) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const handlePeriodChange = (periodType: string) => {
    if (periodType === 'custom') {
      setIsCustomOpen(true);
      return;
    }

    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (periodType) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'QTD':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        from = quarterStart;
        break;
      case 'YTD':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    onChange({
      type: periodType as PeriodFilterType['type'],
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    });
  };

  const handleCustomRangeApply = () => {
    if (customFrom && customTo) {
      onChange({
        type: 'custom',
        from: customFrom.toISOString().split('T')[0],
        to: customTo.toISOString().split('T')[0],
      });
      setIsCustomOpen(false);
    }
  };

  const getDisplayText = () => {
    if (value.type === 'custom' && value.from && value.to) {
      return `${format(new Date(value.from), 'MMM dd')} - ${format(new Date(value.to), 'MMM dd, yyyy')}`;
    }
    
    const option = PERIOD_OPTIONS.find(opt => opt.value === value.type);
    return option?.label || 'Select period';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value.type} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.type === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                  className="rounded-md border"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCustomOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCustomRangeApply}
                  disabled={!customFrom || !customTo}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {value.type !== 'custom' && (
        <div className="text-sm text-muted-foreground">
          {getDisplayText()}
        </div>
      )}
    </div>
  );
};
