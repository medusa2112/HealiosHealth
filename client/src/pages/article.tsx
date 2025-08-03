import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, User, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/seo-head';

interface Article {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  research: string;
  sources: string[];
  createdAt: string;
}

export default function Article() {
  const [match, params] = useRoute('/journal/:slug');
  const slug = params?.slug;

  // Fetch specific article by slug
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${slug}`],
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center py-12">
            <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-4">Article Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Sorry, we couldn't find the article you're looking for.
            </p>
            <Link href="/journal/all">
              <button className="bg-black text-white px-6 py-3 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all">
                Browse All Articles
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to estimate read time
  const estimateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title={`${article.title} | Healios Evidence-Based Journal`}
        description={article.metaDescription}
        keywords="evidence-based health, nutrition research, supplement science, clinical studies"
        url={`https://healios.com/journal/${article.slug}`}
      />

      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/journal/all">
            <button className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to All Articles
            </button>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Healios Research Team</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{estimateReadTime(article.content)}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="article-content"
          />
        </div>

        {/* Research Summary */}
        {article.research && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Research Summary</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.research}
              </p>
            </div>
          </div>
        )}

        {/* Sources */}
        {article.sources && article.sources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">References & Sources</h2>
            <div className="space-y-2">
              {article.sources.map((source, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-mono min-w-6">
                    [{index + 1}]
                  </span>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all flex items-center gap-1"
                  >
                    {source}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-black text-white p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-4">
              Interested in Evidence-Based Supplements?
            </h3>
            <p className="text-gray-300 mb-6">
              Explore our range of research-backed supplements designed to support your health goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button className="bg-white text-black px-6 py-3 font-medium hover:bg-gray-100 transition-colors">
                  Shop Supplements
                </button>
              </Link>
              <Link href="/quiz">
                <button className="border border-white text-white px-6 py-3 font-medium hover:bg-white hover:text-black transition-colors">
                  Take Wellness Quiz
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">More Evidence-Based Articles</h2>
          <div className="text-center">
            <Link href="/journal/all">
              <button className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Browse All Articles →
              </button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}