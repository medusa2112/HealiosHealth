import { randomUUID } from "crypto";
import type { SecurityIssue } from "@shared/schema";

// Mock security issues for ALFR3D testing
export const mockSecurityIssues: SecurityIssue[] = [
  {
    id: randomUUID(),
    type: "authentication",
    filePath: "server/routes/auth.ts",
    line: 45,
    snippet: "app.post('/api/auth/login', (req, res) => { /* missing rate limiting */ });",
    fixed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    type: "input_validation",
    filePath: "server/routes.ts",
    line: 134,
    snippet: "const query = 'SELECT * FROM products WHERE category = ' + userInput;",
    fixed: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "authorization",
    filePath: "server/routes/admin.ts",
    line: 23,
    snippet: "router.get('/api/admin/users', authenticateToken, (req, res) => { /* missing role check */ });",
    fixed: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "csrf",
    filePath: "server/routes.ts",
    line: 551,
    snippet: "app.post('/api/orders', (req, res) => { /* missing CSRF protection */ });",
    fixed: true,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "xss",
    filePath: "client/src/pages/customer-portal.tsx",
    line: 67,
    snippet: "<div>{userProfile.bio}</div> // Unescaped user content",
    fixed: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "session",
    filePath: "server/index.ts",
    line: 34,
    snippet: "session({ maxAge: 24 * 60 * 60 * 1000 }) // 24 hours - too long",
    fixed: true,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  }
];