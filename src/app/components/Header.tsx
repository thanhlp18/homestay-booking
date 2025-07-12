'use client';

import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💚</span>
          <span className={styles.logoText}>Localhome.vn</span>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Chỗ nghỉ</a>
          <a href="#" className={styles.navLink}>Tạo căn BookYng</a>
          <a href="#" className={styles.navLink}>Hỗ trợ / Khuyến mãi</a>
          <a href="#" className={styles.navLink}>Blog</a>
          <a href="#" className={styles.navLink}>Liên hệ</a>
        </nav>
        <button 
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#" className={styles.mobileNavLink}>Chỗ nghỉ</a>
          <a href="#" className={styles.mobileNavLink}>Tạo căn BookYng</a>
          <a href="#" className={styles.mobileNavLink}>Hỗ trợ / Khuyến mãi</a>
          <a href="#" className={styles.mobileNavLink}>Blog</a>
          <a href="#" className={styles.mobileNavLink}>Liên hệ</a>
        </div>
      )}
    </header>
  );
} 