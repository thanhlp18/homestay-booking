'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import RoomBookingTable from '../../components/RoomBookingTable';
import { getBranchBySlug, mockInitialBookings } from '../../data/bookingData';
import styles from './branch.module.css';

export default function BranchPage() {
  const params = useParams();
  const branchSlug = params.branchSlug as string;
  
  const branch = getBranchBySlug(branchSlug);
  
  if (!branch) {
    notFound();
  }

  // Convert branch data to booking table format
  const branchForBookingTable = [{
    id: branch.id,
    name: branch.name,
    rooms: branch.rooms.map(room => ({
      id: room.id,
      name: room.name,
      timeSlots: room.timeSlots
    }))
  }];

  const handleBookingSubmit = (selectedSlots: Array<{date: string; branchId: string; roomId: string; timeSlotId: string; price: number}>) => {
    console.log('Branch booking submitted:', selectedSlots);
    const totalSlots = selectedSlots.length;
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    
    alert(`Đặt phòng thành công!\n- Số khung giờ: ${totalSlots}\n- Tổng tiền: ${totalPrice.toLocaleString('vi-VN')}đ\n\nCảm ơn bạn đã sử dụng dịch vụ!`);
  };

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
                  <div className={styles.roomBadge}>
                    <span className={styles.discountBadge}>-{room.price.discount}%</span>
                  </div>
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
                        {room.price.base.toLocaleString('vi-VN')} đ/tháng
                      </span>
                      <span className={styles.originalPrice}>
                        {room.price.originalPrice?.toLocaleString('vi-VN')} đ/tháng
                      </span>
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
            initialBookings={mockInitialBookings}
            onBookingSubmit={handleBookingSubmit}
            daysCount={7}
            slotPrice={50000}
          />
        </div>
      </div>
    </div>
  );
} 