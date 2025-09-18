import { ARTICLE_PROMPT_TEMPLATE, MEDICAL_DISCLAIMER, predefinedTopics } from './article-prompt-template';

interface ResearchData {
  sources: string[];
  content: string;
}

interface ArticleData {
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  research: string;
  sources: string[];
  created_at: string;
}

export class ArticleBot {
  private perplexityApiKey: string;
  private openaiApiKey: string;

  constructor(perplexityApiKey: string, openaiApiKey: string) {
    this.perplexityApiKey = perplexityApiKey;
    this.openaiApiKey = openaiApiKey;
  }

  async gatherResearch(topic: string): Promise<ResearchData> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: `Research ${topic} using credible medical sources. Focus on:
              - PubMed studies and clinical trials
              - NHS, NICE, or WHO guidelines
              - Mayo Clinic or similar medical institutions
              - Recent peer-reviewed research (last 5 years preferred)
              
              Provide specific citations with URLs where possible. Summarize key findings that would be relevant for a UK health-conscious audience.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      const researchContent = data.choices[0]?.message?.content || '';
      
      // Extract URLs from the research content
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const sources = researchContent.match(urlRegex) || [];

      return {
        sources: sources.slice(0, 10), // Limit to 10 sources
        content: researchContent
      };
    } catch (error) {
      // // console.error('Research gathering failed:', error);
      return {
        sources: [],
        content: 'Research data unavailable. Article will be based on general knowledge.'
      };
    }
  }

  async generateArticle(topic: string, research: ResearchData): Promise<string> {
    try {
      const prompt = ARTICLE_PROMPT_TEMPLATE
        .replace('{topic}', topic)
        .replace('{research}', research.content);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are an expert medical content writer specializing in evidence-based health articles for UK audiences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_completion_tokens: 2000
          // Note: temperature parameter not supported in gpt-5
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';

      // Add medical disclaimer
      content += MEDICAL_DISCLAIMER;

      // Sanitize content (remove AI disclaimers and unsupported claims)
      content = this.sanitizeContent(content);

      return content;
    } catch (error) {
      // // console.error('Article generation failed:', error);
      throw error;
    }
  }

  private sanitizeContent(content: string): string {
    // Remove common AI disclaimers and phrases
    const aiPhrases = [
      /I'm an AI and cannot provide medical advice/gi,
      /As an AI language model/gi,
      /Please consult with a healthcare professional/gi,
      /I cannot provide medical diagnosis/gi,
      /This is not medical advice/gi
    ];

    let sanitized = content;
    aiPhrases.forEach(phrase => {
      sanitized = sanitized.replace(phrase, '');
    });

    // Remove any remaining AI-specific language
    sanitized = sanitized.replace(/\b(I'm|I am|As an AI)\b[^.]*\./gi, '');
    
    // Clean up extra whitespace
    sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return sanitized.trim();
  }

  private generateSlug(title: string): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
    
    return `${slugBase}-${date}`;
  }

  private extractMetaDescription(content: string): string {
    // Try to extract from content or generate from first paragraph
    const firstParagraph = content.match(/<p>(.*?)<\/p>/)?.[1] || '';
    const cleaned = firstParagraph.replace(/<[^>]*>/g, '').substring(0, 157) + '...';
    return cleaned;
  }

  private extractTitle(content: string): string {
    // Extract H1 title from content
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'Untitled Article';
  }

  async createArticle(topic: string, maxRetries: number = 2): Promise<ArticleData> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        console.log(`Generating article for topic: ${topic}`);
        
        // Step 1: Gather research
        const research = await this.gatherResearch(topic);
        
        // Step 2: Generate article
        const content = await this.generateArticle(topic, research);
        
        // Step 3: Validate content
        if (content.length < 500) {
          throw new Error('Generated content too short');
        }
        
        if (research.content.length < 100) {
          console.warn('Limited research data available');
        }
        
        // Step 4: Extract metadata
        const title = this.extractTitle(content) || topic;
        const slug = this.generateSlug(title);
        const metaDescription = this.extractMetaDescription(content);
        
        return {
          title,
          slug,
          meta_description: metaDescription,
          content,
          research: research.content,
          sources: research.sources,
          created_at: new Date().toISOString()
        };
        
      } catch (error) {
        attempts++;
        console.error(`Article generation attempt ${attempts} failed:`, error);
        
        if (attempts >= maxRetries) {
          throw new Error(`Failed to generate article after ${maxRetries} attempts: ${error}`);
        }
        
        // Wait 30 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    throw new Error('Unexpected error in article creation');
  }

  async createMultipleArticles(count: number): Promise<ArticleData[]> {
    const maxCount = Math.min(count, 5); // Limit to 5 articles per run
    const articles: ArticleData[] = [];
    
    // Get random topics
    const shuffledTopics = [...predefinedTopics].sort(() => 0.5 - Math.random());
    const selectedTopics = shuffledTopics.slice(0, maxCount);
    
    for (const topic of selectedTopics) {
      try {
        const article = await this.createArticle(topic);
        articles.push(article);
        
        // Rate limit: wait 30 seconds between articles
        if (articles.length < maxCount) {
          console.log('Waiting 30 seconds before next article...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error(`Failed to create article for topic: ${topic}`, error);
        // Continue with next topic
      }
    }
    
    return articles;
  }

  static getAvailableTopics(): string[] {
    return predefinedTopics;
  }
}