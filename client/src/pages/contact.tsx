import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from '@/components/seo-head';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Contact Us | Healios"
        description="Get in touch with our wellness experts. Contact Healios for product questions, support, or general inquiries about our premium supplements."
        keywords="contact healios, customer support, supplement questions, wellness support, health inquiries"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark-text sm:text-5xl mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or need personalized nutrition advice? 
            We're here to help you on your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-dark-text">
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* South Africa Office */}
                <div>
                  <h4 className="font-medium text-dark-text mb-3">🇿🇦 South Africa Office</h4>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-brand-yellow mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">
                          The Healios Health (Pty) Ltd<br />
                          6A 2nd Street, Linden<br />
                          Johannesburg, Gauteng, South Africa
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 text-brand-yellow mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">+27 82 691 4852</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UK Office */}
                <div>
                  <h4 className="font-medium text-dark-text mb-3">🇬🇧 United Kingdom Office</h4>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-brand-yellow mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">
                          The Healios Health Ltd<br />
                          69 High Street, Southgate<br />
                          London N14 6LD, England
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 text-brand-yellow mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">+44 7947 730436</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-brand-yellow mt-1" />
                  <div>
                    <p className="font-medium text-dark-text">Email</p>
                    <p className="text-gray-600">marketing@thehealios.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-brand-yellow mt-1" />
                  <div>
                    <p className="font-medium text-dark-text">Business Hours</p>
                    <p className="text-gray-600">
                      Monday - Friday: 9AM - 6PM GMT<br />
                      Saturday: 10AM - 2PM GMT<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-dark-text">
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="block text-gray-600 hover:text-brand-yellow transition-colors">
                    → Shipping Information
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-brand-yellow transition-colors">
                    → Return & Exchange Policy
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-brand-yellow transition-colors">
                    → Product Usage Guidelines
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-brand-yellow transition-colors">
                    → Subscription Management
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-brand-yellow transition-colors">
                    → Wholesale Inquiries
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-dark-text">
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-dark-text mb-2">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-dark-text mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-dark-text mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full brand-yellow hover:bg-brand-yellow-dark text-dark-text py-3 font-medium"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Support Section */}
        <div className="mt-16 text-center">
          <h2 className="font-heading text-2xl font-bold text-dark-text mb-4">
            Need Immediate Help?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            For urgent matters or if you need immediate assistance with your order, 
            please call our customer service line during business hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="brand-yellow hover:bg-brand-yellow-dark text-dark-text">
              🇿🇦 Call SA: +27 82 691 4852
            </Button>
            <Button variant="outline">
              🇬🇧 Call UK: +44 7947 730436
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
