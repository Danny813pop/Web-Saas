import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  planType: text("plan_type").default("free"),
  apiKey: text("api_key"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk type enum
export const RiskLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type RiskLevelType = typeof RiskLevel[keyof typeof RiskLevel];

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(), // pdf, docx
  originalText: text("original_text").notNull(),
  contractType: text("contract_type"), // e.g., NDA, Service Agreement, etc.
  riskScore: text("risk_score").notNull(), // low, medium, high
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Analysis table
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  summary: jsonb("summary").notNull(), // Array of key points
  riskyClauseIndices: jsonb("risky_clause_indices"), // Array of indices of risky clauses
  fullAnalysis: jsonb("full_analysis").notNull(), // Complete analysis from GPT-4
});

// Risky Clauses table
export const riskyClauses = pgTable("risky_clauses", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull(),
  clauseIndex: integer("clause_index").notNull(),
  clauseText: text("clause_text").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high
  explanation: text("explanation").notNull(),
  suggestion: text("suggestion"), // AI suggestion for safer alternative
});

// Saved Clauses table
export const savedClauses = pgTable("saved_clauses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clauseType: text("clause_type").notNull(), // e.g., NDA, Payment Terms, etc.
  tone: text("tone").notNull(), // formal, friendly, aggressive, neutral
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table for Q&A history
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contractId: integer("contract_id").notNull(),
  messages: jsonb("messages").notNull(), // Array of message objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for inserting a new user
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  company: true,
  planType: true,
});

// Schema for inserting a new contract
export const insertContractSchema = createInsertSchema(contracts).pick({
  userId: true,
  name: true,
  fileType: true,
  originalText: true,
  contractType: true,
  riskScore: true,
});

// Schema for inserting a new analysis
export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  contractId: true,
  summary: true,
  riskyClauseIndices: true,
  fullAnalysis: true,
});

// Schema for inserting a new risky clause
export const insertRiskyClauseSchema = createInsertSchema(riskyClauses).pick({
  analysisId: true,
  clauseIndex: true,
  clauseText: true,
  riskLevel: true,
  explanation: true,
  suggestion: true,
});

// Schema for inserting a saved clause
export const insertSavedClauseSchema = createInsertSchema(savedClauses).pick({
  userId: true,
  clauseType: true,
  tone: true,
  content: true,
});

// Schema for inserting a new conversation
export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  contractId: true,
  messages: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export type InsertRiskyClause = z.infer<typeof insertRiskyClauseSchema>;
export type RiskyClause = typeof riskyClauses.$inferSelect;

export type InsertSavedClause = z.infer<typeof insertSavedClauseSchema>;
export type SavedClause = typeof savedClauses.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Message type for conversations
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};
