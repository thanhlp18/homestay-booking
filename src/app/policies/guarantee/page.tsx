'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import styles from './guarantee.module.css';

export default function GuaranteePolicyPage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/policies" className={styles.backLink}>← Quay lại</Link>
          <h1 className={styles.title}>Chính sách bảo đảm</h1>
          <p className={styles.lastUpdated}>Cập nhật lần cuối: 15/01/2025</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Cam kết chất lượng</h2>
            <p>Chúng tôi cam kết cung cấp dịch vụ chất lượng cao với các tiêu chuẩn sau:</p>
            <ul>
              <li>Phòng sạch sẽ, được vệ sinh kỹ lưỡng trước mỗi lượt khách</li>
              <li>Thiết bị và tiện nghi hoạt động tốt</li>
              <li>Dịch vụ khách hàng 24/7</li>
              <li>Đảm bảo an toàn và bảo mật</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Bảo đảm đặt phòng</h2>
            <div className={styles.guaranteeTypes}>
              <div className={styles.guaranteeType}>
                <h3>✅ Xác nhận ngay lập tức</h3>
                <p>Nhận xác nhận đặt phòng ngay sau khi thanh toán thành công</p>
              </div>
              
              <div className={styles.guaranteeType}>
                <h3>🔄 Hoàn tiền 100%</h3>
                <p>Hoàn tiền đầy đủ nếu không thể cung cấp phòng như đã đặt</p>
              </div>
              
              <div className={styles.guaranteeType}>
                <h3>📞 Hỗ trợ 24/7</h3>
                <p>Đội ngũ hỗ trợ khách hàng sẵn sàng hỗ trợ mọi lúc</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>3. Chính sách hoàn tiền</h2>
            <p>Chúng tôi cam kết hoàn tiền trong các trường hợp sau:</p>
            <ul>
              <li>Phòng không đúng như mô tả trên website</li>
              <li>Thiết bị, tiện nghi bị hỏng không thể sử dụng</li>
              <li>Vấn đề vệ sinh nghiêm trọng</li>
              <li>Không thể cung cấp phòng do lỗi hệ thống</li>
              <li>Hủy phòng trước 24h so với thời gian check-in</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Quy trình khiếu nại</h2>
            <ol>
              <li>Liên hệ ngay với chúng tôi qua hotline hoặc email</li>
              <li>Cung cấp thông tin chi tiết về vấn đề gặp phải</li>
              <li>Chúng tôi sẽ điều tra và phản hồi trong vòng 2 giờ</li>
              <li>Nếu khiếu nại hợp lệ, sẽ được xử lý theo chính sách bảo đảm</li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2>5. Giới hạn trách nhiệm</h2>
            <p>Chúng tôi không chịu trách nhiệm trong các trường hợp:</p>
            <ul>
              <li>Thiên tai, bão lũ, sự kiện bất khả kháng</li>
              <li>Khách hàng vi phạm quy định sử dụng</li>
              <li>Thiệt hại do lỗi của khách hàng</li>
              <li>Khiếu nại sau 24h kể từ thời điểm check-out</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Bảo hiểm và an toàn</h2>
            <p>Chúng tôi đảm bảo:</p>
            <ul>
              <li>Bảo hiểm trách nhiệm dân sự cho khách hàng</li>
              <li>Hệ thống an ninh 24/7</li>
              <li>Bảo vệ thông tin cá nhân khách hàng</li>
              <li>Tuân thủ các quy định về an toàn phòng cháy chữa cháy</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Liên hệ khiếu nại</h2>
            <p>Để khiếu nại hoặc yêu cầu hỗ trợ, vui lòng liên hệ:</p>
            <div className={styles.contactInfo}>
              <p><strong>Hotline khiếu nại:</strong> 0932000000</p>
              <p><strong>Email:</strong> support@O Ni Homestay.vn</p>
              <p><strong>Thời gian phản hồi:</strong> Trong vòng 2 giờ</p>
              <p><strong>Giờ làm việc:</strong> 24/7</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 