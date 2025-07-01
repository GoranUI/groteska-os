
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { ParsedExpense } from "@/utils/csvParser";

interface PreviewImportCardProps {
  parsedExpenses: ParsedExpense[];
  isProcessing: boolean;
  importResults: { success: number; failed: number } | null;
  onImport: () => void;
}

export const PreviewImportCard = ({ 
  parsedExpenses, 
  isProcessing, 
  importResults, 
  onImport 
}: PreviewImportCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parsedExpenses.length > 0 && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Found <strong>{parsedExpenses.length}</strong> expense records
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {parsedExpenses.slice(0, 5).map((expense, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        -{expense.amount.toLocaleString()} {expense.currency}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                ))}
                {parsedExpenses.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    ... and {parsedExpenses.length - 5} more
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={onImport} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Importing...' : `Import ${parsedExpenses.length} Expenses`}
            </Button>
          </>
        )}
        
        {importResults && (
          <Alert className={importResults.success > 0 ? "border-green-200" : "border-red-200"}>
            {importResults.success > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              Import completed: {importResults.success} successful, {importResults.failed} failed
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
