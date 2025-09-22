#!/usr/bin/env tsx
/**
 * Local Database Seed Script
 * Seeds the local PostgreSQL database with test products
 */

import dotenv from 'dotenv';
dotenv.config();

import { db } from '../server/db.js';
import * as schema from '../shared/schema.js';
import { eq } from 'drizzle-orm';

console.log('🌱 Starting local database seeding...');

const testProducts = [
  {
    id: 'apple-cider-vinegar',
    name: 'Apple Cider Vinegar + Ginger Gummies — 500mg ACV with the Mother | Natural Apple Flavour',
    description: 'Apple cider vinegar with "the mother" enhanced with ginger extract. Supports healthy metabolism, digestive wellness, and overall vitality in a convenient gummy form.',
    price: '299.00',
    originalPrice: '399.00',
    imageUrl: '/images/apple-cider-vinegar-ginger-gummies-500mg-natural-supplement.jpg',
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
    description: 'High-potency biotin gummies for healthy hair, skin, and nails. Delicious strawberry flavor with 10,000 µg of biotin per serving.',
    price: '249.00',
    originalPrice: '349.00',
    imageUrl: '/images/biotin-10000-mcg-strawberry-gummies-hair-skin-nails.jpg',
    categories: ['gummies', 'beauty'],
    rating: '4.8',
    reviewCount: 15,
    inStock: true,
    stockQuantity: 67,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'collagen-peptides',
    name: 'Marine Collagen Peptides Powder',
    description: 'Premium marine collagen peptides for skin elasticity, joint health, and overall wellness. Unflavored and easily mixable.',
    price: '599.00',
    originalPrice: '799.00',
    imageUrl: '/images/marine-collagen-peptides-powder-skin-joint-health.jpg',
    categories: ['collagen', 'beauty'],
    rating: '4.9',
    reviewCount: 32,
    inStock: true,
    stockQuantity: 45,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3 2000 IU Softgels',
    description: 'High-quality Vitamin D3 supplements for immune support, bone health, and overall wellness. Easy-to-swallow softgels.',
    price: '199.00',
    originalPrice: '299.00',
    imageUrl: '/images/vitamin-d3-2000-iu-softgels-immune-bone-health.jpg',
    categories: ['vitamins', 'immune'],
    rating: '4.7',
    reviewCount: 28,
    inStock: true,
    stockQuantity: 120,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'omega-3',
    name: 'Omega-3 Fish Oil Capsules',
    description: 'Premium omega-3 fish oil with EPA and DHA for heart health, brain function, and inflammation support.',
    price: '349.00',
    originalPrice: '449.00',
    imageUrl: '/images/omega-3-fish-oil-capsules-epa-dha-heart-brain.jpg',
    categories: ['vitamins', 'cognitive'],
    rating: '4.6',
    reviewCount: 19,
    inStock: true,
    stockQuantity: 78,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'collagen-powder',
    name: 'HALO Glow Collagen – Pure Type I Collagen Peptides for Skin, Hair & Nails (30-Day Supply)',
    description: 'Premium hydrolyzed collagen peptides for comprehensive beauty support. Unflavoured powder easily mixes into any beverage for convenient daily supplementation.',
    price: '429.00',
    originalPrice: '579.00',
    imageUrl: '/images/halo-glow-collagen-powder-type-1-peptides-beauty.jpg',
    categories: ['collagen', 'beauty'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 18,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement',
    supplyDays: 30
  },
  {
    id: 'healios-oversized-tee',
    name: 'Healios HealthClub 1984 Oversized Tee',
    description: 'Premium quality oversized t-shirt featuring exclusive Healios HealthClub 1984 design. Made from 100% organic cotton for ultimate comfort and sustainability.',
    price: '750.00',
    originalPrice: '950.00',
    imageUrl: '/images/healios-healthclub-1984-oversized-tee-black.jpg',
    categories: ['merchandise'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 50,
    featured: true,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'apparel'
  },
  {
    id: 'ashwagandha',
    name: 'KSM-66® Ashwagandha Capsules 500mg | 90 Vegan Capsules',
    description: 'Premium KSM-66® ashwagandha extract, the most clinically studied ashwagandha. Supports stress management, energy levels, and promotes restful sleep naturally.',
    price: '429.00',
    originalPrice: '429.00',
    imageUrl: '/images/ksm-66-ashwagandha-capsules-500mg-90-vegan.jpg',
    categories: ['adaptogens', 'stress'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'probiotic-complex',
    name: 'Probiotic Complex — 10 Billion CFU with FOS (6 Strains, Vegan, 60 Capsules)',
    description: 'Premium probiotic complex with 10 billion CFU and FOS prebiotics for comprehensive gut health support. Our advanced formula features 6 carefully selected probiotic strains that work synergistically to support digestive balance and immune function.',
    price: '449.00',
    originalPrice: '449.00',
    imageUrl: '/images/probiotic-complex-10-billion-cfu-6-strains-vegan-60-capsules.jpg',
    categories: ['probiotics', 'gut-health'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'vitamin-d3-gummies',
    name: 'Vitamin D3 4000 IU Gummies (Natural Orange Flavour | 60 Gummies)',
    description: 'High-strength vitamin D3 for comprehensive immune support. Each orange-flavoured gummy provides 4000 IU of vitamin D3 to support immunity, bone health, and mood.',
    price: '449.00',
    originalPrice: '449.00',
    imageUrl: '/images/vitamin-d3-4000-iu-gummies-natural-orange-flavour-60-gummies.jpg',
    categories: ['vitamins', 'immune'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 100,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'magnesium-complex',
    name: 'Magnesium Complex Capsules — 375mg Magnesium + B6 (120 Vegan Capsules)',
    description: 'Premium magnesium bisglycinate combined with vitamin B6 for enhanced absorption and efficacy. Supports muscle function, nervous system health, and energy metabolism.',
    price: '449.00',
    originalPrice: '449.00',
    imageUrl: '/images/magnesium-complex-capsules-375mg-b6-120-vegan.jpg',
    categories: ['minerals', 'sleep'],
    rating: '5.0',
    reviewCount: 0,
    inStock: true,
    stockQuantity: 50,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  },
  {
    id: 'biotin-gummies',
    name: 'Biotin 10,000 µg Strawberry Gummies',
    description: 'High-strength biotin gummies for comprehensive beauty support. Each delicious strawberry-flavoured gummy provides 10,000 µg of biotin to support healthy hair growth, strengthen nails, and maintain radiant skin.',
    price: '449.00',
    originalPrice: '449.00',
    imageUrl: '/images/biotin-10000-mcg-strawberry-gummies-hair-skin-nails.jpg',
    categories: ['beauty', 'vitamins'],
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
    id: 'collagen-c-zinc-gummies',
    name: 'Collagen + C + Zinc Gummies',
    description: 'Marine collagen enhanced with vitamin C and zinc for superior absorption and efficacy. This powerful combination supports skin elasticity, joint health, and overall wellness.',
    price: '399.00',
    originalPrice: '399.00',
    imageUrl: '/images/collagen-complex-gummies.png',
    categories: ['beauty', 'collagen'],
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
    id: 'folic-acid-gummies',
    name: 'Folic Acid 400µg Gummies (Berry Flavour)',
    description: 'Essential folic acid supplement specially formulated for pregnancy support. Each berry-flavoured gummy provides 400µg of folic acid to support healthy fetal development.',
    price: '399.00',
    originalPrice: '399.00',
    imageUrl: '/images/folic-acid-gummies.png',
    categories: ['prenatal', 'vitamins'],
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
    id: 'gut-mind-energy-gummies',
    name: 'Gut + Mind + Energy Vitamin Plus Gummies (Pineapple Flavour)',
    description: 'Comprehensive wellness formula combining probiotics, B vitamins, and energy-supporting nutrients. Delicious pineapple flavour makes daily supplementation enjoyable.',
    price: '549.00',
    originalPrice: '549.00',
    imageUrl: '/images/probiotic-vitamins-gummies.png',
    categories: ['probiotics', 'vitamins', 'energy'],
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
    id: 'iron-vitamin-c-gummies',
    name: 'Iron + Vitamin C Gummies (Cherry Flavour)',
    description: 'Gentle iron supplement enhanced with vitamin C for optimal absorption. Cherry-flavoured gummies provide 14mg of iron to support energy levels and reduce tiredness.',
    price: '429.00',
    originalPrice: '429.00',
    imageUrl: '/images/iron-vitamin-c-gummies.png',
    categories: ['minerals', 'energy'],
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
    id: 'magnesium-gummies-berry',
    name: 'Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)',
    description: 'High-absorption magnesium gummies combining citrate and glycinate forms for optimal bioavailability. Perfect for supporting muscle function, promoting restful sleep, and maintaining energy levels.',
    price: '329.00',
    originalPrice: '329.00',
    imageUrl: '/images/magnesium-gummies.png',
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
    id: 'lions-mane-gummies',
    name: 'Mind & Memory Mushroom - Lion\'s Mane Gummies (2000mg)',
    description: 'Potent Lion\'s Mane mushroom extract for cognitive support. Each serving provides 2000mg of Lion\'s Mane to support brain health, memory, and mental clarity.',
    price: '499.00',
    originalPrice: '499.00',
    imageUrl: '/images/lions-mane-gummies.png',
    categories: ['adaptogens', 'cognitive'],
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
    id: 'probiotic-vitamins-gummies',
    name: 'Probiotic + Vitamins Gummies',
    description: 'All-in-one probiotic and multivitamin gummies for complete wellness support. Combines beneficial bacteria with essential vitamins for digestive health and daily nutrition.',
    price: '379.00',
    originalPrice: '379.00',
    imageUrl: '/images/probiotic-vitamins-gummies.png',
    categories: ['probiotics', 'vitamins'],
    rating: '5.0',
    reviewCount: 0,
    inStock: false,
    stockQuantity: 0,
    featured: false,
    allowPreorder: false,
    preorderCap: null,
    preorderCount: 0,
    type: 'supplement'
  }
];

async function seedLocalDatabase() {
  try {
    console.log(`📦 Seeding ${testProducts.length} products...`);
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const product of testProducts) {
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
          console.log(`✓ Updated: ${product.name}`);
        } else {
          // Insert new product
          await db.insert(schema.products).values({
            ...product,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          createdCount++;
          console.log(`✓ Created: ${product.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to process ${product.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Seeding completed!`);
    console.log(`   Created: ${createdCount} products`);
    console.log(`   Updated: ${updatedCount} products`);
    
    // Verify the products were inserted
    const totalProducts = await db.select().from(schema.products);
    console.log(`   Total products in database: ${totalProducts.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedLocalDatabase()
  .then(() => {
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });