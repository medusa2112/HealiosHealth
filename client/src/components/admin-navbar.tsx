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
      </div>
    </TooltipProvider>
  );
}