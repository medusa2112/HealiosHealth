import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Clock, User } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import { useQuery } from '@tanstack/react-query';
import type { Article } from '@shared/types';

export default function JournalAll() {
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch articles from API
  const { data: articles = [], isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = [
    'All',
    'Sleep & Recovery',
    'Mental Health',
    'Beauty & Skin',
    'Digestive Health',
    'Immune Support',
    'Women\'s Health',
    'Hormonal Health',
    'Pregnancy & Prenatal',
    'Supplement Science'
  ];

  // Helper function to categorize articles based on title keywords
  const categorizeArticle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('magnesium') || titleLower.includes('sleep')) return 'Sleep & Recovery';
    if (titleLower.includes('vitamin d') || titleLower.includes('mood') || titleLower.includes('ashwagandha')) return 'Mental Health';
    if (titleLower.includes('collagen') || titleLower.includes('biotin') || titleLower.includes('hair') || titleLower.includes('skin')) return 'Beauty & Skin';
    if (titleLower.includes('gut') || titleLower.includes('probiotic') || titleLower.includes('digestive')) return 'Digestive Health';
    if (titleLower.includes('immune') || titleLower.includes('vitamin d')) return 'Immune Support';
    if (titleLower.includes('iron') || titleLower.includes('women')) return 'Women\'s Health';
    if (titleLower.includes('hormonal') || titleLower.includes('hormone')) return 'Hormonal Health';
    if (titleLower.includes('folic acid') || titleLower.includes('pregnancy') || titleLower.includes('prenatal')) return 'Pregnancy & Prenatal';
    if (titleLower.includes('regulation') || titleLower.includes('supplement') || titleLower.includes('apple cider vinegar')) return 'Supplement Science';
    return 'Supplement Science';
  };

  // Helper function to estimate read time
  const estimateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Helper function to create excerpt from content
  const createExcerpt = (content: string): string => {
    // Remove HTML tags and get first paragraph
    const plainText = content.replace(/<[^>]*>/g, '');
    const firstParagraph = plainText.split('\n\n')[1] || plainText.split('\n')[1] || plainText;
    return firstParagraph.substring(0, 160) + '...';
  };

  // Helper function to get article image based on title
  const getArticleImage = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('magnesium')) return '/assets/healios-health44.png';
    if (titleLower.includes('vitamin d')) return '/assets/healios-health127.png';
    if (titleLower.includes('collagen')) return '/assets/healios-health10.webp';
    if (titleLower.includes('ashwagandha')) return '/assets/healios-health3.png';
    if (titleLower.includes('probiotic')) return '/assets/healios-health53.png';
    if (titleLower.includes('biotin')) return '/assets/healios-health8.png';
    if (titleLower.includes('iron')) return '/assets/healios-health39.png';
    if (titleLower.includes('folic acid')) return '/assets/healios-health14.png';
    if (titleLower.includes('apple cider vinegar')) return '/assets/healios-health2.png';
    return '/assets/healios-health27.png'; // Default image
  };

  // Convert articles to the format expected by the UI
  const blogPosts = articles.map((article, index) => ({
    id: index + 1,
    title: article.title,
    excerpt: createExcerpt(article.content),
    category: categorizeArticle(article.title),
    readTime: estimateReadTime(article.content),
    author: 'Healios Research Team',
    date: new Date(article.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    image: getArticleImage(article.title),
    slug: article.slug
  }));

  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Healios Evidence-Based Journal | Research-Backed Health & Nutrition Articles"
        description="Explore our comprehensive collection of evidence-based health and nutrition articles. From sleep support to hormonal health, discover research-backed insights from our expert team."
        keywords="evidence-based health, nutrition research, supplement science, clinical studies, health articles, wellness insights"
        url="https://healios.com/journal/all"
      />

      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Healios Evidence-Based Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive, research-backed articles on nutrition, wellness, and supplementation from our expert team
          </p>
        </div>

        {/* Category Pills */}
        <div className="mb-12 flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading evidence-based articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">Failed to load articles. Please try again later.</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3 leading-tight">
                    {post.title}
                  </h2>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    
                    <Link href={`/journal/${post.slug}`}>
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        Read article
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Articles Found */}
        {!isLoading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {activeCategory === 'All' ? 'No articles available.' : `No articles found in ${activeCategory} category.`}
            </p>
          </div>
        )}

        {/* Article Count */}
        {!isLoading && !error && filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing {filteredPosts.length} of {blogPosts.length} evidence-based articles
            </p>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Stay Updated with Our Latest Research
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get the latest evidence-based health and nutrition articles delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button className="bg-black text-white px-6 py-3 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}