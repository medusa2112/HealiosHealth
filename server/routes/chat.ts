import { Request, Response } from 'express';

interface ChatMessage {
  content: string;
  isUser: boolean;
}

interface ProductQuestionRequest {
  question: string;
  conversationHistory?: ChatMessage[];
}

// Product knowledge base
const PRODUCT_KNOWLEDGE = `
You are a helpful nutrition assistant for Healios, a premium supplement company specializing in science-backed gummy vitamins and supplements. Here's key information about our products:

CURRENT PRODUCTS & STOCK STATUS:
- Apple Cider Vinegar Gummies (Strawberry) - IN STOCK - R349.00
- Vitamin D3 4000 IU Gummies (Lemon) - IN STOCK - R429.00 (our bestselling high-potency formula)
- Ashwagandha 600mg Gummies (Strawberry) - PREORDER
- Iron + Vitamin C Gummies (Cherry) - PREORDER  
- Biotin 5000µg Gummies (Strawberry) - PREORDER
- Magnesium Gummies (Berry) - PREORDER
- Collagen Complex Gummies (Orange) - PREORDER
- Probiotic Complex 10 Billion CFU (Capsules) - PREORDER - NOT gummies, these are delayed-release capsules
- Folic Acid 400µg Gummies (Berry) - PREORDER
- Children's Multivitamin Gummies - PREORDER

KEY DIFFERENTIATORS:
- Science-backed formulations with EFSA health claims where applicable
- No artificial colors, flavors, or preservatives
- Vegetarian-friendly (except some specialty formulas)
- High-potency therapeutic doses
- Premium ingredients with superior bioavailability
- South African pricing in ZAR (Rand)

DOSAGE & SAFETY:
- All products designed for daily use
- Follow label instructions for dosage
- Consult healthcare provider if pregnant, nursing, or taking medications
- Our Vitamin D3 is 4000 IU high-potency, ideal for year-round support

SPECIAL FEATURES:
- Bundle discounts available on product pages
- Pre-order system for out-of-stock items with email notifications
- Free shipping on qualifying orders
- 60-day satisfaction guarantee

Always be helpful, accurate, and recommend consulting healthcare providers for specific health concerns. Focus on ingredient benefits backed by research rather than making medical claims.
`;

export async function handleProductQuestion(req: Request, res: Response) {
  try {
    const { question, conversationHistory = [] }: ProductQuestionRequest = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n' + 
        conversationHistory.slice(-3).map(msg => 
          `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }

    const prompt = `${PRODUCT_KNOWLEDGE}

${conversationContext}

User Question: ${question}

Please provide a helpful, accurate response about Healios supplements. Be conversational but informative. If the question is about specific health conditions, remind them to consult their healthcare provider. Keep responses concise but comprehensive.`;

    // Call OpenAI API for intelligent responses
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable nutrition assistant for Healios supplements. Be helpful, accurate, and friendly while staying within the bounds of nutrition education rather than medical advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0]?.message?.content || 
      'I apologize, but I\'m having trouble processing your question right now. Please try again or contact our support team.';

    res.json({ answer });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback response for common questions
    const question = req.body.question?.toLowerCase() || '';
    let fallbackAnswer = '';
    
    if (question.includes('vitamin d') || question.includes('d3')) {
      fallbackAnswer = 'Our Vitamin D3 4000 IU is our bestselling high-potency formula, perfect for year-round immune and bone support. It\'s currently in stock for R429.00. The lemon flavor makes it enjoyable to take daily, and 4000 IU provides optimal therapeutic levels for most adults.';
    } else if (question.includes('apple cider vinegar') || question.includes('acv')) {
      fallbackAnswer = 'Our Apple Cider Vinegar Gummies provide all the benefits of traditional ACV without the harsh taste or burn. They support metabolism and digestive health in a delicious strawberry flavor. Currently in stock for R349.00.';
    } else if (question.includes('stock') || question.includes('available')) {
      fallbackAnswer = 'Currently, we have Apple Cider Vinegar Gummies and Vitamin D3 4000 IU in stock. All other products are available for pre-order with email notifications when they become available.';
    } else if (question.includes('price') || question.includes('cost')) {
      fallbackAnswer = 'Our supplements range from R299-R449, with bundle discounts available. Apple Cider Vinegar is R299 and Vitamin D3 4000 IU is R429. Check individual product pages for current bundle offers.';
    } else {
      fallbackAnswer = 'I\'d be happy to help with information about our science-backed supplements! We offer premium gummy vitamins and supplements with authentic ingredients. What specific product or ingredient would you like to know more about?';
    }
    
    res.json({ answer: fallbackAnswer });
  }
}