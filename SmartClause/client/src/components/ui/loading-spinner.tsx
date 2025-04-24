import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className,
  label
}: LoadingSpinnerProps) {
  // Size variants
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };
  
  // Color variants for the spinner
  const colorClasses = {
    primary: 'border-t-primary',
    white: 'border-t-white'
  };
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-gray-200", 
        sizeClasses[size],
        colorClasses[color]
      )}></div>
      {label && <p className="mt-2 text-sm text-gray-600">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
