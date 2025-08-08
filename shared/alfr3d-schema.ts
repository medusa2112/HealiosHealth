import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ALFR3D Security Issues table for Fix Tracking CLI
export const securityIssues = pgTable("security_issues", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // e.g. unauthRoute, unvalidatedInput, rawSQL, sensitiveResp
  filePath: text("filePath").notNull(),
  line: integer("line").notNull(),
  snippet: text("snippet").notNull(),
  fixed: boolean("fixed").default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Fix Attempts table for CLI tracking
export const fixAttempts = pgTable("fix_attempts", {
  id: text("id").primaryKey(),
  summary: text("summary").notNull(),
  fileCount: integer("fileCount").notNull(),
  issueCount: integer("issueCount").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas for validation
export const insertSecurityIssueSchema = createInsertSchema(securityIssues).omit({
  createdAt: true,
});

export const insertFixAttemptSchema = createInsertSchema(fixAttempts).omit({
  createdAt: true,
});

// Type exports
export type SecurityIssue = typeof securityIssues.$inferSelect;
export type InsertSecurityIssue = z.infer<typeof insertSecurityIssueSchema>;
export type FixAttempt = typeof fixAttempts.$inferSelect;
export type InsertFixAttempt = z.infer<typeof insertFixAttemptSchema>;