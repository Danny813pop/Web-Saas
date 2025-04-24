import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  className?: string;
}

export default function ChatMessage({ 
  role, 
  content, 
  timestamp,
  className 
}: ChatMessageProps) {
  // Styles based on role
  const isUser = role === 'user';
  
  const containerClasses = cn(
    "flex mb-4",
    isUser ? "justify-end" : "",
    className
  );
  
  const messageClasses = cn(
    "rounded-lg py-2 px-4 max-w-[75%]",
    isUser 
      ? "bg-primary-100 text-primary-800" 
      : "bg-gray-100 text-gray-800"
  );
  
  return (
    <div className={containerClasses}>
      <div className={messageClasses}>
        <p>{content}</p>
        {timestamp && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
