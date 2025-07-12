'use client';

import Header from './components/Header';
import HomeCard from './components/HomeCard';
import DemoNotice from './components/DemoNotice';
import RoomBookingTable from './components/RoomBookingTable';
import { mockBranches, mockInitialBookings } from './data/bookingData';
import styles from "./page.module.css";

export default function Home() {
  // Handle booking submission
  const handleBookingSubmit = (selectedSlots: Array<{date: string; branchId: string; roomId: string; timeSlotId: string; price: number}>) => {
    console.log('Booking submitted:', selectedSlots);
    const totalSlots = selectedSlots.length;
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    
    alert(`Đặt phòng thành công!\n- Số khung giờ: ${totalSlots}\n- Tổng tiền: ${totalPrice.toLocaleString('vi-VN')}đ\n\nCảm ơn bạn đã sử dụng dịch vụ!`);
  };

  const featuredHomes = [
    {
      title: "Home - Đại Ngàn, Ninh Kiều",
      type: "SWIMMING POOL • CẦU RỒNG",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón, máy giặt, tủ lạnh, máy sấy tóc, view từ tầng cao nhìn ra sông Hàn",
      imageGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Home - Cái Khế, Ninh Kiều",
      type: "SWIMMING POOL • CẦU RỒNG",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón, máy giặt, tủ lạnh, máy sấy tóc, view từ tầng cao nhìn ra sông Hàn",
      imageGradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)"
    },
    {
      title: "Home - Hưng Phát, Ninh Kiều",
      type: "SWIMMING POOL • CẦU RỒNG",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón, máy giặt, tủ lạnh, máy sấy tóc, view từ tầng cao nhìn ra sông Hàn",
      imageGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  const canThoHomes = [
    {
      title: "Lovely",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón",
      price: "179.000 đ/tháng",
      originalPrice: "319.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Tasty 1",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón",
      price: "219.000 đ/tháng",
      originalPrice: "399.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)"
    },
    {
      title: "Secret Home",
      description: "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón",
      price: "179.000 đ/tháng",
      originalPrice: "319.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  const anGiangHomes = [
    {
      title: "Lola House",
      price: "399.000 đ/tháng",
      originalPrice: "539.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Happy",
      price: "399.000 đ/tháng",
      originalPrice: "599.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)"
    },
    {
      title: "Tế Tế Home",
      price: "399.000 đ/tháng",
      originalPrice: "595.000 đ/tháng",
      availability: "có thể nhận",
      imageGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  return (
    <div className={styles.page}>
      <DemoNotice />
      <Header />

      {/* Featured Homes Section */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>Danh sách tất cả các Home</h2>
        <div className={styles.homeGrid}>
          {featuredHomes.map((home, index) => (
            <HomeCard
              key={index}
              title={home.title}
              type={home.type}
              description={home.description}
              showDetails={true}
              imageGradient={home.imageGradient}
              branchSlug={index === 0 ? 'lovely' : index === 1 ? 'tasty-1' : 'secret-home'}
            />
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section className={styles.destinationsSection}>
        <h2 className={styles.sectionTitle}>Điểm đến</h2>
        <p className={styles.sectionSubtitle}>tại Tp.Cần Thơ</p>
        <div className={styles.destinationTabs}>
          <button className={styles.tab}>Đại Ngàn</button>
          <button className={styles.tab}>Cái Khế</button>
          <button className={styles.tab}>Hưng Phát</button>
          <button className={styles.tab}>Bến Ninh Kiều</button>
          <button className={styles.tab}>Hưng Phú</button>
          <button className={styles.tab}>Phạm Ngũ Lão</button>
          <button className={styles.tab}>Lê Hồng Phong</button>
          <button className={styles.tab}>Xuân Khánh</button>
          <button className={styles.tab}>Chu Văn An</button>
          <button className={styles.tab}>Khu khác trở lên</button>
          <button className={styles.tab}>Hưng Lợi</button>
        </div>

        <h3 className={styles.locationTitle}>Home - Đại Ngàn, Ninh Kiều</h3>
        <div className={styles.homeGrid}>
          {canThoHomes.map((home, index) => (
            <HomeCard
              key={index}
              title={home.title}
              description={home.description}
              price={home.price}
              originalPrice={home.originalPrice}
              availability={home.availability}
              showBooking={true}
              imageGradient={home.imageGradient}
              roomSlug={index === 0 ? 'lovely-room' : index === 1 ? 'tasty-1-room' : 'secret-home-room'}
            />
          ))}
        </div>
      </section>

      {/* An Giang Section */}
      <section className={styles.destinationsSection}>
        <h2 className={styles.sectionTitle}>Điểm đến</h2>
        <p className={styles.sectionSubtitle}>tại An Giang - Kiên Giang</p>
        <div className={styles.destinationTabs}>
          <button className={styles.tab}>Tỉy Đức 1, Rạch Sỏi</button>
          <button className={styles.tab}>Thị xã Kỳ Rạch Sỏi</button>
          <button className={styles.tab}>Mỹ Phước, Long Xuyên</button>
        </div>

        <h3 className={styles.locationTitle}>Home - Tỉy Đức 2, Rạch Giá</h3>
        <div className={styles.homeGrid}>
          {anGiangHomes.map((home, index) => (
            <HomeCard
              key={index}
              title={home.title}
              price={home.price}
              originalPrice={home.originalPrice}
              availability={home.availability}
              showBooking={true}
              imageGradient={home.imageGradient}
              roomSlug={index === 0 ? 'lovely-room' : index === 1 ? 'tasty-1-room' : 'secret-home-room'}
            />
          ))}
        </div>
      </section>

      {/* Interactive Room Booking Table */}
      <section className={styles.calendarSection}>
        <h2 className={styles.sectionTitle}>Lịch đặt phòng thời gian thực</h2>
        <p className={styles.sectionSubtitle}>Chọn khung giờ phù hợp với bạn</p>
        
        <RoomBookingTable
          branches={mockBranches}
          initialBookings={mockInitialBookings}
          onBookingSubmit={handleBookingSubmit}
          daysCount={7}
          slotPrice={50000}
        />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <span className={styles.logoIcon}>💚</span>
              <span className={styles.logoText}>Localhome.vn</span>
            </div>
            <p className={styles.footerText}>Hotline: 0932.620.930</p>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Chính sách</h4>
            <ul>
              <li>Chính sách bảo mật thông tin</li>
              <li>Chính sách khuyến mãi</li>
              <li>Chính sách bảo đảm</li>
              <li>Hướng dẫn sử dụng</li>
              <li>Hướng dẫn bàn giao</li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Hỗ trợ thanh toán</h4>
            <div className={styles.paymentMethods}>
              <span>💳 Visa</span>
              <span>💳 MasterCard</span>
              <span>💳 ATM</span>
              <span>💳 Napas</span>
              <span>💳 Momo</span>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>© Copyright Localhome.vn 2024</p>
        </div>
      </footer>
    </div>
  );
}
