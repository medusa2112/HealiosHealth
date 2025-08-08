import { randomUUID } from "crypto";
import type { SecurityIssue } from "@shared/schema";

// Mock security issues for ALFR3D testing
export const mockSecurityIssues: SecurityIssue[] = [
  {
    id: randomUUID(),
    type: "authentication",
    severity: "high",
    title: "Missing Rate Limiting on Login Endpoint",
    description: "The /api/auth/login endpoint lacks rate limiting, making it vulnerable to brute force attacks. An attacker could attempt thousands of login combinations without being throttled.",
    recommendation: "Implement rate limiting middleware to restrict login attempts per IP address and per user account.",
    file: "server/routes/auth.ts",
    line: 45,
    route: "/api/auth/login",
    status: "resolved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    type: "input_validation",
    severity: "critical",
    title: "SQL Injection in Product Search",
    description: "The product search functionality directly concatenates user input into SQL queries without proper sanitization or parameterization, creating a critical SQL injection vulnerability.",
    recommendation: "Use parameterized queries or ORM methods to prevent SQL injection. Validate and sanitize all user inputs before database operations.",
    file: "server/routes.ts",
    line: 134,
    route: "/api/products/category/:category",
    status: "resolved",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "authorization",
    severity: "medium",
    title: "Insufficient Role Validation in Admin Routes",
    description: "Some admin routes only check for authentication but not for proper admin role authorization, allowing authenticated customers to access admin functions.",
    recommendation: "Implement proper role-based access control (RBAC) middleware to verify admin privileges before allowing access to sensitive endpoints.",
    file: "server/routes/admin.ts",
    line: 23,
    route: "/api/admin/users",
    status: "resolved",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "csrf",
    severity: "medium",
    title: "Missing CSRF Protection on State-Changing Operations",
    description: "Critical operations like order creation and user data modification lack CSRF protection, making them vulnerable to cross-site request forgery attacks.",
    recommendation: "Implement CSRF tokens for all state-changing operations. Use SameSite cookies and verify origin headers.",
    file: "server/routes.ts",
    line: 551,
    route: "/api/orders",
    status: "resolved",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "xss",
    severity: "high",
    title: "Potential XSS in User Profile Display",
    description: "User-generated content in profiles is not properly sanitized before display, potentially allowing stored XSS attacks through malicious profile data.",
    recommendation: "Implement proper input sanitization and output encoding. Use Content Security Policy (CSP) headers to mitigate XSS risks.",
    file: "client/src/pages/customer-portal.tsx",
    line: 67,
    status: "resolved",
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: randomUUID(),
    type: "session",
    severity: "low",
    title: "Session Timeout Configuration",
    description: "Session timeout is set to a very long duration (24 hours) which increases the risk window if a session is compromised.",
    recommendation: "Reduce session timeout to a more reasonable duration (1-2 hours) and implement proper session renewal mechanisms.",
    file: "server/index.ts",
    line: 34,
    status: "resolved",
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
  }
];