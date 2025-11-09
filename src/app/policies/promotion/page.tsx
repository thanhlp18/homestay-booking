"use client";

import Header from "../../components/Header";
import Link from "next/link";
import styles from "./promotion.module.css";

export default function PromotionPolicyPage() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/policies" className={styles.backLink}>
            ← Quay lại
          </Link>
          <h1 className={styles.pageTitle}>Chính sách khuyến mãi</h1>
          <p className={styles.lastUpdated}>Cập nhật lần cuối: 15/01/2025</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Tổng quan</h2>
            <p>
              Chính sách khuyến mãi này quy định các điều kiện và điều khoản áp
              dụng cho tất cả các chương trình khuyến mãi, giảm giá và ưu đãi
              được cung cấp bởi Minhome.vn.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Các loại khuyến mãi</h2>
            <div className={styles.promotionTypes}>
              <div className={styles.promotionType}>
                <h3>🎁 Khuyến mãi mới</h3>
                <p>Giảm giá cho khách hàng đặt phòng lần đầu</p>
                <ul>
                  <li>Giảm 10% cho đặt phòng đầu tiên</li>
                  <li>Áp dụng cho tất cả phòng</li>
                  <li>Không áp dụng cho ngày lễ, cuối tuần</li>
                </ul>
              </div>

              <div className={styles.promotionType}>
                <h3>👥 Khuyến mãi nhóm</h3>
                <p>Ưu đãi đặc biệt cho nhóm từ 4 người trở lên</p>
                <ul>
                  <li>Giảm 15% cho nhóm từ 4-6 người</li>
                  <li>Giảm 20% cho nhóm từ 7 người trở lên</li>
                  <li>Áp dụng cho đặt phòng cùng thời gian</li>
                </ul>
              </div>

              <div className={styles.promotionType}>
                <h3>📅 Khuyến mãi theo mùa</h3>
                <p>Các chương trình khuyến mãi theo thời điểm trong năm</p>
                <ul>
                  <li>Giảm giá mùa thấp điểm (tháng 3-8)</li>
                  <li>Ưu đãi đặc biệt dịp lễ, Tết</li>
                  <li>Khuyến mãi cuối tuần</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Điều kiện áp dụng</h2>
            <ul>
              <li>
                Khuyến mãi chỉ áp dụng cho đặt phòng trực tiếp qua website
              </li>
              <li>Không thể kết hợp nhiều khuyến mãi cùng lúc</li>
              <li>Khuyến mãi có thể bị hủy bỏ mà không cần báo trước</li>
              <li>Áp dụng theo điều kiện cụ thể của từng chương trình</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Quy trình áp dụng</h2>
            <ol>
              <li>Chọn phòng và thời gian phù hợp</li>
              <li>Hệ thống tự động tính toán khuyến mãi</li>
              <li>Xác nhận thông tin đặt phòng</li>
              <li>Thanh toán theo giá đã được giảm</li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Hạn chế và loại trừ</h2>
            <p>Khuyến mãi không áp dụng trong các trường hợp:</p>
            <ul>
              <li>Đặt phòng qua đại lý hoặc bên thứ ba</li>
              <li>Ngày lễ, Tết và các dịp đặc biệt</li>
              <li>Phòng đã được đặt trước</li>
              <li>Khách hàng vi phạm quy định sử dụng</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Thay đổi và hủy bỏ</h2>
            <p>Chúng tôi có quyền:</p>
            <ul>
              <li>Thay đổi điều kiện khuyến mãi bất cứ lúc nào</li>
              <li>Hủy bỏ chương trình khuyến mãi</li>
              <li>Từ chối áp dụng cho trường hợp đặc biệt</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Liên hệ</h2>
            <p>Để biết thêm thông tin về khuyến mãi, vui lòng liên hệ:</p>
            <div className={styles.contactInfo}>
              <p>
                <strong>Hotline:</strong> 0932000000
              </p>
              <p>
                <strong>Email:</strong> promotion@O Ni Homestay.vn
              </p>
              <p>
                <strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
