#!/usr/bin/env tsx

/**
 * Product Debug Script
 * Lists all products in the database to check available product IDs
 */

import { storage } from './storage';

async function debugProducts() {
  console.log('\n📦 Checking Available Products...');
  
  try {
    const products = await storage.getAllProducts();
    
    console.log(`\n✅ Found ${products.length} products in database:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: "${product.id}" | Name: "${product.name}" | Price: R${product.price}`);
    });
    
    // Check for specific quiz recommendation product IDs
    const quizProductIds = ['magnesium', 'ashwagandha', 'iron-vitamin-c', 'probiotic-vitamins', 'vitamin-d3', 'probiotics', 'mind-memory-mushroom', 'collagen-complex', 'biotin-10000', 'apple-cider-vinegar'];
    
    console.log('\n🔍 Checking Quiz Product ID Mapping:');
    for (const productId of quizProductIds) {
      const product = products.find(p => p.id === productId);
      console.log(`${productId}: ${product ? '✅ Found' : '❌ NOT FOUND'}`);
      if (product) {
        console.log(`  -> "${product.name}"`);
      }
    }
    
    console.log('\n💡 Available Product IDs for Quiz Mapping:');
    products.forEach(product => {
      if (product.name.toLowerCase().includes('magnesium') || 
          product.name.toLowerCase().includes('ashwagandha') || 
          product.name.toLowerCase().includes('iron') ||
          product.name.toLowerCase().includes('probiotic') ||
          product.name.toLowerCase().includes('vitamin d') ||
          product.name.toLowerCase().includes('collagen') ||
          product.name.toLowerCase().includes('biotin') ||
          product.name.toLowerCase().includes('apple')) {
        console.log(`"${product.id}": ${product.name}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugProducts().catch(console.error);
}

export { debugProducts };