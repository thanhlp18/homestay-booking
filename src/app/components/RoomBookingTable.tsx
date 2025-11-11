"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./RoomBookingTable.module.css";
import TimeSlotSelector from "./TimeSlotSelector";
import {
  Branch,
  isOvernightPackage,
  parseTimeRange,
  SelectedSlot,
  SelectedSlotWithTime,
  TimeConflict,
  TimeSlot,
} from "./bookingUtils";
import { useToast } from "@/hooks/useToast";

// Types

interface BookingStatus {
  status: "booked" | "available" | "selected" | "promotion" | "mystery";
  price?: number;
  originalPrice?: number;
  bookedSlots?: Array<{
    checkIn: string;
    checkOut: string;
    bookingId: string;
  }>;
}

interface RoomBookingTableProps {
  branches: Branch[];
  startDate?: Date;
  daysCount?: number;
  onBookingSubmit?: (selectedSlots: SelectedSlot[]) => void;

  initialBookings?: Record<
    string,
    Record<string, Record<string, Record<string, BookingStatus>>>
  >;
  initialSelectedSlots?: SelectedSlot[];
  submitOnSelect?: boolean;
  isFullDayBooking?: boolean;
  summaryElementId?: string; // ✅ ID of summary element to scroll to
}

// SVG Icon Components
const AvailableIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 471.701 471.701"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1 c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3 l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4 C471.801,124.501,458.301,91.701,433.601,67.001z M414.401,232.701l-178.7,178l-178.3-178.3c-19.6-19.6-30.4-45.6-30.4-73.3 s10.7-53.7,30.3-73.2c19.5-19.5,45.5-30.3,73.1-30.3c27.7,0,53.8,10.8,73.4,30.4l22.6,22.6c5.3,5.3,13.8,5.3,19.1,0l22.4-22.4 c19.6-19.6,45.7-30.4,73.3-30.4c27.6,0,53.6,10.8,73.2,30.3c19.6,19.6,30.3,45.6,30.3,73.3 C444.801,187.101,434.001,213.101,414.401,232.701z"
      fill="#605f3a"
    />
  </svg>
);

const BookedIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.3 5.71002C18.841 5.24601 18.2943 4.87797 17.6917 4.62731C17.0891 4.37666 16.4426 4.2484 15.79 4.25002C15.1373 4.2484 14.4909 4.37666 13.8883 4.62731C13.2857 4.87797 12.739 5.24601 12.28 5.71002L12 6.00002L11.72 5.72001C10.7917 4.79182 9.53273 4.27037 8.22 4.27037C6.90726 4.27037 5.64829 4.79182 4.72 5.72001C3.80386 6.65466 3.29071 7.91125 3.29071 9.22002C3.29071 10.5288 3.80386 11.7854 4.72 12.72L11.49 19.51C11.6306 19.6505 11.8212 19.7294 12.02 19.7294C12.2187 19.7294 12.4094 19.6505 12.55 19.51L19.32 12.72C20.2365 11.7823 20.7479 10.5221 20.7442 9.21092C20.7405 7.89973 20.2218 6.64248 19.3 5.71002Z"
      fill="#83311b"
    />
  </svg>
);

const SelectedIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.3 5.71002C18.841 5.24601 18.2943 4.87797 17.6917 4.62731C17.0891 4.37666 16.4426 4.2484 15.79 4.25002C15.1373 4.2484 14.4909 4.37666 13.8883 4.62731C13.2857 4.87797 12.739 5.24601 12.28 5.71002L12 6.00002L11.72 5.72001C10.7917 4.79182 9.53273 4.27037 8.22 4.27037C6.90726 4.27037 5.64829 4.79182 4.72 5.72001C3.80386 6.65466 3.29071 7.91125 3.29071 9.22002C3.29071 10.5288 3.80386 11.7854 4.72 12.72L11.49 19.51C11.6306 19.6505 11.8212 19.7294 12.02 19.7294C12.2187 19.7294 12.4094 19.6505 12.55 19.51L19.32 12.72C20.2365 11.7823 20.7479 10.5221 20.7442 9.21092C20.7405 7.89973 20.2218 6.64248 19.3 5.71002Z"
      fill="#bd8049"
    />
  </svg>
);

export default function RoomBookingTable({
  branches,
  startDate = new Date(),
  daysCount = 7,
  onBookingSubmit,
  initialBookings = {},
  initialSelectedSlots = [],
  submitOnSelect = false,
  isFullDayBooking = false,
  summaryElementId,
}: RoomBookingTableProps) {
  const [selectedSlots, setSelectedSlots] =
    useState<SelectedSlot[]>(initialSelectedSlots);
  const [bookings] = useState(initialBookings);
  const prevSlotsRef = useRef<string>("");
  const toast = useToast(); // ✅ Add this hook

  const [isMobile, setIsMobile] = useState(false);
  const isInitialMount = useRef(true);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{
    date: string;
    branchId: string;
    roomId: string;
    timeSlot: TimeSlot;
  } | null>(null);

  // ✅ Refs for auto-scroll
  const timeSelectorRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // ✅ Helper function to scroll to summary
  const scrollToSummary = () => {
    setTimeout(() => {
      if (summaryElementId) {
        // Scroll to external summary element by ID
        const summaryElement = document.getElementById(summaryElementId);
        summaryElement?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else if (summaryRef.current) {
        // Scroll to internal ref (if any)
        summaryRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // ✅ Get all unique time slots from all rooms across all branches
  const getAllTimeSlots = (): TimeSlot[] => {
    const timeSlotMap = new Map<string, TimeSlot>();
    
    branches.forEach((branch) => {
      branch.rooms.forEach((room) => {
        room.timeSlots.forEach((timeSlot) => {
          if (!timeSlotMap.has(timeSlot.id)) {
            timeSlotMap.set(timeSlot.id, timeSlot);
          }
        });
      });
    });
    
    return Array.from(timeSlotMap.values());
  };

  const allTimeSlots = getAllTimeSlots();

  // ✅ Check if a room has a specific time slot
  const roomHasTimeSlot = (room: any, timeSlotId: string): TimeSlot | null => {
    const timeSlot = room.timeSlots.find((ts: TimeSlot) => ts.id === timeSlotId);
    return timeSlot || null;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Call onBookingSubmit whenever selectedSlots changes
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (submitOnSelect && onBookingSubmit) {
      onBookingSubmit(selectedSlots);
    }
  }, [selectedSlots]);

  const getIconSize = () => {
    if (typeof window === "undefined") return 24;
    if (window.innerWidth <= 360) return 14;
    if (isMobile) return 16;
    return 24;
  };

  // Generate dates with compact format for mobile
  const generateDates = () => {
    const dates = [];
    const vietnameseDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayName = i === 0 ? "Hôm nay" : vietnameseDays[date.getDay()];
      let dateString;

      if (typeof window !== "undefined") {
        if (window.innerWidth <= 360) {
          dateString = `${date.getDate()}/${date.getMonth() + 1}`;
        } else if (isMobile) {
          dateString = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
        } else {
          dateString = date.toLocaleDateString("vi-VN");
        }
      } else {
        dateString = date.toLocaleDateString("vi-VN");
      }

      const dateKey = date.toISOString().split("T")[0];

      dates.push({
        key: dateKey,
        dayName,
        dateString,
        date,
      });
    }
    return dates;
  };

  const dates = generateDates();
  useEffect(() => {
    setSelectedSlots(initialSelectedSlots);
  }, [JSON.stringify(initialSelectedSlots)]);
  // Get booking status for a specific slot
  const getBookingStatus = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlotId: string
  ): BookingStatus => {
    const bookingData = bookings[dateKey]?.[branchId]?.[roomId]?.[timeSlotId];
    
    // ✅ Nếu không có booking nào, trả về available
    if (!bookingData) {
      return { status: "available" };
    }
    
    // ✅ UU TIÊN: Nếu bookingData đã có status "booked" (từ initialBookings), 
    // trả về ngay (đây là overnight package đã được mark sẵn)
    if (bookingData.status === "booked") {
      return {
        status: "booked",
        bookedSlots: bookingData.bookedSlots || [],
      };
    }
    
    // ✅ Fallback: Check nếu có bookedSlots nhưng status không phải "booked"
    // → Đây là gói giờ thông thường, vẫn available để đặt thêm
    if (bookingData.bookedSlots && bookingData.bookedSlots.length > 0) {
      return {
        status: "available",
        bookedSlots: bookingData.bookedSlots,
      };
    }
    
    // ✅ Default: available
    return { status: "available" };
  };

  const isSelected = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlotId: string
  ): boolean => {
    return selectedSlots.some(
      (slot) =>
        slot.date === dateKey &&
        slot.branchId === branchId &&
        slot.roomId === roomId &&
        slot.timeSlotId === timeSlotId
      // ← Không check checkInTime vì có thể có nhiều bookings với cùng slot nhưng khác giờ
    );
  };

  // ✅ Helper function để tìm checkInTime của slot đã chọn - MOVE INSIDE COMPONENT
  const findSelectedCheckInTime = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlotId: string
  ): string | undefined => {
    const slot = selectedSlots.find(
      (s) =>
        s.date === dateKey &&
        s.branchId === branchId &&
        s.roomId === roomId &&
        s.timeSlotId === timeSlotId
    );
    return slot?.checkInTime;
  };

  // RoomBookingTable.tsx

  const handleCellClick = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlot: TimeSlot
  ) => {
    if (isFullDayBooking) return;

    const bookingStatus = getBookingStatus(
      dateKey,
      branchId,
      roomId,
      timeSlot.id
    );

    // ✅ CHỈ block nếu là overnight package và đã có booking
    if (bookingStatus.status === "booked") {
      const conflictDetails = bookingStatus.bookedSlots
        ?.map((slot) => {
          const checkIn = new Date(slot.checkIn).toLocaleString("vi-VN");
          const checkOut = new Date(slot.checkOut).toLocaleString("vi-VN");
          return `${checkIn} → ${checkOut}`;
        })
        .join(", ");

      toast.warning(
        "Gói overnight đã được đặt",
        `Không thể đặt thêm. Booking hiện có:\n${conflictDetails}`
      );
      return;
    }

    // ✅ Với gói giờ thông thường, cho phép chọn để pick giờ cụ thể
    // (Conflict check sẽ được xử lý trong TimeSlotSelector)
    
    // ... rest of logic
    const matchingSlots = selectedSlots.filter(
      (slot) =>
        slot.date === dateKey &&
        slot.branchId === branchId &&
        slot.roomId === roomId &&
        slot.timeSlotId === timeSlot.id
    );

    if (matchingSlots.length > 0) {
      const newSlots = selectedSlots.filter(
        (slot) =>
          !(
            slot.date === dateKey &&
            slot.branchId === branchId &&
            slot.roomId === roomId &&
            slot.timeSlotId === timeSlot.id
          )
      );
      setSelectedSlots(newSlots);
      toast.info("Đã bỏ chọn", `Khung giờ ${timeSlot.time} đã được xóa`);
    } else {
      const isOvernightPackage =
        timeSlot.isOvernight === true ||
        (timeSlot.duration && timeSlot.duration >= 20);

      if (isOvernightPackage) {
        const newSlot: SelectedSlot = {
          date: dateKey,
          branchId,
          roomId,
          timeSlotId: timeSlot.id,
          price: timeSlot.price,
          checkInTime: "14:00",
        };

        setSelectedSlots((prev) => [...prev, newSlot]);
        toast.success("Đã thêm vào giỏ", `${timeSlot.time} (Qua đêm)`);
        
        // ✅ Auto-scroll to summary after adding overnight slot
        scrollToSummary();
      } else {
        setPendingSlot({
          date: dateKey,
          branchId,
          roomId,
          timeSlot,
        });
        setShowTimeSelector(true);
        
        // ✅ Auto-scroll to time selector
        setTimeout(() => {
          timeSelectorRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    }
  };

  // Calculate total price with discounts
  const calculateTotal = () => {
    const baseTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const slotCount = selectedSlots.length;

    let discount = 0;
    if (slotCount >= 3) {
      discount = 0.1;
    } else if (slotCount === 2) {
      discount = 0.05;
    }

    const finalTotal = baseTotal * (1 - discount);
    return { baseTotal, discount, finalTotal, slotCount };
  };

  const { baseTotal, discount, finalTotal, slotCount } = calculateTotal();

  // Handle booking submission
  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      toast.warning(
        "Chưa chọn khung giờ",
        "Vui lòng chọn ít nhất một khung giờ để đặt phòng"
      );
      return;
    }

    if (onBookingSubmit) {
      onBookingSubmit(selectedSlots);
    } else {
      toast.success(
        "Đặt phòng thành công!",
        `Tổng tiền: ${finalTotal.toLocaleString("vi-VN")}đ`
      );
    }
  };

  const handleTimeConfirm = async (checkInTime: string) => {
    if (!pendingSlot) return;

    const checkInDateTime = new Date(`${pendingSlot.date}T${checkInTime}:00`);

    try {
      const response = await fetch("/api/bookings/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: pendingSlot.roomId,
          timeSlotId: pendingSlot.timeSlot.id,
          checkInDateTime: checkInDateTime.toISOString(),
        }),
      });

      const result = await response.json();

      if (!result.available) {
        toast.error(
          "Khung giờ không khả dụng",
          result.message || "Vui lòng chọn thời gian khác"
        );
        return;
      }

      const newSlot: SelectedSlot = {
        date: pendingSlot.date,
        branchId: pendingSlot.branchId,
        roomId: pendingSlot.roomId,
        timeSlotId: pendingSlot.timeSlot.id,
        price: pendingSlot.timeSlot.price,
        checkInTime: checkInTime,
      };

      setSelectedSlots((prev) => [...prev, newSlot]);
      setShowTimeSelector(false);
      setPendingSlot(null);
      toast.success(
        "Đã thêm vào giỏ",
        `${pendingSlot.timeSlot.time} - Check-in: ${checkInTime}`
      );
      
      // ✅ Auto-scroll to summary after confirming time
      scrollToSummary();
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error(
        "Lỗi hệ thống",
        "Không thể kiểm tra tính khả dụng. Vui lòng thử lại"
      );
    }
  };

  const handleTimeCancel = () => {
    setShowTimeSelector(false);
    setPendingSlot(null);
  };

  // Get cell class based on status and selection
  // RoomBookingTable.tsx

  const getCellClass = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlotId: string
  ) => {
    const selected = isSelected(dateKey, branchId, roomId, timeSlotId);
    const bookingStatus = getBookingStatus(
      dateKey,
      branchId,
      roomId,
      timeSlotId
    );

    if (selected) return `${styles.cell} ${styles.selected}`;

    // ✅ Chỉ hiển thị 'booked' (đỏ) nếu là overnight package và đã có booking
    if (bookingStatus.status === "booked") {
      return `${styles.cell} ${styles.booked}`;
    }

    // ✅ Với gói giờ thông thường, vẫn hiển thị available (xanh) 
    // ngay cả khi đã có booking (vì có thể đặt giờ khác)
    return `${styles.cell} ${styles.available}`;
  };

  // Get cell content based on status
  const getCellContent = (
    dateKey: string,
    branchId: string,
    roomId: string,
    timeSlotId: string
  ) => {
    const iconSize = getIconSize();

    // ✅ Count số lượng bookings đã chọn cho cell này
    const selectedCount = selectedSlots.filter(
      (slot) =>
        slot.date === dateKey &&
        slot.branchId === branchId &&
        slot.roomId === roomId &&
        slot.timeSlotId === timeSlotId
    ).length;

    // ✅ Nếu có ít nhất 1 selected → Show SelectedIcon
    if (selectedCount > 0) {
      return (
        <div style={{ position: "relative" }}>
          <SelectedIcon size={iconSize} />
          {selectedCount > 1 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "#bd8049",
                color: "white",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {selectedCount}
            </span>
          )}
        </div>
      );
    }
    const bookingStatus = getBookingStatus(
      dateKey,
      branchId,
      roomId,
      timeSlotId
    );

    // ✅ Nếu là overnight package và đã có booking → Show BookedIcon (đỏ)
    if (bookingStatus.status === "booked") {
      return (
        <div style={{ position: "relative" }}>
          <BookedIcon size={iconSize} />
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "#ff4d4f",
              color: "white",
              borderRadius: "50%",
              width: 16,
              height: 16,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {bookingStatus.bookedSlots?.length || 1}
          </span>
        </div>
      );
    }

    // ✅ Với gói giờ thông thường, có booking nhưng vẫn available
    // → Show AvailableIcon (xanh) kèm badge số lượng booking
    if (bookingStatus.bookedSlots && bookingStatus.bookedSlots.length > 0) {
      return (
        <div style={{ position: "relative" }}>
          <AvailableIcon size={iconSize} />
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "#1890ff",
              color: "white",
              borderRadius: "50%",
              width: 16,
              height: 16,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {bookingStatus.bookedSlots.length}
          </span>
        </div>
      );
    }
    return <AvailableIcon size={iconSize} />;
  };

  return (
    <div className={styles.bookingTableContainer}>
      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <AvailableIcon size={getIconSize()} />
          <span>Còn trống</span>
        </div>
        <div className={styles.legendItem}>
          <SelectedIcon size={getIconSize()} />
          <span>Đang chọn</span>
        </div>
        <div className={styles.legendItem}>
          <BookedIcon size={getIconSize()} />
          <span>Đã đặt</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.bookingTable}>
          <thead>
            {/* Row 1: Branch headers */}
            <tr className={styles.branchRow}>
              <th className={styles.dateHeader}>Ngày</th>
              {branches.map((branch) => (
                <th
                  key={branch.id}
                  className={styles.branchHeader}
                  colSpan={branch.rooms.length * allTimeSlots.length}
                >
                  {branch.name}
                </th>
              ))}
            </tr>

            {/* Row 2: Room headers */}
            <tr className={styles.roomRow}>
              <th className={styles.dateHeader}></th>
              {branches.map((branch) =>
                branch.rooms.map((room) => (
                  <th
                    key={`${branch.id}-${room.id}`}
                    className={styles.roomHeader}
                    colSpan={allTimeSlots.length}
                  >
                    {room.name}
                  </th>
                ))
              )}
            </tr>

            {/* Row 3: Time slot headers - DYNAMIC */}
            <tr className={styles.timeRow}>
              <th className={styles.dateHeader}>Khung giờ</th>
              {branches.map((branch) =>
                branch.rooms.map((room) =>
                  allTimeSlots.map((timeSlot) => (
                    <th
                      key={`${branch.id}-${room.id}-${timeSlot.id}`}
                      className={styles.timeHeader}
                    >
                      {timeSlot.time}
                    </th>
                  ))
                )
              )}
            </tr>
          </thead>

          <tbody>
            {dates.map((dateInfo) => (
              <tr key={dateInfo.key} className={styles.dateRow}>
                <td className={styles.dateCell}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dayName}>{dateInfo.dayName}</span>
                    <span className={styles.dateString}>
                      {dateInfo.dateString}
                    </span>
                  </div>
                </td>
                {branches.map((branch) =>
                  branch.rooms.map((room) =>
                    allTimeSlots.map((timeSlot) => {
                      const roomTimeSlot = roomHasTimeSlot(room, timeSlot.id);
                      
                      // ✅ If room doesn't have this time slot, show disabled cell
                      if (!roomTimeSlot) {
                        return (
                          <td
                            key={`${dateInfo.key}-${branch.id}-${room.id}-${timeSlot.id}`}
                            className={`${styles.cell} ${styles.disabled}`}
                          >
                            <span style={{ opacity: 0.3 }}>—</span>
                          </td>
                        );
                      }

                      // ✅ Room has this time slot, show normal cell
                      return (
                        <td
                          key={`${dateInfo.key}-${branch.id}-${room.id}-${timeSlot.id}`}
                          className={getCellClass(
                            dateInfo.key,
                            branch.id,
                            room.id,
                            timeSlot.id
                          )}
                          onClick={() =>
                            handleCellClick(
                              dateInfo.key,
                              branch.id,
                              room.id,
                              roomTimeSlot
                            )
                          }
                        >
                          {getCellContent(
                            dateInfo.key,
                            branch.id,
                            room.id,
                            timeSlot.id
                          )}
                        </td>
                      );
                    })
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTimeSelector && pendingSlot && (
        <div ref={timeSelectorRef}>
          <TimeSlotSelector
            date={pendingSlot.date}
            roomId={pendingSlot.roomId}
            roomName={
              branches
                .find((b) => b.id === pendingSlot.branchId)
                ?.rooms.find((r) => r.id === pendingSlot.roomId)?.name || ""
            }
            timeSlot={pendingSlot.timeSlot}
            onTimeSelect={handleTimeConfirm}
            onCancel={handleTimeCancel}
          />
        </div>
      )}
    </div>
  );
}
