import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import { StockUpdateBanner } from "@/components/stock-update-banner";
import { StockNotification } from "@/components/stock-notification";
// Chat functionality removed as requested
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductComprehensive from "@/pages/product-comprehensive";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import CheckoutSuccess from "@/pages/checkout-success";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Science from "@/pages/science";
import ScienceResearch from "@/pages/science-research";
import JournalAll from "@/pages/journal-all";
import Article from "@/pages/article";

import Quiz from "@/pages/quiz";
import Planet from "@/pages/planet";
import AdminDashboard from "@/pages/admin";
import AdminOrders from "@/pages/admin/orders";
import AdminCarts from "@/pages/admin/carts";
import AdminLogs from "@/pages/admin/logs";
import AbandonedCarts from "@/pages/admin/abandoned-carts";
import AdminBundles from "@/pages/AdminBundles";
import ReorderAnalytics from "@/pages/admin/reorder-analytics";
import AdminDiscountCodes from "@/pages/AdminDiscountCodes";
import AdminProducts from "@/pages/admin-products";
import AdminProductEdit from "@/pages/admin-product-edit";
import CustomerPortal from "@/pages/customer-portal";
import PortalSubscriptions from "@/pages/PortalSubscriptions";
import ALFR3D from "@/pages/alfr3d";
import { FAQ } from "@/pages/faq";
import { ShippingReturns } from "@/pages/shipping-returns";
import { Terms } from "@/pages/terms";
import { Careers } from "@/pages/careers";
import { Privacy } from "@/pages/privacy";
import { Affiliate } from "@/pages/affiliate";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminLogin from "@/pages/admin-login";
import Verify from "@/pages/verify";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import { AIAssistant, ChatBubble } from "@/components/AIAssistant";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/cookie-consent";

function Router() {
  // Automatically scroll to top on page navigation
  useScrollToTop();
  
  return (
    <Switch>
      {/* Standalone Admin Login - No Layout */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* All other routes with full layout */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductComprehensive} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout-success" component={CheckoutSuccess} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/science" component={Science} />
      <Route path="/science/research" component={ScienceResearch} />
      <Route path="/journal/all" component={JournalAll} />
      <Route path="/journal/:slug" component={Article} />

      <Route path="/quiz" component={Quiz} />
      <Route path="/planet" component={Planet} />
      <Route path="/admin" component={() => <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" component={() => <ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/carts" component={() => <ProtectedRoute requiredRole="admin"><AdminCarts /></ProtectedRoute>} />
      <Route path="/admin/abandoned-carts" component={() => <ProtectedRoute requiredRole="admin"><AbandonedCarts /></ProtectedRoute>} />
      <Route path="/admin/logs" component={() => <ProtectedRoute requiredRole="admin"><AdminLogs /></ProtectedRoute>} />
      <Route path="/admin/reorder-analytics" component={() => <ProtectedRoute requiredRole="admin"><ReorderAnalytics /></ProtectedRoute>} />
      <Route path="/admin/discount-codes" component={() => <ProtectedRoute requiredRole="admin"><AdminDiscountCodes /></ProtectedRoute>} />
      <Route path="/admin/bundles" component={() => <ProtectedRoute requiredRole="admin"><AdminBundles /></ProtectedRoute>} />
      <Route path="/admin/products" component={() => <ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/products/:id" component={() => <ProtectedRoute requiredRole="admin"><AdminProductEdit /></ProtectedRoute>} />
      <Route path="/admin/alfr3d" component={() => <ProtectedRoute requiredRole="admin"><ALFR3D /></ProtectedRoute>} />
      <Route path="/portal" component={() => <ProtectedRoute requiredRole="customer"><CustomerPortal /></ProtectedRoute>} />
      <Route path="/portal/subscriptions" component={() => <ProtectedRoute requiredRole="customer"><PortalSubscriptions /></ProtectedRoute>} />
      
      {/* Legal and Informational Pages */}
      <Route path="/faq" component={FAQ} />
      <Route path="/shipping-returns" component={ShippingReturns} />
      <Route path="/terms" component={Terms} />
      <Route path="/careers" component={Careers} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/affiliate" component={Affiliate} />
      
      {/* Authentication Pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify" component={Verify} />
      <Route path="/forgot-password" component={ForgotPassword} />
      {/* Legacy redirect - reset-password now handled by /verify?type=reset */}
      <Route path="/reset-password" component={() => {
        window.location.href = '/verify?type=reset';
        return null;
      }} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAIAssistantMinimized, setIsAIAssistantMinimized] = useState(false);
  const [location] = useLocation();
  
  // Check if current route should bypass layout
  const isStandaloneRoute = location === '/admin/login';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              {isStandaloneRoute ? (
                // Standalone pages without layout
                <div className="min-h-screen bg-white dark:bg-gray-900">
                  <Router />
                  <Toaster />
                </div>
              ) : (
                // Full layout for all other pages
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
                  <StockUpdateBanner />
                  <Header />
                  <main className="flex-1">
                    <Router />
                  </main>
                  <Footer />
                  <CartSidebar />
                  <StockNotification />
                  
                  {/* AI Assistant */}
                  {!isAIAssistantOpen && (
                    <ChatBubble onClick={() => setIsAIAssistantOpen(true)} />
                  )}
                  
                  <AIAssistant 
                    isOpen={isAIAssistantOpen}
                    onToggle={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                    isMinimized={isAIAssistantMinimized}
                    onMinimize={() => setIsAIAssistantMinimized(!isAIAssistantMinimized)}
                  />
                  <Toaster />
                  <CookieConsent />
                </div>
              )}
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
