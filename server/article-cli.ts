#!/usr/bin/env tsx

import { ArticleBot } from './article-bot';
import { storage } from './storage';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
Article Bot CLI Usage:

  npm run article:status                    - Check bot status
  npm run article:topics                    - List available topics  
  npm run article:create "Topic Name"       - Create single article
  npm run article:create-bulk 3             - Create multiple articles (max 5)
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
          console.error('Topic required. Usage: npm run article:create "Topic Name"');
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
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function showStatus() {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  console.log('\n🤖 Article Bot Status');
  console.log('====================');
  console.log(`Perplexity API: ${perplexityKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`OpenAI API: ${openaiKey ? '✅ Configured' : '❌ Missing'}`);
  
  if (!perplexityKey || !openaiKey) {
    console.log('\n⚠️  Bot not fully configured. Add missing API keys to environment.');
    return;
  }
  
  const articles = await storage.getLatestArticles(10);
  console.log(`\nDatabase Articles: ${articles.length}`);
  
  if (articles.length > 0) {
    console.log('\nLatest Articles:');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title} (${article.createdAt})`);
    });
  }
}

async function showTopics() {
  const topics = ArticleBot.getAvailableTopics();
  console.log('\n📝 Available Topics');
  console.log('==================');
  topics.forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic}`);
  });
}

async function createArticle(topic: string) {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!perplexityKey || !openaiKey) {
    console.error('❌ Missing API keys. Set PERPLEXITY_API_KEY and OPENAI_API_KEY');
    process.exit(1);
  }
  
  console.log(`\n🔄 Creating article: "${topic}"`);
  console.log('This may take 1-2 minutes...\n');
  
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
    
    console.log('✅ Article created successfully!');
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Length: ${article.content.length} characters`);
    console.log(`   Sources: ${article.sources?.length || 0} references`);
    console.log(`   ID: ${article.id}`);
    
  } catch (error: any) {
    console.error(`❌ Failed to create article: ${error.message}`);
    process.exit(1);
  }
}

async function createBulkArticles(count: number) {
  if (count < 1 || count > 5) {
    console.error('❌ Count must be between 1 and 5');
    process.exit(1);
  }
  
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!perplexityKey || !openaiKey) {
    console.error('❌ Missing API keys. Set PERPLEXITY_API_KEY and OPENAI_API_KEY');
    process.exit(1);
  }
  
  console.log(`\n🔄 Creating ${count} articles...`);
  console.log('This may take several minutes with rate limiting...\n');
  
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
    
    console.log(`✅ Created ${savedArticles.length} articles successfully!`);
    savedArticles.forEach((article, i) => {
      console.log(`   ${i + 1}. ${article.title} (${article.content.length} chars)`);
    });
    
  } catch (error: any) {
    console.error(`❌ Failed to create articles: ${error.message}`);
    process.exit(1);
  }
}

async function listArticles() {
  const articles = await storage.getArticles();
  
  console.log(`\n📚 All Articles (${articles.length})`);
  console.log('==============');
  
  if (articles.length === 0) {
    console.log('No articles found.');
    return;
  }
  
  articles.forEach((article, i) => {
    console.log(`\n${i + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Length: ${article.content.length} characters`);
    console.log(`   Sources: ${article.sources?.length || 0} references`);
    console.log(`   Created: ${article.createdAt}`);
  });
}

// ES Module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}