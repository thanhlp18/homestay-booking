// src/app/components/TimeSlotSelector.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./TimeSlotSelector.module.css";
import { parseTimeRange } from "./bookingUtils";

interface UnavailableSlot {
  checkIn: string;
  checkOut: string;
}

interface TimeSlotSelectorProps {
  date: string;
  roomId: string;
  roomName: string;
  timeSlot: {
    id: string;
    time: string;
    price: number;
    duration?: number | null;
  };
  onTimeSelect: (time: string) => void;
  onCancel: () => void;
}

// ✅ Generate time slots with OVERNIGHT support
// TimeSlotSelector.tsx

// ✅ FIX: Generate time slots with proper overnight handling
function generateTimeSlots(
  start: string,
  end: string,
  step: number = 15
): string[] {
  console.log("🔍 Generating slots:", { start, end, step }); // Debug

  const slots: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  console.log("⏰ Minutes:", { startMinutes, endMinutes }); // Debug

  // ✅ Check if overnight (end time < start time)
  // VD: 14:00 (840min) -> 12:00 (720min) → Overnight!
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours (1440 minutes)
    console.log("🌙 Overnight detected! New endMinutes:", endMinutes); // Debug
  }

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += step) {
    const actualMinutes = minutes % (24 * 60); // Wrap around 24h
    const hours = Math.floor(actualMinutes / 60);
    const mins = actualMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
    slots.push(timeStr);
  }

  console.log("✅ Generated slots count:", slots.length); // Debug
  console.log("📋 First 5 slots:", slots.slice(0, 5)); // Debug
  console.log("📋 Last 5 slots:", slots.slice(-5)); // Debug

  return slots;
}

// ✅ Check time conflict with proper overnight handling
function isTimeConflict(
  checkInTime: string,
  duration: number,
  unavailableSlots: UnavailableSlot[],
  bookingDate: string
): boolean {
  const checkInDate = new Date(`${bookingDate}T${checkInTime}:00`);
  const checkOutDate = new Date(
    checkInDate.getTime() + duration * 60 * 60 * 1000
  );

  for (const slot of unavailableSlots) {
    const existingCheckIn = new Date(slot.checkIn);
    const existingCheckOut = new Date(slot.checkOut);

    // Check overlap: (A_start < B_end) AND (A_end > B_start)
    if (checkInDate < existingCheckOut && checkOutDate > existingCheckIn) {
      return true;
    }
  }

  return false;
}

export default function TimeSlotSelector({
  date,
  roomId,
  roomName,
  timeSlot,
  onTimeSelect,
  onCancel,
}: TimeSlotSelectorProps) {
  const [selectedTime, setSelectedTime] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeStep, setTimeStep] = useState(30);

  useEffect(() => {
    fetchUnavailableTimes();
  }, [date, roomId, timeSlot.id]);

  const fetchUnavailableTimes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/bookings/unavailable-times?date=${date}&roomId=${roomId}&timeSlotId=${timeSlot.id}`
      );
      const data = await response.json();

      if (data.success) {
        setUnavailableSlots(data.unavailableSlots || []);
      }
    } catch (err) {
      console.error("Error fetching unavailable times:", err);
      setError("Không thể tải thông tin thời gian đã đặt");
    } finally {
      setLoading(false);
    }
  };

  const { start, end } = parseTimeRange(timeSlot.time);
  const availableSlots = generateTimeSlots(start, end, timeStep);
  const duration = timeSlot.duration || 1;

  const handleTimeClick = (time: string) => {
    if (isTimeConflict(time, duration, unavailableSlots, date)) {
      const checkIn = new Date(`${date}T${time}:00`);
      const checkOut = new Date(checkIn.getTime() + duration * 60 * 60 * 1000);

      const checkOutTime = checkOut.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const checkOutDateStr =
        checkOut.getDate() !== checkIn.getDate()
          ? ` (${checkOut.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })})`
          : "";

      setError(
        `⚠️ Khung giờ ${time} - ${checkOutTime}${checkOutDateStr} bị trùng với booking khác. Vui lòng chọn thời gian khác.`
      );
      setSelectedTime("");
      return;
    }

    setError("");
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedTime) {
      onTimeSelect(selectedTime);
    }
  };

  // ✅ Check if overnight range
  const isOvernightRange = () => {
    const [startHour] = start.split(":").map(Number);
    const [endHour] = end.split(":").map(Number);
    return endHour < startHour;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h4>Chọn giờ check-in</h4>
          <p className={styles.details}>
            <strong>Ngày:</strong> {new Date(date).toLocaleDateString("vi-VN")}{" "}
            | <strong>Phòng:</strong> {roomName} | <strong>Gói:</strong>{" "}
            {timeSlot.time} ({duration}h)
            {isOvernightRange() && (
              <span className={styles.overnightBadge}> 🌙 Qua đêm</span>
            )}
          </p>
        </div>
        <button className={styles.closeBtn} onClick={onCancel}>
          ✕
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {unavailableSlots.length > 0 && (
        <div className={styles.unavailableSection}>
          <p className={styles.unavailableTitle}>
            🔴 Các khoảng thời gian đã được đặt:
          </p>
          <div className={styles.unavailableList}>
            {unavailableSlots.map((slot, idx) => {
              const checkIn = new Date(slot.checkIn);
              const checkOut = new Date(slot.checkOut);

              const checkInStr = checkIn.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const checkOutStr = checkOut.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const checkOutDateStr =
                checkOut.getDate() !== checkIn.getDate()
                  ? ` (${checkOut.getDate()}/${checkOut.getMonth() + 1})`
                  : "";

              return (
                <span key={idx} className={styles.unavailableTag}>
                  {checkInStr} - {checkOutStr}
                  {checkOutDateStr}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <>
          {/* ✅ Info text for overnight */}
          {isOvernightRange() && (
            <div className={styles.infoBox}>
              💡 <strong>Lưu ý:</strong> Gói này qua đêm. Chọn giờ check-in từ{" "}
              {start} hôm nay đến {end} ngày hôm sau.
            </div>
          )}

          <div className={styles.timeGrid}>
            {availableSlots.map((time) => {
              const isConflict = isTimeConflict(
                time,
                duration,
                unavailableSlots,
                date
              );
              const isSelected = time === selectedTime;

              return (
                <button
                  key={time}
                  className={`${styles.timeSlot} ${
                    isConflict
                      ? styles.timeSlotDisabled
                      : isSelected
                      ? styles.timeSlotSelected
                      : styles.timeSlotAvailable
                  }`}
                  onClick={() => handleTimeClick(time)}
                  disabled={isConflict}
                  title={
                    isConflict ? "Thời gian này bị trùng với booking khác" : ""
                  }
                >
                  {time}
                  {isConflict && (
                    <span className={styles.disabledIcon}>🚫</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.cancelActionBtn} onClick={onCancel}>
          Hủy
        </button>
        <button
          className={styles.confirmActionBtn}
          onClick={handleConfirm}
          disabled={!selectedTime}
        >
          Xác nhận {selectedTime && `(${selectedTime})`}
        </button>
      </div>
    </div>
  );
}
