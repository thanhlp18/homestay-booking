// CheckInTimeModal.tsx
import { useEffect, useState } from "react";
import styles from "./CheckInTimeModal.module.css";
import { SelectedSlot } from "../rooms/[roomSlug]/page";

export interface SelectedSlotWithTime extends SelectedSlot {
  checkInTime?: string;
}

interface SimpleTimeSlot {
  id: string;
  time: string;
  price: number;
  duration?: number | null;
}

// ✅ THÊM roomId vào interface
interface CheckInTimeModalProps {
  isOpen: boolean;
  slotInfo: {
    date: string;
    timeSlot: SimpleTimeSlot;
    roomName: string;
    roomId: string; // ← THÊM FIELD NÀY
  } | null;
  onConfirm: (checkInTime: string) => void;
  onCancel: () => void;
}

// Helper function to parse time ranges
function parseTimeRange(timeString: string): { start: string; end: string } {
  const separators = ["–", "-", "—", " to ", " - ", "~"];

  for (const separator of separators) {
    if (timeString.includes(separator)) {
      const parts = timeString.split(separator);
      if (parts.length === 2) {
        return {
          start: parts[0].trim(),
          end: parts[1].trim(),
        };
      }
    }
  }

  const timeMatch = timeString.match(/(\d{1,2}:\d{2})\s*.*?\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    return {
      start: timeMatch[1],
      end: timeMatch[2],
    };
  }

  console.warn("Could not parse time range from:", timeString);
  return {
    start: "00:00",
    end: "23:59",
  };
}

export const CheckInTimeModal: React.FC<CheckInTimeModalProps> = ({
  isOpen,
  slotInfo,
  onConfirm,
  onCancel,
}) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);

  useEffect(() => {
    if (slotInfo) {
      fetchUnavailableTimes();
    }
  }, [slotInfo]);

  const fetchUnavailableTimes = async () => {
    if (!slotInfo) return;

    try {
      const response = await fetch(
        `/api/bookings/unavailable-times?date=${slotInfo.date}&roomId=${slotInfo.roomId}&timeSlotId=${slotInfo.timeSlot.id}`
      );
      const data = await response.json();

      if (data.success) {
        setUnavailableTimes(data.unavailableTimes || []);
      }
    } catch (error) {
      console.error("Error fetching unavailable times:", error);
    }
  };

  if (!isOpen || !slotInfo) return null;

  const { start: startTime, end: endTime } = parseTimeRange(
    slotInfo.timeSlot.time
  );

  const handleConfirm = () => {
    if (selectedTime) {
      onConfirm(selectedTime);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.timeModal}>
        <h3>Chọn giờ nhận phòng</h3>
        <div className={styles.slotInfo}>
          <p>
            <strong>Ngày:</strong>{" "}
            {new Date(slotInfo.date).toLocaleDateString("vi-VN")}
          </p>
          <p>
            <strong>Phòng:</strong> {slotInfo.roomName}
          </p>
          <p>
            <strong>Gói:</strong> {slotInfo.timeSlot.time}
            {slotInfo.timeSlot.duration && (
              <span> ({slotInfo.timeSlot.duration}h)</span>
            )}
          </p>
        </div>

        {unavailableTimes.length > 0 && (
          <div className={styles.unavailableSection}>
            <p className={styles.unavailableTitle}>
              ⚠️ Các khoảng thời gian đã được đặt:
            </p>
            {unavailableTimes.map((timeRange, idx) => (
              <div key={idx} className={styles.unavailableSlot}>
                🔴 {timeRange}
              </div>
            ))}
            <p className={styles.unavailableHint}>
              Vui lòng chọn giờ check-in sao cho không trùng với các khoảng thời
              gian trên
            </p>
          </div>
        )}

        <div className={styles.timePickerSection}>
          <label>Giờ check-in:</label>
          <input
            type="time"
            min={startTime}
            max={endTime}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className={styles.timeInput}
          />
          <p className={styles.hint}>
            Vui lòng chọn giờ trong khoảng {startTime} - {endTime}
          </p>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTime}
            className={styles.confirmBtn}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
