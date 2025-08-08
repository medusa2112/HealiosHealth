import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ALFR3D Security Issues table
export const securityIssues = pgTable("security_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 64 }).notNull(), // e.g. "authentication", "input_validation"
  severity: varchar("severity", { length: 16 }).notNull(), // "low", "medium", "high", "critical"
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  file: text("file").notNull(), // file path where issue was found
  line: integer("line"), // line number (nullable)
  route: text("route"), // API route if applicable
  status: varchar("status", { length: 16 }).default("open"), // "open", "in_progress", "resolved"
  fixPrompt: text("fix_prompt"), // AI generated fix prompt
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ALFR3D Security Scan Status table
export const securityScans = pgTable("security_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: varchar("status", { length: 16 }).notNull(), // "running", "completed", "failed"
  issuesFound: integer("issues_found").default(0),
  startedAt: text("started_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
  errorMessage: text("error_message"),
});

// Insert schemas for validation
export const insertSecurityIssueSchema = createInsertSchema(securityIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({
  id: true,
  startedAt: true,
});

// Type exports
export type SecurityIssue = typeof securityIssues.$inferSelect;
export type InsertSecurityIssue = z.infer<typeof insertSecurityIssueSchema>;
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;