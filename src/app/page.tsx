"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "./components/Header";
import HomeCard from "./components/HomeCard";
import DemoNotice from "./components/DemoNotice";
import RoomBookingTable from "./components/RoomBookingTable";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";
import styles from "./page.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";

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
  floor?: string;
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
  googleMapUrl?: string;
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
  status: "booked" | "available" | "selected" | "promotion" | "mystery";
  price?: number;
  originalPrice?: number;
}

export default function Home() {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchAPIResponse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingTableBranches, setBookingTableBranches] = useState<
    BookingTableBranch[]
  >([]);
  const [initialBookings, setInitialBookings] = useState<
    Record<
      string,
      Record<string, Record<string, Record<string, BookingStatus>>>
    >
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("");

  // Fetch branches and rooms data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches data
        const branchesResponse = await fetch("/api/branches");
        if (!branchesResponse.ok) {
          throw new Error("Failed to fetch branches data");
        }
        const branchesData = await branchesResponse.json();

        if (!branchesData.success) {
          throw new Error(
            branchesData.message || "Failed to fetch branches data"
          );
        }

        setBranches(branchesData.data);

        // Transform branches data to rooms format for easy display
        const roomsData: Room[] = [];
        branchesData.data?.forEach((branch: BranchAPIResponse) => {
          branch.rooms?.forEach((room: BranchAPIResponse["rooms"][0]) => {
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
        const bookingTableData: BookingTableBranch[] =
          branchesData.data?.map((branch: BranchAPIResponse) => ({
            id: branch.id,
            name: branch.name,
            rooms:
              branch.rooms?.map((room: BranchAPIResponse["rooms"][0]) => ({
                id: room.id,
                name: room.name,
                timeSlots: room.timeSlots || [],
              })) || [],
          })) || [];

        setBookingTableBranches(bookingTableData);

        // Set initial selected destination to "Tất cả" (Show All)
        setSelectedDestination("Tất cả");

        // Fetch existing bookings for the next 30 days
        await fetchExistingBookings();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
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

      const bookingsResponse = await fetch(
        `/api/bookings?startDate=${today.toISOString().split("T")[0]}&endDate=${
          endDate.toISOString().split("T")[0]
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
      console.error("Error fetching bookings:", error);
    }
  };

  // Handle booking submission - redirect to room detail page

  if (loading) {
    return (
      <div className={styles.page}>
        {/* <DemoNotice /> */}
        <Header />
        <LoadingSpinner text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        {/* <DemoNotice /> */}
        <Header />
        <div className={styles.error}>
          <p>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  // Get featured homes (all branches)
  const featuredHomes = branches.map((branch) => ({
    title: `Home - ${branch.location}`,
    type: "SWIMMING POOL • CẦU RỒNG",
    description:
      branch.rooms[0]?.description || "Căn hộ mới 100% với đầy đủ tiện nghi",
    imageUrl: branch.images[0], // Use the first branch image
    imageGradient: getGradientForBranch(branch.id), // Fallback gradient
    branchSlug: branch.slug,
    googleMapUrl: branch.googleMapUrl,
  }));

  // Extract unique destinations from branches data
  const uniqueDestinations = [
    "Tất cả",
    ...Array.from(
      new Set(
        branches.map((branch) => {
          const locationParts = branch.location.split(", ");
          return locationParts[0]; // Get the first part (e.g., "Đại Ngàn" from "Đại Ngàn, Ninh Kiều, Cần Thơ")
        })
      )
    ),
  ];

  // Filter rooms by selected destination
  const filteredRooms =
    selectedDestination === "Tất cả"
      ? rooms
      : rooms.filter((room) => {
          const roomBranch = branches.find((b) => b.id === room.branchId);
          if (!roomBranch) return false;
          const locationParts = roomBranch.location.split(", ");
          return locationParts[0] === selectedDestination;
        });

  const branchInformationFitter =
    selectedDestination !== "Tất cả"
      ? branches.filter((branch) => {
          const locationParts = branch.location.split(", ");
          return locationParts[0] === selectedDestination;
        })[0]
      : null;
  console.log(branchInformationFitter);
  // Get Can Tho homes (filtered by selected destination)
  const canThoHomes = filteredRooms.map((room) => {
    return {
      title: room.name,
      description: room.description,
      price: `${room.basePrice.toLocaleString("vi-VN")} đ/ngày`,
      originalPrice: room.originalPrice
        ? `${room.originalPrice.toLocaleString("vi-VN")} đ/ngày`
        : undefined,
      availability: "Đang trống",
      imageUrl: room.images?.[0], // Add optional chaining to prevent error
      imageGradient: getGradientForBranch(room.branchId), // Fallback gradient
      roomSlug: room.slug,
    };
  });

  return (
    <div className={styles.page}>
      {/* <DemoNotice /> */}
      <Header />

      {/* Featured Homes Section */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>O Ni Homestay - Thành phố Huế</h2>
        <p className={styles.sectionSubtitle}>
          Không gian nghỉ dưỡng ấm cúng giữa lòng cố đô
        </p>
        {branches.length === 1 ? (
          // Layout đặc biệt cho 1 branch
          <div className={styles.singleBranchLayout}>
            {branches.map((branch) => (
              <div key={branch.id} className={styles.branchHero}>
                <div className={styles.branchImageGallery}>
                  <div
                    className={styles.branchMainImage}
                    style={{
                      backgroundImage: `url(${branch.images[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
                <div className={styles.branchContent}>
                  <div className={styles.branchHeader}>
                    <h3 className={styles.branchName}>{branch.name}</h3>
                    <div className={styles.branchBadge}>
                      <span>⭐</span> Homestay cao cấp
                    </div>
                  </div>
                  <p className={styles.branchAddress}>
                    📍 {branch.address}
                  </p>
                  <p className={styles.branchDescription}>
                    {branch.description}
                  </p>
                  <div className={styles.branchAmenities}>
                    <h4>Tiện nghi nổi bật:</h4>
                    <div className={styles.amenitiesList}>
                      {branch.amenities.slice(0, 6).map((amenity, idx) => (
                        <span key={idx} className={styles.amenityItem}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.branchStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{branch.rooms.length}</span>
                      <span className={styles.statLabel}>Phòng</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>
                        {Math.min(...branch.rooms.map((r) => r.basePrice)).toLocaleString()}đ
                      </span>
                      <span className={styles.statLabel}>/Ngày</span>
                    </div>
                  </div>
                  <Link
                    href={`/branches/${branch.slug}`}
                    className={styles.branchCtaButton}
                  >
                    Khám phá các phòng →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Layout grid cho nhiều branches
          <div className={styles.homeGrid}>
            {featuredHomes.map((home, index) => {
              const branch = branches.find((b) => b.slug === home.branchSlug);
              const amenities = branch?.rooms[0]?.amenities || [];
              return (
                <div key={index} style={{ position: "relative" }}>
                  <HomeCard
                    title={home.title}
                    type={home.type}
                    description={home.description}
                    showDetails={true}
                    imageUrl={home.imageUrl}
                    imageGradient={home.imageGradient}
                    branchSlug={home.branchSlug}
                    amenities={amenities}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Destinations Section */}
      <section className={styles.destinationsSection}>
        <h2 className={styles.sectionTitle}>Điểm đến</h2>
        <p className={styles.sectionSubtitle}>tại Thành phố Huế</p>
        <div className={styles.destinationTabs}>
          {uniqueDestinations.map((destination) => (
            <button
              key={destination}
              className={`${styles.tab} ${
                selectedDestination === destination ? styles.activeTab : ""
              }`}
              onClick={() => setSelectedDestination(destination)}
            >
              {destination}
            </button>
          ))}
        </div>

        <div className={styles.locationHeader}>
          <h3 className={styles.locationTitle}>
            {selectedDestination === "Tất cả"
              ? "Tất cả các Home tại Thành phố Huế"
              : `Home - ${selectedDestination}`}
          </h3>
          {branchInformationFitter && branchInformationFitter.googleMapUrl && (
            <a
              href={branchInformationFitter.googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.googleMapButton}
            >
              <FaMapMarkerAlt className={styles.googleMapButtonIcon} />
              View on Google Map
            </a>
          )}
        </div>
        <div className={styles.homeGrid}>
          {canThoHomes.length > 0 ? (
            canThoHomes.map((home, index) => {
              const room = rooms.find((r) => r.slug === home.roomSlug);
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
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "2rem",
                color: "#666",
                fontSize: "1.1rem",
              }}
            >
              Không có phòng nào khả dụng tại {selectedDestination}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Room Booking Table */}
      {/* <section className={styles.calendarSection}>
        <div className={styles.calendarContainer}>
          <h2 className={styles.sectionTitle}>Lịch đặt phòng</h2>
          <p className={styles.sectionSubtitle}>
            Tất cả các phòng với khung giờ có sẵn
          </p>

          <RoomBookingTable
            branches={bookingTableBranches}
            daysCount={30}
            onBookingSubmit={handleBookingSubmit}
            initialBookings={initialBookings}
            submitOnSelect={false}
          />
        </div>
      </section> */}

      <Footer />
    </div>
  );
}

// Helper function to get gradient for different branches
function getGradientForBranch(branchId: string): string {
  const gradients = [
    "linear-gradient(135deg, #FEA38E 0%, #FBA2AB 100%)",
    "linear-gradient(135deg, #F3B5A0 0%, #FEA38E 100%)",
    "linear-gradient(135deg, #FBA2AB 0%, #F3B5A0 100%)",
    "linear-gradient(135deg, #FFDFC3 0%, #F6E6D0 100%)",
    "linear-gradient(135deg, #FEA38E 0%, #F6E6D0 100%)",
    "linear-gradient(135deg, #FBA2AB 0%, #FFDFC3 100%)",
  ];

  const index =
    branchId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradients.length;
  return gradients[index];
}
