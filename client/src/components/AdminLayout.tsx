import { useLocation } from "wouter";
import { AdminNavbar } from "./admin-navbar";
import { Toaster } from "@/components/ui/toaster";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  
  // Get current tab based on location
  const getCurrentTab = () => {
    if (location === '/admin') return 'overview';
    if (location === '/admin/products') return 'products';
    if (location === '/admin/orders') return 'orders';
    if (location.includes('/admin/abandoned-carts')) return 'abandoned-carts';
    if (location === '/admin/discount-codes') return 'discount-codes';
    if (location === '/admin/admin-logs') return 'admin-logs';
    if (location === '/admin/email-jobs') return 'email-jobs';
    if (location === '/admin/analytics') return 'analytics';
    if (location === '/admin/security') return 'security';
    return 'overview';
  };

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    const routeMap: { [key: string]: string } = {
      'overview': '/admin',
      'products': '/admin/products',
      'orders': '/admin/orders',
      'abandoned-carts': '/admin/abandoned-carts',
      'discount-codes': '/admin/discount-codes',
      'admin-logs': '/admin/admin-logs',
      'email-jobs': '/admin/email-jobs',
      'analytics': '/admin/analytics',
      'security': '/admin/security',
    };
    
    const route = routeMap[tab];
    if (route) {
      setLocation(route);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Fixed Admin Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminNavbar 
          activeTab={getCurrentTab()} 
          onTabChange={handleTabChange} 
        />
      </div>
      
      {/* Main Content with top padding to account for fixed navbar */}
      <div className="pt-14">
        {children}
      </div>
      
      <Toaster />
    </div>
  );
}