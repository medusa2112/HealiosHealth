#!/usr/bin/env tsx

import { ArticleBot } from './article-bot';
import { storage } from './storage';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    
  npm run article:list                      - List all articles

Environment Variables Required:
  PERPLEXITY_API_KEY - For research gathering
  OPENAI_API_KEY     - For article generation
  ARTICLE_BOT_API_KEY - For API protection (optional)
    `);
    return;
  }

  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;
      case 'topics':
        await showTopics();
        break;
      case 'create':
        const topic = args[1];
        if (!topic) {
          // // console.error('Topic required. Usage: npm run article:create "Topic Name"');
          process.exit(1);
        }
        await createArticle(topic);
        break;
      case 'create-bulk':
        const count = parseInt(args[1]) || 1;
        await createBulkArticles(count);
        break;
      case 'list':
        await listArticles();
        break;
      default:
        // // console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    // // console.error('Error:', error.message);
    process.exit(1);
  }
}

async function showStatus() {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!perplexityKey || !openaiKey) {
    
    return;
  }
  
  const articles = await storage.getLatestArticles(10);

  if (articles.length > 0) {
    
    articles.forEach((article, i) => {
      `);
    });
  }
}

async function showTopics() {
  const topics = ArticleBot.getAvailableTopics();

  topics.forEach((topic, i) => {
    
  });
}

async function createArticle(topic: string) {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!perplexityKey || !openaiKey) {
    // // console.error('❌ Missing API keys. Set PERPLEXITY_API_KEY and OPENAI_API_KEY');
    process.exit(1);
  }

  const bot = new ArticleBot(perplexityKey, openaiKey);
  
  try {
    // Create article data
    const articleData = await bot.createArticle(topic);
    
    // Save to database
    const article = await storage.createArticle({
      title: articleData.title,
      slug: articleData.slug,
      metaDescription: articleData.meta_description,
      content: articleData.content,
      research: articleData.research,
      sources: articleData.sources,
      category: "Health",
      author: "Healios Team",
      readTime: "5 min read",
      published: true
    });

  } catch (error: any) {
    // // console.error(`❌ Failed to create article: ${error.message}`);
    process.exit(1);
  }
}

async function createBulkArticles(count: number) {
  if (count < 1 || count > 5) {
    // // console.error('❌ Count must be between 1 and 5');
    process.exit(1);
  }
  
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!perplexityKey || !openaiKey) {
    // // console.error('❌ Missing API keys. Set PERPLEXITY_API_KEY and OPENAI_API_KEY');
    process.exit(1);
  }

  const bot = new ArticleBot(perplexityKey, openaiKey);
  
  try {
    const articlesData = await bot.createMultipleArticles(count);
    
    // Save all to database
    const savedArticles = [];
    for (const articleData of articlesData) {
      const article = await storage.createArticle({
        title: articleData.title,
        slug: articleData.slug,
        metaDescription: articleData.meta_description,
        content: articleData.content,
        research: articleData.research,
        sources: articleData.sources,
        category: "Health",
        author: "Healios Team",
        readTime: "5 min read",
        published: true
      });
      savedArticles.push(article);
    }

    savedArticles.forEach((article, i) => {
      `);
    });
    
  } catch (error: any) {
    // // console.error(`❌ Failed to create articles: ${error.message}`);
    process.exit(1);
  }
}

async function listArticles() {
  const articles = await storage.getArticles();
  
  `);

  if (articles.length === 0) {
    
    return;
  }
  
  articles.forEach((article, i) => {

  });
}

// ES Module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}