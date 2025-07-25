import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Leaf, Microscope, Award } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();

  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email });
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                  <h1 className="font-heading">
                    <span className="block text-4xl tracking-tight font-bold text-dark-text sm:text-5xl md:text-6xl">
                      Premium Nutrition
                    </span>
                    <span className="block text-brand-yellow text-4xl tracking-tight font-bold sm:text-5xl md:text-6xl">
                      Made Simple
                    </span>
                  </h1>
                  <p className="mt-6 text-base text-gray-600 sm:text-lg md:mt-8 md:text-xl md:max-w-3xl">
                    Discover scientifically-backed supplements crafted from the finest natural ingredients. 
                    Fuel your body with what it deserves.
                  </p>
                  <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/products">
                        <Button className="w-full flex items-center justify-center px-8 py-3 brand-yellow hover:bg-brand-yellow-dark text-dark-text rounded-md md:py-4 md:text-lg md:px-10">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                      <Link href="/about">
                        <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-dark-text bg-white hover:bg-gray-50 rounded-md md:py-4 md:text-lg md:px-10">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Woman preparing healthy nutrition" 
                    className="w-full rounded-xl shadow-xl" 
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our most popular supplements, trusted by thousands of health-conscious individuals worldwide.
            </p>
          </div>
          
          {isLoading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button className="bg-dark-text text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
                Why Choose Wild Nutrition?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We're committed to providing the highest quality supplements that support your health journey with science-backed formulations.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">100% Natural Ingredients</h3>
                    <p className="mt-2 text-gray-600">Sourced from the finest organic farms and sustainable suppliers worldwide.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Microscope className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">Science-Backed Formulas</h3>
                    <p className="mt-2 text-gray-600">Every product is formulated based on the latest nutritional research and clinical studies.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">Third-Party Tested</h3>
                    <p className="mt-2 text-gray-600">All supplements undergo rigorous testing for purity, potency, and safety.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500" 
                alt="Clean eating ingredients" 
                className="w-full rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-dark-text py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Stay Updated
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Get the latest health tips, exclusive offers, and product updates delivered to your inbox.
            </p>
          </div>
          
          <div className="mt-8 max-w-md mx-auto">
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-md border-0 text-dark-text focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                required
              />
              <Button
                type="submit"
                className="brand-yellow hover:bg-brand-yellow-dark text-dark-text px-6 py-3 rounded-r-md font-medium transition-colors duration-200"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-3 text-sm text-gray-400 text-center">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
