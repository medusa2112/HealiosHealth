-- Healios Health Ecommerce Database Setup
-- Run this after importing the Drizzle schema

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products (in_stock);
CREATE INDEX IF NOT EXISTS idx_products_type ON products (type);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (payment_status, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

-- Create indexes for product variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants (sku);

-- Enable RLS if needed (optional)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Sample product categories for reference
-- Categories used in the store:
-- gummies, metabolism, collagen, beauty, merchandise, adaptogens, stress
-- probiotics, gut-health, vitamins, immune, minerals, sleep, cognitive
-- energy, prenatal

-- Notes:
-- - All prices are in South African Rand (ZAR)
-- - Stock management includes preorder functionality  
-- - Product variants support subscriptions
-- - Admin panel has separate authentication