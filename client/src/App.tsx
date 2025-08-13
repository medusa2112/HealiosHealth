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
import { isAdminEnabled } from "@/config/adminConfig";
import { AdminLayout } from "@/components/AdminLayout";
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
import Verify from "@/pages/verify";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { AIAssistant, ChatBubble } from "@/components/AIAssistant";
import { CookieConsent } from "@/components/cookie-consent";

// Import admin components conditionally
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import AdminAuthProvider conditionally
import { AdminAuthProvider as AdminAuthProviderImport } from "@/hooks/use-admin-auth";
const AdminAuthProvider = isAdminEnabled()
  ? AdminAuthProviderImport
  : ({ children }: any) => <>{children}</>;

const AdminLogin = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/login"))
  : () => <NotFound />;

const AdminDashboard = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin"))
  : () => <NotFound />;

const AdminOrders = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/orders"))
  : () => <NotFound />;

const AdminCarts = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/carts"))
  : () => <NotFound />;

const AdminLogs = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/logs"))
  : () => <NotFound />;

const AbandonedCarts = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/abandoned-carts"))
  : () => <NotFound />;

const AdminBundles = isAdminEnabled() 
  ? lazy(() => import("@/pages/AdminBundles"))
  : () => <NotFound />;

const ReorderAnalytics = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/reorder-analytics"))
  : () => <NotFound />;

const AdminDiscountCodes = isAdminEnabled() 
  ? lazy(() => import("@/pages/AdminDiscountCodes"))
  : () => <NotFound />;

const AdminProducts = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin-products"))
  : () => <NotFound />;

const AdminProductEdit = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin-product-edit"))
  : () => <NotFound />;

const EmailJobs = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/EmailJobs"))
  : () => <NotFound />;

const AdminAnalytics = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/analytics"))
  : () => <NotFound />;

const AdminSecurity = isAdminEnabled() 
  ? lazy(() => import("@/pages/admin/security"))
  : () => <NotFound />;

function Router() {
  // Automatically scroll to top on page navigation
  useScrollToTop();
  
  return (
    <Switch>
      {/* Standalone Admin Login - No Layout */}
      {isAdminEnabled() && (
        <Route path="/admin/login">
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLogin />
          </Suspense>
        </Route>
      )}
      
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
      
      {/* Admin routes - only rendered if admin is enabled */}
      {isAdminEnabled() && (
        <>
          <Route path="/admin" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminDashboard /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminOrders /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/carts" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminCarts /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/abandoned-carts" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AbandonedCarts /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/admin-logs" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminLogs /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reorder-analytics" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><ReorderAnalytics /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/discount-codes" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminDiscountCodes /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/bundles" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminBundles /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminProducts /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products/:id" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminProductEdit /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/email-jobs" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><EmailJobs /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminAnalytics /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/security" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><AdminSecurity /></Suspense></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/alfr3d" component={() => <ProtectedRoute requiredRole="admin"><AdminLayout><Suspense fallback={<div>Loading...</div>}><ALFR3D /></Suspense></AdminLayout></ProtectedRoute>} />
        </>
      )}
      
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
      <Route path="/profile" component={() => <ProtectedRoute requiredRole="customer"><Profile /></ProtectedRoute>} />
      {/* Legacy redirect - reset-password now handled by /verify?type=reset */}
      <Route path="/reset-password" component={() => {
        window.location.href = '/verify?type=reset';
        return null;
      }} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAIAssistantMinimized, setIsAIAssistantMinimized] = useState(false);
  const [location] = useLocation();
  
  // Check if current route should bypass layout (only admin/login)
  const isStandaloneRoute = isAdminEnabled() && location === '/admin/login';

  if (isStandaloneRoute) {
    // Standalone admin login without layout
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Router />
        <Toaster />
      </div>
    );
  }

  // Full layout for all other pages
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
