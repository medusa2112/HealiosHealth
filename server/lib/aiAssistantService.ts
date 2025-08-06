import { storage } from "../storage";
import { sendEmail } from "./email";
import { randomUUID } from "crypto";

// Rate limiting storage
const userRequestCounts: Map<string, { count: number; resetTime: number }> = new Map();
const MAX_REQUESTS_PER_HOUR = 10;

// Healios FAQ Knowledge Base
const FAQ_KNOWLEDGE_BASE = [
  {
    q: "What is your return policy?",
    a: "Returns are accepted within 30 days of purchase if products are unopened and in original packaging. Email us at support@healios.com to initiate a return.",
    category: "returns"
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship to South Africa only. We're working on expanding our shipping regions.",
    category: "shipping"
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days within South Africa. Free shipping on orders over R500.",
    category: "shipping"
  },
  {
    q: "What are your discount codes?",
    a: "Check our active promotions on the website. First-time customers can use WELCOME10 for 10% off their first order.",
    category: "discounts"
  },
  {
    q: "Are your products safe during pregnancy?",
    a: "We recommend consulting with your healthcare provider before taking any supplements during pregnancy or breastfeeding. Our products contain ingredient lists for your doctor's review.",
    category: "medical"
  },
  {
    q: "What makes Healios different from other supplement brands?",
    a: "Healios focuses on evidence-based formulations with high-quality ingredients. All our products are third-party tested and we prioritize transparency in our ingredient sourcing.",
    category: "products"
  },
  {
    q: "How do subscriptions work?",
    a: "You can set up auto-refill subscriptions for any product. Choose your delivery frequency (30, 60, or 90 days) and save 10% on every order. Cancel anytime from your customer portal.",
    category: "subscriptions"
  },
  {
    q: "Can I change my subscription?",
    a: "Yes! Log into your customer portal to modify delivery frequency, skip shipments, or cancel your subscription anytime.",
    category: "subscriptions"
  },
  {
    q: "What if I'm not satisfied with my order?",
    a: "We offer a 30-day satisfaction guarantee. If you're not happy with your purchase, contact us for a full refund or replacement.",
    category: "satisfaction"
  },
  {
    q: "How do I track my order?",
    a: "After placing an order, you'll receive a confirmation email with tracking information. You can also track orders in your customer portal.",
    category: "orders"
  }
];

// Check rate limiting for user
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userRequestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    userRequestCounts.set(userId, {
      count: 1,
      resetTime: now + (60 * 60 * 1000) // 1 hour from now
    });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Analyze user intent and extract relevant data
export async function analyzeUserIntent(message: string, userId?: string): Promise<{
  intent: 'order_tracking' | 'return_request' | 'discount_validation' | 'faq' | 'general' | 'medical_advice';
  confidence: number;
  extractedData?: any;
}> {
  const messageLower = message.toLowerCase();
  
  // Order tracking patterns
  if (messageLower.includes('track') || messageLower.includes('order') || messageLower.includes('delivery') || messageLower.includes('shipped')) {
    return { intent: 'order_tracking', confidence: 0.9 };
  }
  
  // Return request patterns
  if (messageLower.includes('return') || messageLower.includes('refund') || messageLower.includes('exchange')) {
    return { intent: 'return_request', confidence: 0.9 };
  }
  
  // Discount code validation
  if (messageLower.includes('discount') || messageLower.includes('code') || messageLower.includes('promo')) {
    return { intent: 'discount_validation', confidence: 0.8 };
  }
  
  // Medical advice detection (to refuse)
  if (messageLower.includes('pregnant') || messageLower.includes('medication') || messageLower.includes('disease') || 
      messageLower.includes('condition') || messageLower.includes('doctor') || messageLower.includes('medical')) {
    return { intent: 'medical_advice', confidence: 0.9 };
  }
  
  // FAQ patterns
  const faqKeywords = ['shipping', 'return', 'policy', 'guarantee', 'subscription', 'international', 'how long'];
  const containsFaqKeyword = faqKeywords.some(keyword => messageLower.includes(keyword));
  
  if (containsFaqKeyword) {
    return { intent: 'faq', confidence: 0.7 };
  }
  
  return { intent: 'general', confidence: 0.5 };
}

// Handle order tracking requests
export async function handleOrderTracking(userId: string): Promise<string> {
  const allOrders = await storage.getAllOrders();
  const userOrders = allOrders.filter((order: any) => order.userId === userId);
  
  if (userOrders.length === 0) {
    return "I don't see any orders in your account. If you placed an order recently, it might still be processing. Please contact support if you need assistance.";
  }
  
  // Get the most recent order
  const latestOrder = userOrders.sort((a: any, b: any) => 
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  )[0];
  
  const orderItems = await storage.getOrderItemsByOrderId(latestOrder.id);
  const itemSummary = orderItems.length === 1 
    ? `${orderItems[0].quantity}x ${orderItems[0].productName}`
    : `${orderItems.length} items`;
  
  let statusMessage = "";
  const orderStatus = (latestOrder as any).status || latestOrder.stripePaymentStatus;
  switch (orderStatus) {
    case 'pending':
      statusMessage = "Your order is being processed and will ship soon.";
      break;
    case 'processing':
      statusMessage = "Your order is being prepared for shipment.";
      break;
    case 'shipped':
      statusMessage = "Your order has been shipped and is on the way!";
      break;
    case 'completed':
    case 'succeeded':
      statusMessage = "Your order has been delivered.";
      break;
    case 'cancelled':
      statusMessage = "This order was cancelled.";
      break;
    default:
      statusMessage = "Your order is being processed.";
  }
  
  return `Your most recent order (#${latestOrder.id.slice(0, 8)}) contains ${itemSummary} for R${latestOrder.totalAmount}. ${statusMessage}`;
}

// Handle return requests
export async function handleReturnRequest(userId: string, orderId?: string): Promise<string> {
  const allOrders = await storage.getAllOrders();
  const userOrders = allOrders.filter((order: any) => order.userId === userId);
  
  if (userOrders.length === 0) {
    return "I don't see any orders in your account that are eligible for returns. Please contact support if you need assistance.";
  }
  
  // Find specific order or use latest
  let targetOrder = orderId 
    ? userOrders.find((o: any) => o.id.startsWith(orderId))
    : userOrders.sort((a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
  
  if (!targetOrder) {
    return "I couldn't find that order. Please check your order number or contact support for assistance.";
  }
  
  // Check if order is within return window (30 days)
  const orderDate = new Date(targetOrder.createdAt || '');
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceOrder > 30) {
    return `Order #${targetOrder.id.slice(0, 8)} is ${daysSinceOrder} days old and outside our 30-day return window. Please contact support to discuss options.`;
  }
  
  // Create support ticket for return
  const user = await storage.getUserById(userId);
  await storage.createSupportTicket({
    userId,
    email: user?.email || '',
    subject: `Return Request - Order #${targetOrder.id.slice(0, 8)}`,
    message: `Customer requested return for order #${targetOrder.id}. Order placed ${daysSinceOrder} days ago.`,
    category: 'return',
    orderId: targetOrder.id,
    aiHandled: true,
    priority: 'medium'
  });
  
  // Send notification to support team (simplified email without specific template)
  try {
    await sendEmail(
      'support@healios.com',
      'order-confirmation',
      `Customer requested return for order #${targetOrder.id.slice(0, 8)}. 
       Customer: ${user?.email}
       Order amount: R${targetOrder.totalAmount}
       Order placed: ${daysSinceOrder} days ago`
    );
  } catch (error) {
    console.log('Email notification failed, but return request still created');
  }
  
  return `I've created a return request for order #${targetOrder.id.slice(0, 8)}. Our support team will contact you within 24 hours to arrange the return. You'll receive a return label and instructions via email.`;
}

// Handle discount code validation
export async function handleDiscountValidation(code?: string): Promise<string> {
  if (!code) {
    return "You can use discount codes at checkout. First-time customers can use WELCOME10 for 10% off. Check our promotions page for current offers.";
  }
  
  const discountCode = await storage.getDiscountCodeByCode(code);
  
  if (!discountCode) {
    return `I couldn't find a discount code "${code}". Please check the spelling or contact support if you believe this is an error.`;
  }
  
  if (!discountCode.isActive) {
    return `The discount code "${code}" is no longer active. Check our current promotions for available offers.`;
  }
  
  const now = new Date();
  const expiryDate = new Date(discountCode.expiresAt || '');
  
  if (discountCode.expiresAt && expiryDate < now) {
    return `The discount code "${code}" expired on ${expiryDate.toLocaleDateString()}. Check our current promotions for available offers.`;
  }
  
  const discountText = discountCode.type === 'percentage' 
    ? `${discountCode.value}% off`
    : `R${discountCode.value} off`;
  
  return `Great! The code "${code}" is valid and gives you ${discountText} your order. Apply it at checkout to save!`;
}

// Search FAQ knowledge base
export function searchFAQ(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  // Find the best matching FAQ
  let bestMatch = null;
  let highestScore = 0;
  
  for (const faq of FAQ_KNOWLEDGE_BASE) {
    const questionWords = faq.q.toLowerCase().split(' ');
    const answerWords = faq.a.toLowerCase().split(' ');
    const allWords = [...questionWords, ...answerWords];
    
    let score = 0;
    const queryWords = queryLower.split(' ');
    
    for (const queryWord of queryWords) {
      if (queryWord.length > 2) { // Ignore short words
        for (const word of allWords) {
          if (word.includes(queryWord) || queryWord.includes(word)) {
            score += 1;
          }
        }
      }
    }
    
    if (score > highestScore && score > 0) {
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  return bestMatch ? bestMatch.a : null;
}

// Main AI assistant handler
export async function processAIAssistantRequest(
  message: string,
  userId?: string,
  sessionToken?: string
): Promise<{
  response: string;
  requiresEscalation: boolean;
  sessionId?: string;
  metadata?: any;
}> {
  try {
    // Rate limiting check
    if (userId && !checkRateLimit(userId)) {
      return {
        response: "You've reached the hourly limit for AI assistant requests. Please try again later or contact support directly.",
        requiresEscalation: false
      };
    }
    
    // Analyze user intent
    const intent = await analyzeUserIntent(message, userId);
    
    let response = "";
    let requiresEscalation = false;
    
    switch (intent.intent) {
      case 'order_tracking':
        if (userId) {
          response = await handleOrderTracking(userId);
        } else {
          response = "To track your order, please log in to your account first. If you don't have an account, you can check your email for order confirmation with tracking details.";
          requiresEscalation = true;
        }
        break;
        
      case 'return_request':
        if (userId) {
          response = await handleReturnRequest(userId);
        } else {
          response = "To process a return, please log in to your account or email us at support@healios.com with your order number.";
          requiresEscalation = true;
        }
        break;
        
      case 'discount_validation':
        // Extract potential discount code from message
        const words = message.split(' ');
        const potentialCode = words.find(word => 
          word.length > 4 && (word.includes('HEALIOS') || word.toUpperCase() === word)
        );
        response = await handleDiscountValidation(potentialCode);
        break;
        
      case 'medical_advice':
        response = "I can't provide medical advice. Please consult with your healthcare provider before taking any supplements, especially if you're pregnant, nursing, or have medical conditions. Our product labels include complete ingredient information for your doctor's review.";
        break;
        
      case 'faq':
        const faqResponse = searchFAQ(message);
        if (faqResponse) {
          response = faqResponse;
        } else {
          response = "I couldn't find specific information about that. Please contact our support team at support@healios.com for detailed assistance.";
          requiresEscalation = true;
        }
        break;
        
      default:
        const generalFaq = searchFAQ(message);
        if (generalFaq) {
          response = generalFaq;
        } else {
          response = "I'd be happy to help! I can assist with order tracking, returns, discount codes, and general product questions. For specific issues, please contact support@healios.com.";
          requiresEscalation = true;
        }
    }
    
    // Create or update chat session
    let sessionId = undefined;
    if (userId || sessionToken) {
      const messages = JSON.stringify([
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() }
      ]);
      
      const session = await storage.createChatSession({
        userId,
        sessionToken,
        messages,
        metadata: JSON.stringify({ intent: intent.intent, confidence: intent.confidence })
      });
      
      sessionId = session.id;
    }
    
    return {
      response,
      requiresEscalation,
      sessionId,
      metadata: { intent: intent.intent, confidence: intent.confidence }
    };
    
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return {
      response: "I'm experiencing technical difficulties. Please contact our support team at support@healios.com for immediate assistance.",
      requiresEscalation: true
    };
  }
}

// Escalate to human support
export async function escalateToSupport(
  sessionId: string,
  reason: string,
  userId?: string
): Promise<void> {
  try {
    const session = await storage.getChatSession(sessionId);
    if (!session) return;
    
    const user = userId ? await storage.getUserById(userId) : null;
    const email = user?.email || 'anonymous@user.com';
    
    // Create support ticket
    const ticket = await storage.createSupportTicket({
      userId,
      email,
      subject: 'AI Assistant Escalation',
      message: `AI assistant escalated conversation. Reason: ${reason}`,
      transcript: session.messages,
      aiHandled: true,
      category: 'general'
    });
    
    // Update chat session
    await storage.updateChatSession(sessionId, {
      escalated: true,
      supportTicketId: ticket.id
    });
    
    // Notify support team (simplified email)
    try {
      await sendEmail(
        'support@healios.com',
        'order-confirmation',
        `AI conversation escalated to support.
         Ticket ID: ${ticket.id}
         Reason: ${reason}
         Customer: ${email}
         
         Conversation transcript:
         ${session.messages}`
      );
    } catch (error) {
      console.log('Email notification failed, but escalation ticket still created');
    }
    
  } catch (error) {
    console.error('Escalation Error:', error);
  }
}