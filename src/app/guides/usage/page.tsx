'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import styles from './usage.module.css';

export default function UsageGuidePage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/policies" className={styles.backLink}>← Quay lại</Link>
          <h1 className={styles.title}>Hướng dẫn sử dụng</h1>
          <p className={styles.subtitle}>Hướng dẫn chi tiết cách sử dụng dịch vụ đặt phòng</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Tìm kiếm và chọn phòng</h2>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Truy cập website</h3>
                <p>Mở trình duyệt và truy cập <strong>O Ni Homestay.vn</strong></p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Chọn chi nhánh</h3>
                <p>Chọn chi nhánh phù hợp với nhu cầu của bạn</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Xem danh sách phòng</h3>
                <p>Xem thông tin chi tiết về các phòng có sẵn</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>2. Đặt phòng</h2>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Chọn phòng và thời gian</h3>
                <p>Chọn phòng mong muốn và thời gian sử dụng</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Điền thông tin cá nhân</h3>
                <p>Nhập đầy đủ thông tin cá nhân theo yêu cầu</p>
                <ul>
                  <li>Họ và tên (bắt buộc)</li>
                  <li>Số điện thoại (bắt buộc)</li>
                  <li>Email (không bắt buộc)</li>
                  <li>Số CCCD (bắt buộc)</li>
                  <li>Số khách (bắt buộc)</li>
                </ul>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Chọn phương thức thanh toán</h3>
                <p>Chọn một trong các phương thức thanh toán:</p>
                <ul>
                  <li>Tiền mặt</li>
                  <li>Chuyển khoản ngân hàng</li>
                  <li>Thẻ tín dụng/ghi nợ</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>3. Thanh toán</h2>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Xác nhận thông tin</h3>
                <p>Kiểm tra lại thông tin đặt phòng trước khi thanh toán</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>8</div>
              <div className={styles.stepContent}>
                <h3>Thực hiện thanh toán</h3>
                <p>Thực hiện thanh toán theo phương thức đã chọn</p>
                <div className={styles.paymentMethods}>
                  <div className={styles.paymentMethod}>
                    <h4>💳 Thẻ tín dụng/ghi nợ</h4>
                    <p>Thanh toán ngay lập tức qua cổng thanh toán</p>
                  </div>
                  <div className={styles.paymentMethod}>
                    <h4>🏦 Chuyển khoản</h4>
                    <p>Chuyển khoản theo thông tin ngân hàng được cung cấp</p>
                  </div>
                  <div className={styles.paymentMethod}>
                    <h4>💵 Tiền mặt</h4>
                    <p>Thanh toán tại chi nhánh khi check-in</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>4. Xác nhận đặt phòng</h2>
            <div className={styles.step}>
              <div className={styles.stepNumber}>9</div>
              <div className={styles.stepContent}>
                <h3>Nhận xác nhận</h3>
                <p>Sau khi thanh toán thành công, bạn sẽ nhận được:</p>
                <ul>
                  <li>Email xác nhận (nếu có cung cấp email)</li>
                  <li>SMS xác nhận đến số điện thoại</li>
                  <li>Mã đặt phòng để tra cứu</li>
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>5. Lưu ý quan trọng</h2>
            <div className={styles.importantNotes}>
              <div className={styles.note}>
                <h3>⚠️ Thời gian giữ phòng</h3>
                <p>Phòng được giữ trong 5 phút sau khi đặt. Vui lòng thanh toán kịp thời.</p>
              </div>
              
              <div className={styles.note}>
                <h3>📱 Thông tin liên hệ</h3>
                <p>Đảm bảo số điện thoại chính xác để nhận thông báo quan trọng.</p>
              </div>
              
              <div className={styles.note}>
                <h3>🆔 Giấy tờ tùy thân</h3>
                <p>Mang theo CCCD khi check-in để xác minh thông tin.</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>6. Hỗ trợ khách hàng</h2>
            <p>Nếu gặp khó khăn trong quá trình đặt phòng, vui lòng liên hệ:</p>
            <div className={styles.contactInfo}>
              <p><strong>Hotline:</strong> 0932000000</p>
              <p><strong>Email:</strong> support@O Ni Homestay.vn</p>
              <p><strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 