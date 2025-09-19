import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Mail, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Form validation schema based on the backend insertNewsletterSchema
const newsletterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  birthday: z.string().optional(),
  website: z.string().optional().default(''), // Honeypot field
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterPopup({ isOpen, onClose }: NewsletterPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      birthday: '',
      website: '', // Honeypot field should be empty
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Welcome to Healios! 🌟",
          description: "Thanks for subscribing! Check your email for confirmation.",
          duration: 5000,
        });
        
        // Store in localStorage to prevent showing again
        localStorage.setItem('healios_newsletter_subscribed', 'true');
        onClose();
      } else {
        throw new Error(result.message || 'Failed to subscribe');
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      if (error.message?.includes('already subscribed')) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "destructive",
        });
        // Store in localStorage since they're already subscribed
        localStorage.setItem('healios_newsletter_subscribed', 'true');
        onClose();
      } else {
        toast({
          title: "Subscription failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      data-testid="newsletter-popup-overlay"
    >
      <div className="relative bg-black border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
          data-testid="button-close-newsletter"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Join Our Wellness Community
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get exclusive health insights, product updates, and special offers delivered to your inbox.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Honeypot Field - Hidden from users */}
            <div className="absolute left-[-9999px] opacity-0">
              <label htmlFor="website">Website (leave blank)</label>
              <Input
                id="website"
                type="text"
                {...form.register('website')}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300 text-sm font-medium">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  {...form.register('firstName')}
                  data-testid="input-firstName"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-400 text-xs" data-testid="error-firstName">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300 text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  {...form.register('lastName')}
                  data-testid="input-lastName"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-400 text-xs" data-testid="error-lastName">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                {...form.register('email')}
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-red-400 text-xs" data-testid="error-email">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Birthday Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="birthday" className="text-gray-300 text-sm font-medium">
                <Calendar className="inline h-4 w-4 mr-1" />
                Birthday (Optional)
              </Label>
              <Input
                id="birthday"
                type="date"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                {...form.register('birthday')}
                data-testid="input-birthday"
              />
              <p className="text-gray-400 text-xs">
                Get special birthday offers and personalized recommendations
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-subscribe"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subscribing...
                </div>
              ) : (
                'Join the Community'
              )}
            </Button>

            {/* Privacy Note */}
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              By subscribing, you agree to receive marketing emails. You can unsubscribe at any time. 
              We respect your privacy and will never share your information.
            </p>
          </form>
        </div>

        {/* Bottom Accent */}
        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-b-2xl"></div>
      </div>
    </div>
  );
}