import nodemailer from "nodemailer";

// TypeScript interfaces for booking data
interface BookingData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: number;
  notes?: string;
  paymentMethod: "CASH" | "TRANSFER" | "CARD";
  room: string;
  location: string;
  totalPrice: number;
  basePrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  checkInDateTime?: Date | string;
  checkOutDateTime?: Date | string;
  checkInTime?: string; // e.g., "14:00"
  checkOutTime?: string; // e.g., "12:00"
  branchAddress?: string;
  googleMapUrl?: string;
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Email templates
export const emailTemplates = {
  bookingConfirmation: (bookingData: BookingData) => {
    const paymentMethodText =
      bookingData.paymentMethod === "CASH"
        ? "Tiền mặt"
        : bookingData.paymentMethod === "TRANSFER"
        ? "Đã chuyển khoản"
        : "Thẻ";

    // Format dates if available
    const formatDate = (date?: Date | string) => {
      if (!date) return "Chưa xác định";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      subject: `[Chờ thanh toán] Xác nhận đặt phòng - ${bookingData.room} | O Ni Homestay`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-bottom: 3px solid #667eea;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">O Ni Homestay</h1>
          </div>

          <div style="background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%); color: white; padding: 15px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">⏳ YÊU CẦU ĐẶT PHÒNG ĐÃ ĐƯỢC GHI NHẬN</h2>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
            <p>Cảm ơn bạn đã lựa chọn O Ni Homestay cho kỳ nghỉ của mình tại Huế 💛</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt phòng của bạn. Dưới đây là thông tin chi tiết:</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border: 2px solid #ff9800;">
              <h3 style="color: #ff9800; margin-top: 0;">🏡 Thông tin đặt phòng</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Mã đặt phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày nhận phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(
                    bookingData.checkInDateTime
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày trả phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(
                    bookingData.checkOutDateTime
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Loại phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                    bookingData.room
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Số khách:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                    bookingData.guests
                  } người</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Tổng tiền:</strong></td>
                  <td style="padding: 8px 0;"><strong style="color: #ff9800; font-size: 18px;">${bookingData.totalPrice?.toLocaleString(
                    "vi-VN"
                  )} đ</strong></td>
                </tr>
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #856404; margin-top: 0;">💳 HƯỚNG DẪN THANH TOÁN</h3>
              ${
                bookingData.paymentMethod === "TRANSFER"
                  ? `
              <p style="margin: 5px 0; color: #856404; line-height: 1.6;">
                Để hoàn tất đặt phòng, vui lòng thanh toán qua chuyển khoản ngân hàng:
              </p>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
                  <strong>Ngân hàng TPBank</strong><br/>
                  Số TK: <strong>43218082002</strong><br/>
                  Chủ TK: <strong>Lê Phước Thành</strong><br/>
                  Số tiền: <strong style="color: #ff9800; font-size: 18px;">${bookingData.totalPrice?.toLocaleString("vi-VN")} đ</strong><br/>
                  Nội dung: <strong style="color: #ff9800;">${bookingData.id}</strong>
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://onihomestay.com"}/payment?bookingIds=${bookingData.id}"
                   style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 10px;">
                  🔗 Mở trang thanh toán QR
                </a>
                <p style="margin: 15px 0 0 0; color: #666; font-size: 13px;">
                  Trang thanh toán có mã QR để bạn quét trực tiếp bằng app ngân hàng
                </p>
              </div>
              <p style="margin: 10px 0 5px 0; color: #856404; font-size: 14px;">
                <em>💡 Lưu ý: Vui lòng ghi đúng nội dung chuyển khoản <strong>${bookingData.id}</strong> để hệ thống tự động xác nhận thanh toán</em>
              </p>
              `
                  : bookingData.paymentMethod === "CASH"
                  ? `
              <p style="margin: 5px 0; color: #856404; line-height: 1.6;">
                Bạn đã chọn hình thức thanh toán bằng <strong>tiền mặt khi nhận phòng</strong>.
              </p>
              <p style="margin: 10px 0; color: #856404; font-size: 14px;">
                Vui lòng chuẩn bị đầy đủ số tiền <strong style="color: #ff9800;">${bookingData.totalPrice?.toLocaleString("vi-VN")} đ</strong> khi đến homestay.
              </p>
              `
                  : `
              <p style="margin: 5px 0; color: #856404; line-height: 1.6;">
                Bạn đã chọn hình thức thanh toán bằng thẻ.
              </p>
              `
              }
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1565c0; margin-top: 0;">📋 BƯỚC TIẾP THEO</h3>
              <p style="margin: 5px 0; color: #1565c0; line-height: 1.6;">
                Sau khi chúng tôi xác nhận thanh toán thành công, bạn sẽ nhận được email xác nhận chi tiết bao gồm:
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0; line-height: 1.8;">
                <li>Hướng dẫn check-in chi tiết</li>
                <li>Mã vào cửa chính (gửi qua Zalo/SMS)</li>
                <li>Nội quy homestay</li>
                <li>Thông tin liên hệ hỗ trợ</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">📚 CẨM NANG DU LỊCH HUẾ</h3>
              <p style="margin: 5px 0; color: #555;">Để chuẩn bị cho chuyến đi, hãy xem ngay cẩm nang du lịch Huế của chúng tôi:</p>
              <p style="margin: 10px 0;">
                <a href="https://drive.google.com/file/d/1waKwKk9inxFd2TdWYCdJ0X0zfT4Ju2pf/view?usp=drive_link" style="color: #667eea; text-decoration: none; font-weight: bold;">
                  📖 Cẩm nang du lịch Huế.pdf
                </a>
              </p>
              <p style="margin: 5px 0; color: #666; font-size: 14px; line-height: 1.6;">
                Tài liệu bao gồm: Điểm tham quan nổi tiếng, quán ăn ngon, kinh nghiệm du lịch Huế và nhiều thông tin hữu ích khác! ✨
              </p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">📞 LIÊN HỆ HỖ TRỢ</h3>
              <p style="color: #666; margin: 5px 0;">Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi:</p>
              <p style="margin: 8px 0;"><strong>Sđt/Zalo:</strong> <a href="tel:0941571155" style="color: #667eea; text-decoration: none;">094.157.1155</a></p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:onihomestay@gmail.com" style="color: #667eea; text-decoration: none;">onihomestay@gmail.com</a></p>
            </div>

            <div style="margin: 20px 0; text-align: center; padding: 15px; background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); border-radius: 5px;">
              <p style="color: #2d3436; font-size: 16px; margin: 0;">
                Cảm ơn bạn đã tin tưởng lựa chọn O Ni Homestay! 💛<br/>
                Chúng tôi rất mong được đón tiếp bạn tại Huế.
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">&copy; 2024 O Ni Homestay - Hệ thống đặt phòng homestay</p>
          </div>
        </div>
      `,
    };
  },

  adminNotification: (bookingData: BookingData) => {
    const formatDate = (date?: Date | string) => {
      if (!date) return "Chưa xác định";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      subject: `🔔 Đặt phòng mới - ${bookingData.room} | ${bookingData.fullName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-bottom: 3px solid #667eea;">
          <h1 style="margin: 0; color: #333; font-size: 24px;">O Ni Homestay</h1>
        </div>

        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">🔔 THÔNG BÁO ĐẶT PHÒNG MỚI</h2>
        </div>

        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Đặt phòng mới cần xử lý</h2>
          <p>Có một đơn đặt phòng mới cần được xem xét và phê duyệt.</p>

          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">📋 Thông tin đặt phòng</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Mã đặt phòng:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày nhận phòng:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkInDateTime)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày trả phòng:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkOutDateTime)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phòng:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.room}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Địa điểm:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Số khách:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.guests} người</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tổng tiền:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong style="color: #dc3545;">${bookingData.totalPrice?.toLocaleString("vi-VN")} đ</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Phương thức thanh toán:</strong></td>
                <td style="padding: 8px 0;">${
                  bookingData.paymentMethod === "CASH"
                    ? "Tiền mặt"
                    : bookingData.paymentMethod === "TRANSFER"
                    ? "Chuyển khoản"
                    : "Thẻ"
                }</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">👤 Thông tin khách hàng</h3>
            <p style="margin: 5px 0;"><strong>Họ tên:</strong> ${bookingData.fullName}</p>
            <p style="margin: 5px 0;"><strong>Điện thoại:</strong> <a href="tel:${bookingData.phone}" style="color: #667eea; text-decoration: none;">${bookingData.phone}</a></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${bookingData.email}" style="color: #667eea; text-decoration: none;">${bookingData.email}</a></p>
            <p style="margin: 5px 0;"><strong>CCCD:</strong> ${bookingData.cccd}</p>
            ${bookingData.notes ? `<p style="margin: 5px 0;"><strong>Ghi chú:</strong> ${bookingData.notes}</p>` : ""}
          </div>

          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">⚡ Hành động cần thực hiện</h3>
            <p style="margin: 0; color: #155724;">Vui lòng đăng nhập vào admin panel để xem chi tiết và phê duyệt đơn đặt phòng này.</p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Xem trong Admin Panel
            </a>
          </div>
        </div>

        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">&copy; 2024 O Ni Homestay - Hệ thống đặt phòng homestay</p>
        </div>
      </div>
    `,
    };
  },

  bookingApproval: (bookingData: BookingData) => {
    const paymentMethodText =
      bookingData.paymentMethod === "CASH"
        ? "Tiền mặt"
        : bookingData.paymentMethod === "TRANSFER"
        ? "Đã chuyển khoản"
        : "Thẻ";

    const formatDate = (date?: Date | string) => {
      if (!date) return "Chưa xác định";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      subject: `Đặt phòng thành công - ${bookingData.room} | O Ni Homestay`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">O Ni Homestay</h1>
          </div>

          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">✅ ĐẶT PHÒNG THÀNH CÔNG</h2>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
            <p>Chúc mừng! Đơn đặt phòng của bạn đã được phê duyệt 🎉</p>
            <p>Cảm ơn bạn đã lựa chọn O Ni Homestay cho kỳ nghỉ của mình tại Huế 💛</p>
            <p>Dưới đây là thông tin chi tiết:</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">🏡 Thông tin đặt phòng</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Mã đặt phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày nhận phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkInDateTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày trả phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkOutDateTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Số khách:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.guests} người</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Loại phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.room}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tổng tiền:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.totalPrice?.toLocaleString("vi-VN")} đ</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Hình thức thanh toán:</strong></td>
                  <td style="padding: 8px 0;">${paymentMethodText}</td>
                </tr>
              </table>

              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f0f0f0;">
                <table style="width: 100%;">
                  <tr>
                    <td style="width: 50%; padding: 5px 0;"><strong>Giờ nhận phòng:</strong><br/>${bookingData.checkInTime || "14:00"}</td>
                    <td style="width: 50%; padding: 5px 0;"><strong>Giờ trả phòng:</strong><br/>${bookingData.checkOutTime || "12:00"}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 15px;">
                <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${bookingData.branchAddress || "9/4 Điềm Phùng Thị, phường Vỹ Dạ, thành phố Huế"}</p>
                ${
                  bookingData.googleMapUrl
                    ? `<p style="margin: 5px 0;"><a href="${bookingData.googleMapUrl}" style="color: #28a745; text-decoration: none;">📍 Xem trên Google Maps</a></p>`
                    : `<p style="margin: 5px 0;"><a href="https://maps.app.goo.gl/vL3pG4wCuAH4Nwyn6?g_st=ipc" style="color: #28a745; text-decoration: none;">📍 Xem trên Google Maps</a></p>`
                }
              </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">🗝️ HƯỚNG DẪN CHECK-IN</h3>

              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0 10px 0;"><strong style="color: #555;">Bước 1: Vào cửa chính</strong></p>
                <p style="margin: 5px 0; color: #666; line-height: 1.6;">
                  Khi đến O Ni, sử dụng mã điện tử được gửi qua số điện thoại/Zalo sau khi đặt phòng thành công.
                </p>
                <p style="margin: 5px 0; color: #666; line-height: 1.6;"><strong>Cách nhập mã:</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px; color: #666;">
                  <li>Chạm vào màn hình để hiển thị số</li>
                  <li>Nhập mã và nhấn #</li>
                </ul>
                <p style="margin: 10px 0; padding: 10px; background: #fff3cd; border-left: 3px solid #ffc107; color: #856404; font-size: 14px;">
                  <em>*Nếu không nhận được mã, vui lòng liên hệ với O Bé qua số điện thoại (094.157.1155) khi tới nơi</em>
                </p>
              </div>

              <div style="margin-top: 15px;">
                <p style="margin: 5px 0 10px 0;"><strong style="color: #555;">Bước 2: Nhận chìa khóa phòng</strong></p>
                <p style="margin: 5px 0; color: #666; line-height: 1.6;">
                  Chìa khóa phòng sẽ được để trong hộp chìa trước cửa phòng của bạn. Để mở hộp, nhập mã <strong>0000</strong> và lấy chìa khóa.
                </p>
                <p style="margin: 10px 0; padding: 10px; background: #e3f2fd; border-left: 3px solid #2196f3; color: #1565c0; font-size: 14px;">
                  <em>Lưu ý: Luôn khóa cửa phòng khi ra ngoài.</em>
                </p>
              </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">CHÍNH SÁCH HỦY PHÒNG</h3>
              <ul style="color: #666; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                <li>Hủy phòng >3 ngày trước ngày nhận: hoàn lại 50% tiền cọc</li>
                <li>Hủy phòng <3 ngày trước ngày nhận: không hoàn tiền cọc</li>
              </ul>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">📖 NỘI QUY HOMESTAY</h3>
              <ul style="color: #666; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                <li>Nghiêm cấm mọi hành vi hoạt động mại dâm, buôn bán, tổ chức sử dụng chất cấm</li>
                <li>Không hút thuốc trong phòng (có khu vực riêng bên ngoài)</li>
                <li>Không đưa bạn bè lên phòng khi chưa thông báo</li>
                <li>Giữ yên tĩnh sau 22:00</li>
                <li>Khi trả phòng, vui lòng bàn giao lại chìa khóa và kiểm tra đồ cá nhân</li>
                <li>Mọi hư hại hoặc mất mát sẽ được tính phí theo quy định</li>
                <li>Không mang thú cưng nếu chưa báo trước</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">📚 CẨM NANG DU LỊCH HUẾ</h3>
              <p style="margin: 5px 0; color: #555;">Để chuyến đi của bạn thêm thú vị, hãy xem ngay:</p>
              <p style="margin: 10px 0;">
                <a href="https://drive.google.com/file/d/1waKwKk9inxFd2TdWYCdJ0X0zfT4Ju2pf/view?usp=drive_link" style="color: #28a745; text-decoration: none; font-weight: bold;">
                  📖 Cẩm nang du lịch Huế.pdf
                </a>
              </p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">📞 THÔNG TIN LIÊN HỆ</h3>
              <p style="color: #666; margin: 5px 0;">Nếu cần hỗ trợ gì, hãy liên hệ với tụi mình qua:</p>
              <p style="margin: 8px 0;"><strong>Sđt/Zalo:</strong> <a href="tel:0941571155" style="color: #28a745; text-decoration: none;">094.157.1155</a></p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:onihomestay@gmail.com" style="color: #28a745; text-decoration: none;">onihomestay@gmail.com</a></p>
            </div>

            <div style="margin: 20px 0; text-align: center; padding: 15px; background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); border-radius: 5px;">
              <p style="color: #2d3436; font-size: 16px; margin: 0;">
                Cảm ơn bạn đã chọn O Ni cho chuyến đi này,<br/>
                hy vọng bạn sẽ có nhiều trải nghiệm thú vị với tụi mình nha! 💛
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">&copy; 2024 O Ni Homestay - Hệ thống đặt phòng homestay</p>
          </div>
        </div>
      `,
    };
  },

  bookingRejection: (bookingData: BookingData, reason: string) => {
    const formatDate = (date?: Date | string) => {
      if (!date) return "Chưa xác định";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      subject: `❌ Đặt phòng bị từ chối - ${bookingData.room} | O Ni Homestay`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-bottom: 3px solid #dc3545;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">O Ni Homestay</h1>
          </div>

          <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 15px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">❌ THÔNG BÁO ĐẶT PHÒNG</h2>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
            <p>Chúng tôi rất tiếc phải thông báo rằng đơn đặt phòng của bạn không thể được xử lý.</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #dc3545; margin-top: 0;">📋 Thông tin đặt phòng</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Mã đặt phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày nhận phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkInDateTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Ngày trả phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(bookingData.checkOutDateTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phòng:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.room}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Địa điểm:</strong></td>
                  <td style="padding: 8px 0;">${bookingData.location}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">⚠️ Lý do từ chối</h3>
              <p style="margin: 0; color: #721c24; line-height: 1.6;">${reason}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">📞 THÔNG TIN LIÊN HỆ</h3>
              <p style="color: #666; margin: 5px 0;">Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng liên hệ với chúng tôi để được hỗ trợ tốt nhất:</p>
              <p style="margin: 8px 0;"><strong>Sđt/Zalo:</strong> <a href="tel:0941571155" style="color: #667eea; text-decoration: none;">094.157.1155</a></p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:onihomestay@gmail.com" style="color: #667eea; text-decoration: none;">onihomestay@gmail.com</a></p>
            </div>

            <div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8d7da; border-radius: 5px; border: 1px solid #f5c6cb;">
              <p style="color: #721c24; font-size: 14px; margin: 0;">
                Chúng tôi rất mong được phục vụ bạn trong những lần tiếp theo.<br/>
                Cảm ơn bạn đã quan tâm đến O Ni Homestay! 💛
              </p>
            </div>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">&copy; 2024 O Ni Homestay - Hệ thống đặt phòng homestay</p>
          </div>
        </div>
      `,
    };
  },
};

// Email sending functions
export async function sendBookingConfirmation(bookingData: BookingData) {
  const { subject, html } = emailTemplates.bookingConfirmation(bookingData);

  try {
    await transporter.sendMail({
      from: `"O Ni Homestay" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });

    console.log("Booking confirmation email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(bookingData: BookingData) {
  const { subject, html } = emailTemplates.adminNotification(bookingData);

  try {
    await transporter.sendMail({
      from: `"O Ni Homestay System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      bcc: process.env.BCC_EMAIL,
      subject,
      html,
    });

    console.log("Admin notification email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return { success: false, error };
  }
}

export async function sendBookingApproval(bookingData: BookingData) {
  const { subject, html } = emailTemplates.bookingApproval(bookingData);

  try {
    await transporter.sendMail({
      from: `"O Ni Homestay" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });

    console.log("Booking approval email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending booking approval email:", error);
    return { success: false, error };
  }
}

export async function sendBookingRejection(
  bookingData: BookingData,
  reason: string
) {
  const { subject, html } = emailTemplates.bookingRejection(
    bookingData,
    reason
  );

  try {
    await transporter.sendMail({
      from: `"O Ni Homestay" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });

    console.log("Booking rejection email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending booking rejection email:", error);
    return { success: false, error };
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("Email connection is working");
    return { success: true };
  } catch (error) {
    console.error("Email connection failed:", error);
    return { success: false, error };
  }
}
