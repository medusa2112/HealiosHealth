import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  useEffect(() => {
    // Set page title and meta for SEO
    document.title = 'Login | Healios';
    
    // Set canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/login`);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = `${window.location.origin}/login`;
      document.head.appendChild(link);
    }

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sign in to your Healios account to access orders, subscriptions and account settings. Secure login for premium wellness products.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Sign in to your Healios account to access orders, subscriptions and account settings. Secure login for premium wellness products.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div id="main">
      <LoginForm />
    </div>
  );
}