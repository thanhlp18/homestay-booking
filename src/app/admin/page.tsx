'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import styles from './admin.module.css';

interface BookingRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: number;
  notes: string;
  paymentMethod: string;
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  totalPrice: number;
  basePrice: number;
  discountAmount: number;
  discountPercentage: number;
  bookingSlots: Array<{
    id: string;
    bookingDate: string;
    price: number;
    room: {
      id: string;
      name: string;
      branch: {
        id: string;
        name: string;
        location: string;
      };
    };
    timeSlot: {
      id: string;
      time: string;
    };
  }>;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách đặt phòng');
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      setError(null);

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không thể phê duyệt đặt phòng');
      }

      // Refresh bookings list
      await fetchBookings();
      alert('Đã phê duyệt đặt phòng thành công');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi phê duyệt đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const reason = prompt('Lý do từ chối đặt phòng:');
    if (!reason) return;

    try {
      setActionLoading(bookingId);
      setError(null);

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không thể từ chối đặt phòng');
      }

      // Refresh bookings list
      await fetchBookings();
      alert('Đã từ chối đặt phòng thành công');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi từ chối đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={styles.statusPending}>Chờ thanh toán</span>;
      case 'PAYMENT_CONFIRMED':
        return <span className={styles.statusPending}>Chờ phê duyệt</span>;
      case 'APPROVED':
        return <span className={styles.statusApproved}>Đã phê duyệt</span>;
      case 'REJECTED':
        return <span className={styles.statusRejected}>Đã từ chối</span>;
      case 'CANCELLED':
        return <span className={styles.statusRejected}>Đã hủy</span>;
      default:
        return <span className={styles.statusPending}>Không xác định</span>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatBookingSlots = (slots: BookingRecord['bookingSlots']) => {
    return slots.map(slot => {
      const date = new Date(slot.bookingDate).toLocaleDateString('vi-VN');
      return `${date} - ${slot.timeSlot.time}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quản lý đặt phòng</h1>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {bookings.filter(b => b.status === 'PAYMENT_CONFIRMED').length}
              </span>
              <span className={styles.statLabel}>Chờ phê duyệt</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {bookings.filter(b => b.status === 'APPROVED').length}
              </span>
              <span className={styles.statLabel}>Đã phê duyệt</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{bookings.length}</span>
              <span className={styles.statLabel}>Tổng đặt phòng</span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Chưa có đặt phòng nào.</p>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingInfo}>
                    <h3 className={styles.customerName}>{booking.fullName}</h3>
                    <p className={styles.roomInfo}>
                      {booking.bookingSlots[0]?.room.name} - {booking.bookingSlots[0]?.room.branch.location}
                    </p>
                  </div>
                  <div className={styles.bookingStatus}>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                
                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Điện thoại:</span>
                    <span className={styles.detailValue}>{booking.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{booking.email || 'Không có'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>CCCD:</span>
                    <span className={styles.detailValue}>{booking.cccd}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Số khách:</span>
                    <span className={styles.detailValue}>{booking.guests}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Ngày đặt:</span>
                    <span className={styles.detailValue}>{formatBookingSlots(booking.bookingSlots)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tổng tiền:</span>
                    <span className={styles.detailValue}>{booking.totalPrice.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {booking.discountAmount > 0 && (
                    <>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Giá gốc:</span>
                        <span className={styles.detailValue}>{booking.basePrice.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Giảm giá:</span>
                        <span className={styles.detailValue}>
                          {booking.discountAmount.toLocaleString('vi-VN')} đ ({(booking.discountPercentage * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phương thức TT:</span>
                    <span className={styles.detailValue}>
                      {booking.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                       booking.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Thời gian tạo:</span>
                    <span className={styles.detailValue}>{formatDateTime(booking.createdAt)}</span>
                  </div>
                  {booking.notes && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ghi chú:</span>
                      <span className={styles.detailValue}>{booking.notes}</span>
                    </div>
                  )}
                  {booking.adminNotes && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Ghi chú admin:</span>
                      <span className={styles.detailValue}>{booking.adminNotes}</span>
                    </div>
                  )}
                </div>
                
                {(booking.status === 'PENDING' || booking.status === 'PAYMENT_CONFIRMED') && (
                  <div className={styles.bookingActions}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleApproveBooking(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? 'Đang xử lý...' : 'Phê duyệt đặt phòng'}
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 