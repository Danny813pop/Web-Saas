import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryPoint {
  text: string;
  status: 'success' | 'warning' | 'danger';
}

interface ResultsSummaryProps {
  points: SummaryPoint[];
  className?: string;
}

export default function ResultsSummary({ points, className }: ResultsSummaryProps) {
  const getIcon = (status: SummaryPoint['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Key Points Summary</h2>
        
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li key={index} className="flex items-start">
              {getIcon(point.status)}
              <span>{point.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
