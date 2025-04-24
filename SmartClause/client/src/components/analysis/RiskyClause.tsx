import { Card, CardContent } from '@/components/ui/card';
import { getRiskColor } from '@/lib/utils';

interface RiskyClauseProps {
  sectionTitle: string;
  clauseText: string;
  riskLevel: string;
  suggestion: string;
  className?: string;
}

export default function RiskyClause({ 
  sectionTitle, 
  clauseText, 
  riskLevel, 
  suggestion,
  className 
}: RiskyClauseProps) {
  // Get the appropriate colors based on risk level
  const borderClass = 
    riskLevel === 'high' ? 'border-red-500' :
    riskLevel === 'medium' ? 'border-yellow-500' :
    'border-green-500';
  
  const bgClass = 
    riskLevel === 'high' ? 'bg-red-50' :
    riskLevel === 'medium' ? 'bg-yellow-50' :
    'bg-green-50';
    
  const textClass = 
    riskLevel === 'high' ? 'text-red-600' :
    riskLevel === 'medium' ? 'text-yellow-600' :
    'text-green-600';

  return (
    <div className={`border-l-4 ${borderClass} rounded-r-md ${bgClass} p-4 ${className}`}>
      <h3 className={`font-medium ${textClass}`}>{sectionTitle}</h3>
      <p className="text-gray-800 mt-1 text-sm">
        "{clauseText}"
      </p>
      
      {suggestion && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-gray-600 uppercase">AI Suggestion:</h4>
          <p className="text-sm text-gray-800 mt-1">
            "{suggestion}"
          </p>
        </div>
      )}
    </div>
  );
}
