// BookingSummary.tsx

import styles from "./BookingSummary.module.css";
import {
  SelectedSlot,
  Branch,
  isWeekend,
  isOvernightPackage,
} from "./bookingUtils";

interface BookingSummaryProps {
  selectedSlots: SelectedSlot[];
  branches: Branch[];
  onRemoveSlot?: (slot: SelectedSlot) => void;
}

// ✅ Tính check-out đúng với date + time
function calculateCheckOutTime(
  date: string,
  checkInTime: string,
  duration: number | null | undefined
): { time: string; date: string; isNextDay: boolean } {
  if (!checkInTime || !duration) {
    return { time: "N/A", date: "", isNextDay: false };
  }

  const checkInDate = new Date(`${date}T${checkInTime}:00`);
  const checkOutDate = new Date(
    checkInDate.getTime() + duration * 60 * 60 * 1000
  );

  const checkOutTime = checkOutDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const checkOutDateStr = checkOutDate.toLocaleDateString("vi-VN");
  const checkInDateStr = checkInDate.toLocaleDateString("vi-VN");
  const isNextDay = checkOutDateStr !== checkInDateStr;

  return {
    time: checkOutTime,
    date: checkOutDateStr,
    isNextDay,
  };
}

export default function BookingSummary({
  selectedSlots,
  branches,
  onRemoveSlot,
}: BookingSummaryProps) {
  if (selectedSlots.length === 0) {
    return (
      <div className={styles.emptySummary}>
        <p>Chưa có khung giờ nào được chọn</p>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = selectedSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, SelectedSlot[]>);

  // ✅ Calculate total price với weekend surcharge
  const calculateTotalPrice = () => {
    let totalBasePrice = 0;
    let totalWeekendSurcharge = 0;

    selectedSlots.forEach((slot) => {
      const branch = branches.find((b) => b.id === slot.branchId);
      const room = branch?.rooms.find((r) => r.id === slot.roomId);
      const timeSlot = room?.timeSlots.find((ts) => ts.id === slot.timeSlotId);

      if (timeSlot) {
        totalBasePrice += timeSlot.price;

        // Check if weekend
        if (isWeekend(slot.date) && timeSlot.weekendSurcharge) {
          totalWeekendSurcharge += timeSlot.weekendSurcharge;
        }
      }
    });

    return {
      basePrice: totalBasePrice,
      weekendSurcharge: totalWeekendSurcharge,
      totalPrice: totalBasePrice + totalWeekendSurcharge,
    };
  };

  const { basePrice, weekendSurcharge, totalPrice } = calculateTotalPrice();

  return (
    <div className={styles.summaryContainer}>
      <h3 className={styles.summaryTitle}>
        Danh sách khung giờ đã chọn ({selectedSlots.length})
      </h3>

      {Object.entries(slotsByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, slots]) => {
          const dateObj = new Date(date);
          const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
          const dayName = dayNames[dateObj.getDay()];
          const isWeekendDay = isWeekend(date);

          return (
            <div key={date} className={styles.dateGroup}>
              <h4 className={styles.dateHeader}>
                {dayName}, {dateObj.toLocaleDateString("vi-VN")}
                {isWeekendDay && (
                  <span className={styles.weekendBadge}>🌟 Cuối tuần</span>
                )}
              </h4>

              {slots.map((slot, index) => {
                const branch = branches.find((b) => b.id === slot.branchId);
                const room = branch?.rooms.find((r) => r.id === slot.roomId);
                const timeSlot = room?.timeSlots.find(
                  (ts) => ts.id === slot.timeSlotId
                );

                if (!timeSlot) return null;

                // ✅ Xử lý check-out time cho overnight
                let checkOut;
                if (timeSlot.isOvernight) {
                  // ✅ Overnight: Check-in 14:00 → Check-out 12:00 ngày hôm sau
                  const nextDay = new Date(date);
                  nextDay.setDate(nextDay.getDate() + 1);

                  checkOut = {
                    time: "12:00",
                    date: nextDay.toLocaleDateString("vi-VN"),
                    isNextDay: true,
                  };
                } else {
                  // Gói theo giờ: Tính theo duration
                  checkOut = slot.checkInTime
                    ? calculateCheckOutTime(
                        date,
                        slot.checkInTime,
                        timeSlot.duration
                      )
                    : null;
                }

                // Calculate price with weekend surcharge
                const slotBasePrice = timeSlot.price;
                const slotWeekendSurcharge =
                  isWeekendDay && timeSlot.weekendSurcharge
                    ? timeSlot.weekendSurcharge
                    : 0;
                const slotTotalPrice = slotBasePrice + slotWeekendSurcharge;

                return (
                  <div
                    key={`${slot.date}-${slot.timeSlotId}-${slot.checkInTime}-${index}`}
                    className={styles.slotCard}
                  >
                    <div className={styles.slotInfo}>
                      <div className={styles.slotHeader}>
                        <span className={styles.slotBranch}>
                          📍 {branch?.name}
                        </span>
                        <span className={styles.slotRoom}>🏠 {room?.name}</span>
                      </div>

                      <div className={styles.slotDetails}>
                        <div className={styles.timeInfo}>
                          <span className={styles.label}>Gói:</span>
                          <span className={styles.value}>
                            {timeSlot.time}
                            {timeSlot.duration && (
                              <span className={styles.durationBadge}>
                                {timeSlot.duration}h
                              </span>
                            )}
                            {/* ✅ Chỉ hiển thị badge overnight nếu là TRUE overnight */}
                            {(timeSlot.isOvernight ||
                              isOvernightPackage(timeSlot)) && (
                              <span className={styles.overnightBadge}>
                                🌙 Qua đêm (không chọn giờ)
                              </span>
                            )}
                          </span>
                        </div>

                        {/* ✅ Hiển thị check-in/out cho cả overnight và hourly */}
                        {slot.checkInTime && (
                          <>
                            <div className={styles.timeInfo}>
                              <span className={styles.label}>Check-in:</span>
                              <span className={styles.value}>
                                {timeSlot.isOvernight
                                  ? `${slot.checkInTime} (${new Date(
                                      date
                                    ).toLocaleDateString("vi-VN")})`
                                  : slot.checkInTime}
                              </span>
                            </div>
                            <div className={styles.timeInfo}>
                              <span className={styles.label}>Check-out:</span>
                              <span className={styles.value}>
                                {checkOut?.time}
                                {checkOut?.isNextDay && (
                                  <span className={styles.nextDayBadge}>
                                    {" "}
                                    ({checkOut.date})
                                  </span>
                                )}
                              </span>
                            </div>
                          </>
                        )}

                        <div className={styles.priceBreakdown}>
                          <div className={styles.timeInfo}>
                            <span className={styles.label}>Giá gốc:</span>
                            <span className={styles.value}>
                              {slotBasePrice.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          {slotWeekendSurcharge > 0 && (
                            <div className={styles.timeInfo}>
                              <span className={styles.label}>
                                Phụ phí cuối tuần:
                              </span>
                              <span className={styles.surchargeValue}>
                                +{slotWeekendSurcharge.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          )}
                          <div className={styles.timeInfo}>
                            <span className={styles.label}>Tổng:</span>
                            <span className={styles.priceValue}>
                              {slotTotalPrice.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {onRemoveSlot && (
                      <button
                        className={styles.removeButton}
                        onClick={() => onRemoveSlot(slot)}
                        aria-label="Xóa khung giờ này"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

      {/* Total section */}
      <div className={styles.totalSection}>
        <div className={styles.totalRow}>
          <span>Tổng giá gốc:</span>
          <span>{basePrice.toLocaleString("vi-VN")}đ</span>
        </div>
        {weekendSurcharge > 0 && (
          <div className={styles.totalRow}>
            <span>Tổng phụ phí cuối tuần:</span>
            <span className={styles.surchargeValue}>
              +{weekendSurcharge.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Tổng thanh toán:</span>
          <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </div>
  );
}
