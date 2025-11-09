// ConflictWarning.tsx
import styles from "./ConflictWarning.module.css";

export interface TimeConflict {
  date: string;
  conflicts: Array<{
    slot1: any;
    slot2: any;
    overlapMessage: string;
  }>;
}

interface ConflictWarningProps {
  conflicts: TimeConflict[];
}

export default function ConflictWarning({ conflicts }: ConflictWarningProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className={styles.warningContainer}>
      <div className={styles.warningHeader}>
        <span className={styles.warningIcon}>⚠️</span>
        <h4 className={styles.warningTitle}>Cảnh báo xung đột lịch</h4>
      </div>

      {conflicts.map((dateConflict, idx) => (
        <div key={idx} className={styles.conflictGroup}>
          <p className={styles.conflictDate}>
            <strong>Ngày:</strong>{" "}
            {new Date(dateConflict.date).toLocaleDateString("vi-VN")}
          </p>

          {dateConflict.conflicts.map((conflict, cidx) => (
            <div key={cidx} className={styles.conflictItem}>
              <p className={styles.conflictMessage}>
                🔴 {conflict.overlapMessage}
              </p>
              <p className={styles.conflictHint}>
                Hai khung giờ này bị trùng lặp. Vui lòng điều chỉnh thời gian check-in.
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
