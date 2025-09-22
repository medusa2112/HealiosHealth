// SEO Sitemap Generation for Search Engine Optimization
import { useQuery } from "@tanstack/react-query";
import { type ProductWithAvailability } from "@/types/product";

export default function Sitemap() {
  const { data: products } = useQuery<ProductWithAvailability[]>({
    queryKey: ["/api/products"],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/quiz', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/planet', priority: '0.6', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/newsletter', priority: '0.5', changefreq: 'monthly' },
  ];

  const productPages = products?.map(product => ({
    url: `/products/${product.id}`,
    priority: '0.8',
    changefreq: 'weekly'
  })) || [];

  const allPages = [...staticPages, ...productPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>https://healios.com${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: '20px' }}>
      {sitemapXml}
    </div>
  );
}