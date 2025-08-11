import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <div className="bg-black text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-600 text-xs px-2 py-1">
                Dev
              </Badge>
            </div>

            {/* Navigation Items */}
            <nav className="flex space-x-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onTabChange(item.id)}
                        className={`flex items-center space-x-1 px-2 py-1 h-8 text-xs ${
                          isActive 
                            ? "bg-white text-black hover:bg-gray-100" 
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden xl:inline">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </nav>

          {/* Admin Actions */}
          <div className="flex items-center space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 h-8"
                >
                  <Settings className="w-3 h-3" />
                  <span className="hidden xl:inline ml-1 text-xs">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 h-8"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden xl:inline ml-1 text-xs">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}