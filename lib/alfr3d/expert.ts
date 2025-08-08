import OpenAI from "openai";
import type { SecurityIssue } from "@shared/schema";
import type { FixPrompt } from "../../types/alfr3d";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class Alfr3dExpert {
  /**
   * Generate an expert fix prompt for a security issue using AI
   */
  async generateFixPrompt(issue: SecurityIssue): Promise<FixPrompt> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('ALFR3D Expert only available in development');
    }

    const expertPrompt = this.buildExpertPrompt(issue);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: expertPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent, precise technical responses
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        analysis: result.analysis || 'No analysis provided',
        steps: result.steps || [],
        riskLevel: result.riskLevel || 'medium',
        estimatedTime: result.estimatedTime || 'Unknown',
        prerequisites: result.prerequisites || [],
        testingApproach: result.testingApproach || 'Manual verification required'
      };

    } catch (error) {
      console.error('[ALFR3D Expert] Failed to generate fix prompt:', error);
      throw new Error(`Failed to generate AI fix prompt: ${error.message}`);
    }
  }

  /**
   * System prompt that defines the expert's role and capabilities
   */
  private getSystemPrompt(): string {
    return `You are ALFR3D Expert, an elite security consultant specializing in full-stack web application security. Your expertise spans:

🔒 SECURITY DOMAINS:
- Authentication & Authorization (JWT, OAuth, RBAC)
- Input Validation & Sanitization (XSS, SQL Injection, CSRF)
- API Security (Rate limiting, CORS, Headers)
- Database Security (ORM best practices, query protection)
- Frontend Security (State management, type safety)

🛠 TECHNICAL STACK:
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL, Drizzle ORM
- Frontend: React, TypeScript, Vite
- Authentication: Passport.js, Sessions

📋 YOUR TASK:
Analyze security issues and provide PRECISE, ACTIONABLE fix instructions. Always respond in JSON format with these exact fields:

{
  "analysis": "Detailed technical analysis of the security vulnerability and its implications",
  "steps": ["Step 1: Specific action", "Step 2: Next action", "..."],
  "riskLevel": "low|medium|high|critical",
  "estimatedTime": "5 minutes|30 minutes|2 hours|1 day",
  "prerequisites": ["Required knowledge or setup needed"],
  "testingApproach": "How to verify the fix works and doesn't break anything"
}

🎯 EXPERT PRINCIPLES:
- Provide specific file paths and line numbers when possible
- Include exact code examples in steps
- Consider both security AND performance implications
- Always include testing/verification steps
- Account for edge cases and potential breaking changes
- Prioritize fixes that address root causes, not just symptoms`;
  }

  /**
   * Build the specific prompt for this security issue
   */
  private buildExpertPrompt(issue: SecurityIssue): string {
    return `🚨 SECURITY ISSUE ANALYSIS REQUEST

TYPE: ${issue.type.toUpperCase()}
SEVERITY: ${issue.severity.toUpperCase()}
TITLE: ${issue.title}

📍 LOCATION:
File: ${issue.file}
${issue.line ? `Line: ${issue.line}` : ''}
${issue.route ? `Route: ${issue.route}` : ''}

📋 DESCRIPTION:
${issue.description}

🎯 CURRENT RECOMMENDATION:
${issue.recommendation}

🔍 CONTEXT:
This is a ${issue.type} issue in a TypeScript/Node.js e-commerce application using:
- Express.js server with session-based authentication
- PostgreSQL database with Drizzle ORM
- React frontend with TypeScript
- Admin portal with RBAC (admin/customer roles)

📝 EXPERT ANALYSIS REQUIRED:
1. Provide deep technical analysis of WHY this is a security issue
2. Create step-by-step fix instructions with exact code examples
3. Assess the risk level accurately
4. Estimate realistic time to implement
5. List any prerequisites (knowledge, tools, dependencies)
6. Define comprehensive testing approach

The fix should be production-ready and follow security best practices for enterprise applications.`;
  }
}

export const alfr3dExpert = new Alfr3dExpert();