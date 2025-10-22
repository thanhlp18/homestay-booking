'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import styles from './privacy.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/policies" className={styles.backLink}>← Quay lại</Link>
          <h1 className={styles.title}>Chính sách bảo mật thông tin</h1>
          <p className={styles.lastUpdated}>Cập nhật lần cuối: 15/01/2025</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Thông tin chúng tôi thu thập</h2>
            <p>Chúng tôi thu thập các thông tin sau đây khi bạn sử dụng dịch vụ:</p>
            <ul>
              <li>Thông tin cá nhân: Họ tên, số điện thoại, email, CCCD</li>
              <li>Thông tin đặt phòng: Ngày đặt, thời gian, số khách</li>
              <li>Thông tin thanh toán: Phương thức thanh toán, số tiền</li>
              <li>Thông tin thiết bị: IP address, trình duyệt, hệ điều hành</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Mục đích sử dụng thông tin</h2>
            <p>Thông tin được sử dụng để:</p>
            <ul>
              <li>Xử lý đặt phòng và thanh toán</li>
              <li>Liên lạc với khách hàng về đặt phòng</li>
              <li>Cải thiện chất lượng dịch vụ</li>
              <li>Tuân thủ quy định pháp luật</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Bảo mật thông tin</h2>
            <p>Chúng tôi cam kết bảo vệ thông tin của bạn bằng cách:</p>
            <ul>
              <li>Sử dụng mã hóa SSL/TLS cho dữ liệu truyền tải</li>
              <li>Lưu trữ an toàn trong hệ thống được bảo vệ</li>
              <li>Giới hạn quyền truy cập thông tin</li>
              <li>Thường xuyên cập nhật biện pháp bảo mật</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Chia sẻ thông tin</h2>
            <p>Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba, trừ khi:</p>
            <ul>
              <li>Có sự đồng ý của bạn</li>
              <li>Để thực hiện dịch vụ (như thanh toán)</li>
              <li>Tuân thủ yêu cầu pháp lý</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Quyền của khách hàng</h2>
            <p>Bạn có quyền:</p>
            <ul>
              <li>Truy cập và xem thông tin cá nhân</li>
              <li>Yêu cầu cập nhật hoặc sửa đổi thông tin</li>
              <li>Yêu cầu xóa thông tin cá nhân</li>
              <li>Từ chối nhận thông tin quảng cáo</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Liên hệ</h2>
            <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> privacy@O Ni Homestay.vn</p>
              <p><strong>Điện thoại:</strong> 0932000000</p>
              <p><strong>Địa chỉ:</strong> Số B1 07, chung cư Cadif - HH1, Hưng Phú, Q. Cái Răng, TP. Cần Thơ</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 