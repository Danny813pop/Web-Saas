import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import ResultsSummary from '@/components/analysis/ResultsSummary';
import RiskyClause from '@/components/analysis/RiskyClause';
import { Download, AlertTriangle } from 'lucide-react';
import { extractTextFromFile } from '@/lib/utils';
import { Analysis, RiskyClause as RiskyClauseType } from '@shared/schema';

export default function Analyzer() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Parse contract ID from URL if present
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const contractIdFromUrl = urlParams.get('contractId');
  
  // Form state
  const [contractName, setContractName] = useState('');
  const [contractType, setContractType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [contractId, setContractId] = useState<number | null>(contractIdFromUrl ? parseInt(contractIdFromUrl) : null);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  
  // Fetch contract if ID is provided
  const { data: contract, isLoading: isLoadingContract } = useQuery({
    queryKey: [`/api/contract/${contractId}`],
    enabled: !!contractId,
  });
  
  // Fetch analysis if contract is loaded
  const { 
    data: analysis, 
    isLoading: isLoadingAnalysis 
  } = useQuery<Analysis>({
    queryKey: [`/api/analysis/contract/${contractId}`],
    enabled: !!contractId,
  });
  
  // Fetch risky clauses if analysis is loaded
  const { 
    data: riskyClauses, 
    isLoading: isLoadingRiskyClauses 
  } = useQuery<RiskyClauseType[]>({
    queryKey: [`/api/risky-clauses/analysis/${analysis?.id}`],
    enabled: !!analysis?.id,
  });
  
  // Set form data if contract is loaded
  useEffect(() => {
    if (contract) {
      setContractName(contract.name);
      setContractType(contract.contractType || '');
      setExtractedText(contract.originalText);
    }
  }, [contract]);
  
  // Analyze contract mutation
  const analyzeMutation = useMutation({
    mutationFn: async (data: { contractId: number, text: string, contractType: string }) => {
      setIsAnalyzing(true);
      return apiRequest('POST', '/api/analyze-contract', data);
    },
    onSuccess: (response) => {
      response.json().then((data: Analysis) => {
        setAnalysisId(data.id);
        toast({
          title: "Analysis complete",
          description: "Your contract has been analyzed successfully.",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/analysis/contract/${contractId}`] });
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze contract. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });
  
  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: { 
      userId: number, 
      name: string, 
      fileType: string,
      originalText: string,
      contractType: string,
      riskScore: string
    }) => {
      return apiRequest('POST', '/api/contract', data);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        setContractId(data.id);
        // After contract is created, analyze it
        analyzeMutation.mutate({
          contractId: data.id,
          text: extractedText,
          contractType
        });
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
    } catch (error) {
      toast({
        title: "Error extracting text",
        description: "Failed to extract text from file. Please try another file.",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractName) {
      toast({
        title: "Missing contract name",
        description: "Please enter a name for the contract.",
        variant: "destructive",
      });
      return;
    }
    
    if (!extractedText) {
      toast({
        title: "No contract text",
        description: "Please upload a contract file or select an existing contract.",
        variant: "destructive",
      });
      return;
    }
    
    if (contractId) {
      // If contract already exists, just analyze it
      analyzeMutation.mutate({
        contractId,
        text: extractedText,
        contractType
      });
    } else {
      // Otherwise create a new contract first
      if (!selectedFile) {
        toast({
          title: "No file selected",
          description: "Please upload a contract file.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new contract
      createContractMutation.mutate({
        userId: user?.id!,
        name: contractName,
        fileType: selectedFile.name.split('.').pop() || 'txt',
        originalText: extractedText,
        contractType,
        riskScore: 'medium' // Default risk score, will be updated after analysis
      });
    }
  };
  
  // Check if analysis is complete
  const isAnalysisComplete = !!analysis;
  
  // Process analysis data
  const summaryPoints = analysis?.summary?.map((point: string) => {
    // Simple heuristic to determine point status based on content
    const lowerPoint = point.toLowerCase();
    if (lowerPoint.includes('risk') || lowerPoint.includes('concern') || lowerPoint.includes('excessive') || lowerPoint.includes('broad')) {
      return { text: point, status: 'danger' as const };
    } else if (lowerPoint.includes('caution') || lowerPoint.includes('consider') || lowerPoint.includes('indemnification') || lowerPoint.includes('liability')) {
      return { text: point, status: 'warning' as const };
    } else {
      return { text: point, status: 'success' as const };
    }
  }) || [];
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contract Analyzer</h1>
        <p className="text-gray-600">Upload a contract to analyze potential risks and get insights</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Upload Contract</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="contract-name">Contract Name</Label>
                <Input 
                  id="contract-name" 
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="E.g., Client Service Agreement" 
                  className="mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="contract-type">Contract Type</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                      <SelectItem value="employment">Employment Contract</SelectItem>
                      <SelectItem value="service">Service Agreement</SelectItem>
                      <SelectItem value="license">License Agreement</SelectItem>
                      <SelectItem value="lease">Lease Agreement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <Label>Upload File</Label>
                <FileUpload 
                  id="contract-file"
                  onFileSelect={handleFileSelect}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isAnalyzing || isLoadingAnalysis || (!selectedFile && !contractId)}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Loading State */}
          {(isAnalyzing || (isLoadingAnalysis && !isAnalysisComplete)) && (
            <Card>
              <CardContent className="py-8 text-center">
                <LoadingSpinner 
                  size="lg" 
                  label="Analyzing your contract..." 
                  className="py-8"
                />
                <p className="text-gray-500 text-sm mt-2">This usually takes 15-30 seconds</p>
              </CardContent>
            </Card>
          )}
          
          {/* Results */}
          {isAnalysisComplete && (
            <>
              {/* Risk Score */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                      analysis.fullAnalysis.riskLevel === 'high' ? 'bg-red-100' : 
                      analysis.fullAnalysis.riskLevel === 'medium' ? 'bg-yellow-100' : 
                      'bg-green-100'
                    }`}>
                      <AlertTriangle className={`text-2xl ${
                        analysis.fullAnalysis.riskLevel === 'high' ? 'text-red-500' : 
                        analysis.fullAnalysis.riskLevel === 'medium' ? 'text-yellow-500' : 
                        'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        analysis.fullAnalysis.riskLevel === 'high' ? 'text-red-500' : 
                        analysis.fullAnalysis.riskLevel === 'medium' ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {analysis.fullAnalysis.riskLevel === 'high' ? 'High Risk' : 
                         analysis.fullAnalysis.riskLevel === 'medium' ? 'Medium Risk' : 
                         'Low Risk'}
                      </h3>
                      <p className="text-gray-600">{analysis.fullAnalysis.riskReason}</p>
                    </div>
                  </div>
                  
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      analysis.fullAnalysis.riskLevel === 'high' ? 'bg-red-500 w-[90%]' : 
                      analysis.fullAnalysis.riskLevel === 'medium' ? 'bg-yellow-500 w-[65%]' : 
                      'bg-green-500 w-[30%]'
                    }`}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Points */}
              <ResultsSummary points={summaryPoints} />
              
              {/* Risky Clauses */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Risky Clauses</h2>
                  
                  {isLoadingRiskyClauses ? (
                    <div className="py-4 flex justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : riskyClauses && riskyClauses.length > 0 ? (
                    <div className="space-y-4">
                      {riskyClauses.map((clause) => (
                        <RiskyClause
                          key={clause.id}
                          sectionTitle={`Section ${clause.clauseIndex + 1}`}
                          clauseText={clause.clauseText}
                          riskLevel={clause.riskLevel}
                          suggestion={clause.suggestion || ''}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No significant risky clauses identified.
                    </p>
                  )}
                  
                  <div className="mt-6">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Download Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
