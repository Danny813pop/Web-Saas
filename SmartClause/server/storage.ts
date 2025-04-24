import { v4 as uuidv4 } from 'uuid';
import { 
  users, contracts, analyses, riskyClauses, savedClauses, conversations, 
  type User, type InsertUser,
  type Contract, type InsertContract,
  type Analysis, type InsertAnalysis,
  type RiskyClause, type InsertRiskyClause,
  type SavedClause, type InsertSavedClause,
  type Conversation, type InsertConversation,
  type Message
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByUserId(userId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  deleteContract(id: number): Promise<boolean>;

  // Analysis operations
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalysisByContractId(contractId: number): Promise<Analysis | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;

  // Risky Clause operations
  getRiskyClausesByAnalysisId(analysisId: number): Promise<RiskyClause[]>;
  createRiskyClause(clause: InsertRiskyClause): Promise<RiskyClause>;

  // Saved Clause operations
  getSavedClausesByUserId(userId: number): Promise<SavedClause[]>;
  getSavedClause(id: number): Promise<SavedClause | undefined>;
  createSavedClause(clause: InsertSavedClause): Promise<SavedClause>;
  deleteSavedClause(id: number): Promise<boolean>;

  // Conversation operations
  getConversationsByContractId(contractId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, messages: Message[]): Promise<Conversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contracts: Map<number, Contract>;
  private analyses: Map<number, Analysis>;
  private riskyClauses: Map<number, RiskyClause>;
  private savedClauses: Map<number, SavedClause>;
  private conversations: Map<number, Conversation>;
  
  private nextUserId: number;
  private nextContractId: number;
  private nextAnalysisId: number;
  private nextRiskyClauseId: number;
  private nextSavedClauseId: number;
  private nextConversationId: number;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.analyses = new Map();
    this.riskyClauses = new Map();
    this.savedClauses = new Map();
    this.conversations = new Map();
    
    this.nextUserId = 1;
    this.nextContractId = 1;
    this.nextAnalysisId = 1;
    this.nextRiskyClauseId = 1;
    this.nextSavedClauseId = 1;
    this.nextConversationId = 1;
    
    // Add some demo data
    this.addDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      apiKey: `sc_${uuidv4().replace(/-/g, '')}`
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.userId === userId
    );
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.nextContractId++;
    const contract: Contract = { 
      ...insertContract, 
      id,
      uploadedAt: new Date()
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async deleteContract(id: number): Promise<boolean> {
    return this.contracts.delete(id);
  }

  // Analysis operations
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysisByContractId(contractId: number): Promise<Analysis | undefined> {
    return Array.from(this.analyses.values()).find(
      (analysis) => analysis.contractId === contractId
    );
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.nextAnalysisId++;
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  // Risky Clause operations
  async getRiskyClausesByAnalysisId(analysisId: number): Promise<RiskyClause[]> {
    return Array.from(this.riskyClauses.values()).filter(
      (clause) => clause.analysisId === analysisId
    );
  }

  async createRiskyClause(insertClause: InsertRiskyClause): Promise<RiskyClause> {
    const id = this.nextRiskyClauseId++;
    const clause: RiskyClause = { ...insertClause, id };
    this.riskyClauses.set(id, clause);
    return clause;
  }

  // Saved Clause operations
  async getSavedClausesByUserId(userId: number): Promise<SavedClause[]> {
    return Array.from(this.savedClauses.values()).filter(
      (clause) => clause.userId === userId
    );
  }

  async getSavedClause(id: number): Promise<SavedClause | undefined> {
    return this.savedClauses.get(id);
  }

  async createSavedClause(insertClause: InsertSavedClause): Promise<SavedClause> {
    const id = this.nextSavedClauseId++;
    const timestamp = new Date().toISOString();
    const clause: SavedClause = { 
      ...insertClause, 
      id,
      createdAt: timestamp
    };
    this.savedClauses.set(id, clause);
    return clause;
  }

  async deleteSavedClause(id: number): Promise<boolean> {
    return this.savedClauses.delete(id);
  }

  // Conversation operations
  async getConversationsByContractId(contractId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.contractId === contractId
    );
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.nextConversationId++;
    const timestamp = new Date().toISOString();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, messages: Message[]): Promise<Conversation | undefined> {
    const conversation = await this.getConversation(id);
    if (!conversation) return undefined;
    
    const timestamp = new Date().toISOString();
    const updatedConversation = { 
      ...conversation, 
      messages, 
      updatedAt: timestamp 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Add demo data
  private addDemoData() {
    // Add a demo user
    const user: User = {
      id: this.nextUserId++,
      email: 'demo@example.com',
      password: '$2a$10$demohashedsecretpassword', // Not a real hash, just for demo
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Inc.',
      planType: 'pro',
      apiKey: 'sc_demoapikeyrandomstring123456',
      createdAt: new Date().toISOString()
    };
    this.users.set(user.id, user);

    // Add some demo contracts
    const contractData = [
      {
        name: 'Client Services Agreement',
        fileType: 'pdf',
        contractType: 'Service Contract',
        riskScore: 'high',
        uploadedAt: '2023-08-15T12:00:00Z'
      },
      {
        name: 'Employment Agreement',
        fileType: 'docx',
        contractType: 'Employment',
        riskScore: 'low',
        uploadedAt: '2023-08-10T10:30:00Z'
      },
      {
        name: 'Non-Disclosure Agreement',
        fileType: 'pdf',
        contractType: 'NDA',
        riskScore: 'medium',
        uploadedAt: '2023-08-05T15:45:00Z'
      },
      {
        name: 'Software License Agreement',
        fileType: 'docx',
        contractType: 'License',
        riskScore: 'medium',
        uploadedAt: '2023-07-29T09:15:00Z'
      }
    ];

    contractData.forEach(contractInfo => {
      const contract: Contract = {
        id: this.nextContractId++,
        userId: user.id,
        name: contractInfo.name,
        fileType: contractInfo.fileType,
        originalText: 'Sample contract text for ' + contractInfo.name,
        contractType: contractInfo.contractType,
        riskScore: contractInfo.riskScore,
        uploadedAt: contractInfo.uploadedAt
      };
      this.contracts.set(contract.id, contract);

      // Add an analysis for each contract
      const analysis: Analysis = {
        id: this.nextAnalysisId++,
        contractId: contract.id,
        summary: [
          "Contract duration is 12 months with automatic renewal unless terminated with 30 days notice",
          "Payment terms require invoice payment within 30 days",
          "Broadly worded indemnification clause places significant burden on your company",
          "Non-compete clause is excessively broad and may not be enforceable in all jurisdictions",
          "Confidentiality provisions expire 3 years after termination",
          "Intellectual property ownership assigns all work product to client without limitation"
        ],
        riskyClauseIndices: [1, 3],
        fullAnalysis: {
          riskLevel: contractInfo.riskScore,
          riskReason: "This contract has some concerning clauses that place undue burden on one party",
          suggestions: "Consider negotiating the indemnification and non-compete clauses"
        }
      };
      this.analyses.set(analysis.id, analysis);

      // Add risky clauses
      if (contractInfo.riskScore === 'high' || contractInfo.riskScore === 'medium') {
        const riskyClause1: RiskyClause = {
          id: this.nextRiskyClauseId++,
          analysisId: analysis.id,
          clauseIndex: 1,
          clauseText: "Contractor agrees not to engage in any business activity competitive with Client's business for a period of five (5) years in any geographic location where Client conducts business.",
          riskLevel: 'high',
          explanation: "This non-compete clause is overly broad in both duration and geographic scope, making it potentially unenforceable in many jurisdictions.",
          suggestion: "Contractor agrees not to engage in substantially similar business activity competitive with Client's core business for a period of one (1) year limited to regions where Contractor directly provided services to Client."
        };
        this.riskyClauses.set(riskyClause1.id, riskyClause1);

        const riskyClause2: RiskyClause = {
          id: this.nextRiskyClauseId++,
          analysisId: analysis.id,
          clauseIndex: 3,
          clauseText: "Contractor shall indemnify, defend, and hold harmless Client from any and all claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees arising from or relating to Contractor's services.",
          riskLevel: 'medium',
          explanation: "This indemnification clause is broad and doesn't limit the contractor's liability to third-party claims or direct damages.",
          suggestion: "Contractor shall indemnify, defend, and hold harmless Client from any third-party claims, damages, liabilities, costs, and expenses, including reasonable attorneys' fees arising directly from Contractor's gross negligence or willful misconduct in performing the services."
        };
        this.riskyClauses.set(riskyClause2.id, riskyClause2);
      }

      // Add a conversation for the first contract
      if (contract.id === 1) {
        const conversation: Conversation = {
          id: this.nextConversationId++,
          userId: user.id,
          contractId: contract.id,
          messages: [
            {
              id: uuidv4(),
              role: 'user',
              content: 'Can this contract be terminated early?',
              timestamp: '2023-08-20T10:15:00Z'
            },
            {
              id: uuidv4(),
              role: 'assistant',
              content: 'Yes, this contract can be terminated early in several ways. According to Section 8.1, either party may terminate with 30 days written notice. Additionally, Section 8.2 allows for immediate termination if there\'s a material breach that remains uncured for 15 business days after written notification.',
              timestamp: '2023-08-20T10:15:10Z'
            },
            {
              id: uuidv4(),
              role: 'user',
              content: 'What happens to confidential information after termination?',
              timestamp: '2023-08-20T10:16:00Z'
            },
            {
              id: uuidv4(),
              role: 'assistant',
              content: 'According to Section 11.3 of the contract, the confidentiality obligations survive for 3 years after termination. During this period, both parties must continue to protect confidential information as defined in the agreement. Upon request, each party must either return or destroy all confidential information in their possession.',
              timestamp: '2023-08-20T10:16:10Z'
            }
          ],
          createdAt: '2023-08-20T10:15:00Z',
          updatedAt: '2023-08-20T10:16:10Z'
        };
        this.conversations.set(conversation.id, conversation);
      }
    });

    // Add some saved clauses
    const savedClause1: SavedClause = {
      id: this.nextSavedClauseId++,
      userId: user.id,
      clauseType: 'Limitation of Liability',
      tone: 'formal',
      content: 'Neither party shall be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.',
      createdAt: '2023-08-10T14:25:00Z'
    };
    this.savedClauses.set(savedClause1.id, savedClause1);

    const savedClause2: SavedClause = {
      id: this.nextSavedClauseId++,
      userId: user.id,
      clauseType: 'Payment Terms',
      tone: 'neutral',
      content: 'Client shall pay all invoices within thirty (30) days of receipt. Late payments shall accrue interest at a rate of 1.5% per month or the highest rate allowed by applicable law, whichever is lower, from the date such payment was due until the date paid. Contractor shall be entitled to recover all reasonable costs and expenses (including, without limitation, reasonable attorneys\' fees) incurred in collecting late payments.',
      createdAt: '2023-08-05T09:30:00Z'
    };
    this.savedClauses.set(savedClause2.id, savedClause2);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const apiKey = `sc_${uuidv4().replace(/-/g, '')}`;
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        apiKey,
        createdAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return db.select().from(contracts).where(eq(contracts.userId, userId));
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values({
        ...insertContract,
        uploadedAt: new Date()
      })
      .returning();
    return contract;
  }

  async deleteContract(id: number): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id));
    // The delete operation returns an object, but we just need to know if it was successful
    return !!result;
  }

  // Analysis operations
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis || undefined;
  }

  async getAnalysisByContractId(contractId: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.contractId, contractId));
    return analysis || undefined;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  // Risky Clause operations
  async getRiskyClausesByAnalysisId(analysisId: number): Promise<RiskyClause[]> {
    return db.select().from(riskyClauses).where(eq(riskyClauses.analysisId, analysisId));
  }

  async createRiskyClause(insertClause: InsertRiskyClause): Promise<RiskyClause> {
    const [clause] = await db
      .insert(riskyClauses)
      .values(insertClause)
      .returning();
    return clause;
  }

  // Saved Clause operations
  async getSavedClausesByUserId(userId: number): Promise<SavedClause[]> {
    return db.select().from(savedClauses).where(eq(savedClauses.userId, userId));
  }

  async getSavedClause(id: number): Promise<SavedClause | undefined> {
    const [clause] = await db.select().from(savedClauses).where(eq(savedClauses.id, id));
    return clause || undefined;
  }

  async createSavedClause(insertClause: InsertSavedClause): Promise<SavedClause> {
    const [clause] = await db
      .insert(savedClauses)
      .values(insertClause)
      .returning();
    return clause;
  }

  async deleteSavedClause(id: number): Promise<boolean> {
    const result = await db.delete(savedClauses).where(eq(savedClauses.id, id));
    return !!result;
  }

  // Conversation operations
  async getConversationsByContractId(contractId: number): Promise<Conversation[]> {
    return db.select().from(conversations).where(eq(conversations.contractId, contractId));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, messages: Message[]): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ 
        messages,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }
}

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();
