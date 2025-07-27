import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Clock, User } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';

export default function JournalAll() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Women\'s Health',
    'Pregnancy',
    'Fertility',
    'Ingredients',
    'Recipes',
    'The Science'
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Weight Management Support: Q+A with our Head of Nutrition',
      excerpt: 'Our Head of Nutrition, Isabelle Mann, reveals more on the UK\'s first to market botanical complex found in Weight Management Support and why it\'s...',
      category: 'Ingredients',
      readTime: '5 min read',
      author: 'Isabelle Mann',
      date: '15 Jan 2025',
      image: '/assets/Ashwagandha-X-2_1753469577639.webp',
      slug: 'weight-management-support-qa'
    },
    {
      id: 2,
      title: 'Your top 10 questions on weight loss injections, answered',
      excerpt: 'Increasingly we\'re speaking with scores of women who are either using GLP-1 RAa injections like peptide T receptor agonists) such as Semaglutide (O...',
      category: 'Women\'s Health',
      readTime: '8 min read',
      author: 'Dr. Sarah Wilson',
      date: '12 Jan 2025',
      image: '/assets/Apple-Cider-Vinegar-X_1753469577640.png',
      slug: 'weight-loss-injections-qa'
    },
    {
      id: 3,
      title: 'What is blood sugar balance?',
      excerpt: 'While many of us may not be suffering from a serious blood sugar disease like diabetes, understanding that certain foods or methods of eating may h...',
      category: 'The Science',
      readTime: '6 min read',
      author: 'Dr. Emma Thompson',
      date: '10 Jan 2025',
      image: '/assets/Vitamin D3  1000 IU_1753615197740.png',
      slug: 'blood-sugar-balance'
    },
    {
      id: 4,
      title: 'The Complete Guide to Prenatal Nutrition',
      excerpt: 'Supporting your body through pregnancy requires specific nutrients at specific times. Our comprehensive guide covers everything from pre-conception to...',
      category: 'Pregnancy',
      readTime: '12 min read',
      author: 'Midwife Lisa Roberts',
      date: '8 Jan 2025',
      image: '/assets/Folic Acid 400µg_1753615197741.png',
      slug: 'prenatal-nutrition-guide'
    },
    {
      id: 5,
      title: 'Understanding Fertility Supplements: What Really Works?',
      excerpt: 'Navigating fertility support can be overwhelming. We break down the science behind key nutrients like folic acid, vitamin D, and coenzyme Q10...',
      category: 'Fertility',
      readTime: '10 min read',
      author: 'Dr. Michael Chen',
      date: '5 Jan 2025',
      image: '/assets/Iron + Vitamin C_1753615197739.png',
      slug: 'fertility-supplements-guide'
    },
    {
      id: 6,
      title: '5 Nutrient-Dense Smoothie Recipes for Busy Mornings',
      excerpt: 'Start your day right with these delicious smoothie recipes packed with vitamins, minerals, and natural energy boosters. Perfect for on-the-go nutrition...',
      category: 'Recipes',
      readTime: '4 min read',
      author: 'Chef Maya Patel',
      date: '3 Jan 2025',
      image: '/assets/Multivitamin for Kids_1753615197742.png',
      slug: 'morning-smoothie-recipes'
    },
    {
      id: 7,
      title: 'The Science Behind Ashwagandha: Ancient Wisdom Meets Modern Research',
      excerpt: 'Ashwagandha has been used in Ayurvedic medicine for over 3,000 years. Recent clinical studies reveal how this adaptogenic herb supports stress...',
      category: 'Ingredients',
      readTime: '7 min read',
      author: 'Dr. Priya Sharma',
      date: '1 Jan 2025',
      image: '/assets/Ashwagandha 600mg_1753615197741.png',
      slug: 'ashwagandha-science'
    },
    {
      id: 8,
      title: 'Hormonal Changes During Perimenopause: What to Expect',
      excerpt: 'Understanding the hormonal shifts that occur during perimenopause can help you navigate this transition with confidence. Learn about symptoms and...',
      category: 'Women\'s Health',
      readTime: '9 min read',
      author: 'Dr. Rachel Green',
      date: '28 Dec 2024',
      image: '/assets/Magnesium_1753615197741.png',
      slug: 'perimenopause-hormones'
    },
    {
      id: 9,
      title: 'Building Healthy Eating Habits for the Whole Family',
      excerpt: 'Creating nutritious meals that everyone enjoys doesn\'t have to be complicated. These family-friendly recipes and tips make healthy eating simple...',
      category: 'Recipes',
      readTime: '6 min read',
      author: 'Nutritionist Tom Wilson',
      date: '25 Dec 2024',
      image: '/assets/Multivitamin & Mineral for Children (2)_1753633320058.png',
      slug: 'family-nutrition-habits'
    }
  ];

  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Healios Journal - All Articles | Evidence-Based Health & Nutrition Insights"
        description="Explore our comprehensive collection of health and nutrition articles. From pregnancy support to ingredient science, discover evidence-based insights from our expert team."
        keywords="health blog, nutrition articles, pregnancy health, women's health, supplement science, fertility support, healthy recipes"
        url="https://healios.com/journal/all"
      />

      {/* Header */}
      <section className="pt-24 pb-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-6">
              Healios Journal
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Evidence-based insights on nutrition, wellness, and healthy living from our team of experts
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
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

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-black text-white px-8 py-4 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Stay Updated with Our Latest Insights
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