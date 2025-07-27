import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductComprehensive from "@/pages/product-comprehensive";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Science from "@/pages/science";
import Consultation from "@/pages/consultation";
import Quiz from "@/pages/quiz";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductComprehensive} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/science" component={Science} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/quiz" component={Quiz} />
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
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
              <CartSidebar />
            </div>
            <Toaster />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
