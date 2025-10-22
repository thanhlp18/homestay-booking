import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.footerLogo}>
            {/* <span className={styles.logoIcon}>💚</span> */}
            <img src="transparent-bg.png" alt="" className={styles.logoImg} />

            <span className={styles.logoText}>O Ni Homestay</span>
          </div>
          <div className={styles.footerSubtext}>
            Homestay và lưu trú tại Việt Nam
          </div>
          <div className={styles.hotline}>Hotline: 0777.013.317</div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Chính sách</h3>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/policies/privacy">Chính sách bảo mật thông tin</Link>
            </li>
            <li>
              <Link href="/policies/promotion">Chính sách khuyến mãi</Link>
            </li>
            <li>
              <Link href="/policies/guarantee">Chính sách bảo đảm</Link>
            </li>
            <li>
              <Link href="/guides/usage">Hướng dẫn sử dụng</Link>
            </li>
            <li>
              <Link href="/guides/handover">Hướng dẫn bàn giao</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Hỗ trợ thanh toán</h3>
          <div className={styles.paymentMethods}>
            <Image
              height={31.2}
              width={50}
              src="/images/payment/visa.png"
              alt="Visa"
            />
            <Image
              height={31.2}
              width={50}
              src="/images/payment/master.png"
              alt="Master card"
            />
            <Image
              height={31.2}
              width={50}
              src="/images/payment/atm.png"
              alt="ATM"
            />
            <Image
              height={31.2}
              width={50}
              src="/images/payment/momo.png"
              alt="MOMO"
            />
            <Image
              height={31.2}
              width={50}
              src="/images/payment/vnpay.png"
              alt="VNPay"
            />
            <Image
              height={31.2}
              width={50}
              src="/images/payment/vietqr.png"
              alt="Viet QR"
            />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerText}>
          Hộ kinh doanh O Ni Homestay <br /> Địa chỉ: 9/4 Điềm Phùng Thị, phường
          Vỹ Dạ, Hue, Vietnam <br /> Mã số hộ kinh doanh: 00000000000 - 002 do
          Phòng Tài Chính - Kế Hoạch Quận Cái Răng cấp lần đầu ngày 13/11/2024.
          <br /> Điện thoại: 0777.013.317. <br />
          Chủ trách nhiệm nội dung: Lê Phước Thành
        </p>
      </div>

      <div className={styles.footerCopyright}>
        <p>© Copyright LocalHome 2025</p>
        <div className={styles.socialIcons}>
          <Link
            href="https://www.facebook.com/profile.php?id=61576760382745"
            className={styles.socialIcon}
            target="_blank"
          >
            f
          </Link>
          <Link
            href="https://www.instagram.com/onihomestay?igsh=dzcycGMzb213eXow"
            target="_blank"
            className={styles.socialIcon}
          >
            <img
              src="/instagram.webp"
              alt=""
              className={styles.instagramIcon}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
