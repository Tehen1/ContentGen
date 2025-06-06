"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface HistoryFileUploaderProps {
  onFileLoaded: (data: any) => void;
}

export function HistoryFileUploader({ onFileLoaded }: HistoryFileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check if it's a JSON file
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };
    
    reader.onload = () => {
      try {
        const jsonData = JSON.parse(reader.result as string);
        onFileLoaded(jsonData);
        toast({
          title: "Success",
          description: `Successfully loaded ${file.name}`,
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast({
          title: "Error parsing file",
          description: "The selected file contains invalid JSON data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "An error occurred while reading the file",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          Browse
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Loading {fileName}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Select a JSON file containing your activity history data.
        Supports Google Location History or fitness app export formats.
      </p>
    </div>
  );
}
