#!/usr/bin/env tsx
/**
 * Production Database Sync Script
 * Syncs development products to production with correct in_stock flags
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

console.log('🔄 Starting production database sync...');

// Current development products data
const developmentProducts = [
  {
    id: 'apple-cider-vinegar',
    name: 'Apple Cider Vinegar + Ginger Gummies — 500mg ACV with the Mother | Natural Apple Flavour',
    description: 'Apple cider vinegar with "the mother" enhanced with ginger extract. Supports healthy metabolism, digestive wellness, and overall vitality in a convenient gummy form.',
    price: '299.00',
    originalPrice: '399.00',
    imageUrl: '/objects/uploads/f17bc94b-f64d-43c1-85fd-7d76ce758646',
    categories: ['gummies', 'metabolism'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 92,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'biotin-5000',
    name: 'Biotin 10,000 µg Strawberry Gummies',
    description: 'High-strength biotin gummies for comprehensive beauty support. Each delicious strawberry-flavoured gummy provides 10,000 µg of biotin to support healthy hair growth, strengthen nails, and maintain radiant skin.',
    price: '449.00',
    originalPrice: '599.00',
    imageUrl: '/objects/uploads/a7736b5f-803d-4464-b5ce-0dbfa19b88b6',
    categories: ['beauty', 'vitamins'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 100,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'collagen-complex',
    name: 'Collagen + C + Zinc Gummies',
    description: 'Marine collagen enhanced with vitamin C and zinc for superior absorption and efficacy. This powerful combination supports skin elasticity, joint health, and overall wellness.',
    price: '399.00',
    originalPrice: '549.00',
    imageUrl: '/objects/uploads/47cbe47b-7fd0-4116-9e4b-d20a75d39c7a',
    categories: ['beauty', 'collagen'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 50,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'folic-acid-400',
    name: 'Folic Acid 400µg Gummies (Berry Flavour)',
    description: 'Essential folic acid supplement specially formulated for pregnancy support. Each berry-flavoured gummy provides 400µg of folic acid to support healthy fetal development.',
    price: '399.00',
    originalPrice: '549.00',
    imageUrl: '/objects/uploads/2af8c7ca-c7d9-4433-bc79-141538abfee2',
    categories: ['prenatal', 'vitamins'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 100,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'bio-cultures-vitamin-plus',
    name: 'Gut + Mind + Energy Vitamin Plus Gummies (Pineapple Flavour)',
    description: 'Comprehensive wellness formula combining probiotics, B vitamins, and energy-supporting nutrients. Delicious pineapple flavour makes daily supplementation enjoyable.',
    price: '549.00',
    originalPrice: '699.00',
    imageUrl: '/objects/uploads/782dff17-a88b-4a07-a914-347a66d2ed15',
    categories: ['probiotics', 'vitamins', 'energy'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 100,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'collagen-powder',
    name: 'HALO Glow Collagen – Pure Type I Collagen Peptides for Skin, Hair & Nails (30-Day Supply)',
    description: 'Premium hydrolyzed collagen peptides for comprehensive beauty support. Unflavoured powder easily mixes into any beverage for convenient daily supplementation.',
    price: '429.00',
    originalPrice: '579.00',
    imageUrl: '/objects/uploads/4858ece6-b0c8-4a94-a30b-f25311157eb9',
    categories: ['collagen', 'beauty'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 18,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'healios-oversized-tee',
    name: 'Healios HealthClub 1984 Oversized Tee',
    description: 'Premium quality oversized t-shirt featuring exclusive Healios HealthClub 1984 design. Made from 100% organic cotton for ultimate comfort and sustainability.',
    price: '750.00',
    originalPrice: '950.00',
    imageUrl: '/objects/uploads/0ab02fea-953d-401d-9771-65c456b30bc4',
    categories: ['merchandise'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 50,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'iron-vitamin-c',
    name: 'Iron + Vitamin C Gummies (Cherry Flavour)',
    description: 'Gentle iron supplement enhanced with vitamin C for optimal absorption. Cherry-flavoured gummies provide 14mg of iron to support energy levels and reduce tiredness.',
    price: '429.00',
    originalPrice: '579.00',
    imageUrl: '/objects/uploads/d86e25e7-0c0c-4080-ba49-e42d1718b1d4',
    categories: ['minerals', 'energy'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 50,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'ashwagandha',
    name: 'KSM-66® Ashwagandha Capsules 500mg | 90 Vegan Capsules',
    description: 'Traditional adaptogenic herb. No EFSA health claims are authorised for Ashwagandha – general wellbeing support only.',
    price: '429.00',
    originalPrice: '579.00',
    imageUrl: '/objects/uploads/77bdf5dc-0594-4369-b2d4-4e70b5caab39',
    categories: ['adaptogens', 'stress'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'magnesium',
    name: 'Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)',
    description: 'High-absorption magnesium gummies combining citrate and glycinate forms for optimal bioavailability. Perfect for supporting muscle function, promoting restful sleep, and maintaining energy levels.',
    price: '329.00',
    originalPrice: '449.00',
    imageUrl: '/objects/uploads/1ba0265c-c8a8-4cd9-b9b2-920b5ab7e67e',
    categories: ['minerals', 'sleep'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 50,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'magnesium-bisglycinate-b6',
    name: 'Magnesium Complex — Triple Magnesium Blend with Vitamin B6 (120 Capsules)',
    description: 'Our Magnesium Complex combines three bioavailable forms — bisglycinate, malate, and taurine chelate — with Vitamin B6. This balanced formula supports:\n\nReduced tiredness and fatigue\n\nHealthy energy metabolism\n\nNervous system and muscle function\n\nStrong bones and teeth',
    price: '449.00',
    originalPrice: '599.00',
    imageUrl: '/objects/uploads/63c0277f-7405-4f35-bcb7-6d1428f4c12f',
    categories: ['minerals', 'sleep'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'mind-memory-mushroom',
    name: 'Mind & Memory Mushroom - Lion\'s Mane Gummies (2000mg)',
    description: 'Potent Lion\'s Mane mushroom extract for cognitive support. Each serving provides 2000mg of Lion\'s Mane to support brain health, memory, and mental clarity.',
    price: '499.00',
    originalPrice: '649.00',
    imageUrl: '/objects/uploads/c7883700-18c8-48b0-811e-6cbbcf14ccbf',
    categories: ['adaptogens', 'cognitive'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 50,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'probiotic-vitamins',
    name: 'Probiotic + Vitamins Gummies',
    description: 'All-in-one probiotic and multivitamin gummies for complete wellness support. Combines beneficial bacteria with essential vitamins for digestive health and daily nutrition.',
    price: '379.00',
    originalPrice: '499.00',
    imageUrl: '/objects/uploads/64af7184-172a-404f-9402-b4c37846f333',
    categories: ['probiotics', 'vitamins'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: true,
    preorderCap: 50,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'probiotics',
    name: 'Probiotic Complex — 10 Billion CFU with FOS (6 Strains, Vegan, 60 Capsules)',
    description: 'Premium probiotic complex with 10 billion CFU and FOS prebiotics for comprehensive gut health support. Our advanced formula features 6 carefully selected probiotic strains that work synergistically to support digestive balance and immune function.',
    price: '449.00',
    originalPrice: '599.00',
    imageUrl: '/objects/uploads/88097669-8269-4703-9086-14adbc0a2647',
    categories: ['probiotics', 'gut-health'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3 4000 IU Gummies — Natural Orange Flavour | 60 Gummies (Vegetarian)',
    description: 'A high-strength daily Vitamin D3 gummy providing 4000 IU (100 µg) per serving. With a natural orange flavour, these gummies are an easy, enjoyable way to support:\n\nNormal immune system function\n\nMaintenance of bones, muscles, and teeth\n\nHealthy vitamin D levels year-round, especially when sunlight exposure is limited\n\nFormulated with clean-label ingredients, free from artificial colours, flavours, and preservures. Suitable for vegetarians.',
    price: '449.00',
    originalPrice: '599.00',
    imageUrl: '/objects/uploads/3300a456-b1a5-49e7-a81e-e29a99086971',
    categories: ['vitamins', 'immune'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  }
];

async function syncProductionDatabase() {
  try {
    console.log(`📦 Syncing ${developmentProducts.length} products to production...`);
    
    let syncedCount = 0;
    let updatedCount = 0;
    
    for (const product of developmentProducts) {
      try {
        // Check if product exists
        const existing = await db.select().from(schema.products)
          .where(eq(schema.products.id, product.id))
          .limit(1);
        
        if (existing.length > 0) {
          // Update existing product
          await db.update(schema.products)
            .set({
              name: product.name,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              imageUrl: product.imageUrl,
              categories: product.categories,
              rating: product.rating,
              reviewCount: product.reviewCount,
              inStock: product.inStock,
              stockQuantity: product.stockQuantity,
              featured: product.featured,
              allowPreorder: product.allowPreorder,
              preorderCap: product.preorderCap,
              preorderCount: product.preorderCount,
              type: product.type,
              updatedAt: new Date().toISOString()
            })
            .where(eq(schema.products.id, product.id));
          
          updatedCount++;
          console.log(`✓ Updated: ${product.name} (in_stock: ${product.inStock})`);
        } else {
          // Insert new product
          await db.insert(schema.products).values({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            imageUrl: product.imageUrl,
            categories: product.categories,
            rating: product.rating,
            reviewCount: product.reviewCount,
            inStock: product.inStock,
            stockQuantity: product.stockQuantity,
            featured: product.featured,
            allowPreorder: product.allowPreorder,
            preorderCap: product.preorderCap,
            preorderCount: product.preorderCount,
            type: product.type
          });
          
          syncedCount++;
          console.log(`✅ Created: ${product.name} (in_stock: ${product.inStock})`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Production sync complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - New products created: ${syncedCount}`);
    console.log(`   - Existing products updated: ${updatedCount}`);
    console.log(`   - Total products: ${syncedCount + updatedCount}`);
    
    // Verify sync
    const stockCountsQuery = `
      SELECT COUNT(*) as total_products, 
             COUNT(*) FILTER (WHERE in_stock = false) as out_of_stock_count 
      FROM products
    `;
    const stockCounts = await db.execute(stockCountsQuery);
    
    console.log(`\n📈 Current production state:`);
    console.log(`   - Total products: ${stockCounts.rows[0]?.total_products || 0}`);
    console.log(`   - Out of stock products: ${stockCounts.rows[0]?.out_of_stock_count || 0}`);
    
  } catch (error) {
    console.error('❌ Production sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncProductionDatabase()
  .then(() => {
    console.log('✨ Production database sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production sync failed:', error);
    process.exit(1);
  });