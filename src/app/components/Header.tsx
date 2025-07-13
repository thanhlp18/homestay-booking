'use client';

import styles from './Header.module.css';
import Link from 'next/link';

export default function Header() {

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link className={styles.logo} href="/">
          <span className={styles.logoIcon}>💚</span>
          <span className={styles.logoText}>Minhome.vn</span>
        </Link>
       </div>
    </header>
  );
} 