import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  Percent, 
  TrendingUp, 
  Mail,
  Shield,
  LogOut,
  Settings
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";

interface AdminNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminNavbar({ activeTab, onTabChange }: AdminNavbarProps) {
  const [, setLocation] = useLocation();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "abandoned-carts", label: "Abandoned Carts", icon: Users },
    { id: "discount-codes", label: "Discount Codes", icon: Percent },
    { id: "admin-logs", label: "Activity Logs", icon: FileText },
    { id: "email-jobs", label: "Email Jobs", icon: Mail },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-xl font-bold text-white hover:text-gray-300">
              Admin Portal
            </Link>
            <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600">
              Development
            </Badge>
          </div>

          {/* Navigation Items */}
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? "bg-white text-black hover:bg-gray-100" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Admin Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Settings</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}