import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertContractSchema, 
  insertAnalysisSchema, 
  insertRiskyClauseSchema,
  insertSavedClauseSchema,
  insertConversationSchema,
  type Message
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Utility function to hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Utility function to verify password
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Mock OpenAI API integration for contract analysis
async function analyzeContract(text: string, contractType: string): Promise<any> {
  // In a real implementation, this would call OpenAI API
  // For now, return mock data based on input
  
  // Check if text contains any concerning keywords
  const hasHighRisk = text.toLowerCase().includes('termination') || text.toLowerCase().includes('compete');
  const hasMediumRisk = text.toLowerCase().includes('payment') || text.toLowerCase().includes('liability');
  
  let riskScore = 'low';
  if (hasHighRisk) riskScore = 'high';
  else if (hasMediumRisk) riskScore = 'medium';
  
  const summary = [
    "Contract duration is 12 months with automatic renewal unless terminated with 30 days notice",
    "Payment terms require invoice payment within 30 days",
    "Broadly worded indemnification clause places significant burden on your company",
    "Non-compete clause is excessively broad and may not be enforceable in all jurisdictions",
    "Confidentiality provisions expire 3 years after termination",
    "Intellectual property ownership assigns all work product to client without limitation"
  ];
  
  const riskyClauseIndices = hasHighRisk ? [0, 3] : hasMediumRisk ? [1] : [];
  
  const fullAnalysis = {
    riskLevel: riskScore,
    riskReason: "This contract has some concerning clauses that place undue burden on one party",
    suggestions: "Consider negotiating the indemnification and non-compete clauses"
  };
  
  return {
    summary,
    riskyClauseIndices,
    fullAnalysis,
    riskScore
  };
}

// Mock function to generate a clause based on parameters
async function generateClause(clauseType: string, tone: string, details: string): Promise<string> {
  // In a real implementation, this would call OpenAI API
  // For now, return a template based on clause type and tone
  let template = '';
  
  if (clauseType === 'nda' || clauseType === 'confidentiality') {
    template = `11.1 Confidential Information. Each party acknowledges that it may be furnished with or may otherwise receive or have access to information or material that relates to past, present, or future products, software, research, development, inventions, processes, techniques, designs, or technical information and data, and marketing plans (hereinafter the "Confidential Information"). Each party agrees to preserve and protect the confidentiality of the Confidential Information.

11.2 Non-Disclosure. Each party agrees that it will not disclose to any third party or use any Confidential Information disclosed to it by the other party except as expressly permitted in this Agreement, and will take reasonable measures to maintain the confidentiality of such information, which measures shall not be less than the degree of care employed by the recipient to preserve and safeguard its own confidential information, but in no event less than a reasonable degree of care.

11.3 Term of Obligation. The obligations of the parties under this Section shall continue in full force and effect for a period of three (3) years from the date of termination or expiration of this Agreement.`;
  } else if (clauseType === 'termination') {
    template = `8.1 Termination for Convenience. Either party may terminate this Agreement for any reason upon thirty (30) days' prior written notice to the other party.

8.2 Termination for Cause. Either party may terminate this Agreement immediately upon written notice to the other party if the other party materially breaches this Agreement and fails to cure such breach within fifteen (15) business days after receiving written notice thereof.

8.3 Effect of Termination. Upon termination of this Agreement for any reason, each party shall promptly return to the other party all property belonging to the other party, including without limitation all Confidential Information.`;
  } else if (clauseType === 'payment') {
    template = `5.1 Fees. Client shall pay the fees set forth in the applicable Statement of Work. All fees are exclusive of taxes, which Client shall pay as applicable.

5.2 Payment Terms. Client shall pay all invoices within thirty (30) days of receipt. Late payments shall accrue interest at a rate of 1.5% per month or the highest rate allowed by applicable law, whichever is lower, from the date such payment was due until the date paid.

5.3 Disputes. Client shall notify Contractor in writing of any disputed charges within fifteen (15) days of the invoice date, or such charges shall be deemed accepted by Client.`;
  } else {
    template = `This is a template for the ${clauseType} clause type with a ${tone} tone.

The clause would typically include specific legal language relevant to this type of provision, with appropriate binding terms and conditions that protect the party's interests.

Additional details from your input would be incorporated here: ${details || "No additional details provided."}`;
  }
  
  // Adjust tone if needed
  if (tone === 'friendly') {
    template = template.replace(/shall/g, 'will').replace(/hereinafter/g, 'below');
  } else if (tone === 'aggressive') {
    template = template.replace(/may/g, 'shall').replace(/reasonable/g, 'strict');
  }
  
  return template;
}

// Mock function to answer questions about a contract
async function answerContractQuestion(contractId: number, question: string): Promise<string> {
  // In a real implementation, this would retrieve the contract text and call OpenAI API
  // For now, return predefined answers based on the question
  
  if (question.toLowerCase().includes('terminate') || question.toLowerCase().includes('termination')) {
    return "Yes, this contract can be terminated early in several ways. According to Section 8.1, either party may terminate with 30 days written notice. Additionally, Section 8.2 allows for immediate termination if there's a material breach that remains uncured for 15 business days after written notification.";
  } else if (question.toLowerCase().includes('confidential') || question.toLowerCase().includes('confidentiality')) {
    return "According to Section 11.3 of the contract, the confidentiality obligations survive for 3 years after termination. During this period, both parties must continue to protect confidential information as defined in the agreement. Upon request, each party must either return or destroy all confidential information in their possession.";
  } else if (question.toLowerCase().includes('payment') || question.toLowerCase().includes('invoice')) {
    return "The payment terms are outlined in Section 5. Client must pay all invoices within 30 days of receipt. Late payments accrue interest at a rate of 1.5% per month. Any disputed charges must be raised within 15 days of the invoice date.";
  } else if (question.toLowerCase().includes('liability') || question.toLowerCase().includes('damages')) {
    return "The contract limits liability in Section 9. Neither party is liable for indirect, consequential, or punitive damages. Each party's total liability is capped at the amount paid under the agreement in the 12 months preceding the claim. These limitations don't apply to breaches of confidentiality or intellectual property provisions.";
  } else {
    return "I'd need to analyze that specific aspect of the contract more carefully. The contract does contain various provisions covering termination, confidentiality, payment terms, intellectual property, and liability. Could you specify which section or topic you're most interested in?";
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // User routes
  app.get('/api/user/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/api/user/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Don't allow updating password through this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Contract routes
  app.get('/api/contracts/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const contracts = await storage.getContractsByUserId(userId);
      
      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/contract/:id', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/contract', async (req: Request, res: Response) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      
      return res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/contract/:id', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const success = await storage.deleteContract(contractId);
      
      if (!success) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      return res.status(200).json({ message: 'Contract deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Analysis routes
  app.get('/api/analysis/contract/:contractId', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const analysis = await storage.getAnalysisByContractId(contractId);
      
      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/analyze-contract', async (req: Request, res: Response) => {
    try {
      const { contractId, text, contractType } = req.body;
      
      if (!contractId || !text) {
        return res.status(400).json({ message: 'Contract ID and text are required' });
      }
      
      // Get the contract
      const contract = await storage.getContract(parseInt(contractId));
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // Analyze the contract text (mock implementation)
      const analysisResult = await analyzeContract(text, contractType || '');
      
      // Create analysis record
      const analysis = await storage.createAnalysis({
        contractId: parseInt(contractId),
        summary: analysisResult.summary,
        riskyClauseIndices: analysisResult.riskyClauseIndices,
        fullAnalysis: analysisResult.fullAnalysis
      });
      
      // Update contract risk score
      await storage.updateUser(contract.id, { riskScore: analysisResult.riskScore });
      
      // Generate risky clauses if needed
      if (analysisResult.riskyClauseIndices.length > 0) {
        // Mock risky clauses for simplicity
        const mockRiskyClauses = [
          {
            clauseIndex: 0,
            clauseText: "Contractor agrees not to engage in any business activity competitive with Client's business for a period of five (5) years in any geographic location where Client conducts business.",
            riskLevel: 'high',
            explanation: "This non-compete clause is overly broad in both duration and geographic scope, making it potentially unenforceable in many jurisdictions.",
            suggestion: "Contractor agrees not to engage in substantially similar business activity competitive with Client's core business for a period of one (1) year limited to regions where Contractor directly provided services to Client."
          },
          {
            clauseIndex: 3,
            clauseText: "Contractor shall indemnify, defend, and hold harmless Client from any and all claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees arising from or relating to Contractor's services.",
            riskLevel: 'medium',
            explanation: "This indemnification clause is broad and doesn't limit the contractor's liability to third-party claims or direct damages.",
            suggestion: "Contractor shall indemnify, defend, and hold harmless Client from any third-party claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees arising directly from Contractor's gross negligence or willful misconduct in performing the services."
          }
        ];
        
        // Create risky clause records
        for (const clauseInfo of mockRiskyClauses) {
          if (analysisResult.riskyClauseIndices.includes(clauseInfo.clauseIndex)) {
            await storage.createRiskyClause({
              analysisId: analysis.id,
              ...clauseInfo
            });
          }
        }
      }
      
      return res.status(200).json(analysis);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Risky Clause routes
  app.get('/api/risky-clauses/analysis/:analysisId', async (req: Request, res: Response) => {
    try {
      const analysisId = parseInt(req.params.analysisId);
      const riskyClauses = await storage.getRiskyClausesByAnalysisId(analysisId);
      
      return res.status(200).json(riskyClauses);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Saved Clause routes
  app.get('/api/saved-clauses/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const savedClauses = await storage.getSavedClausesByUserId(userId);
      
      return res.status(200).json(savedClauses);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/saved-clause', async (req: Request, res: Response) => {
    try {
      const clauseData = insertSavedClauseSchema.parse(req.body);
      const savedClause = await storage.createSavedClause(clauseData);
      
      return res.status(201).json(savedClause);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/saved-clause/:id', async (req: Request, res: Response) => {
    try {
      const clauseId = parseInt(req.params.id);
      const success = await storage.deleteSavedClause(clauseId);
      
      if (!success) {
        return res.status(404).json({ message: 'Saved clause not found' });
      }
      
      return res.status(200).json({ message: 'Saved clause deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Clause Generator route
  app.post('/api/generate-clause', async (req: Request, res: Response) => {
    try {
      const { clauseType, tone, details } = req.body;
      
      if (!clauseType || !tone) {
        return res.status(400).json({ message: 'Clause type and tone are required' });
      }
      
      // Generate clause (mock implementation)
      const generatedClause = await generateClause(clauseType, tone, details || '');
      
      return res.status(200).json({ 
        clause: generatedClause,
        legalContext: "This clause establishes standard protections with reasonable terms that courts typically uphold. It provides clear guidance on handling proprietary information and is balanced between parties."
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Conversation routes
  app.get('/api/conversations/contract/:contractId', async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const conversations = await storage.getConversationsByContractId(contractId);
      
      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/conversation', async (req: Request, res: Response) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      
      return res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/conversation/:id/message', async (req: Request, res: Response) => {
    try {
      const { question } = req.body;
      const conversationId = parseInt(req.params.id);
      
      if (!question) {
        return res.status(400).json({ message: 'Question is required' });
      }
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      // Add the user's question to messages
      const updatedMessages = [...conversation.messages];
      const userMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      };
      updatedMessages.push(userMessage);
      
      // Generate AI response (mock implementation)
      const answer = await answerContractQuestion(conversation.contractId, question);
      
      // Add AI response to messages
      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString()
      };
      updatedMessages.push(aiMessage);
      
      // Update conversation with new messages
      const updatedConversation = await storage.updateConversation(conversationId, updatedMessages);
      
      return res.status(200).json(updatedConversation);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Q&A route - Direct question without saving conversation
  app.post('/api/contract-qa', async (req: Request, res: Response) => {
    try {
      const { contractId, question } = req.body;
      
      if (!contractId || !question) {
        return res.status(400).json({ message: 'Contract ID and question are required' });
      }
      
      // Get the contract
      const contract = await storage.getContract(parseInt(contractId));
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      // Generate answer (mock implementation)
      const answer = await answerContractQuestion(parseInt(contractId), question);
      
      return res.status(200).json({ answer });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  return httpServer;
}
