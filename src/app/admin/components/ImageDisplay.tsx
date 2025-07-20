'use client';

import { useState } from 'react';
import { Image, Spin } from 'antd';
import { EyeOutlined, FileImageOutlined } from '@ant-design/icons';

interface ImageDisplayProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  preview?: boolean;
  fallback?: string;
  onClick?: () => void;
}

export default function ImageDisplay({
  src,
  alt = 'Image',
  width = 100,
  height = 100,
  className,
  style = {},
  preview = true,
  fallback,
  onClick
}: ImageDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Default fallback image (you can replace with your own)
  const defaultFallback = fallback || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.error('Failed to load image:', src);
  };

  // If no src provided, show fallback
  if (!src) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: 6,
          ...style
        }}
        className={className}
      >
        <FileImageOutlined style={{ fontSize: 24, color: '#ccc' }} />
      </div>
    );
  }

  return (
    <div 
      style={{ position: 'relative', ...style }} 
      className={className}
      onClick={onClick}
    >
      {loading && (
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: 6,
            zIndex: 1
          }}
        >
          <Spin size="small" />
        </div>
      )}
      
      {error ? (
        <div 
          style={{ 
            width, 
            height, 
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8
          }}
        >
          <FileImageOutlined style={{ fontSize: 20, color: '#ff4d4f', marginBottom: 4 }} />
          <span style={{ fontSize: 10, color: '#ff4d4f', textAlign: 'center' }}>
            Failed to load
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ 
            objectFit: 'cover',
            borderRadius: 6,
            border: '1px solid #f0f0f0'
          }}
          fallback={defaultFallback}
          preview={preview ? {
            mask: <div><EyeOutlined /> Preview</div>
          } : false}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={
            <div style={{ 
              width, 
              height, 
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6
            }}>
              <Spin size="small" />
            </div>
          }
        />
      )}
    </div>
  );
}

// Helper component for image galleries
interface ImageGalleryProps {
  images: string[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  onImageClick?: (url: string, index: number) => void;
}

export function ImageGallery({ 
  images, 
  maxDisplay = 4, 
  size = 'medium',
  onImageClick
}: ImageGalleryProps) {
  const sizeMap = {
    small: 60,
    medium: 80,
    large: 120
  };

  const imageSize = sizeMap[size];
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  if (!images || images.length === 0) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: 'center', 
        color: '#999',
        border: '1px dashed #d9d9d9',
        borderRadius: 6,
        backgroundColor: '#fafafa'
      }}>
        <FileImageOutlined style={{ fontSize: 24, marginBottom: 8 }} />
        <div>No images available</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {displayImages.map((url, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <ImageDisplay
            src={url}
            alt={`Image ${index + 1}`}
            width={imageSize}
            height={imageSize}
            style={{ cursor: onImageClick ? 'pointer' : 'default' }}
            onClick={() => onImageClick?.(url, index)}
          />
          {index === maxDisplay - 1 && remainingCount > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              +{remainingCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 