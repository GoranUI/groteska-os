
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadCardProps {
  file: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUploadCard = ({ file, onFileUpload, onDragOver, onDrop }: FileUploadCardProps) => {
  return (
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
          onDragOver={onDragOver}
          onDrop={onDrop}
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
                onChange={onFileUpload}
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
  );
};
