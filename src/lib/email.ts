import nodemailer from 'nodemailer';

// TypeScript interfaces for booking data
interface BookingData {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  cccd: string;
  guests: number;
  notes?: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
  room: string;
  location: string;
  totalPrice: number;
  basePrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Email templates
export const emailTemplates = {
  bookingConfirmation: (bookingData: BookingData) => ({
    subject: `Xác nhận đặt phòng - ${bookingData.room} | TidyToto`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">💚 TidyToto</h1>
          <p style="margin: 10px 0 0 0;">Xác nhận đặt phòng</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
          <p>Chúng tôi đã nhận được yêu cầu đặt phòng của bạn. Dưới đây là thông tin chi tiết:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Thông tin đặt phòng</h3>
            <p><strong>Mã đặt phòng:</strong> ${bookingData.id}</p>
            <p><strong>Phòng:</strong> ${bookingData.room}</p>
            <p><strong>Địa điểm:</strong> ${bookingData.location}</p>
            <p><strong>Số khách:</strong> ${bookingData.guests}</p>
            <p><strong>Tổng tiền:</strong> ${bookingData.totalPrice?.toLocaleString('vi-VN')} đ</p>
            <p><strong>Phương thức thanh toán:</strong> ${bookingData.paymentMethod === 'CASH' ? 'Tiền mặt' : bookingData.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}</p>
            ${bookingData.notes ? `<p><strong>Ghi chú:</strong> ${bookingData.notes}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Thông tin khách hàng</h3>
            <p><strong>Họ tên:</strong> ${bookingData.fullName}</p>
            <p><strong>Điện thoại:</strong> ${bookingData.phone}</p>
            <p><strong>Email:</strong> ${bookingData.email || 'Không có'}</p>
            <p><strong>CCCD:</strong> ${bookingData.cccd}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Trạng thái đặt phòng</h3>
            <p style="margin: 0; color: #856404;">Đơn đặt phòng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận.</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của TidyToto!</p>
            <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua:</p>
            <p>📞 Hotline: 0939000000</p>
            <p>📧 Email: ${process.env.ADMIN_EMAIL}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">&copy; 2024 TidyToto - Hệ thống đặt phòng homestay</p>
        </div>
      </div>
    `
  }),

  adminNotification: (bookingData: BookingData) => ({
    subject: `🔔 Đặt phòng mới - ${bookingData.room} | ${bookingData.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🔔 Thông báo đặt phòng mới</h1>
          <p style="margin: 10px 0 0 0;">TidyToto Admin Panel</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Đặt phòng mới cần xử lý</h2>
          <p>Có một đơn đặt phòng mới cần được xem xét và phê duyệt.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">Thông tin đặt phòng</h3>
            <p><strong>Mã đặt phòng:</strong> ${bookingData.id}</p>
            <p><strong>Phòng:</strong> ${bookingData.room}</p>
            <p><strong>Địa điểm:</strong> ${bookingData.location}</p>
            <p><strong>Khách hàng:</strong> ${bookingData.fullName}</p>
            <p><strong>Điện thoại:</strong> ${bookingData.phone}</p>
            <p><strong>Email:</strong> ${bookingData.email || 'Không có'}</p>
            <p><strong>CCCD:</strong> ${bookingData.cccd}</p>
            <p><strong>Số khách:</strong> ${bookingData.guests}</p>
            <p><strong>Tổng tiền:</strong> ${bookingData.totalPrice?.toLocaleString('vi-VN')} đ</p>
            <p><strong>Phương thức TT:</strong> ${bookingData.paymentMethod === 'CASH' ? 'Tiền mặt' : bookingData.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}</p>
            ${bookingData.notes ? `<p><strong>Ghi chú:</strong> ${bookingData.notes}</p>` : ''}
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Hành động cần thực hiện</h3>
            <p style="margin: 0; color: #155724;">Vui lòng đăng nhập vào admin panel để xem chi tiết và phê duyệt đơn đặt phòng này.</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Xem trong Admin Panel
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">&copy; 2024 TidyToto - Admin System</p>
        </div>
      </div>
    `
  }),

  bookingApproval: (bookingData: BookingData) => ({
    subject: `✅ Đặt phòng được phê duyệt - ${bookingData.room} | TidyToto`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">✅ Đặt phòng thành công!</h1>
          <p style="margin: 10px 0 0 0;">TidyToto</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
          <p>Chúc mừng! Đơn đặt phòng của bạn đã được phê duyệt. Dưới đây là thông tin chi tiết:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">Thông tin đặt phòng</h3>
            <p><strong>Mã đặt phòng:</strong> ${bookingData.id}</p>
            <p><strong>Phòng:</strong> ${bookingData.room}</p>
            <p><strong>Địa điểm:</strong> ${bookingData.location}</p>
            <p><strong>Số khách:</strong> ${bookingData.guests}</p>
            <p><strong>Tổng tiền:</strong> ${bookingData.totalPrice?.toLocaleString('vi-VN')} đ</p>
            <p><strong>Phương thức thanh toán:</strong> ${bookingData.paymentMethod === 'CASH' ? 'Tiền mặt' : bookingData.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">Thông tin liên hệ</h3>
            <p><strong>Địa chỉ:</strong> ${bookingData.location}</p>
            <p><strong>Giờ nhận phòng:</strong> 14:00</p>
            <p><strong>Giờ trả phòng:</strong> 12:00</p>
            <p><strong>Hotline hỗ trợ:</strong> 0939000000</p>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0;">Lưu ý quan trọng</h3>
            <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
              <li>Vui lòng mang theo CCCD/CMND khi nhận phòng</li>
              <li>Liên hệ hotline nếu cần hỗ trợ</li>
              <li>Tuân thủ các quy định của homestay</li>
            </ul>
          </div>
          
          <div style="margin: 20px 0;">
            <p>Cảm ơn bạn đã tin tưởng TidyToto! Chúng tôi mong được phục vụ bạn.</p>
            <p>Chúc bạn có một kỳ nghỉ tuyệt vời!</p>
            <p>📞 Hotline: 0939000000</p>
            <p>📧 Email: ${process.env.ADMIN_EMAIL}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">&copy; 2024 TidyToto - Hệ thống đặt phòng homestay</p>
        </div>
      </div>
    `
  }),

  bookingRejection: (bookingData: BookingData, reason: string) => ({
    subject: `❌ Đặt phòng bị từ chối - ${bookingData.room} | TidyToto`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">❌ Thông báo đặt phòng</h1>
          <p style="margin: 10px 0 0 0;">TidyToto</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Chào ${bookingData.fullName},</h2>
          <p>Chúng tôi rất tiếc phải thông báo rằng đơn đặt phòng của bạn không thể được xử lý.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">Thông tin đặt phòng</h3>
            <p><strong>Mã đặt phòng:</strong> ${bookingData.id}</p>
            <p><strong>Phòng:</strong> ${bookingData.room}</p>
            <p><strong>Địa điểm:</strong> ${bookingData.location}</p>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">Lý do từ chối</h3>
            <p style="margin: 0; color: #721c24;">${reason}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p>Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng liên hệ với chúng tôi để được hỗ trợ tốt nhất.</p>
            <p>📞 Hotline: 0939000000</p>
            <p>📧 Email: ${process.env.ADMIN_EMAIL}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">&copy; 2024 TidyToto - Hệ thống đặt phòng homestay</p>
        </div>
      </div>
    `
  })
};

// Email sending functions
export async function sendBookingConfirmation(bookingData: BookingData) {
  const { subject, html } = emailTemplates.bookingConfirmation(bookingData);
  
  try {
    await transporter.sendMail({
      from: `"TidyToto" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });
    
    console.log('Booking confirmation email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(bookingData: BookingData) {
  const { subject, html } = emailTemplates.adminNotification(bookingData);
  
  try {
    await transporter.sendMail({
      from: `"TidyToto System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });
    
    console.log('Admin notification email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error };
  }
}

export async function sendBookingApproval(bookingData: BookingData) {
  const { subject, html } = emailTemplates.bookingApproval(bookingData);
  
  try {
    await transporter.sendMail({
      from: `"TidyToto" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });
    
    console.log('Booking approval email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending booking approval email:', error);
    return { success: false, error };
  }
}

export async function sendBookingRejection(bookingData: BookingData, reason: string) {
  const { subject, html } = emailTemplates.bookingRejection(bookingData, reason);
  
  try {
    await transporter.sendMail({
      from: `"TidyToto" <${process.env.GMAIL_USER}>`,
      to: bookingData.email,
      subject,
      html,
    });
    
    console.log('Booking rejection email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending booking rejection email:', error);
    return { success: false, error };
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email connection is working');
    return { success: true };
  } catch (error) {
    console.error('Email connection failed:', error);
    return { success: false, error };
  }
} 