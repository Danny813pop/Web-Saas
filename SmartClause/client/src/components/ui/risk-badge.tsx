import { cn, getRiskColor, getRiskLevelText } from "@/lib/utils";

interface RiskBadgeProps {
  risk: string; // 'low', 'medium', 'high'
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ risk, className, size = 'md' }: RiskBadgeProps) {
  // Set base styles based on risk level
  const baseClass = getRiskColor(risk);
  
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs rounded-full',
    md: 'px-2 py-1 text-xs font-medium rounded-full',
    lg: 'px-3 py-1 text-sm font-medium rounded-full'
  };
  
  return (
    <span className={cn(baseClass, sizeClasses[size], className)}>
      {getRiskLevelText(risk)}
    </span>
  );
}

export default RiskBadge;
