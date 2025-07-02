
import { useState, useCallback } from 'react';
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { parseCSV, ParsedExpense } from "@/utils/csvParser";
import { FileUploadCard } from "@/components/import/FileUploadCard";
import { PreviewImportCard } from "@/components/import/PreviewImportCard";
import { FormatGuideCard } from "@/components/import/FormatGuideCard";

const ImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const { showSuccess, showError } = useToastNotifications();
  const { isLoading, setLoading } = useLoadingStates();
  const { handleAsyncError } = useErrorHandler();
  const { addExpense } = useSupabaseData();
  const isProcessing = isLoading('import');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      showError("Invalid file type", "Please select a CSV file.");
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
        showSuccess("File parsed successfully", `Found ${parsed.length} expense records to import.`);
      } catch (error) {
        showError("Parse error", error instanceof Error ? error.message : "Failed to parse CSV file.");
      }
    };
    
    reader.readAsText(selectedFile, 'utf-8');
  }, [showSuccess, showError]);

  const handleImport = async () => {
    if (parsedExpenses.length === 0) return;
    
    setLoading('import', true);
    let success = 0;
    let failed = 0;
    
    for (const expense of parsedExpenses) {
      const result = await handleAsyncError(
        () => addExpense({
          amount: expense.amount,
          currency: expense.currency as "USD" | "EUR" | "RSD",
          date: expense.date,
          category: expense.category as any,
          description: expense.description,
          isRecurring: false,
        }),
        { operation: "import expense", component: "ImportPage" }
      );
      
      if (result !== null) {
        success++;
      } else {
        failed++;
      }
    }
    
    setImportResults({ success, failed });
    setLoading('import', false);
    
    if (success > 0) {
      showSuccess("Import completed", `Successfully imported ${success} expenses. ${failed} failed.`);
    } else {
      showError("Import failed", `Failed to import all ${failed} expenses.`);
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Import Expenses</h1>
        <p className="text-muted-foreground">Upload CSV files from your Serbian bank statement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

export default ImportPage;
