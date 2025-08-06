import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import { StockUpdateBanner } from "@/components/stock-update-banner";
import { StockNotification } from "@/components/stock-notification";
import { JulietChatbotPopup } from "@/components/juliet-chatbot-popup";
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
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin";
import AdminOrders from "@/pages/admin/orders";
import CustomerPortal from "@/pages/customer-portal";
import NotFound from "@/pages/not-found";

function Router() {
  // Automatically scroll to top on page navigation
  useScrollToTop();
  
  return (
    <Switch>
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/portal" component={CustomerPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
              <StockUpdateBanner />
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
              <CartSidebar />
              <StockNotification />
              <JulietChatbotPopup />
            </div>
            <Toaster />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
