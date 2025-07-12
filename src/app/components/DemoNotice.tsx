'use client';

import { useState } from 'react';
import styles from './DemoNotice.module.css';

export default function DemoNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={styles.demoNotice}>
      <div className={styles.noticeContent}>
        <span className={styles.demoIcon}>🚀</span>
        <div className={styles.demoText}>
          <strong>Demo Mode</strong>
          <p>This is a demo booking app. All bookings are simulated for demonstration purposes.</p>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
} 