import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/loading-spinner';
import FileUpload from '@/components/ui/file-upload';
import ChatMessage from '@/components/qa/ChatMessage';
import { Contract, Conversation, Message } from '@shared/schema';
import { Layers, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function QA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
  // Fetch user's contracts
  const { 
    data: contracts, 
    isLoading: isLoadingContracts 
  } = useQuery<Contract[]>({
    queryKey: ['/api/contracts/user/' + user?.id],
    enabled: !!user?.id,
  });
  
  // Fetch conversations for selected contract
  const { 
    data: conversations, 
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery<Conversation[]>({
    queryKey: [`/api/conversations/contract/${selectedContractId}`],
    enabled: !!selectedContractId,
  });
  
  // Set initial conversation or create a new one
  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversation) {
      setConversation(conversations[0]);
      setMessages(conversations[0].messages);
    }
  }, [conversations, conversation]);
  
  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { userId: number, contractId: number, messages: Message[] }) => {
      return apiRequest('POST', '/api/conversation', data);
    },
    onSuccess: (response) => {
      response.json().then((data: Conversation) => {
        setConversation(data);
        setMessages(data.messages);
        refetchConversations();
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (data: { question: string }) => {
      setIsLoading(true);
      return apiRequest('POST', `/api/conversation/${conversation?.id}/message`, data);
    },
    onSuccess: (response) => {
      response.json().then((data: Conversation) => {
        setMessages(data.messages);
        setQuestion('');
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  // Direct Q&A mutation (without saving conversation)
  const directQAMutation = useMutation({
    mutationFn: async (data: { contractId: number, question: string }) => {
      setIsLoading(true);
      return apiRequest('POST', '/api/contract-qa', data);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        const userMsg: Message = {
          id: uuidv4(),
          role: 'user',
          content: question,
          timestamp: new Date().toISOString()
        };
        
        const aiMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString()
        };
        
        setMessages([...messages, userMsg, aiMsg]);
        setQuestion('');
        
        // If this is the first message and we don't have a conversation yet, create one
        if (!conversation && selectedContractId) {
          createConversationMutation.mutate({
            userId: user?.id || 0,
            contractId: parseInt(selectedContractId),
            messages: [...messages, userMsg, aiMsg]
          });
        }
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Handle sending a question
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      return;
    }
    
    if (!selectedContractId) {
      toast({
        title: "No contract selected",
        description: "Please select a contract to ask questions about.",
        variant: "destructive",
      });
      return;
    }
    
    if (conversation) {
      // If we have an existing conversation, add to it
      askQuestionMutation.mutate({ question });
    } else {
      // Otherwise do a direct Q&A
      directQAMutation.mutate({
        contractId: parseInt(selectedContractId),
        question
      });
    }
  };
  
  // Handle contract selection
  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId);
    setConversation(null);
    setMessages([]);
  };
  
  // Handle file upload
  const handleFileSelect = (file: File) => {
    toast({
      title: "File selected",
      description: "File upload feature will be implemented soon.",
    });
  };
  
  // Sample questions to demonstrate functionality
  const sampleQuestions = [
    "What are the termination conditions?",
    "What are my payment obligations?",
    "Can the other party terminate without cause?",
    "What are the warranty limitations?",
    "How is confidential information defined?"
  ];
  
  // Insert sample question to input
  const handleSampleQuestion = (question: string) => {
    setQuestion(question);
    if (document.getElementById('question-input')) {
      (document.getElementById('question-input') as HTMLTextAreaElement).focus();
    }
  };
  
  // Find the selected contract
  const selectedContract = contracts?.find(c => c.id.toString() === selectedContractId);
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contract Q&A</h1>
        <p className="text-gray-600">Ask questions about your contracts and get AI-powered answers</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contract Selection */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Select Contract</h2>
              
              <div className="mb-4">
                <Label htmlFor="qa-contract">Choose a contract</Label>
                <Select value={selectedContractId} onValueChange={handleContractChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingContracts ? (
                      <div className="flex justify-center p-2">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : contracts && contracts.length > 0 ? (
                      <SelectGroup>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id.toString()}>
                            {contract.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No contracts found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="qa-contract-file">
                    Or upload a new contract
                  </Label>
                  <span className="text-xs text-gray-500">(PDF or DOCX)</span>
                </div>
                <FileUpload
                  id="qa-contract-file"
                  onFileSelect={handleFileSelect}
                />
              </div>
              
              {selectedContract && (
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Contract Details</h3>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-start">
                      <span className="font-medium w-24">Type:</span>
                      <span>{selectedContract.contractType || 'Not specified'}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24">Uploaded:</span>
                      <span>{new Date(selectedContract.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24">Risk Score:</span>
                      <span className={
                        selectedContract.riskScore === 'high' ? 'text-red-500 font-medium' :
                        selectedContract.riskScore === 'medium' ? 'text-yellow-500 font-medium' :
                        'text-green-500 font-medium'
                      }>
                        {selectedContract.riskScore === 'high' ? 'High' :
                         selectedContract.riskScore === 'medium' ? 'Medium' :
                         'Low'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24">Format:</span>
                      <span>{selectedContract.fileType.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Sample Questions</h2>
              
              <ul className="space-y-2 text-sm">
                {sampleQuestions.map((question, index) => (
                  <li key={index}>
                    <Button 
                      variant="link" 
                      className="text-primary-600 hover:text-primary-800 p-0 h-auto font-normal"
                      onClick={() => handleSampleQuestion(question)}
                    >
                      {question}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Q&A Interface */}
        <Card className="lg:col-span-2">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Ask about your contract</h2>
          </div>
          
          {/* Chat Container */}
          <div 
            ref={chatContainerRef}
            className="flex-grow p-4 overflow-y-auto space-y-4 h-[450px]"
          >
            {messages.length > 0 ? (
              <>
                <div className="flex justify-center mb-6">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
              </>
            ) : selectedContractId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="p-4 rounded-full bg-gray-100 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <p className="text-center text-sm">
                  Ask a question about your contract to get started
                </p>
                <p className="text-center text-xs mt-2">
                  Try asking about termination conditions, payment terms, or confidentiality
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="p-4 rounded-full bg-gray-100 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <p className="text-center text-sm">
                  Please select a contract to start the Q&A
                </p>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center text-gray-500">
                <LoadingSpinner size="sm" className="mr-2" />
                <span>AI is generating an answer...</span>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <form className="flex items-end" onSubmit={handleSendQuestion}>
              <div className="flex-grow">
                <Textarea 
                  id="question-input" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about your contract..."
                  className="resize-none min-h-[40px]"
                  rows={1}
                  disabled={!selectedContractId || isLoading}
                />
              </div>
              <div className="ml-3">
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!selectedContractId || !question.trim() || isLoading}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
