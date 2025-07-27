# Healios Article Generation System

A comprehensive backend-only article generation system that produces expert-level, medically credible health and wellness articles using AI research and generation.

## Overview

The system integrates research retrieval via Perplexity API, article generation via OpenAI GPT-4, strict quality controls, and PostgreSQL database storage to create authentic Healios content.

## Architecture

- **Research Layer**: Uses Perplexity API to gather data from credible medical sources (PubMed, NICE, NHS, WHO)
- **Generation Engine**: GPT-4 powered article creation with medical compliance and UK English
- **Database Storage**: PostgreSQL with full article metadata and research citations
- **Quality Controls**: Content sanitization, length validation, and medical disclaimer inclusion
- **Rate Limiting**: 30-second delays between articles to prevent token spam

## Files Structure

```
server/
├── article-prompt-template.ts  # Prompt templates and topic definitions
├── article-bot.ts             # Core ArticleBot class with generation logic  
├── article-cli.ts             # Command-line interface for testing
└── routes.ts                  # API endpoints for article management
```

## Environment Variables

```bash
# Required for article generation
PERPLEXITY_API_KEY=your_perplexity_key_here
OPENAI_API_KEY=your_openai_key_here

# Optional for API protection
ARTICLE_BOT_API_KEY=your_secure_api_key_here

# Database (automatically configured)
DATABASE_URL=postgresql://...
```

## CLI Usage

```bash
# Check system status
npm run article:status

# List available topics
npm run article:topics

# Create single article
npm run article:create "Magnesium for Sleep: Clinical Evidence and Benefits"

# Create multiple articles (max 5)
npm run article:create-bulk 3

# List all stored articles
npm run article:list
```

## API Endpoints

### Article Management
- `GET /api/articles` - Get all articles
- `GET /api/articles/:slug` - Get article by slug
- `GET /api/articles/category/:category` - Get articles by category

### Bot Operations (Protected)
- `POST /api/bot/create-article` - Create single article
- `POST /api/bot/create-articles/:count` - Create multiple articles (max 5)
- `GET /api/bot/status` - Get bot configuration and recent articles

### Example API Usage

```bash
# Create single article
curl -X POST http://localhost:5000/api/bot/create-article \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Vitamin D and Mood: What Research Shows",
    "apiKey": "your_api_key_here"
  }'

# Check bot status
curl http://localhost:5000/api/bot/status
```

## Database Schema

```sql
CREATE TABLE articles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  research TEXT,
  sources TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Health',
  author TEXT DEFAULT 'Healios Team',
  read_time TEXT DEFAULT '5 min read',
  published BOOLEAN DEFAULT true,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Predefined Topics

The system includes 14 pre-vetted topics covering Healios product areas:

1. Magnesium for Sleep: Clinical Evidence and Benefits
2. Vitamin D and Mood: What Research Shows  
3. Collagen Benefits Backed by Research
4. Gut-Skin Axis: What Science Says
5. What Is Adaptogenic Fatigue Recovery?
6. The Truth About Hormonal Imbalance in Men & Women
7. Immune System Priming Through Supplementation
8. UK Supplement Regulation Explained
9. Iron Deficiency: Signs, Symptoms and Solutions
10. Biotin for Hair Health: Separating Fact from Fiction
11. Ashwagandha: Ancient Medicine Meets Modern Science
12. Folic Acid in Pregnancy: Essential Guidelines
13. Probiotic Benefits: Evidence-Based Health Support
14. Apple Cider Vinegar: Health Claims vs Reality

## Quality Standards

### Medical Compliance
- Professional medical tone avoiding AI-speak and clickbait
- Educational content only - never medical advice
- EFSA-compliant health claims for UK market
- Mandatory medical disclaimer on every article
- Credible source citations (PubMed, NICE, NHS, WHO)

### Content Structure
- H1 > H2 > H3 semantic hierarchy
- 1500-2000 word target length
- Numbered sections and bullet lists
- Key takeaways summary
- Inline and end-of-article citations

### Technical Validation
- Minimum 500 characters content length
- Research content validation (>100 characters)
- Duplicate slug detection with timestamp fallback
- Content sanitization removing AI disclaimers
- Maximum 2 retry attempts on generation failure

## Error Handling

The system includes comprehensive error handling:

- **API Errors**: Graceful fallback when research APIs fail
- **Content Validation**: Length and quality checks before storage
- **Rate Limiting**: Built-in delays to prevent token exhaustion
- **Retry Logic**: Automatic retries with exponential backoff
- **Logging**: Detailed error logs for debugging

## Security Features

- **API Key Protection**: Optional ARTICLE_BOT_API_KEY for bot endpoints
- **Input Validation**: Zod schema validation for all inputs
- **Content Sanitization**: Removal of potentially harmful content
- **Rate Limiting**: 30-second delays between bulk operations
- **No Frontend Exposure**: Backend-only system for security

## Getting Started

1. **Set Environment Variables**:
   ```bash
   export PERPLEXITY_API_KEY="your_key"
   export OPENAI_API_KEY="your_key"
   export ARTICLE_BOT_API_KEY="optional_security_key"
   ```

2. **Test Configuration**:
   ```bash
   npm run article:status
   ```

3. **Create Your First Article**:
   ```bash
   npm run article:create "Magnesium for Sleep: Clinical Evidence and Benefits"
   ```

4. **View Results**:
   ```bash
   npm run article:list
   ```

## Integration with Frontend

Articles are automatically available through the existing `/api/articles` endpoints and can be integrated into the journal system:

```typescript
// Fetch articles for journal page
const { data: articles } = useQuery<Article[]>({
  queryKey: ["/api/articles"],
});

// Get specific article by slug
const { data: article } = useQuery<Article>({
  queryKey: ["/api/articles", slug],
});
```

## Monitoring and Maintenance

- Monitor API usage through Perplexity and OpenAI dashboards
- Regular content review for medical accuracy
- Database cleanup for outdated or duplicate content
- API key rotation as needed
- Rate limit adjustments based on usage patterns

## Support

For issues or questions:
1. Check logs in console output
2. Verify API key configuration
3. Test with single article before bulk generation
4. Review database connectivity
5. Check rate limiting if multiple failures occur