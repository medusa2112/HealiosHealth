import { Link } from 'wouter';
import { ArrowLeft, LayoutDashboard, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AdminHeader({ title = "Admin Panel", subtitle }: AdminHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4" />
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </Button>
            </Link>
            <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}