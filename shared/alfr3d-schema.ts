import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSecurityIssueSchema = createInsertSchema(securityIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSecurityIssue = z.infer<typeof insertSecurityIssueSchema>;
export type SecurityIssue = typeof securityIssues.$inferSelect;