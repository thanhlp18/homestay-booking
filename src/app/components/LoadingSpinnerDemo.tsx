'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from './LoadingSpinnerDemo.module.css';

export default function LoadingSpinnerDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const handleShowDemo = () => {
    setShowDemo(true);
    setTimeout(() => setShowDemo(false), 3000);
  };

  return (
    <div className={styles.demoContainer}>
      <h2 className={styles.demoTitle}>LoadingSpinner Component Demo</h2>
      
      <div className={styles.spinnerGrid}>
        <div className={styles.spinnerCard}>
          <h3>Small Size</h3>
          <LoadingSpinner size="small" text="Loading..." />
        </div>
        
        <div className={styles.spinnerCard}>
          <h3>Medium Size (Default)</h3>
          <LoadingSpinner text="Đang tải dữ liệu..." />
        </div>
        
        <div className={styles.spinnerCard}>
          <h3>Large Size</h3>
          <LoadingSpinner size="large" text="Loading large..." />
        </div>
        
        <div className={styles.spinnerCard}>
          <h3>Without Text</h3>
          <LoadingSpinner size="medium" />
        </div>
      </div>
      
      <div className={styles.demoActions}>
        <button onClick={handleShowDemo} className={styles.demoButton}>
          Show Full Page Loading Demo
        </button>
      </div>
      
      {showDemo && (
        <div className={styles.fullPageDemo}>
          <LoadingSpinner text="Đang tải trang..." />
        </div>
      )}
    </div>
  );
} 