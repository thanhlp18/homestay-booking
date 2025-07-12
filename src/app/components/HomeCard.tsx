'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './HomeCard.module.css';

interface HomeCardProps {
  title: string;
  type?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  availability?: string;
  showBooking?: boolean;
  showDetails?: boolean;
  imageGradient?: string;
  roomSlug?: string;
  branchSlug?: string;
}

export default function HomeCard({
  title,
  type,
  description,
  price,
  originalPrice,
  availability,
  showBooking = false,
  showDetails = false,
  imageGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  roomSlug,
  branchSlug
}: HomeCardProps) {
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      alert('Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setIsBooking(false);
    }, 1000);
  };

  return (
    <div className={styles.homeCard}>
      <div className={styles.homeImage} style={{ background: imageGradient }}>
        <div className={styles.imagePlaceholder}>🏠</div>
      </div>
      <div className={styles.homeInfo}>
        {type && (
          <span className={styles.homeType}>{type}</span>
        )}
        <h3 className={styles.homeTitle}>{title}</h3>
        {description && (
          <p className={styles.homeDescription}>{description}</p>
        )}
        
        {showDetails && (
          branchSlug ? (
            <Link href={`/branches/${branchSlug}`} className={styles.viewButton}>
              Xem chi tiết chỗ ở →
            </Link>
          ) : (
            <a href="#" className={styles.viewButton}>Xem chi tiết chỗ ở →</a>
          )
        )}
        
        {showBooking && (
          <div className={styles.priceSection}>
            {availability && (
              <span className={styles.availability}>{availability}</span>
            )}
            {price && (
              <div className={styles.pricing}>
                <span className={styles.price}>{price}</span>
                {originalPrice && (
                  <span className={styles.originalPrice}>{originalPrice}</span>
                )}
              </div>
            )}
            {roomSlug ? (
              <Link href={`/rooms/${roomSlug}`} className={styles.bookButton}>
                Đặt phòng
              </Link>
            ) : (
              <button 
                className={`${styles.bookButton} ${isBooking ? styles.booking : ''}`}
                onClick={handleBooking}
                disabled={isBooking}
              >
                {isBooking ? 'Đang đặt...' : 'Đặt phòng'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 