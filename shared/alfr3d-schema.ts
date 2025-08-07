import { pgTable, text, timestamp, boolean, uuid, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const securityIssues = pgTable("security_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'security' | 'routing' | 'schema' | 'sync'
  severity: text("severity").notNull(), // 'low' | 'medium' | 'high' | 'critical'
  title: text("title").notNull(),
  description: text("description").notNull(),
  file: text("file").notNull(),
  line: text("line"),
  route: text("route"),
  recommendation: text("recommendation").notNull(),
  reviewed: boolean("reviewed").default(false).notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  archived: boolean("archived").default(false).notNull(),
  archivedAt: timestamp("archived_at"),
  archivedBy: text("archived_by"),
  fixPrompt: json("fix_prompt"), // FixPrompt object
  fixAttempts: json("fix_attempts").default('[]'), // FixAttempt[] array
  issueKey: text("issue_key").notNull(), // Unique identifier for tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fixAttempts = pgTable("fix_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id").notNull().references(() => securityIssues.id),
  appliedBy: text("applied_by").notNull(),
  success: boolean("success").notNull(),
  notes: text("notes"),
  scanResultBefore: integer("scan_result_before").notNull(),
  scanResultAfter: integer("scan_result_after").notNull(),
  newIssuesIntroduced: integer("new_issues_introduced").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSecurityIssueSchema = createInsertSchema(securityIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFixAttemptSchema = createInsertSchema(fixAttempts).omit({
  id: true,
  createdAt: true,
});

export type InsertSecurityIssue = z.infer<typeof insertSecurityIssueSchema>;
export type SecurityIssue = typeof securityIssues.$inferSelect;
export type InsertFixAttempt = z.infer<typeof insertFixAttemptSchema>;
export type FixAttempt = typeof fixAttempts.$inferSelect;