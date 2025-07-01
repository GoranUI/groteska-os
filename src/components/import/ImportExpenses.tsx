
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { parseCSV, ParsedExpense } from "@/utils/csvParser";
import { FileUploadCard } from "./FileUploadCard";
import { PreviewImportCard } from "./PreviewImportCard";
import { FormatGuideCard } from "./FormatGuideCard";

export const ImportExpenses = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { toast } = useToast();
  const { addExpense } = useSupabaseData();

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
  }, [toast]);

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
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-gray-600">Upload CSV files from your Serbian bank statement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadCard
          file={file}
          onFileUpload={handleFileUpload}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        <PreviewImportCard
          parsedExpenses={parsedExpenses}
          isProcessing={isProcessing}
          importResults={importResults}
          onImport={handleImport}
        />
      </div>

      <FormatGuideCard />
    </div>
  );
};
