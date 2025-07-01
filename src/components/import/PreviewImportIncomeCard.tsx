
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ParsedIncome } from "@/utils/incomeParser";

interface PreviewImportIncomeCardProps {
  parsedIncomes: ParsedIncome[];
  isProcessing: boolean;
  importResults: { success: number; failed: number } | null;
  onImport: () => void;
}

export const PreviewImportIncomeCard = ({
  parsedIncomes,
  isProcessing,
  importResults,
  onImport
}: PreviewImportIncomeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parsedIncomes.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Found {parsedIncomes.length} income records ready to import
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {parsedIncomes.slice(0, 5).map((income, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <div className="font-medium">{income.client}</div>
                    <div className="text-gray-500">{income.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      +{income.amount.toLocaleString()} {income.currency}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {income.category}
                    </Badge>
                  </div>
                </div>
              ))}
              {parsedIncomes.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {parsedIncomes.length - 5} more
                </div>
              )}
            </div>

            <Button 
              onClick={onImport} 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {parsedIncomes.length} Income Records
                </>
              )}
            </Button>

            {importResults && (
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{importResults.success} imported</span>
                </div>
                {importResults.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{importResults.failed} failed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Upload a CSV file to see preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
