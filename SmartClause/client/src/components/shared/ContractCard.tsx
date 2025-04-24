import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import RiskBadge from '@/components/ui/risk-badge';

interface ContractCardProps {
  id: number;
  name: string;
  date: string;
  riskScore: string;
  contractType: string;
  fileType: string;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ContractCard({
  id,
  name,
  date,
  riskScore,
  contractType,
  fileType,
  onView,
  onDownload,
  onDelete
}: ContractCardProps) {
  const handleView = () => {
    if (onView) onView(id);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) onDownload(id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };
  
  // Get file icon based on file type
  const getFileIcon = () => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <i className="fas fa-file-pdf text-red-500 mr-3"></i>;
      case 'docx':
      case 'doc':
        return <i className="fas fa-file-word text-blue-500 mr-3"></i>;
      default:
        return <FileText className="text-gray-500 mr-3" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleView}>
      <td className="p-4">
        <div className="flex items-center">
          {getFileIcon()}
          <span className="font-medium text-gray-900">{name}</span>
        </div>
      </td>
      <td className="p-4 text-sm text-gray-600">{formatDate(date)}</td>
      <td className="p-4">
        <RiskBadge risk={riskScore} />
      </td>
      <td className="p-4 text-sm text-gray-600">{contractType}</td>
      <td className="p-4">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleView}
            className="text-primary-600 hover:text-primary-800"
            aria-label="View contract"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Download contract"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete contract"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
