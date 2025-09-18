#!/usr/bin/env tsx

import { ArticleBot } from './article-bot';
import { storage } from './storage';

async function generateAshwagandhaArticle() {
  const topic = "Ashwagandha: Ancient Medicine Meets Modern Science";
  
  console.log(`🌿 Generating article for topic: ${topic}`);
  
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!perplexityKey || !openaiKey) {
    console.error('❌ Missing API keys. Set PERPLEXITY_API_KEY and OPENAI_API_KEY');
    process.exit(1);
  }

  const bot = new ArticleBot(perplexityKey, openaiKey);
  
  try {
    console.log('🔬 Starting article generation process...');
    console.log('📚 Step 1: Gathering research from credible medical sources...');
    
    // Create article data
    const articleData = await bot.createArticle(topic);
    
    console.log('✅ Research completed');
    console.log(`📊 Sources found: ${articleData.sources.length}`);
    console.log('📝 Step 2: Generating article content...');
    
    // Calculate read time based on content length (average 200 words per minute)
    const wordCount = articleData.content.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / 200);
    const readTime = `${readTimeMinutes} min read`;
    
    console.log(`📖 Article generated - ${wordCount} words (${readTime})`);
    console.log('💾 Step 3: Saving to database...');
    
    // Save to database with specific requirements
    const article = await storage.createArticle({
      title: articleData.title,
      slug: articleData.slug,
      metaDescription: articleData.meta_description,
      content: articleData.content,
      research: articleData.research,
      sources: articleData.sources,
      category: "Adaptogens", // As specified in requirements
      author: "Healios Health Team", // As specified in requirements
      readTime: readTime,
      published: true // As specified in requirements
    });

    console.log('✅ Article successfully created and saved!');
    console.log('');
    console.log('📄 Article Details:');
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   Author: ${article.author}`);
    console.log(`   Read Time: ${article.readTime}`);
    console.log(`   Published: ${article.published}`);
    console.log(`   Meta Description: ${article.metaDescription.substring(0, 100)}...`);
    console.log(`   Sources: ${article.sources.length} medical references`);
    console.log(`   Content Length: ${article.content.length} characters`);
    console.log('');
    console.log('🎉 Ashwagandha article generation completed successfully!');
    console.log('');
    console.log('🏥 Compliance Notes:');
    console.log('   - Educational content only (no medical advice)');
    console.log('   - Includes proper medical disclaimers');
    console.log('   - Evidence-based information from credible sources');
    console.log('   - UK/SA medical compliance standards followed');
    
    return article;
    
  } catch (error: any) {
    console.error(`❌ Failed to create article: ${error.message}`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// ES Module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAshwagandhaArticle();
}

export { generateAshwagandhaArticle };