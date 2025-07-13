'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import styles from './payment.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';

interface SelectedSlot {
  date: string;
  branchId: string;
  roomId: string;
  timeSlotId: string;
  price: number;
}

interface BookingData {
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: string;
  notes: string;
  paymentMethod: string;
  room: string;
  location: string;
  price: number;
  selectedSlots: SelectedSlot[];
  frontIdImage?: string;
  backIdImage?: string;
  bookingId: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(288); // 4 minutes 48 seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    paymentConfirmed: boolean;
    paymentConfirmedAt?: string;
  } | null>(null);

  // Generate QR code URL
  const generateQRCodeUrl = (bookingId: string, amount: number) => {
    return `https://qr.sepay.vn/img?acc=43218082002&bank=TPBank&amount=${amount}&des=${bookingId}`;
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    if (!bookingData?.bookingId) return;

    try {
      const response = await fetch(`/api/bookings/${bookingData.bookingId}/payment-status`);
      const result = await response.json();

      if (result.success) {
        setPaymentStatus({
          status: result.data.status,
          paymentConfirmed: result.data.paymentConfirmed,
          paymentConfirmedAt: result.data.paymentConfirmedAt
        });

        // If payment is confirmed, show success message
        if (result.data.paymentConfirmed && result.data.status === 'PAYMENT_CONFIRMED') {
          alert('Thanh toán thành công! Chúng tôi sẽ kiểm tra và phê duyệt đặt phòng của bạn trong thời gian sớm nhất.');
          localStorage.removeItem('bookingData');
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem('bookingData');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (!bookingData?.bookingId) return;

    // Check immediately
    checkPaymentStatus();

    // Then check every 5 seconds
    const paymentTimer = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(paymentTimer);
  }, [bookingData?.bookingId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds.toString().padStart(2, '0')} giây`;
  };

  const handleConfirmTransfer = async () => {
    if (!bookingData) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update booking status to PAYMENT_CONFIRMED
      const response = await fetch(`/api/admin/bookings/${bookingData.bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PAYMENT_CONFIRMED'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
      }

      // Clear booking data from localStorage
      localStorage.removeItem('bookingData');
      
      // Show success message and redirect
      alert('Xác nhận thành công! Chúng tôi sẽ kiểm tra và phê duyệt đặt phòng của bạn trong thời gian sớm nhất.');
      router.push('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    localStorage.removeItem('bookingData');
    router.push('/');
  };

  if (!bookingData) {
    return (
      <div className={styles.page}>
        <Header />
        <LoadingSpinner text="Đang tải thông tin đặt phòng..." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.successSection}>
          <div className={styles.successIcon}>
            <div className={styles.checkmark}>✓</div>
          </div>
          <h1 className={styles.successTitle}>Đặt hàng thành công!</h1>
          <div className={styles.timeRemaining}>
            Booking có hiệu lực còn {formatTime(timeRemaining)}
          </div>
        </div>

        <div className={styles.paymentSection}>
          <h2 className={styles.paymentTitle}>Hướng dẫn thanh toán qua chuyển khoản ngân hàng</h2>
          
          <div className={styles.paymentMethods}>
            <div className={styles.paymentMethod}>
              <h3 className={styles.methodTitle}>Cách 1: Mở app ngân hàng và quét mã QR</h3>
              <div className={styles.qrSection}>
                <div className={styles.qrCode}>
                  <div className={styles.qrPlaceholder}>
                    {bookingData && (
                      <img 
                        src={generateQRCodeUrl(bookingData.bookingId, bookingData.price)}
                        alt="QR Code for payment"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <div className={styles.qrLabels}>
                    <span className={styles.qrLabel}>TPBank</span>
                    <span className={styles.qrLabel}>VietQR</span>
                    <span className={styles.qrLabel}>QR Pay</span>
                  </div>
                  <div className={styles.qrStatus}>
                    <a 
                      href={bookingData ? generateQRCodeUrl(bookingData.bookingId, bookingData.price) : '#'}
                      download="payment-qr.png"
                      className={styles.statusButton}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tải ảnh QR
                    </a>
                  </div>
                </div>
                <div className={styles.qrNote}>
                  {paymentStatus?.paymentConfirmed ? (
                    <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
                      ✅ Thanh toán thành công! Đang xử lý...
                    </span>
                  ) : (
                    <span>Trạng thái: Chờ thanh toán... ⏳</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.paymentMethod}>
              <h3 className={styles.methodTitle}>Cách 2: Chuyển khoản thủ công theo thông tin</h3>
              <div className={styles.bankInfo}>
                <div className={styles.bankLogo}>
                  <img 
                    src="/logo-TPBank.svg" 
                    alt="TPBank Logo" 
                    className={styles.bankLogoImg}
                  />
                  <span className={styles.bankName}>Ngân hàng TPBank</span>
                </div>
                <div className={styles.bankDetails}>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Chủ tài khoản:</span>
                    <span className={styles.bankValue}>Lê Phước Thành</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Số TK:</span>
                    <span className={styles.bankValue}>43218082002</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Số tiền:</span>
                    <span className={styles.bankValue}>{bookingData.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Nội dung CK:</span>
                    <span className={styles.bankValue}>{bookingData.bookingId}</span>
                  </div>
                </div>
                <div className={styles.bankNote}>
                  <p>Lưu ý: Vui lòng ghi nguyên nội dung chuyển khoản {bookingData.bookingId} để hệ thống tự động xác nhận thanh toán</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.backButton}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            {/* <button 
              onClick={handleConfirmTransfer} 
              className={styles.confirmTransferBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
            </button> */}
            <button 
              onClick={handleBackToHome} 
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              ← Hủy đặt phòng
            </button>
          </div>
        </div>

        <div className={styles.promoSection}>
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <div className={styles.promoTitle}>MIỄN PHÍ</div>
              <div className={styles.promoSubtitle}>NHƯỢNG QUYỀN HOMESTAY TOÀN QUỐC</div>
              <div className={styles.promoNote}>(CLICK ĐỂ TÌM HIỂU THÊM)</div>
            </div>
          </div>
          <div className={styles.licenseInfo}>
            Tài trợ: Liên hệ QC 0901416888
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <span className={styles.logoIcon}>🏠</span>
              <span className={styles.logoText}>TidyToto</span>
            </div>
            <div className={styles.footerSubtext}>Homestay và lưu trú tại Việt Nam</div>
            <div className={styles.hotline}>Hotline: 0932000000</div>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Chính sách</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/policies/privacy">Chính sách bảo mật thông tin</Link></li>
              <li><Link href="/policies/promotion">Chính sách khuyến mãi</Link></li>
              <li><Link href="/policies/guarantee">Chính sách bảo đảm</Link></li>
              <li><Link href="/guides/usage">Hướng dẫn sử dụng</Link></li>
              <li><Link href="/guides/handover">Hướng dẫn bàn giao</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Hỗ trợ thanh toán</h3>
            <div className={styles.paymentIcons}>
              <span className={styles.paymentIcon}>VISA</span>
              <span className={styles.paymentIcon}>💳</span>
              <span className={styles.paymentIcon}>ATM</span>
              <span className={styles.paymentIcon}>VNPAY</span>
              <span className={styles.paymentIcon}>🏦</span>
              <span className={styles.paymentIcon}>momo</span>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.footerText}>
            Hộ kinh doanh LOCAL HOME / Địa chỉ: Số B1 07, chung cư Cadif - HH1, Hưng Phú, Q. Cái Răng, TP. Cần Thơ / Mã số hộ kinh doanh: 
            8340126748 - 002 do Phòng Tài Chính - Kế Hoạch Quận Cái Răng cấp lần đầu ngày 13/11/2024. Điện thoại: 0901416888. Chủ trách nhiệm 
            nội dung: Lê Phước Thành
          </p>
        </div>
        
        <div className={styles.footerCopyright}>
          <p>© Copyright LocalHome 2025</p>
          <div className={styles.socialIcons}>
            <span className={styles.socialIcon}>f</span>
            <span className={styles.socialIcon}>📱</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 