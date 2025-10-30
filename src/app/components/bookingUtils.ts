export interface TimeSlot {
  id: string;
  time: string;
  price: number;
  duration?: number | null;
  weekendSurcharge?: number;
  isOvernight?: boolean;
}

export interface Room {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

export interface Branch {
  id: string;
  name: string;
  rooms: Room[];
}

export interface SelectedSlot {
  date: string;
  branchId: string;
  roomId: string;
  timeSlotId: string;
  price: number;
  checkInTime?: string;
}

export interface SelectedSlotWithTime extends SelectedSlot {
  checkInTime: string;
}

export interface TimeConflict {
  date: string;
  conflicts: Array<{
    slot1: SelectedSlotWithTime;
    slot2: SelectedSlotWithTime;
    overlapMessage: string;
  }>;
}

// Function để kiểm tra xung đột thời gian
export function checkTimeConflicts(
  selectedSlots: SelectedSlotWithTime[],
  branches: Branch[]
): TimeConflict[] {
  const conflicts: TimeConflict[] = [];

  const slotsByDateAndRoom = selectedSlots.reduce((acc, slot) => {
    const key = `${slot.date}-${slot.roomId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, SelectedSlotWithTime[]>);

  Object.entries(slotsByDateAndRoom).forEach(([key, slots]) => {
    const [date] = key.split("-");

    if (slots.length < 2) return;

    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];

        const branch1 = branches.find((b) => b.id === slot1.branchId);
        const room1 = branch1?.rooms.find((r) => r.id === slot1.roomId);
        const timeSlot1 = room1?.timeSlots.find(
          (ts) => ts.id === slot1.timeSlotId
        );

        const branch2 = branches.find((b) => b.id === slot2.branchId);
        const room2 = branch2?.rooms.find((r) => r.id === slot2.roomId);
        const timeSlot2 = room2?.timeSlots.find(
          (ts) => ts.id === slot2.timeSlotId
        );

        if (
          !timeSlot1 ||
          !timeSlot2 ||
          !slot1.checkInTime ||
          !slot2.checkInTime
        )
          continue;

        const checkIn1 = new Date(`${slot1.date}T${slot1.checkInTime}:00`);
        const checkOut1 = new Date(
          checkIn1.getTime() + (timeSlot1.duration || 1) * 60 * 60 * 1000
        );

        const checkIn2 = new Date(`${slot2.date}T${slot2.checkInTime}:00`);
        const checkOut2 = new Date(
          checkIn2.getTime() + (timeSlot2.duration || 1) * 60 * 60 * 1000
        );

        const hasOverlap = checkIn1 < checkOut2 && checkOut1 > checkIn2;

        if (hasOverlap) {
          const existingConflict = conflicts.find((c) => c.date === date);

          const checkOut1Str = checkOut1.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const checkOut2Str = checkOut2.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const overlapMessage = `Xung đột: ${slot1.checkInTime} - ${checkOut1Str} và ${slot2.checkInTime} - ${checkOut2Str}`;

          if (existingConflict) {
            existingConflict.conflicts.push({
              slot1,
              slot2,
              overlapMessage,
            });
          } else {
            conflicts.push({
              date,
              conflicts: [
                {
                  slot1,
                  slot2,
                  overlapMessage,
                },
              ],
            });
          }
        }
      }
    }
  });

  return conflicts;
}

// Helper để parse time range
// bookingUtils.ts

export function parseTimeRange(timeString: string): {
  start: string;
  end: string;
} {
  console.log("🔍 Parsing time string:", timeString);

  // ✅ PRIORITY 1: Check for patterns inside parentheses FIRST
  // Pattern: "(14h-12h)" hoặc "(14:00-12:00)"
  const bracketPattern =
    /\((\d{1,2})h?:?(\d{2})?\s*[-–—]\s*(\d{1,2})h?:?(\d{2})?\)/;
  const bracketMatch = timeString.match(bracketPattern);

  if (bracketMatch) {
    const startHour = bracketMatch[1].padStart(2, "0");
    const startMin = bracketMatch[2] || "00";
    const endHour = bracketMatch[3].padStart(2, "0");
    const endMin = bracketMatch[4] || "00";

    const result = {
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`,
    };
    console.log("✅ Bracket parsed:", result);
    return result;
  }

  // ✅ PRIORITY 2: Simple patterns with h notation
  // Pattern: "14h-12h" hoặc "14h00-12h00"
  const hPattern = /(\d{1,2})h(\d{2})?\s*[-–—]\s*(\d{1,2})h(\d{2})?/;
  const hMatch = timeString.match(hPattern);

  if (hMatch) {
    const startHour = hMatch[1].padStart(2, "0");
    const startMin = hMatch[2] || "00";
    const endHour = hMatch[3].padStart(2, "0");
    const endMin = hMatch[4] || "00";

    const result = {
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`,
    };
    console.log("✅ H-notation parsed:", result);
    return result;
  }

  // ✅ PRIORITY 3: Standard time format
  // Pattern: "14:00-12:00" hoặc "14:00 - 12:00"
  const colonPattern = /(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/;
  const colonMatch = timeString.match(colonPattern);

  if (colonMatch) {
    const result = {
      start: `${colonMatch[1].padStart(2, "0")}:${colonMatch[2]}`,
      end: `${colonMatch[3].padStart(2, "0")}:${colonMatch[4]}`,
    };
    console.log("✅ Colon parsed:", result);
    return result;
  }

  // ✅ PRIORITY 4: Text-based separators (old logic as fallback)
  const textSeparators = ["–", "-", "—", " to ", " - ", "~", "→", " đến "];

  for (const separator of textSeparators) {
    if (timeString.includes(separator)) {
      const parts = timeString.split(separator);
      if (parts.length === 2) {
        // Clean up the parts (remove non-time characters)
        let start = parts[0].trim().replace(/[^\d:h]/g, "");
        let end = parts[1].trim().replace(/[^\d:h]/g, "");

        // Convert "14h" → "14:00"
        start = start.replace(
          /(\d{1,2})h(\d{2})?/,
          (_, h, m) => `${h.padStart(2, "0")}:${m || "00"}`
        );
        end = end.replace(
          /(\d{1,2})h(\d{2})?/,
          (_, h, m) => `${h.padStart(2, "0")}:${m || "00"}`
        );

        // Validate format
        if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
          const result = { start, end };
          console.log("✅ Text separator parsed:", result);
          return result;
        }
      }
    }
  }

  console.warn("⚠️ Could not parse time range from:", timeString);
  return {
    start: "00:00",
    end: "23:59",
  };
}

export function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

// bookingUtils.ts

export function isOvernightPackage(timeSlot: TimeSlot): boolean {
  // Priority 1: Check database field
  if (timeSlot.isOvernight === true) {
    return true;
  }

  if (timeSlot.isOvernight === false) {
    return false;
  }

  // Priority 2: Pattern matching
  const timeStr = timeSlot.time.toLowerCase();

  // ✅ Nếu có dấu ngoặc với time range → KHÔNG PHẢI overnight thật
  // VD: "Qua đêm (14h-12h)" → Gói theo giờ, phải chọn giờ
  if (/\(\d+h?:?\d*\s*[-–]\s*\d+h?:?\d*\)/.test(timeStr)) {
    console.log("❌ Has time range in brackets → NOT true overnight");
    return false; // Có khung giờ → phải chọn giờ
  }

  // ✅ Explicit overnight keywords WITHOUT time range
  // VD: "Overnight Stay", "Qua đêm cố định"
  if (
    (timeStr.includes("overnight stay") ||
      timeStr.includes("qua đêm cố định")) &&
    !timeStr.includes("(") &&
    !timeStr.includes("-")
  ) {
    console.log("✅ Explicit overnight keyword → TRUE overnight");
    return true;
  }

  console.log("❌ Default → NOT true overnight");
  return false;
}
