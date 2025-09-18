#!/usr/bin/env tsx

// Simple test script to verify article creation works
import { storage } from './storage';

async function testArticleCreation() {
  try {
    console.log('🧪 Testing storage system...');
    
    // Create a test article
    const testArticle = {
      title: "Test Article",
      slug: "test-article-123",
      metaDescription: "Test meta description",
      content: "<h1>Test Article</h1><p>This is a test article.</p>",
      research: "Test research data",
      sources: ["https://example.com/source1"],
      category: "Test",
      author: "Test Author",
      readTime: "2 min read",
      published: true
    };

    console.log('📝 Creating test article...');
    const savedArticle = await storage.createArticle(testArticle);
    console.log('✅ Test article created:', savedArticle.id);

    console.log('📚 Fetching all articles...');
    const allArticles = await storage.getArticles();
    console.log(`Found ${allArticles.length} articles in storage`);
    
    allArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.slug})`);
    });

    console.log('🔍 Testing article lookup by slug...');
    const foundArticle = await storage.getArticleBySlug(testArticle.slug);
    
    if (foundArticle) {
      console.log('✅ Article found by slug:', foundArticle.title);
    } else {
      console.log('❌ Article not found by slug');
    }

    console.log('🎉 Storage system test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Storage test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testArticleCreation();