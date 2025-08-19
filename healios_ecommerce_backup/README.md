# Healios Health Ecommerce Store - Complete Product Backup

## Overview
This backup contains all product data, imagery, and components from the Healios Health ecommerce platform. Use this package to restore product information and assets to any new deployment.

## Contents

### 📦 Products Data
- `products/products_backup.json` - Complete product database export with 15 products
- All products include: name, description, pricing, images, categories, stock levels, and metadata

### 🗃️ Database Schema  
- `schemas/schema.ts` - Complete Drizzle ORM schema for products, orders, users, and all ecommerce tables
- Includes product variants, subscriptions, cart management, and admin systems

### 🎨 Product Images
- `images/` - All product imagery including:
  - Generated AI product images
  - Uploaded product photos  
  - Brand assets and logos
  - Marketing imagery

### ⚛️ React Components
- `components/` - Key product-related React components:
  - Product cards and listings
  - Product detail pages
  - Admin product management
  - Product editing interfaces

## Product Inventory Summary

### Featured Products (6 items)
1. **Apple Cider Vinegar + Ginger Gummies** - R299 (was R399) - 92 in stock
2. **HALO Glow Collagen** - R429 (was R579) - 18 in stock  
3. **Healios HealthClub 1984 Oversized Tee** - R750 (was R950) - 50 in stock
4. **KSM-66® Ashwagandha Capsules** - R429 (was R579) - 100 in stock
5. **Probiotic Complex** - R449 (was R599) - 100 in stock
6. **Vitamin D3 4000 IU Gummies** - R449 (was R599) - 100 in stock

### Preorder Products (9 items)
- All products with preorder caps ranging from 50-100 units
- Categories: beauty, vitamins, minerals, adaptogens, probiotics

## Product Categories
- **Gummies & Vitamins**: ACV, Vitamin D3, Biotin, Iron+C, Magnesium
- **Beauty & Collagen**: HALO Glow, Collagen Complex  
- **Adaptogens**: Ashwagandha, Lion's Mane
- **Gut Health**: Probiotics, Gut+Mind+Energy
- **Merchandise**: Healios branded apparel
- **Prenatal**: Folic Acid supplements

## Usage Instructions

### For New Deployment:
1. Import the database schema from `schemas/schema.ts`
2. Run database migrations to create tables
3. Import product data from `products/products_backup.json`
4. Upload images from `images/` folder to your image storage
5. Update image URLs in product data to match your new image paths
6. Import React components for product display and management

### Database Import:
```sql
-- Use the provided schema.ts with Drizzle ORM
-- Import products via API or direct database insert
```

### Image Management:
- All images are optimized for web use
- Generated images have AI-created professional product photography
- Update imageUrl fields in products to match your storage URLs

## Technical Details
- **Database**: PostgreSQL with Drizzle ORM
- **Images**: PNG/JPG/WebP formats, web-optimized
- **Components**: React + TypeScript with Tailwind CSS
- **Currency**: South African Rand (ZAR)
- **Stock Management**: Real-time inventory tracking
- **Features**: Preorders, variants, subscriptions, admin panel

## Restore Process
1. Set up database with provided schema
2. Import product JSON data
3. Upload and configure image assets  
4. Deploy React components
5. Update API endpoints for your environment
6. Test product display and admin functions

---
**Generated**: August 19, 2025  
**Source**: Healios Health Production Store  
**Products**: 15 total (6 in stock, 9 preorder)  
**Value**: R6,627 total inventory value