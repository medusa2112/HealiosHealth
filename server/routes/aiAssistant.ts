import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { processAIAssistantRequest, escalateToSupport } from "../lib/aiAssistantService";
import { storage } from "../storage";
import { randomUUID } from "crypto";

const router = Router();

// Rate limiting storage for anonymous users
const anonymousRequestCounts: Map<string, { count: number; resetTime: number }> = new Map();
const MAX_ANONYMOUS_REQUESTS = 5;

function checkAnonymousRateLimit(sessionToken: string): boolean {
  const now = Date.now();
  const userLimit = anonymousRequestCounts.get(sessionToken);
  
  if (!userLimit || now > userLimit.resetTime) {
    anonymousRequestCounts.set(sessionToken, {
      count: 1,
      resetTime: now + (60 * 60 * 1000) // 1 hour from now
    });
    return true;
  }
  
  if (userLimit.count >= MAX_ANONYMOUS_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// POST /api/ai-assistant/chat - Main chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, sessionToken } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Get user ID if authenticated
    const userId = req.user?.claims?.sub;
    
    // Rate limiting for anonymous users
    if (!userId && sessionToken) {
      if (!checkAnonymousRateLimit(sessionToken)) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please try again later or create an account for higher limits.",
          requiresLogin: true
        });
      }
    }
    
    // Generate session token for anonymous users if not provided
    const finalSessionToken = sessionToken || (!userId ? randomUUID() : undefined);
    
    // Process the request
    const result = await processAIAssistantRequest(message, userId, finalSessionToken);
    
    res.json({
      response: result.response,
      requiresEscalation: result.requiresEscalation,
      sessionId: result.sessionId,
      sessionToken: finalSessionToken,
      metadata: result.metadata
    });
    
  } catch (error) {
    console.error('AI Assistant Chat Error:', error);
    res.status(500).json({ 
      error: "I'm experiencing technical difficulties. Please try again or contact support.",
      requiresEscalation: true
    });
  }
});

// POST /api/ai-assistant/escalate - Escalate to human support
router.post("/escalate", async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    
    if (!sessionId || !reason) {
      return res.status(400).json({ error: "Session ID and reason are required" });
    }
    
    const userId = req.user?.claims?.sub;
    
    await escalateToSupport(sessionId, reason, userId);
    
    res.json({ 
      success: true, 
      message: "Your conversation has been escalated to our support team. They will contact you shortly." 
    });
    
  } catch (error) {
    console.error('Escalation Error:', error);
    res.status(500).json({ error: "Failed to escalate to support" });
  }
});

// GET /api/ai-assistant/session/:id - Get chat session (authenticated users only)
router.get("/session/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const session = await storage.getChatSession(id);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Check if user owns this session
    if (session.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(session);
    
  } catch (error) {
    console.error('Get Session Error:', error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

// GET /api/ai-assistant/sessions - Get user's chat sessions
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const sessions = await storage.getChatSessionsByUserId(userId);
    
    // Sort by last activity, most recent first
    const sortedSessions = sessions.sort((a: any, b: any) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    
    res.json(sortedSessions);
    
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ error: "Failed to retrieve sessions" });
  }
});

// POST /api/ai-assistant/feedback - Submit feedback on AI response
router.post("/feedback", async (req, res) => {
  try {
    const { sessionId, rating, feedback } = req.body;
    
    if (!sessionId || !rating) {
      return res.status(400).json({ error: "Session ID and rating are required" });
    }
    
    // Update session with feedback
    const session = await storage.getChatSession(sessionId);
    if (session) {
      const metadata = JSON.parse(session.metadata || '{}');
      metadata.feedback = { rating, feedback, timestamp: new Date().toISOString() };
      
      await storage.updateChatSession(sessionId, {
        metadata: JSON.stringify(metadata)
      });
    }
    
    res.json({ success: true, message: "Thank you for your feedback!" });
    
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

export { router as aiAssistantRoutes };