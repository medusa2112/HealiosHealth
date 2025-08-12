import React, { useState, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  width?: number;
  height?: number;
  quality?: number;
  webpFallback?: boolean;
}

export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  sizes,
  width,
  height,
  quality = 80,
  webpFallback = true
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // If WebP fails and fallback is enabled, try original format
    if (webpFallback && currentSrc !== src && src.includes('.webp')) {
      const fallbackSrc = src.replace('.webp', '.jpg').replace('.webp', '.png');
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
  };

  // Generate responsive image URLs if possible
  const generateSrcSet = (baseSrc: string) => {
    if (!width) return undefined;
    
    const baseUrl = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = baseSrc.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.webp';
    
    return [
      `${baseUrl}_small${ext} 400w`,
      `${baseUrl}_medium${ext} 800w`,
      `${baseUrl}_large${ext} 1200w`,
      `${baseSrc} ${width}w`
    ].join(', ');
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 dark:text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <img
        src={currentSrc}
        srcSet={generateSrcSet(currentSrc)}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={loading}
        sizes={sizes || width ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` : undefined}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        style={{
          filter: quality < 80 ? `brightness(1.05) contrast(1.05)` : undefined
        }}
      />
    </div>
  );
});

// Enhanced Picture component for WebP support with fallbacks
interface ResponsivePictureProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  quality?: number;
}

export const ResponsivePicture = memo(({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
  quality = 80
}: ResponsivePictureProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate different format sources
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const originalSrc = src;

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <picture>
        {/* WebP source for modern browsers */}
        <source 
          srcSet={webpSrc} 
          type="image/webp"
          media="(min-width: 1px)" 
        />
        {/* Fallback for older browsers */}
        <img
          src={originalSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading={loading}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          decoding="async"
          style={{
            filter: quality < 80 ? `brightness(1.05) contrast(1.05)` : undefined
          }}
        />
      </picture>
    </div>
  );
});