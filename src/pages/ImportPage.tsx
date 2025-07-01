import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
}

const ImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { toast } = useToast();
  const { addExpense } = useSupabaseData();

  const categorizeExpense = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('upwork')) {
      return 'Office';
    }
    if (desc.includes('wolt') || desc.includes('glovo') || desc.includes('donesi')) {
      return 'External Food';
    }
    if (desc.includes('pekara') || desc.includes('hleb') || desc.includes('kifle')) {
      return 'Food';
    }
    if (desc.includes('zdravlja') || desc.includes('medigroup') || desc.includes('apoteka')) {
      return 'Utilities';
    }
    if (desc.includes('prevoz') || desc.includes('bus') || desc.includes('taxi')) {
      return 'Transport';
    }
    if (desc.includes('market') || desc.includes('shop') || desc.includes('store')) {
      return 'Food';
    }
    
    return 'Recurring';
  };

  const parseCSV = useCallback((csvText: string) => {
    const lines = csvText.split('\n');
    const expenses: ParsedExpense[] = [];
    
    // Find the header line (contains DATUM)
    const headerIndex = lines.findIndex(line => line.includes('DATUM'));
    if (headerIndex === -1) {
      throw new Error('CSV header not found. Please ensure the file contains DATUM column.');
    }
    
    // Process data lines (skip header)
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length < 4) continue;
      
      const dateStr = columns[0]?.trim();
      const description = columns[2]?.trim() || '';
      const amountStr = columns[3]?.trim() || '';
      
      // Parse Serbian date format (DD.MM.YYYY)
      if (!dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) continue;
      
      const [day, month, year] = dateStr.split('.');
      const date = `${year}-${month}-${day}`;
      
      // Parse Serbian amount format ("- 2.495,51 RSD")
      const amountMatch = amountStr.match(/[+-]?\s*(\d{1,3}(?:\.\d{3})*),(\d{2})/);
      if (!amountMatch) continue;
      
      const amount = parseFloat(amountMatch[1].replace(/\./g, '') + '.' + amountMatch[2]);
      if (isNaN(amount)) continue;
      
      const category = categorizeExpense(description);
      
      expenses.push({
        date,
        description: description.replace(/^Kupovina\s+/, ''),
        amount,
        category,
        currency: 'RSD'
      });
    }
    
    return expenses;
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      
      try {
        const parsed = parseCSV(text);
        setParsedExpenses(parsed);
        toast({
          title: "File parsed successfully",
          description: `Found ${parsed.length} expense records to import.`,
        });
      } catch (error) {
        toast({
          title: "Parse error",
          description: error instanceof Error ? error.message : "Failed to parse CSV file.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(selectedFile, 'utf-8');
  }, [parseCSV, toast]);

  const handleImport = async () => {
    if (parsedExpenses.length === 0) return;
    
    setIsProcessing(true);
    let success = 0;
    let failed = 0;
    
    for (const expense of parsedExpenses) {
      try {
        await addExpense({
          amount: expense.amount,
          currency: expense.currency as "USD" | "EUR" | "RSD",
          date: expense.date,
          category: expense.category as any,
          description: expense.description,
          isRecurring: false,
        });
        success++;
      } catch (error) {
        console.error('Failed to import expense:', error);
        failed++;
      }
    }
    
    setImportResults({ success, failed });
    setIsProcessing(false);
    
    toast({
      title: "Import completed",
      description: `Successfully imported ${success} expenses. ${failed} failed.`,
      variant: success > 0 ? "default" : "destructive",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      const event = { target: { files: [droppedFile] } } as any;
      handleFileUpload(event);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Import Expenses</h1>
        <p className="text-gray-600">Upload CSV files from your Serbian bank statement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload CSV File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" type="button">
                    Choose File
                  </Button>
                </Label>
              </div>
            </div>
            
            {file && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Selected file: <strong>{file.name}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
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
                  onClick={handleImport} 
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
      </div>

      {/* Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Supported CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Your CSV should have the following structure:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              <div>DATUM,TIP TRANSAKCIJE,OPIS,IZNOS</div>
              <div>01.07.2025,PLAĆANJE KARTICOM,Kupovina LOVABLE,"- 2.495,51 RSD"</div>
              <div>30.06.2025,PLAĆANJE KARTICOM,Kupovina Wolt doo,"- 1.619,32 RSD"</div>
              <div>01.07.2025,PLAĆANJE KARTICOM,Kupovina Upwork -822939118REF,"- 5.102,96 RSD"</div>
            </div>
            <p className="text-xs text-gray-500">
              • Dates in DD.MM.YYYY format<br/>
              • Amounts in Serbian format with comma as decimal separator<br/>
              • Expenses are automatically categorized:<br/>
              • Upwork → Office (outsourcing)<br/>
              • Wolt/Glovo → External Food<br/>
              • Pekara → Food<br/>
              • Health services → Utilities
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportPage;
