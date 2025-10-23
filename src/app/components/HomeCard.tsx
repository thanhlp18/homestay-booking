"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./HomeCard.module.css";

interface HomeCardProps {
  title: string;
  type?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  availability?: string;
  showBooking?: boolean;
  showDetails?: boolean;
  imageUrl?: string;
  imageGradient?: string;
  roomSlug?: string;
  branchSlug?: string;
  amenities?: string[];
}

export const AMENITY_ICON_MAP: Record<string, string> = {
  "WiFi miễn phí": "/tien_nghi/tien_nghi_wifi.png",
  TV: "/tien_nghi/tien_nghi_tivi.png",
  Netflix: "/tien_nghi/tien_nghi_netflix.png",
  "Ghế lười": "/tien_nghi/tien_nghi_ghe_luoi.png",
  "Ghế sách": "/tien_nghi/tien_nghi_ghe_sach.png",
  "Máy game": "/tien_nghi/tien_nghi_may_game.png",
  "Gương king": "/tien_nghi/tien_nghi_guong_king.png",
  "Bàn trang điểm": "/tien_nghi/tien_nghi_ban_trang_diem.png",
  "Gương toàn thân": "/tien_nghi/tien_nghi_guong_toan_than.png",
};

export default function HomeCard({
  title,
  type,
  description,
  price,
  originalPrice,
  availability,
  showBooking = false,
  showDetails = false,
  imageUrl,
  imageGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  roomSlug,
  branchSlug,
  amenities = [],
}: HomeCardProps) {
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      alert("Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      setIsBooking(false);
    }, 1000);
  };

  // Use imageUrl if available, otherwise fall back to gradient
  const backgroundStyle = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { background: imageGradient };

  return (
    <div className={styles.homeCard}>
      <div className={styles.homeImage} style={backgroundStyle}>
        {!imageUrl && <div className={styles.imagePlaceholder}>🏠</div>}
      </div>
      <div className={styles.homeInfo}>
        <div>
          {type && <span className={styles.homeType}>{type}</span>}
          <h3 className={styles.homeTitle}>{title}</h3>
          {description && (
            <p className={styles.homeDescription}>{description}</p>
          )}
          {amenities.length > 0 && (
            <div className={styles.amenitiesGrid}>
              {amenities.map((amenity) => (
                <div className={styles.amenityIconWrapper} key={amenity}>
                  <span className={styles.amenityIconBg}>
                    <img
                      src={
                        AMENITY_ICON_MAP[amenity] ||
                        "/tien_nghi/tien_nghi_khac.png"
                      }
                      alt={amenity}
                      className={styles.amenityIconImg}
                    />
                  </span>
                  <span className={styles.amenityTooltip}>{amenity}</span>
                </div>
              ))}
            </div>
          )}
          {showDetails &&
            (branchSlug ? (
              <Link
                href={`/branches/${branchSlug}`}
                className={styles.viewButton}
              >
                Xem chi tiết chỗ ở →
              </Link>
            ) : (
              <a href="#" className={styles.viewButton}>
                Xem chi tiết chỗ ở →
              </a>
            ))}
        </div>
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
                className={`${styles.bookButton} ${isBooking ? styles.booking : ""}`}
                onClick={handleBooking}
                disabled={isBooking}
              >
                {isBooking ? "Đang đặt..." : "Đặt phòng"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
