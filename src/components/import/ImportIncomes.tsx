
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { parseIncomeCSV, ParsedIncome } from "@/utils/incomeParser";
import { FileUploadCard } from "./FileUploadCard";
import { PreviewImportIncomeCard } from "./PreviewImportIncomeCard";
import { IncomeFormatGuideCard } from "./IncomeFormatGuideCard";

export const ImportIncomes = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [parsedIncomes, setParsedIncomes] = useState<ParsedIncome[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { toast } = useToast();
  const { addIncomeBulk } = useSupabaseData();

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
        const parsed = parseIncomeCSV(text);
        setParsedIncomes(parsed);
        toast({
          title: "File parsed successfully",
          description: `Found ${parsed.length} income records to import.`,
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
    if (parsedIncomes.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const incomesToAdd = parsedIncomes.map(income => ({
        amount: income.amount,
        currency: income.currency as "USD" | "EUR" | "RSD",
        client: income.client,
        date: income.date,
        category: income.category as "main-bank" | "savings" | "cash" | "one-time",
        description: income.description,
      }));

      const result = await addIncomeBulk(incomesToAdd);
      setImportResults(result);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${result.success} incomes. ${result.failed} failed.`,
        variant: result.success > 0 ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Failed to import incomes:', error);
      toast({
        title: "Import failed",
        description: "An error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
        <p className="text-gray-600">Upload CSV files from your Serbian bank statement for income tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadCard
          file={file}
          onFileUpload={handleFileUpload}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        <PreviewImportIncomeCard
          parsedIncomes={parsedIncomes}
          isProcessing={isProcessing}
          importResults={importResults}
          onImport={handleImport}
        />
      </div>

      <IncomeFormatGuideCard />
    </div>
  );
};
