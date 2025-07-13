'use client';

import Header from '../components/Header';
import Link from 'next/link';
import styles from './policies.module.css';

export default function PoliciesPage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chính sách</h1>
          <p className={styles.subtitle}>Tìm hiểu về các chính sách và quy định của chúng tôi</p>
        </div>

        <div className={styles.policiesGrid}>
          <Link href="/policies/privacy" className={styles.policyCard}>
            <div className={styles.policyIcon}>🔒</div>
            <h3 className={styles.policyTitle}>Chính sách bảo mật thông tin</h3>
            <p className={styles.policyDescription}>
              Tìm hiểu cách chúng tôi bảo vệ thông tin cá nhân của bạn
            </p>
          </Link>

          <Link href="/policies/promotion" className={styles.policyCard}>
            <div className={styles.policyIcon}>🎁</div>
            <h3 className={styles.policyTitle}>Chính sách khuyến mãi</h3>
            <p className={styles.policyDescription}>
              Các chương trình khuyến mãi và điều kiện áp dụng
            </p>
          </Link>

          <Link href="/policies/guarantee" className={styles.policyCard}>
            <div className={styles.policyIcon}>✅</div>
            <h3 className={styles.policyTitle}>Chính sách bảo đảm</h3>
            <p className={styles.policyDescription}>
              Cam kết chất lượng dịch vụ và bảo đảm quyền lợi khách hàng
            </p>
          </Link>
        </div>

        <div className={styles.guidesSection}>
          <h2 className={styles.sectionTitle}>Hướng dẫn sử dụng</h2>
          <div className={styles.policiesGrid}>
            <Link href="/guides/usage" className={styles.policyCard}>
              <div className={styles.policyIcon}>📖</div>
              <h3 className={styles.policyTitle}>Hướng dẫn sử dụng</h3>
              <p className={styles.policyDescription}>
                Hướng dẫn chi tiết cách sử dụng dịch vụ đặt phòng
              </p>
            </Link>

            <Link href="/guides/handover" className={styles.policyCard}>
              <div className={styles.policyIcon}>🔑</div>
              <h3 className={styles.policyTitle}>Hướng dẫn bàn giao</h3>
              <p className={styles.policyDescription}>
                Quy trình bàn giao phòng và nhận phòng
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 