"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import styles from "./payment.module.css";
import LoadingSpinner from "../components/LoadingSpinner";
import Footer from "../components/Footer";

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

// Extract the component that uses useSearchParams
function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(288); // 4 minutes 48 seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    paymentConfirmed: boolean;
    paymentConfirmedAt?: string;
  } | null>(null);
  const paymentTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR code URL
  const generateQRCodeUrl = (bookingId: string, amount: number) => {
    return `https://qr.sepay.vn/img?acc=43218082002&bank=TPBank&amount=${amount}&des=${bookingId}`;
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    if (!bookingData?.bookingId) return;

    try {
      const response = await fetch(
        `/api/bookings/${bookingData.bookingId}/payment-status`
      );
      const result = await response.json();

      if (result.success) {
        setPaymentStatus({
          status: result.data.status,
          paymentConfirmed: result.data.paymentConfirmed,
          paymentConfirmedAt: result.data.paymentConfirmedAt,
        });

        // If payment is confirmed, show success message but stay on page
        if (
          result.data.paymentConfirmed &&
          (result.data.status === "PAYMENT_CONFIRMED" ||
            result.data.status === "APPROVED")
        ) {
          // Stop checking payment status
          if (paymentTimerRef.current) {
            clearInterval(paymentTimerRef.current);
            paymentTimerRef.current = null;
          }
          console.log(
            "Payment confirmed, stopped polling and staying on payment page"
          );
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const getStoredBookingData = () => {
    const cookies = document.cookie.split(";");
    const bookingDataCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("bookingData=")
    );

    if (bookingDataCookie) {
      try {
        const bookingDataString = bookingDataCookie.split("=")[1];
        return JSON.parse(decodeURIComponent(bookingDataString));
      } catch (error) {
        console.error("Error parsing booking data from cookie:", error);
        return null;
      }
    }
    return null;
  };

  const fetchBookingData = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings`);
      const result = await response.json();

      if (result.success && result.data) {
        interface BookingFromAPI {
          id: string;
          fullName: string;
          phone: string;
          email?: string;
          cccd: string;
          guests: number;
          notes?: string;
          paymentMethod: string;
          totalPrice: number;
          frontIdImageUrl?: string;
          backIdImageUrl?: string;
          room?: {
            name: string;
            branch?: {
              location: string;
            };
          };
        }

        const booking = result.data.find(
          (b: BookingFromAPI) => b.id === bookingId
        );

        if (booking) {
          // Transform API booking data to BookingData format
          const transformedData: BookingData = {
            fullName: booking.fullName,
            phone: booking.phone,
            email: booking.email || "",
            cccd: booking.cccd,
            guests: booking.guests.toString(),
            notes: booking.notes || "",
            paymentMethod: booking.paymentMethod,
            room: booking.room?.name || "",
            location: booking.room?.branch?.location || "",
            price: booking.totalPrice,
            selectedSlots: [], // Not needed for payment page
            frontIdImage: booking.frontIdImageUrl,
            backIdImage: booking.backIdImageUrl,
            bookingId: booking.id,
          };
          return transformedData;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching booking data:", error);
      return null;
    }
  };

  useEffect(() => {
    // First, try to get bookingIds from URL
    const bookingIdsParam = searchParams?.get("bookingIds");

    if (bookingIdsParam) {
      // Get the first booking ID (comma-separated list)
      const bookingIds = bookingIdsParam.split(",").filter((id) => id.trim());
      const firstBookingId = bookingIds[0]?.trim();

      if (firstBookingId) {
        // Fetch booking data from API
        fetchBookingData(firstBookingId).then((data) => {
          if (data) {
            setBookingData(data);
          } else {
            // Fallback to stored data if API fetch fails
            const storedData = getStoredBookingData();
            if (storedData) {
              setBookingData(storedData);
            } else {
              router.push("/");
            }
          }
        });
        return;
      }
    }

    // Fallback to stored data from cookies
    const storedData = getStoredBookingData();

    if (!storedData) {
      router.push("/");
      return;
    }

    setBookingData(storedData);
  }, [router, searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
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
    paymentTimerRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => {
      if (paymentTimerRef.current) {
        clearInterval(paymentTimerRef.current);
        paymentTimerRef.current = null;
      }
    };
  }, [bookingData?.bookingId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds
      .toString()
      .padStart(2, "0")} giây`;
  };

  const handleBackToHome = async () => {
    if (!bookingData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Update booking status to CANCELLED
      const response = await fetch(
        `/api/admin/bookings/${bookingData.bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra khi hủy đặt phòng");
      }

      // Clear booking data from localStorage
      document.cookie =
        "bookingData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

      // Show success message and redirect
      alert("Đã hủy đặt phòng thành công!");
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi hủy đặt phòng"
      );
    } finally {
      setIsSubmitting(false);
    }
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
          {!paymentStatus?.paymentConfirmed && (
            <div className={styles.timeRemaining}>
              Booking có hiệu lực còn {formatTime(timeRemaining)}
            </div>
          )}
          {paymentStatus?.paymentConfirmed && (
            <div className={styles.paymentConfirmed}>
              <div
                style={{
                  color: "#48bb78",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginTop: "1rem",
                }}
              >
                ✅ Thanh toán thành công!
                {paymentStatus.status === "APPROVED"
                  ? " Đặt phòng đã được phê duyệt."
                  : " Đang xử lý phê duyệt..."}
              </div>
            </div>
          )}
        </div>

        {!paymentStatus?.paymentConfirmed && (
          <div className={styles.paymentSection}>
            <h2 className={styles.paymentTitle}>
              Hướng dẫn thanh toán qua chuyển khoản ngân hàng
            </h2>

            <div className={styles.paymentMethods}>
              <div className={styles.paymentMethod}>
                <h3 className={styles.methodTitle}>
                  Cách 1: Mở app ngân hàng và quét mã QR
                </h3>
                <div className={styles.qrSection}>
                  <div className={styles.qrCode}>
                    <div className={styles.qrPlaceholder}>
                      {bookingData && (
                        <img
                          src={generateQRCodeUrl(
                            bookingData.bookingId,
                            bookingData.price
                          )}
                          alt="QR Code for payment"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
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
                        href={
                          bookingData
                            ? generateQRCodeUrl(
                                bookingData.bookingId,
                                bookingData.price
                              )
                            : "#"
                        }
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
                      <span style={{ color: "#48bb78", fontWeight: "bold" }}>
                        ✅ Thanh toán thành công! Đang xử lý...
                      </span>
                    ) : (
                      <span>Trạng thái: Chờ thanh toán... ⏳</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.paymentMethod}>
                <h3 className={styles.methodTitle}>
                  Cách 2: Chuyển khoản thủ công theo thông tin
                </h3>
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
                      <span className={styles.bankValue}>
                        {bookingData.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className={styles.bankRow}>
                      <span className={styles.bankLabel}>Nội dung CK:</span>
                      <span className={styles.bankValue}>
                        {bookingData.bookingId}
                      </span>
                    </div>
                  </div>
                  <div className={styles.bankNote}>
                    <p>
                      Lưu ý: Vui lòng ghi nguyên nội dung chuyển khoản{" "}
                      {bookingData.bookingId} để hệ thống tự động xác nhận thanh
                      toán
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.backButton}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              {/* <button 
              onClick={handleConfirmTransfer} 
              className={styles.confirmTransferBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
            </button> */}
              {!paymentStatus?.paymentConfirmed && (
                <button
                  onClick={handleBackToHome}
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang hủy..." : "← Hủy đặt phòng"}
                </button>
              )}
            </div>
          </div>
        )}

        {paymentStatus?.paymentConfirmed && (
          <div className={styles.paymentSuccessSection}>
            <div className={styles.successInfo}>
              <h2 className={styles.successSectionTitle}>
                Thanh toán đã hoàn tất
              </h2>
              <div className={styles.successMessage}>
                <p>✅ Giao dịch của bạn đã được xử lý thành công</p>
                {paymentStatus.status === "APPROVED" ? (
                  <p>🎉 Đặt phòng đã được tự động phê duyệt và xác nhận</p>
                ) : (
                  <p>⏳ Đặt phòng đang được xử lý và sẽ sớm được phê duyệt</p>
                )}
                <p>📧 Email xác nhận đã được gửi đến địa chỉ của bạn</p>
                <p>
                  📞 Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết trong
                  thời gian sớm nhất
                </p>
              </div>
              <div className={styles.nextSteps}>
                <h3>Các bước tiếp theo:</h3>
                <ul>
                  <li>Kiểm tra email để xem thông tin chi tiết đặt phòng</li>
                  <li>Chuẩn bị giấy tờ tùy thân (CCCD/CMND) khi nhận phòng</li>
                  <li>Liên hệ hotline 0932000000 nếu cần hỗ trợ</li>
                </ul>
              </div>
              <div className={styles.successActions}>
                <button
                  onClick={() => {
                    document.cookie =
                      "bookingData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
                    router.push("/");
                  }}
                  className={styles.homeButton}
                >
                  ← Trở về trang chủ
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.promoSection}>
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <div className={styles.promoTitle}>MIỄN PHÍ</div>
              <div className={styles.promoSubtitle}>
                NHƯỢNG QUYỀN HOMESTAY TOÀN QUỐC
              </div>
              <div className={styles.promoNote}>(CLICK ĐỂ TÌM HIỂU THÊM)</div>
            </div>
          </div>
          <div className={styles.licenseInfo}>
            Tài trợ: Liên hệ QC 0901416888
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Main component wrapped in Suspense
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <Header />
          <LoadingSpinner text="Đang tải thông tin đặt phòng..." />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
