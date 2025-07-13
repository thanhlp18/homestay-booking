'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import RoomBookingTable from '../../components/RoomBookingTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './branch.module.css';

interface TimeSlot {
  id: string;
  time: string;
  price: number;
}

interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  amenities: string[];
  images: string[];
  basePrice: number;
  discountPrice?: number;
  originalPrice?: number;
  location: string;
  area: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  policies: string[];
  checkIn: string;
  checkOut: string;
  rating: number;
  reviewCount: number;
  timeSlots: TimeSlot[];
}

interface Branch {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  rooms: Room[];
}

interface BookingTableBranch {
  id: string;
  name: string;
  rooms: Array<{
    id: string;
    name: string;
    timeSlots: TimeSlot[];
  }>;
}

interface BookingStatus {
  status: 'booked' | 'available' | 'selected' | 'promotion' | 'mystery';
  price?: number;
  originalPrice?: number;
}

export default function BranchPage() {
  const params = useParams();
  const router = useRouter();
  const branchSlug = params.branchSlug as string;
  
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialBookings, setInitialBookings] = useState<Record<string, Record<string, Record<string, Record<string, BookingStatus>>>>>({});

  // Fetch branch data from API
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches data to find the specific branch
        const branchesResponse = await fetch('/api/branches');
        if (!branchesResponse.ok) {
          throw new Error('Failed to fetch branches data');
        }
        const branchesData = await branchesResponse.json();

        if (!branchesData.success) {
          throw new Error(branchesData.message || 'Failed to fetch branches data');
        }

        // Find the branch by slug
        const foundBranch = branchesData.data.find((b: Branch) => b.slug === branchSlug);
        
        if (!foundBranch) {
          throw new Error('Branch not found');
        }

        setBranch(foundBranch);

        // Fetch existing bookings for the next 30 days
        await fetchExistingBookings();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load branch data');
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [branchSlug]);

  // Fetch existing bookings
  const fetchExistingBookings = async () => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      const bookingsResponse = await fetch(
        `/api/bookings?startDate=${today.toISOString().split('T')[0]}&endDate=${
          endDate.toISOString().split('T')[0]
        }`
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();

        if (bookingsData.success && bookingsData.data) {
          const bookingsMap: Record<
            string,
            Record<string, Record<string, Record<string, BookingStatus>>>
          > = {};

          bookingsData.data.forEach(
            (booking: {
              bookingSlots?: Array<{
                bookingDate: string;
                room: { branch: { id: string }; id: string };
                timeSlot: { id: string };
                price: number;
              }>;
            }) => {
              booking.bookingSlots?.forEach(
                (slot: {
                  bookingDate: string;
                  room: { branch: { id: string }; id: string };
                  timeSlot: { id: string };
                  price: number;
                }) => {
                  const dateKey = new Date(slot.bookingDate)
                    .toISOString()
                    .split("T")[0];
                  const branchId = slot.room.branch.id;
                  const roomId = slot.room.id;
                  const timeSlotId = slot.timeSlot.id;

                  if (!bookingsMap[dateKey]) bookingsMap[dateKey] = {};
                  if (!bookingsMap[dateKey][branchId])
                    bookingsMap[dateKey][branchId] = {};
                  if (!bookingsMap[dateKey][branchId][roomId])
                    bookingsMap[dateKey][branchId][roomId] = {};

                  bookingsMap[dateKey][branchId][roomId][timeSlotId] = {
                    status: "booked",
                    price: slot.price,
                  };
                }
              );
            }
          );

          setInitialBookings(bookingsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingSubmit = (selectedSlots: Array<{date: string; branchId: string; roomId: string; timeSlotId: string; price: number}>) => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất một khung giờ!');
      return;
    }

    // Find the room for the first selected slot
    const firstSlot = selectedSlots[0];
    const room = branch?.rooms.find(r => r.id === firstSlot.roomId);
    
    if (!room) {
      alert('Không tìm thấy thông tin phòng!');
      return;
    }

    // Encode selected slots and redirect to room detail page
    const encodedSlots = encodeURIComponent(JSON.stringify(selectedSlots));
    router.push(`/rooms/${room.slug}?selectedSlots=${encodedSlots}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <LoadingSpinner text="Đang tải thông tin chi nhánh..." />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>
          <p>Lỗi: {error || 'Không tìm thấy chi nhánh'}</p>
        </div>
      </div>
    );
  }

  // Convert branch data to booking table format
  const branchForBookingTable: BookingTableBranch[] = [{
    id: branch.id,
    name: branch.name,
    rooms: branch.rooms.map(room => ({
      id: room.id,
      name: room.name,
      timeSlots: room.timeSlots
    }))
  }];

  return (
    <div className={styles.page}>
      <Header />
      
      {/* Branch Header */}
      <div className={styles.branchHeader}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{branch.name}</span>
          </div>
          <h1 className={styles.branchTitle}>Home - {branch.location}</h1>
        </div>
      </div>

      {/* Branch Info */}
      <div className={styles.branchInfo}>
        <div className={styles.infoContainer}>
          <div className={styles.infoMain}>
            <h2 className={styles.infoTitle}>Chi nhánh {branch.name}</h2>
            <p className={styles.description}>{branch.description}</p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Địa chỉ:</span>
                <span className={styles.contactValue}>{branch.address}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Điện thoại:</span>
                <span className={styles.contactValue}>{branch.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email:</span>
                <span className={styles.contactValue}>{branch.email}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.amenities}>
            <h3 className={styles.amenitiesTitle}>Tiện nghi chi nhánh</h3>
            <div className={styles.amenitiesList}>
              {branch.amenities.map((amenity, index) => (
                <span key={index} className={styles.amenityTag}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className={styles.roomSection}>
        <div className={styles.roomContainer}>
          <h2 className={styles.roomSectionTitle}>Danh sách phòng</h2>
          <div className={styles.roomGrid}>
            {branch.rooms.map((room) => (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.roomImageContainer}>
                  <div 
                    className={styles.roomImage}
                    style={{ 
                      background: room.images[0] ? `url(${room.images[0]})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  {room.originalPrice && room.basePrice < room.originalPrice && (
                    <div className={styles.roomBadge}>
                      <span className={styles.discountBadge}>
                        -{Math.round(((room.originalPrice - room.basePrice) / room.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={styles.roomContent}>
                  <h3 className={styles.roomName}>{room.name}</h3>
                  <p className={styles.roomDescription}>{room.description}</p>
                  
                  <div className={styles.roomDetails}>
                    <div className={styles.roomSpecs}>
                      <span className={styles.spec}>👥 {room.capacity} khách</span>
                      <span className={styles.spec}>🏠 {room.bedrooms} phòng ngủ</span>
                      <span className={styles.spec}>🚿 {room.bathrooms} phòng tắm</span>
                      <span className={styles.spec}>📐 {room.area}</span>
                    </div>
                    
                    <div className={styles.roomFeatures}>
                      {room.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className={styles.featureTag}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.roomAmenities}>
                    <div className={styles.amenitiesRow}>
                      {room.amenities.slice(0, 6).map((amenity, index) => (
                        <span key={index} className={styles.amenityIcon}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.roomPricing}>
                    <div className={styles.priceInfo}>
                      <span className={styles.currentPrice}>
                        {room.basePrice.toLocaleString('vi-VN')} đ/ngày
                      </span>
                      {room.originalPrice && (
                        <span className={styles.originalPrice}>
                          {room.originalPrice.toLocaleString('vi-VN')} đ/ngày
                        </span>
                      )}
                    </div>
                    <div className={styles.availability}>có thể nhận</div>
                  </div>
                  
                  <div className={styles.roomActions}>
                    <Link href={`/rooms/${room.slug}`} className={styles.bookButton}>
                      Đặt phòng
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Table Section */}
      <div className={styles.bookingSection}>
        <div className={styles.bookingContainer}>
          <h2 className={styles.bookingSectionTitle}>Lịch đặt phòng</h2>
          <p className={styles.bookingSubtitle}>Chọn khung giờ phù hợp cho chi nhánh {branch.name}</p>
          
          <RoomBookingTable
            branches={branchForBookingTable}
            initialBookings={initialBookings}
            onBookingSubmit={handleBookingSubmit}
            daysCount={7}
            submitOnSelect={false}
          />
        </div>
      </div>
    </div>
  );
} 