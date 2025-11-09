'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import styles from './handover.module.css';

export default function HandoverGuidePage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/policies" className={styles.backLink}>← Quay lại</Link>
          <h1 className={styles.pageTitle}>Hướng dẫn bàn giao</h1>
          <p className={styles.subtitle}>Quy trình bàn giao phòng và nhận phòng</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Quy trình check-in</h2>
            <div className={styles.process}>
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🕐</div>
                <h3>Thời gian check-in</h3>
                <p>Check-in từ 14:00 - 22:00 hàng ngày</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>📋</div>
                <h3>Chuẩn bị giấy tờ</h3>
                <p>Mang theo CCCD và thông tin đặt phòng</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>✅</div>
                <h3>Xác minh thông tin</h3>
                <p>Nhân viên sẽ xác minh thông tin đặt phòng</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🔑</div>
                <h3>Nhận chìa khóa</h3>
                <p>Nhận chìa khóa và hướng dẫn sử dụng phòng</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Quy trình check-out</h2>
            <div className={styles.process}>
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🕐</div>
                <h3>Thời gian check-out</h3>
                <p>Check-out trước 12:00 ngày hôm sau</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🧹</div>
                <h3>Dọn dẹp phòng</h3>
                <p>Đảm bảo phòng sạch sẽ, gọn gàng</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🔍</div>
                <h3>Kiểm tra phòng</h3>
                <p>Nhân viên sẽ kiểm tra tình trạng phòng</p>
              </div>
              
              <div className={styles.processStep}>
                <div className={styles.processIcon}>🔑</div>
                <h3>Trả chìa khóa</h3>
                <p>Trả chìa khóa và hoàn tất thủ tục</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Quy định sử dụng phòng</h2>
            <div className={styles.rules}>
              <div className={styles.rule}>
                <h3>✅ Được phép</h3>
                <ul>
                  <li>Sử dụng các tiện nghi có sẵn trong phòng</li>
                  <li>Mang theo đồ dùng cá nhân</li>
                  <li>Liên hệ nhân viên khi cần hỗ trợ</li>
                  <li>Giữ gìn vệ sinh chung</li>
                </ul>
              </div>
              
              <div className={styles.rule}>
                <h3>❌ Không được phép</h3>
                <ul>
                  <li>Hút thuốc trong phòng</li>
                  <li>Mang thú cưng vào phòng</li>
                  <li>Làm ồn quá mức</li>
                  <li>Phá hoại tài sản</li>
                  <li>Cho người khác vào phòng</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Tiện nghi và dịch vụ</h2>
            <div className={styles.amenities}>
              <div className={styles.amenity}>
                <h3>🛏️ Tiện nghi cơ bản</h3>
                <ul>
                  <li>Giường ngủ và chăn gối</li>
                  <li>Điều hòa nhiệt độ</li>
                  <li>TV và WiFi miễn phí</li>
                  <li>Phòng tắm riêng</li>
                  <li>Tủ quần áo</li>
                </ul>
              </div>
              
              <div className={styles.amenity}>
                <h3>🍽️ Dịch vụ bổ sung</h3>
                <ul>
                  <li>Dịch vụ dọn phòng hàng ngày</li>
                  <li>Thay khăn tắm theo yêu cầu</li>
                  <li>Hỗ trợ đặt đồ ăn</li>
                  <li>Dịch vụ giặt ủi</li>
                  <li>Bảo vệ 24/7</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Lưu ý quan trọng</h2>
            <div className={styles.importantNotes}>
              <div className={styles.note}>
                <h3>⏰ Thời gian</h3>
                <p>Check-in: 14:00 - 22:00 | Check-out: Trước 12:00</p>
              </div>
              
              <div className={styles.note}>
                <h3>🆔 Giấy tờ</h3>
                <p>Luôn mang theo CCCD khi check-in và check-out</p>
              </div>
              
              <div className={styles.note}>
                <h3>💰 Đặt cọc</h3>
                <p>Có thể yêu cầu đặt cọc tùy theo tình hình</p>
              </div>
              
              <div className={styles.note}>
                <h3>📞 Liên hệ</h3>
                <p>Liên hệ ngay nếu có vấn đề với phòng</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Thông tin liên hệ</h2>
            <p className={styles.contactTitle}>Để được hỗ trợ về bàn giao phòng, vui lòng liên hệ:</p>
            <div className={styles.contactInfo}>
              <p><strong>Hotline:</strong> 0932000000</p>
              <p><strong>Email:</strong> handover@O Ni Homestay.vn</p>
              <p><strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
              <p><strong>Hỗ trợ khẩn cấp:</strong> 24/7</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 