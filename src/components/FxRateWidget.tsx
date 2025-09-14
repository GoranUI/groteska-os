import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Edit3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FxRateResponse, FxRateUpdate } from '@/types/finance';

interface FxRateWidgetProps {
  rate: number;
  updatedAt: string;
  source: 'manual' | 'provider';
  onRefresh: () => void;
  onUpdate: (update: FxRateUpdate) => Promise<void>;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const FxRateWidget = ({
  rate,
  updatedAt,
  source,
  onRefresh,
  onUpdate,
  loading = false,
  error,
  className
}: FxRateWidgetProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualRate, setManualRate] = useState(rate.toString());
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    const newRate = parseFloat(manualRate);
    if (isNaN(newRate) || newRate <= 0) return;

    setIsUpdating(true);
    try {
      await onUpdate({ rate: newRate, note: note.trim() || undefined });
      setIsDialogOpen(false);
      setNote('');
    } catch (err) {
      console.error('Failed to update FX rate:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getSourceIcon = () => {
    switch (source) {
      case 'manual':
        return <Edit3 className="h-3 w-3" />;
      case 'provider':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getSourceColor = () => {
    switch (source) {
      case 'manual':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'provider':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">USD to RSD Rate</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Exchange Rate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate">USD to RSD Rate</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      placeholder="Enter new rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Reason for manual update..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={isUpdating || !manualRate || parseFloat(manualRate) <= 0}
                    >
                      {isUpdating ? 'Updating...' : 'Update Rate'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              1 USD = {rate.toFixed(2)} RSD
            </span>
            <Badge className={cn('text-xs', getSourceColor())}>
              {getSourceIcon()}
              <span className="ml-1 capitalize">{source}</span>
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated {format(new Date(updatedAt), 'MMM dd, yyyy HH:mm')}</span>
          </div>

          {error && (
            <div className="flex items-center text-xs text-destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <div className="font-medium">Formula:</div>
            <div>Total RSD = RSD Balance + (USD Balance × {rate.toFixed(2)})</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
