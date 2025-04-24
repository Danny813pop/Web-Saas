import { apiRequest } from '@/lib/queryClient';
import { 
  Contract, 
  Analysis, 
  RiskyClause, 
  SavedClause, 
  Conversation, 
  Message 
} from '@shared/schema';
import { extractTextFromFile } from '@/lib/utils';

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    return response.json();
  },
  
  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  }) => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return response.json();
  },
};

// Contract API
export const contractApi = {
  getUserContracts: async (userId: number) => {
    const response = await apiRequest('GET', `/api/contracts/user/${userId}`);
    return response.json() as Promise<Contract[]>;
  },
  
  getContract: async (contractId: number) => {
    const response = await apiRequest('GET', `/api/contract/${contractId}`);
    return response.json() as Promise<Contract>;
  },
  
  createContract: async (contractData: {
    userId: number;
    name: string;
    fileType: string;
    originalText: string;
    contractType?: string;
    riskScore: string;
  }) => {
    const response = await apiRequest('POST', '/api/contract', contractData);
    return response.json() as Promise<Contract>;
  },
  
  uploadContract: async (userId: number, file: File, name: string, contractType?: string) => {
    try {
      // Extract text from file (in a real app, this would be done on the server)
      const text = await extractTextFromFile(file);
      
      // Create the contract
      const contractData = {
        userId,
        name,
        fileType: file.name.split('.').pop() || 'txt',
        originalText: text,
        contractType: contractType || '',
        riskScore: 'medium', // Default, will be updated after analysis
      };
      
      const response = await apiRequest('POST', '/api/contract', contractData);
      return response.json() as Promise<Contract>;
    } catch (error) {
      throw new Error('Failed to upload contract: ' + error);
    }
  },
  
  deleteContract: async (contractId: number) => {
    await apiRequest('DELETE', `/api/contract/${contractId}`);
    return true;
  },
};

// Analysis API
export const analysisApi = {
  getAnalysisByContractId: async (contractId: number) => {
    const response = await apiRequest('GET', `/api/analysis/contract/${contractId}`);
    return response.json() as Promise<Analysis>;
  },
  
  analyzeContract: async (contractId: number, text: string, contractType?: string) => {
    const response = await apiRequest('POST', '/api/analyze-contract', {
      contractId,
      text,
      contractType
    });
    return response.json() as Promise<Analysis>;
  },
  
  getRiskyClausesByAnalysisId: async (analysisId: number) => {
    const response = await apiRequest('GET', `/api/risky-clauses/analysis/${analysisId}`);
    return response.json() as Promise<RiskyClause[]>;
  },
};

// Clause Generator API
export const clauseApi = {
  getSavedClausesByUserId: async (userId: number) => {
    const response = await apiRequest('GET', `/api/saved-clauses/user/${userId}`);
    return response.json() as Promise<SavedClause[]>;
  },
  
  generateClause: async (clauseType: string, tone: string, details?: string) => {
    const response = await apiRequest('POST', '/api/generate-clause', {
      clauseType,
      tone,
      details
    });
    return response.json();
  },
  
  saveClause: async (clauseData: {
    userId: number;
    clauseType: string;
    tone: string;
    content: string;
  }) => {
    const response = await apiRequest('POST', '/api/saved-clause', clauseData);
    return response.json() as Promise<SavedClause>;
  },
  
  deleteSavedClause: async (clauseId: number) => {
    await apiRequest('DELETE', `/api/saved-clause/${clauseId}`);
    return true;
  },
};

// Q&A API
export const qaApi = {
  getConversationsByContractId: async (contractId: number) => {
    const response = await apiRequest('GET', `/api/conversations/contract/${contractId}`);
    return response.json() as Promise<Conversation[]>;
  },
  
  createConversation: async (conversationData: {
    userId: number;
    contractId: number;
    messages: Message[];
  }) => {
    const response = await apiRequest('POST', '/api/conversation', conversationData);
    return response.json() as Promise<Conversation>;
  },
  
  addMessageToConversation: async (conversationId: number, question: string) => {
    const response = await apiRequest('POST', `/api/conversation/${conversationId}/message`, {
      question
    });
    return response.json() as Promise<Conversation>;
  },
  
  askDirectQuestion: async (contractId: number, question: string) => {
    const response = await apiRequest('POST', '/api/contract-qa', {
      contractId,
      question
    });
    return response.json();
  },
};

// User API
export const userApi = {
  getUser: async (userId: number) => {
    const response = await apiRequest('GET', `/api/user/${userId}`);
    return response.json();
  },
  
  updateUser: async (userId: number, userData: {
    firstName?: string;
    lastName?: string;
    company?: string;
  }) => {
    const response = await apiRequest('PATCH', `/api/user/${userId}`, userData);
    return response.json();
  },
};
