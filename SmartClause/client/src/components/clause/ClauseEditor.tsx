import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, RefreshCw, Plus } from 'lucide-react';

interface ClauseEditorProps {
  title?: string;
  content: string;
  legalContext?: string;
  onRegenerate?: () => void;
  onSave?: (content: string) => void;
  className?: string;
}

export default function ClauseEditor({
  title = "Generated Clause",
  content,
  legalContext,
  onRegenerate,
  onSave,
  className
}: ClauseEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopy}
              aria-label={copySuccess ? "Copied!" : "Copy to clipboard"}
              title={copySuccess ? "Copied!" : "Copy to clipboard"}
            >
              <Copy className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              aria-label="Download"
              title="Download as text file"
            >
              <Download className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50 mb-4">
          <textarea
            className="w-full bg-gray-50 text-gray-800 text-sm font-mono leading-relaxed focus:outline-none resize-none min-h-[200px]"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>
        
        {legalContext && (
          <div className="bg-primary-50 border border-primary-100 rounded-md p-4 mb-4">
            <h3 className="text-sm font-semibold text-primary-800 flex items-center">
              <i className="fas fa-lightbulb mr-2 text-primary-500"></i> Legal Context
            </h3>
            <p className="text-sm text-gray-700 mt-2">{legalContext}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          {onRegenerate && (
            <Button 
              variant="outline" 
              onClick={onRegenerate}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
            </Button>
          )}
          {onSave && (
            <Button 
              onClick={handleSave}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add to Contract
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
