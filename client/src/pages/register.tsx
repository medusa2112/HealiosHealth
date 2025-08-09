import { useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Register() {
  useEffect(() => {
    // Set page title and meta for SEO
    document.title = 'Create Account | Healios';
    
    // Set canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/register`);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = `${window.location.origin}/register`;
      document.head.appendChild(link);
    }

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create your Healios account to access premium wellness products, personalised health insights, and exclusive member benefits.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Create your Healios account to access premium wellness products, personalised health insights, and exclusive member benefits.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div id="main">
      <RegisterForm />
    </div>
  );
}