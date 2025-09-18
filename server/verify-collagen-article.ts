import { storage } from './storage';

async function verifyCollagenArticle() {
  console.log('🔍 Verifying Collagen Benefits article...');
  
  try {
    // Check if article exists by slug
    const article = await storage.getArticleBySlug('collagen-benefits-backed-by-research');
    
    if (!article) {
      console.error('❌ Article not found by slug');
      return;
    }
    
    console.log('✅ Article successfully retrieved from database');
    console.log('');
    console.log('📋 Article Verification:');
    console.log(`   ID: ${article.id}`);
    console.log(`   Title: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   Author: ${article.author}`);
    console.log(`   Read Time: ${article.readTime}`);
    console.log(`   Published: ${article.published}`);
    console.log(`   Content Length: ${article.content.length} characters`);
    console.log(`   Research Sources: ${article.sources?.length || 0} sources`);
    console.log(`   Meta Description Length: ${article.metaDescription.length} characters`);
    console.log('');
    
    // Verify all requirements
    const requirements = {
      'Slug matches required format': article.slug === 'collagen-benefits-backed-by-research',
      'Category is Beauty & Skin': article.category === 'Beauty & Skin',
      'Author is Healios Health Team': article.author === 'Healios Health Team',
      'Published status is true': article.published === true,
      'Content contains medical disclaimer': article.content.includes('medical-disclaimer'),
      'Content covers collagen types': article.content.toLowerCase().includes('type i collagen'),
      'Content covers research evidence': article.content.toLowerCase().includes('clinical') && article.content.toLowerCase().includes('study'),
      'Content covers bioavailability': article.content.toLowerCase().includes('bioavailability'),
      'Content covers dosage': article.content.toLowerCase().includes('dosage'),
      'Content covers safety': article.content.toLowerCase().includes('safety'),
      'Has research sources': (article.sources?.length || 0) > 0,
      'Meta description appropriate length': article.metaDescription.length <= 160,
      'Content is substantial': article.content.length > 5000
    };
    
    console.log('✅ Requirements Verification:');
    Object.entries(requirements).forEach(([requirement, passed]) => {
      console.log(`   ${passed ? '✓' : '✗'} ${requirement}`);
    });
    
    const allPassed = Object.values(requirements).every(Boolean);
    console.log('');
    console.log(allPassed ? '🎉 All requirements passed!' : '⚠️  Some requirements not met');
    
    // Show first few sources for verification
    if (article.sources && article.sources.length > 0) {
      console.log('');
      console.log('📚 Research Sources (sample):');
      article.sources.slice(0, 3).forEach((source, index) => {
        console.log(`   ${index + 1}. ${source}`);
      });
      if (article.sources.length > 3) {
        console.log(`   ... and ${article.sources.length - 3} more sources`);
      }
    }
    
  } catch (error: any) {
    console.error(`❌ Verification failed: ${error.message}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyCollagenArticle();
}

export { verifyCollagenArticle };