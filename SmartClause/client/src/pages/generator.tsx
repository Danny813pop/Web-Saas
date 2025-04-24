import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ClauseEditor from '@/components/clause/ClauseEditor';
import { formatDate } from '@/lib/utils';
import { SavedClause } from '@shared/schema';
import { Edit, Trash } from 'lucide-react';

// Tone options for clauses
const toneOptions = [
  { id: 'formal', label: 'Formal' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'aggressive', label: 'Aggressive' },
];

export default function Generator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [clauseType, setClauseType] = useState('');
  const [tone, setTone] = useState('formal');
  const [details, setDetails] = useState('');
  
  // Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedClause, setGeneratedClause] = useState('');
  const [legalContext, setLegalContext] = useState('');
  
  // Fetch user's saved clauses
  const { 
    data: savedClauses, 
    isLoading: isLoadingSavedClauses,
    refetch: refetchSavedClauses 
  } = useQuery<SavedClause[]>({
    queryKey: ['/api/saved-clauses/user/' + user?.id],
    enabled: !!user?.id,
  });
  
  // Generate clause mutation
  const generateClauseMutation = useMutation({
    mutationFn: async (data: { clauseType: string, tone: string, details: string }) => {
      setIsGenerating(true);
      return apiRequest('POST', '/api/generate-clause', data);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        setGeneratedClause(data.clause);
        setLegalContext(data.legalContext);
        toast({
          title: "Clause generated",
          description: "Your clause has been generated successfully.",
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: "Failed to generate clause. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });
  
  // Save clause mutation
  const saveClauseMutation = useMutation({
    mutationFn: async (data: { 
      userId: number, 
      clauseType: string, 
      tone: string, 
      content: string 
    }) => {
      return apiRequest('POST', '/api/saved-clause', data);
    },
    onSuccess: () => {
      toast({
        title: "Clause saved",
        description: "The clause has been saved to your collection.",
      });
      refetchSavedClauses();
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: "Failed to save clause. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Delete saved clause mutation
  const deleteClauseMutation = useMutation({
    mutationFn: async (clauseId: number) => {
      return apiRequest('DELETE', `/api/saved-clause/${clauseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Clause deleted",
        description: "The clause has been deleted from your collection.",
      });
      refetchSavedClauses();
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: "Failed to delete clause. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clauseType) {
      toast({
        title: "Missing clause type",
        description: "Please select a clause type.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tone) {
      toast({
        title: "Missing tone",
        description: "Please select a tone for the clause.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate clause
    generateClauseMutation.mutate({
      clauseType,
      tone,
      details
    });
  };
  
  // Handle regeneration
  const handleRegenerate = () => {
    generateClauseMutation.mutate({
      clauseType,
      tone,
      details
    });
  };
  
  // Handle saving a clause
  const handleSaveClause = (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to save clauses.",
        variant: "destructive",
      });
      return;
    }
    
    saveClauseMutation.mutate({
      userId: user.id,
      clauseType,
      tone,
      content
    });
  };
  
  // Handle deleting a saved clause
  const handleDeleteClause = (clauseId: number) => {
    if (window.confirm('Are you sure you want to delete this clause?')) {
      deleteClauseMutation.mutate(clauseId);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clause Generator</h1>
        <p className="text-gray-600">Generate legally sound contract clauses for your specific needs</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Generate a Clause</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="clause-type">Clause Type</Label>
                <Select value={clauseType} onValueChange={setClauseType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select clause type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="nda">Confidentiality / NDA</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="payment">Payment Terms</SelectItem>
                      <SelectItem value="ip">Intellectual Property</SelectItem>
                      <SelectItem value="liability">Limitation of Liability</SelectItem>
                      <SelectItem value="force-majeure">Force Majeure</SelectItem>
                      <SelectItem value="non-compete">Non-Compete</SelectItem>
                      <SelectItem value="dispute">Dispute Resolution</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label>Tone</Label>
                <RadioGroup 
                  value={tone} 
                  onValueChange={setTone}
                  className="grid grid-cols-2 gap-3 mt-1"
                >
                  {toneOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem
                        value={option.id}
                        id={`tone-${option.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`tone-${option.id}`}
                        className="block border border-gray-300 rounded-md p-3 text-center peer-data-[state=checked]:bg-primary-50 peer-data-[state=checked]:border-primary-500 hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="clause-details">
                  Additional Details <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Textarea 
                  id="clause-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Include any specific requirements, parties involved, or jurisdictions..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Clause'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Clause Result */}
        <div className="space-y-6">
          {/* Loading State */}
          {isGenerating && (
            <Card>
              <CardContent className="py-8 text-center">
                <LoadingSpinner 
                  size="lg" 
                  label="Generating your clause..." 
                  className="py-8"
                />
                <p className="text-gray-500 text-sm mt-2">This usually takes a few seconds</p>
              </CardContent>
            </Card>
          )}
          
          {/* Results */}
          {generatedClause && !isGenerating && (
            <ClauseEditor
              title="Generated Clause"
              content={generatedClause}
              legalContext={legalContext}
              onRegenerate={handleRegenerate}
              onSave={handleSaveClause}
            />
          )}
          
          {/* Saved Clauses */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Saved Clauses</h2>
              
              {isLoadingSavedClauses ? (
                <div className="py-4 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : savedClauses && savedClauses.length > 0 ? (
                <>
                  {savedClauses.map((clause) => (
                    <div key={clause.id} className="border-b border-gray-200 pb-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{clause.clauseType}</h3>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Edit clause"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClause(clause.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete clause"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {clause.content.length > 120 
                          ? `${clause.content.substring(0, 120)}...` 
                          : clause.content}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>Created: {formatDate(clause.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-primary-600">{clause.tone} tone</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center mt-4">
                  <p className="text-gray-500 text-sm">You don't have any saved clauses yet</p>
                </div>
              )}
              
              {savedClauses && savedClauses.length > 0 && (
                <div className="text-center mt-4">
                  <p className="text-gray-500 text-sm">You have {savedClauses.length} saved {savedClauses.length === 1 ? 'clause' : 'clauses'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
