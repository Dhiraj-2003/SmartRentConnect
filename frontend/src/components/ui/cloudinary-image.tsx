import React, { useState, useEffect } from 'react';
import { createOptimizedCloudinaryUrl, isCloudinaryUrl } from '@/lib/api';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  fallback?: string; // Fallback image URL if Cloudinary fails
  onClick?: () => void;
  style?: React.CSSProperties;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  format = 'auto',
  loading = 'lazy',
  fallback,
  onClick,
  style,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      if (isCloudinaryUrl(src)) {
        // Create optimized Cloudinary URL
        const optimizedUrl = createOptimizedCloudinaryUrl(src, {
          width,
          height,
          quality,
          format,
        });
        setImageSrc(optimizedUrl);
      } else {
        // Use original URL for non-Cloudinary images
        setImageSrc(src);
      }
    }
  }, [src, width, height, quality, format]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
    }
  };

  const handleLoad = () => {
    // Reset error state on successful load
    setHasError(false);
  };

  if (!imageSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: width || '100%', height: height || 'auto', ...style }}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      style={style}
    />
  );
};

export default CloudinaryImage;
