"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import RoomBookingTable from "../../components/RoomBookingTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./room.module.css";
import { AMENITY_ICON_MAP } from "@/app/components/HomeCard";

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
  branchId: string;
  branchName: string;
  branchLocation: string;
  branchSlug: string;
  timeSlots: TimeSlot[];
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

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: string;
  notes: string;
  paymentMethod: string;
}

interface SelectedSlot {
  date: string;
  branchId: string;
  roomId: string;
  timeSlotId: string;
  price: number;
}

interface BookingStatus {
  status: "booked" | "available" | "selected" | "promotion" | "mystery";
  price?: number;
  originalPrice?: number;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomSlug = params.roomSlug as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [frontIdImage, setFrontIdImage] = useState<File | null>(null);
  const [backIdImage, setBackIdImage] = useState<File | null>(null);
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
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

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    cccd: "",
    guests: "",
    notes: "",
    paymentMethod: "cash",
  });

  // Load room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches data to find the room
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

        // Find the room by slug
        let foundRoom: Room | null = null;
        let foundBranch: {
          id: string;
          name: string;
          location: string;
          slug: string;
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
            timeSlots: Array<{ id: string; time: string; price: number }>;
          }>;
        } | null = null;

        for (const branch of branchesData.data) {
          const room = branch.rooms?.find(
            (r: { slug: string }) => r.slug === roomSlug
          );
          if (room) {
            foundRoom = {
              id: room.id,
              name: room.name,
              slug: room.slug,
              description: room.description,
              amenities: room.amenities,
              images: room.images,
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
              timeSlots: room.timeSlots || [],
            };
            foundBranch = branch;
            break;
          }
        }

        if (!foundRoom) {
          throw new Error("Room not found");
        }

        setRoom(foundRoom);

        // Create booking table data for this room only
        if (foundBranch) {
          const bookingTableData: BookingTableBranch[] = [
            {
              id: foundBranch.id,
              name: foundBranch.name,
              rooms: [
                {
                  id: foundRoom.id,
                  name: foundRoom.name,
                  timeSlots: foundRoom.timeSlots,
                },
              ],
            },
          ];

          setBookingTableBranches(bookingTableData);
        }

        // Fetch existing bookings for the next 30 days
        await fetchExistingBookings();

        // Check for selected slots from URL parameters
        const selectedSlotsParam = searchParams.get("selectedSlots");
        if (selectedSlotsParam) {
          try {
            const slots = JSON.parse(decodeURIComponent(selectedSlotsParam));
            setSelectedSlots(slots);
          } catch (error) {
            console.error("Error parsing selected slots:", error);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load room data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomSlug, searchParams]);

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

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <LoadingSpinner text="Đang tải thông tin phòng..." />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.error}>
          <p>Lỗi: {error || "Không tìm thấy phòng"}</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "front") {
          setFrontIdImage(file);
          setFrontIdPreview(result);
        } else {
          setBackIdImage(file);
          setBackIdPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingTableSubmit = (slots: SelectedSlot[]) => {
    setSelectedSlots(slots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSlots.length === 0) {
      alert("Vui lòng chọn ít nhất một khung giờ từ bảng lịch đặt phòng!");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || undefined,
          cccd: formData.cccd,
          guests: parseInt(formData.guests),
          notes: formData.notes || undefined,
          paymentMethod: formData.paymentMethod.toUpperCase() as
            | "CASH"
            | "TRANSFER"
            | "CARD",
          selectedSlots: selectedSlots,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Đặt phòng thành công! Tổng tiền: ${result.data.totalPrice.toLocaleString(
            "vi-VN"
          )}đ`
        );
        // Redirect to home page or show success message
        router.push("/");
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.");
    }
  };

  const handleEditInfo = () => {
    setShowConfirmation(false);
  };

  const formatSelectedSlots = () => {
    if (selectedSlots.length === 0) return "Chưa chọn khung giờ";

    return selectedSlots
      .map((slot) => {
        const date = new Date(slot.date).toLocaleDateString("vi-VN");
        const branch = bookingTableBranches.find((b) => b.id === slot.branchId);
        const roomData = branch?.rooms.find((r) => r.id === slot.roomId);
        const timeSlot = roomData?.timeSlots.find(
          (ts) => ts.id === slot.timeSlotId
        );

        return `${date} (${timeSlot?.time})`;
      })
      .join(", ");
  };

  const calculateTotalPrice = () => {
    const baseTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const slotCount = selectedSlots.length;

    let discount = 0;
    if (slotCount >= 3) {
      discount = 0.1; // 10% discount for 3+ slots
    } else if (slotCount === 2) {
      discount = 0.05; // 5% discount for 2 slots
    }

    const finalTotal = baseTotal * (1 - discount);
    return { baseTotal, discount, finalTotal, slotCount };
  };

  const { baseTotal, discount, finalTotal, slotCount } = calculateTotalPrice();

  return (
    <div className={styles.page}>
      <Header />

      {/* Room Header */}
      <div className={styles.roomHeader}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>
              Trang chủ
            </Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{room.name}</span>
          </div>
          <h1 className={styles.roomTitle}>{room.name}</h1>
          <div className={styles.roomLocation}>📍 {room.location}</div>
        </div>
      </div>

      <div className={styles.roomContainer}>
        <div className={styles.roomMain}>
          {/* Room Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <div
                className={styles.roomImage}
                style={{
                  backgroundImage: `url(${room.images[selectedImageIndex]})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
            <div className={styles.imageThumbnails}>
              {room.images.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === selectedImageIndex ? styles.thumbnailActive : ""
                  }`}
                  style={{
                    background: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
            <div className={styles.amenitiesContainer}>
              <h3 className={styles.sectionTitle}>Tiện nghi</h3>

              {room.amenities.length > 0 && (
                <div className={styles.amenitiesList}>
                  {room.amenities.map((amenity) => (
                    <div className={styles.amenityRow} key={amenity}>
                      <span className={styles.amenityIconBox}>
                        <img
                          src={
                            AMENITY_ICON_MAP[amenity] ||
                            "/tien_nghi/tien_nghi_khac.png"
                          }
                          alt={amenity}
                          className={styles.amenityIconImg}
                        />
                      </span>
                      <span className={styles.amenityText}>{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Room Details */}
          <div className={styles.roomDetails}>
            <div className={styles.roomInfo}>
              <h2 className={styles.roomName}>{room.name}</h2>
              <div className={styles.roomRating}>
                <span className={styles.rating}>⭐ {room.rating}</span>
                <span className={styles.reviews}>
                  ({room.reviewCount} đánh giá)
                </span>
              </div>

              <div className={styles.roomSpecs}>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>👥</span>
                  <span className={styles.specText}>{room.capacity} khách</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>🏠</span>
                  <span className={styles.specText}>
                    {room.bedrooms} phòng ngủ
                  </span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>🚿</span>
                  <span className={styles.specText}>
                    {room.bathrooms} phòng tắm
                  </span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>📐</span>
                  <span className={styles.specText}>{room.area}</span>
                </div>
              </div>

              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currentPrice}>
                    {room.basePrice.toLocaleString("vi-VN")} đ/ngày
                  </span>
                  {room.originalPrice && (
                    <span className={styles.originalPrice}>
                      {room.originalPrice.toLocaleString("vi-VN")} đ/ngày
                    </span>
                  )}
                </div>
                {room.originalPrice && room.basePrice < room.originalPrice && (
                  <div className={styles.discountBadge}>
                    Tiết kiệm{" "}
                    {Math.round(
                      ((room.originalPrice - room.basePrice) /
                        room.originalPrice) *
                        100
                    )}
                    %
                  </div>
                )}
              </div>

              <div className={styles.description}>
                <h3 className={styles.sectionTitle}>Mô tả</h3>
                <p className={styles.descriptionText}>{room.description}</p>
              </div>
              <div className={styles.features}>
                <h3 className={styles.sectionTitle}>Đặc điểm nổi bật</h3>
                <div className={styles.featureList}>
                  {room.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <span className={styles.featureIcon}>✓</span>
                      <span className={styles.featureText}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className={styles.bookingSection}>
          <h2 className={styles.bookingTitle}>Thông tin Đặt phòng</h2>

          {/* Time Slot Selection Table */}
          <div className={styles.timeSlotSection}>
            <h3 className={styles.formSectionTitle}>
              Lịch đặt phòng thời gian thực
            </h3>
            <p className={styles.tableDescription}>
              Chọn khung giờ phù hợp với bạn
            </p>
            <RoomBookingTable
              branches={bookingTableBranches}
              daysCount={30}
              onBookingSubmit={handleBookingTableSubmit}
              initialBookings={initialBookings}
              initialSelectedSlots={selectedSlots}
              submitOnSelect={true}
            />
          </div>

          <div className={styles.bookingForm}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Thông tin khách hàng
                </h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      className={styles.input}
                      placeholder="Nhập họ và tên"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      className={styles.input}
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      className={styles.input}
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CCCD/CMND *</label>
                    <input
                      type="text"
                      name="cccd"
                      className={styles.input}
                      placeholder="Nhập số CCCD/CMND"
                      value={formData.cccd}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Căn cước công dân</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mặt trước *</label>
                    <div
                      className={`${styles.imageUpload} ${
                        frontIdImage ? styles.uploaded : ""
                      }`}
                    >
                      <input
                        type="file"
                        className={styles.fileInput}
                        accept="image/*"
                        required
                        onChange={(e) => handleFileUpload(e, "front")}
                        aria-label="Tải lên ảnh mặt trước CCCD"
                      />
                      {frontIdPreview ? (
                        <div className={styles.imagePreview}>
                          <img
                            src={frontIdPreview}
                            alt="CCCD mặt trước"
                            className={styles.previewImage}
                          />
                          <div className={styles.previewOverlay}>
                            <span className={styles.fileName}>
                              {frontIdImage?.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <div className={styles.uploadIcon}>📷+</div>
                          <span className={styles.uploadText}>Mặt trước</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mặt sau *</label>
                    <div
                      className={`${styles.imageUpload} ${
                        backIdImage ? styles.uploaded : ""
                      }`}
                    >
                      <input
                        type="file"
                        className={styles.fileInput}
                        accept="image/*"
                        required
                        onChange={(e) => handleFileUpload(e, "back")}
                        aria-label="Tải lên ảnh mặt sau CCCD"
                      />
                      {backIdPreview ? (
                        <div className={styles.imagePreview}>
                          <img
                            src={backIdPreview}
                            alt="CCCD mặt sau"
                            className={styles.previewImage}
                          />
                          <div className={styles.previewOverlay}>
                            <span className={styles.fileName}>
                              {backIdImage?.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <div className={styles.uploadIcon}>📷+</div>
                          <span className={styles.uploadText}>Mặt sau</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.idCardNotice}>
                  <p className={styles.noticeText}>
                    * Thông tin CCCD của bạn được lưu trữ và bảo mật riêng tư để
                    khai báo lưu trú, sẽ được xóa bỏ sau khi bạn check-out. Bạn
                    vui lòng chọn đúng ảnh CCCD của người Đặt phòng và chịu
                    trách nhiệm với thông tin trên.
                  </p>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Thông tin đặt phòng</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Khung giờ đã chọn</label>
                    <div className={styles.selectedSlotsDisplay}>
                      {formatSelectedSlots()}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số lượng khách *</label>
                    <select
                      name="guests"
                      className={styles.select}
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn số lượng khách</option>
                      <option value="1">1 khách</option>
                      <option value="2">2 khách</option>
                      <option value="3">3 khách</option>
                      <option value="4">4 khách</option>
                      <option value="5">5+ khách</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ghi chú</label>
                    <input
                      type="text"
                      name="notes"
                      className={styles.input}
                      placeholder="Yêu cầu đặc biệt (nếu có)"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Thông tin thanh toán
                </h3>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Số khung giờ:</span>
                    <span>{slotCount}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tổng tiền gốc:</span>
                    <span>{baseTotal.toLocaleString("vi-VN")} đ</span>
                  </div>
                  {discount > 0 && (
                    <div className={styles.priceRow}>
                      <span>Giảm giá ({(discount * 100).toFixed(0)}%):</span>
                      <span className={styles.discount}>
                        -{(baseTotal * discount).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  )}
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Tổng thanh toán:</span>
                    <span className={styles.totalPrice}>
                      {finalTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <div className={styles.paymentMethods}>
                  <h4 className={styles.paymentTitle}>
                    Phương thức thanh toán
                  </h4>
                  <div className={styles.paymentOptions}>
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={handleInputChange}
                      />
                      <span>Thanh toán tiền mặt khi nhận phòng</span>
                    </label>
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === "transfer"}
                        onChange={handleInputChange}
                      />
                      <span>Chuyển khoản ngân hàng</span>
                    </label>
                    <label className={styles.paymentOption}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                      />
                      <span>Thanh toán bằng thẻ</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.termsSection}>
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      required
                    />
                    <span>
                      Tôi đã đọc và đồng ý với{" "}
                      <a href="#" className={styles.link}>
                        điều khoản sử dụng
                      </a>{" "}
                      và{" "}
                      <a href="#" className={styles.link}>
                        chính sách bảo mật
                      </a>
                    </span>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Xác nhận đặt phòng
                  </button>
                  <button type="button" className={styles.cancelButton}>
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Xác nhận đặt phòng</h2>
              <button
                className={styles.closeButton}
                onClick={handleEditInfo}
                aria-label="Đóng modal"
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.bookingLocation}>
                <strong>Bạn đang đặt phòng tại:</strong>
                <span className={styles.locationText}>
                  {room.name} - {room.location}
                </span>
              </div>

              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên khách hàng:</span>
                  <span className={styles.detailValue}>
                    {formData.fullName}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số điện thoại:</span>
                  <span className={styles.detailValue}>{formData.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Chi nhánh:</span>
                  <span className={styles.detailValue}>
                    {room.name} - {room.location}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên phòng:</span>
                  <span className={styles.detailValue}>{room.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Khung giờ:</span>
                  <span className={styles.detailValue}>
                    {formatSelectedSlots()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số tiền tạm tính:</span>
                  <span className={styles.detailValue}>
                    {finalTotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className={styles.bookingNotice}>
                <strong>
                  KHÁCH MUỐN BẢO LƯU HAY ĐỔI NGÀY VUI LÒNG BẢO TRƯỚC 3 TIẾNG
                  TRƯỚC GIỜ CHECK IN
                </strong>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.editButton} onClick={handleEditInfo}>
                  Sửa lại thông tin
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmBooking}
                >
                  Đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
