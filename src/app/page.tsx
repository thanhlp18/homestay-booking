'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HomeCard from './components/HomeCard';
import DemoNotice from './components/DemoNotice';
import RoomBookingTable from './components/RoomBookingTable';
import styles from "./page.module.css";



interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  amenities: string[];
  images: string[]; // Add this line
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
  branchId: string;
  branchName: string;
  branchLocation: string;
  branchSlug: string;
}

interface BranchAPIResponse {
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
  rooms: Array<{
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
    timeSlots: Array<{
      id: string;
      time: string;
      price: number;
    }>;
  }>;
}

interface BookingTableBranch {
  id: string;
  name: string;
  rooms: Array<{
    id: string;
    name: string;
    timeSlots: Array<{
      id: string;
      time: string;
      price: number;
    }>;
  }>;
}

interface BookingStatus {
  status: 'booked' | 'available' | 'selected' | 'promotion' | 'mystery';
  price?: number;
  originalPrice?: number;
}

export default function Home() {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchAPIResponse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingTableBranches, setBookingTableBranches] = useState<BookingTableBranch[]>([]);
  const [initialBookings, setInitialBookings] = useState<Record<string, Record<string, Record<string, Record<string, BookingStatus>>>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('');



  // Fetch branches and rooms data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch branches data
        const branchesResponse = await fetch('/api/branches');
        if (!branchesResponse.ok) {
          throw new Error('Failed to fetch branches data');
        }
        const branchesData = await branchesResponse.json();
        
        if (!branchesData.success) {
          throw new Error(branchesData.message || 'Failed to fetch branches data');
        }
        
        setBranches(branchesData.data);
        
        // Transform branches data to rooms format for easy display
        const roomsData: Room[] = [];
        branchesData.data?.forEach((branch: BranchAPIResponse) => {
          branch.rooms?.forEach((room: BranchAPIResponse['rooms'][0]) => {
            roomsData.push({
              id: room.id,
              name: room.name,
              slug: room.slug,
              description: room.description,
              amenities: room.amenities || [],
              basePrice: room.basePrice,
              discountPrice: room.discountPrice,
              originalPrice: room.originalPrice,
              location: room.location,
              area: room.area,
              capacity: room.capacity,
              bedrooms: room.bedrooms,
              bathrooms: room.bathrooms,
              features: room.features,
              policies: room.policies,
              checkIn: room.checkIn,
              checkOut: room.checkOut,
              rating: room.rating,
              reviewCount: room.reviewCount,
              branchId: branch.id,
              branchName: branch.name,
              branchLocation: branch.location,
              branchSlug: branch.slug,
              images: room.images, // Add this line to include images
            });
          });
        });
        setRooms(roomsData);
        
        // Transform data for RoomBookingTable component
        const bookingTableData: BookingTableBranch[] = branchesData.data?.map((branch: BranchAPIResponse) => ({
          id: branch.id,
          name: branch.name,
          rooms: branch.rooms?.map((room: BranchAPIResponse['rooms'][0]) => ({
            id: room.id,
            name: room.name,
            timeSlots: room.timeSlots || []
          })) || []
        })) || [];
        
        setBookingTableBranches(bookingTableData);
        
        // Set initial selected destination to "Tất cả" (Show All)
        setSelectedDestination('Tất cả');
        
        // Fetch existing bookings for the next 30 days
        await fetchExistingBookings();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch existing bookings
  const fetchExistingBookings = async () => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);
      
      const bookingsResponse = await fetch(`/api/bookings?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        
        if (bookingsData.success && bookingsData.data) {
          const bookingsMap: Record<string, Record<string, Record<string, Record<string, BookingStatus>>>> = {};
          
          bookingsData.data.forEach((booking: { bookingSlots?: Array<{ bookingDate: string; room: { branch: { id: string }; id: string }; timeSlot: { id: string }; price: number }> }) => {
            booking.bookingSlots?.forEach((slot: { bookingDate: string; room: { branch: { id: string }; id: string }; timeSlot: { id: string }; price: number }) => {
              const dateKey = new Date(slot.bookingDate).toISOString().split('T')[0];
              const branchId = slot.room.branch.id;
              const roomId = slot.room.id;
              const timeSlotId = slot.timeSlot.id;
              
              if (!bookingsMap[dateKey]) bookingsMap[dateKey] = {};
              if (!bookingsMap[dateKey][branchId]) bookingsMap[dateKey][branchId] = {};
              if (!bookingsMap[dateKey][branchId][roomId]) bookingsMap[dateKey][branchId][roomId] = {};
              
              bookingsMap[dateKey][branchId][roomId][timeSlotId] = {
                status: 'booked',
                price: slot.price
              };
            });
          });
          
          setInitialBookings(bookingsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Handle booking submission - redirect to room detail page
  const handleBookingSubmit = (selectedSlots: Array<{ date: string; branchId: string; roomId: string; timeSlotId: string; price: number }>) => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất một khung giờ!');
      return;
    }

    // Find the room for the first selected slot
    const firstSlot = selectedSlots[0];
    const branch = bookingTableBranches.find(b => b.id === firstSlot.branchId);
    const room = branch?.rooms.find(r => r.id === firstSlot.roomId);
    
    if (!room) {
      alert('Không tìm thấy thông tin phòng!');
      return;
    }

    // Find the room slug from the branches data
    const branchData = branches.find(b => b.id === firstSlot.branchId);
    const roomData = branchData?.rooms.find(r => r.id === firstSlot.roomId);
    
    if (!roomData?.slug) {
      alert('Không tìm thấy thông tin phòng!');
      return;
    }

    // Encode selected slots and redirect to room detail page
    const encodedSlots = encodeURIComponent(JSON.stringify(selectedSlots));
    router.push(`/rooms/${roomData.slug}?selectedSlots=${encodedSlots}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <DemoNotice />
        <Header />
        <div className={styles.loading}>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <DemoNotice />
        <Header />
        <div className={styles.error}>
          <p>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  // Get featured homes (all branches)
  const featuredHomes = branches.map(branch => ({
    title: `Home - ${branch.location}`,
    type: "SWIMMING POOL • CẦU RỒNG",
    description: branch.rooms[0]?.description || "Căn hộ mới 100% với đầy đủ tiện nghi",
    imageUrl: branch.images[0], // Use the first branch image
    imageGradient: getGradientForBranch(branch.id), // Fallback gradient
    branchSlug: branch.slug
  }));

  // Extract unique destinations from branches data
  const uniqueDestinations = ['Tất cả', ...Array.from(new Set(branches.map(branch => {
    const locationParts = branch.location.split(', ');
    return locationParts[0]; // Get the first part (e.g., "Đại Ngàn" from "Đại Ngàn, Ninh Kiều, Cần Thơ")
  })))];

  // Filter rooms by selected destination
  const filteredRooms = selectedDestination === 'Tất cả' ? rooms : rooms.filter(room => {
    const roomBranch = branches.find(b => b.id === room.branchId);
    if (!roomBranch) return false;
    const locationParts = roomBranch.location.split(', ');
    return locationParts[0] === selectedDestination;
  });

  // Get Can Tho homes (filtered by selected destination)
  const canThoHomes = filteredRooms.slice(0, 3).map(room => {
    const branch = branches.find(b => b.id === room.branchId);
    return {
      title: room.name,
      description: room.description,
      price: `${room.basePrice.toLocaleString('vi-VN')} đ/2 giờ`,
      originalPrice: room.originalPrice ? `${room.originalPrice.toLocaleString('vi-VN')} đ/2 giờ` : undefined,
      availability: "có thể nhận",
      imageUrl: room.images?.[0], // Add optional chaining to prevent error
      imageGradient: getGradientForBranch(room.branchId), // Fallback gradient
      roomSlug: room.slug
    };
  });

  return (
    <div className={styles.page}>
      <DemoNotice />
      <Header />

      {/* Featured Homes Section */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>Danh sách tất cả các Home</h2>
        <div className={styles.homeGrid}>
          {featuredHomes.map((home, index) => {
            const branch = branches.find(b => b.slug === home.branchSlug);
            const amenities = branch?.rooms[0]?.amenities || [];
            return (
              <HomeCard
                key={index}
                title={home.title}
                type={home.type}
                description={home.description}
                showDetails={true}
                imageUrl={home.imageUrl}
                imageGradient={home.imageGradient}
                branchSlug={home.branchSlug}
                amenities={amenities}
              />
            );
          })}
        </div>
      </section>

      {/* Destinations Section */}
      <section className={styles.destinationsSection}>
        <h2 className={styles.sectionTitle}>Điểm đến</h2>
        <p className={styles.sectionSubtitle}>tại Tp.Cần Thơ</p>
        <div className={styles.destinationTabs}>
          {uniqueDestinations.map((destination) => (
            <button 
              key={destination}
              className={`${styles.tab} ${selectedDestination === destination ? styles.activeTab : ''}`}
              onClick={() => setSelectedDestination(destination)}
            >
              {destination}
            </button>
          ))}
        </div>

        <h3 className={styles.locationTitle}>
          {selectedDestination === 'Tất cả' ? 'Tất cả các Home tại Tp.Cần Thơ' : `Home - ${selectedDestination}, Ninh Kiều`}
        </h3>
        <div className={styles.homeGrid}>
          {canThoHomes.length > 0 ? (
            canThoHomes.map((home, index) => {
              const room = rooms.find(r => r.slug === home.roomSlug);
              return (
                <HomeCard
                  key={index}
                  title={home.title}
                  description={home.description}
                  price={home.price}
                  originalPrice={home.originalPrice}
                  availability={home.availability}
                  showBooking={true}
                  imageUrl={home.imageUrl}
                  imageGradient={home.imageGradient}
                  roomSlug={home.roomSlug}
                  amenities={room?.amenities || []}
                />
              );
            })
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '2rem',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              Không có phòng nào khả dụng tại {selectedDestination}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Room Booking Table */}
      <section className={styles.calendarSection}>
        <h2 className={styles.sectionTitle}>Lịch đặt phòng</h2>
        <p className={styles.sectionSubtitle}>Tất cả các phòng với khung giờ có sẵn</p>
        
        <RoomBookingTable
          branches={bookingTableBranches}
          daysCount={30}
          onBookingSubmit={handleBookingSubmit}
          initialBookings={initialBookings}
        />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <span className={styles.logoIcon}>💚</span>
              <span className={styles.logoText}>Minhome.vn</span>
            </div>
            <p className={styles.footerText}>Hotline: 0932.620.930</p>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Chính sách</h4>
            <ul>
              <li>Chính sách bảo mật thông tin</li>
              <li>Chính sách khuyến mãi</li>
              <li>Chính sách bảo đảm</li>
              <li>Hướng dẫn sử dụng</li>
              <li>Hướng dẫn bàn giao</li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Hỗ trợ thanh toán</h4>
            <div className={styles.paymentMethods}>
              <span>💳 Visa</span>
              <span>💳 MasterCard</span>
              <span>💳 ATM</span>
              <span>💳 Napas</span>
              <span>💳 Momo</span>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>© Copyright Minhome.vn 2024</p>
        </div>
      </footer>
    </div>
  );
}

// Helper function to get gradient for different branches
function getGradientForBranch(branchId: string): string {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  ];
  
  const index = branchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}
