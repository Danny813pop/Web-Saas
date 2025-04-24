import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  id: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect?: (file: File) => void;
  className?: string;
  helperText?: string;
}

export function FileUpload({
  id,
  label = 'Upload File',
  accept = '.pdf,.docx',
  maxSize = 10, // Default 10MB
  onFileSelect,
  className,
  helperText = 'Supported formats: PDF, DOCX (Max size: 10MB)'
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSize}MB`);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    // Reset the input value
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <div className={className}>
      <input 
        type="file" 
        id={id} 
        className="hidden" 
        accept={accept}
        onChange={handleFileChange}
      />
      
      <div className={cn(
        "border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors",
        !selectedFile && "hover:border-primary hover:bg-primary/5 cursor-pointer"
      )}>
        {!selectedFile ? (
          <label htmlFor={id} className="cursor-pointer block">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-1">Drag and drop your file here or</p>
            <span className="text-primary-600 font-medium">browse files</span>
            {helperText && (
              <p className="text-gray-400 text-xs mt-2">{helperText}</p>
            )}
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-5 w-5 text-primary mr-2" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={clearFile}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Remove file"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FileUpload;
