// Healios Health Product Import Script
// Node.js script to import products into new database

const fs = require('fs');
const path = require('path');

// Load product data
const products = JSON.parse(fs.readFileSync('./products/products_backup.json', 'utf8'));

console.log(`Found ${products.length} products to import`);

// Sample import function (adapt for your database setup)
async function importProducts(db) {
  for (const product of products) {
    try {
      // Insert product (adapt SQL for your database driver)
      await db.query(`
        INSERT INTO products (
          id, name, description, price, original_price, image_url,
          categories, featured, in_stock, stock_quantity, rating,
          review_count, type, allow_preorder, preorder_cap, preorder_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
      `, [
        product.id,
        product.name,
        product.description,
        product.price,
        product.originalPrice,
        product.imageUrl,
        product.categories,
        product.featured,
        product.inStock,
        product.stockQuantity,
        product.rating,
        product.reviewCount,
        product.type,
        product.allowPreorder,
        product.preorderCap,
        product.preorderCount
      ]);
      
      console.log(`✅ Imported: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to import ${product.name}:`, error.message);
    }
  }
}

// For Drizzle ORM (preferred)
async function importWithDrizzle(db, productsTable) {
  for (const product of products) {
    try {
      await db.insert(productsTable).values({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl, // Update this path for your storage
        categories: product.categories,
        featured: product.featured,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        rating: product.rating,
        reviewCount: product.reviewCount,
        type: product.type,
        allowPreorder: product.allowPreorder,
        preorderCap: product.preorderCap,
        preorderCount: product.preorderCount
      });
      
      console.log(`✅ Imported: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to import ${product.name}:`, error.message);
    }
  }
}

// Export for use
module.exports = { importProducts, importWithDrizzle, products };

// Usage examples:
// For direct database: await importProducts(db);
// For Drizzle ORM: await importWithDrizzle(db, products);