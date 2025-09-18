import { storage } from './storage';

async function checkAllArticles() {
  console.log('📚 Checking all articles in database...');
  
  try {
    const articles = await storage.getArticles();
    
    console.log(`Found ${articles.length} articles in database:`);
    console.log('');
    
    if (articles.length === 0) {
      console.log('❌ No articles found in database');
      console.log('This could indicate:');
      console.log('  - Articles are stored in memory and lost between script runs');
      console.log('  - Database connection issue');
      console.log('  - Article creation failed silently');
      return;
    }
    
    articles.forEach((article, index) => {
      console.log(`${index + 1}. Article: ${article.title}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Author: ${article.author}`);
      console.log(`   Published: ${article.published}`);
      console.log('');
    });
    
    // Check specifically for collagen article
    const collagenArticle = articles.find(a => 
      a.slug === 'collagen-benefits-backed-by-research' || 
      a.title.toLowerCase().includes('collagen')
    );
    
    if (collagenArticle) {
      console.log('✅ Found collagen article!');
      console.log(`   Title: ${collagenArticle.title}`);
      console.log(`   Slug: ${collagenArticle.slug}`);
    } else {
      console.log('❌ No collagen article found');
    }
    
  } catch (error: any) {
    console.error(`❌ Error checking articles: ${error.message}`);
    console.error('Stack trace:', error.stack);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAllArticles();
}

export { checkAllArticles };