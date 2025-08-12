import { Router } from "express";
import { db } from "../db";
import { products } from "@shared/schema";

const router = Router();

// Generate sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    const allProducts = await db.select({
      id: products.id,
      createdAt: products.createdAt
    }).from(products);

    const currentDate = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
      { url: '/products', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
      { url: '/quiz', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
      { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { url: '/planet', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
      { url: '/blog', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
      { url: '/newsletter', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    ];

    const productPages = allProducts.map(product => ({
      url: `/products/${product.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: product.createdAt || currentDate
    }));

    const allPages = [...staticPages, ...productPages];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>https://healios.com${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemapXml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Generate robots.txt
router.get("/robots.txt", (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

# Important pages for crawling
Allow: /products
Allow: /products/*
Allow: /quiz
Allow: /about
Allow: /blog
Allow: /newsletter

# Block admin and internal pages
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /portal/*
Disallow: /src/*
Disallow: /*.json$
Disallow: /*.xml$

# Sitemap location
Sitemap: https://healios.com/sitemap.xml

# Crawl delay for politeness
Crawl-delay: 1`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;