# 🚀 API Setup Guide - Complete Backend Integration

## Overview
This guide will help you set up the complete API system with PostgreSQL database, Prisma ORM, and Gmail email notifications for your booking app.

## 🎯 What We Built

### ✅ Complete API System:
- **Booking API** (`/api/bookings`) - Handle booking submissions with email notifications
- **Admin API** (`/api/admin/bookings/[id]`) - Approve/reject bookings with email notifications
- **Email Service** - Professional email templates for all booking states
- **Database Schema** - Complete PostgreSQL schema with all relationships
- **Type Safety** - Full TypeScript integration with Prisma

### ✅ Email Templates:
- 📧 **Booking Confirmation** - Sent to customer when booking is submitted
- 🔔 **Admin Notification** - Sent to admin when new booking arrives
- ✅ **Booking Approval** - Sent to customer when booking is approved
- ❌ **Booking Rejection** - Sent to customer when booking is rejected

---

## 🛠️ Setup Instructions

### Step 1: Environment Variables
Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/booking_app?schema=public"

# JWT Secret for Authentication
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Gmail Configuration for Email Service
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password-here"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Admin Email for Booking Notifications
ADMIN_EMAIL="admin@localhome.vn"
```

### Step 2: Database Setup

**Option A: Quick Cloud Database (Recommended)**
1. Go to [Supabase](https://supabase.com) or [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection URL to your `.env` file

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# OR
sudo apt-get install postgresql postgresql-contrib  # Ubuntu

# Create database
createdb booking_app
```

**Option C: Docker**
```bash
docker run --name booking-postgres \
  -e POSTGRES_DB=booking_app \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres
```

### Step 3: Gmail Setup
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Go to **Security** → **App passwords**
4. Generate a new app password for "Mail"
5. Use this password in `GMAIL_APP_PASSWORD` (not your regular password)

### Step 4: Database Migration & Seeding
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Open Prisma Studio to view data (optional)
npm run db:studio
```

### Step 5: Test the Setup
```bash
# Start the development server
npm run dev

# Your app should now be running with:
# - Database connected ✅
# - Email service ready ✅
# - API endpoints active ✅
```

---

## 🔧 API Endpoints

### 1. Booking Submission
**POST** `/api/bookings`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0932620930",
  "email": "customer@example.com",
  "cccd": "123456789",
  "guests": 2,
  "notes": "Ghi chú từ khách hàng",
  "paymentMethod": "TRANSFER",
  "selectedSlots": [
    {
      "date": "2024-01-15T00:00:00.000Z",
      "branchId": "lovely",
      "roomId": "lovely-room1",
      "timeSlotId": "morning",
      "price": 50000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt phòng thành công!",
  "data": {
    "bookingId": "clrx1234567890",
    "totalPrice": 50000,
    "discountAmount": 0,
    "status": "PENDING"
  }
}
```

### 2. Admin Approval/Rejection
**PATCH** `/api/admin/bookings/[bookingId]`

**Request Body (Approve):**
```json
{
  "action": "approve"
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "reason": "Phòng đã được đặt cho ngày này"
}
```

### 3. Get Bookings (Admin)
**GET** `/api/bookings?page=1&limit=10&status=PENDING`

---

## 🎨 Frontend Integration

### Update Room Booking Form
Replace the localStorage logic in your room booking form:

```typescript
// In src/app/rooms/[roomSlug]/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (selectedSlots.length === 0) {
    alert('Vui lòng chọn ít nhất một khung giờ từ bảng lịch đặt phòng!');
    return;
  }

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        selectedSlots: selectedSlots,
        frontIdImageUrl: frontIdImage?.name,
        backIdImageUrl: backIdImage?.name,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      alert(`Đặt phòng thành công! Mã đặt phòng: ${result.data.bookingId}`);
      router.push('/');
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error('Error submitting booking:', error);
    alert('Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.');
  }
};
```

### Update Admin Panel
Replace the localStorage logic in your admin panel:

```typescript
// In src/app/admin/page.tsx
const handleApproveBooking = async (bookingId: string) => {
  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'approve' }),
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Đã phê duyệt đặt phòng thành công!');
      // Refresh the bookings list
      loadBookings();
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error('Error approving booking:', error);
    alert('Đã xảy ra lỗi khi phê duyệt đặt phòng.');
  }
};

const handleRejectBooking = async (bookingId: string) => {
  const reason = prompt('Lý do từ chối đặt phòng:');
  if (!reason) return;

  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'reject', reason }),
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Đã từ chối đặt phòng thành công!');
      // Refresh the bookings list
      loadBookings();
    } else {
      alert(`Lỗi: ${result.message}`);
    }
  } catch (error) {
    console.error('Error rejecting booking:', error);
    alert('Đã xảy ra lỗi khi từ chối đặt phòng.');
  }
};

// Load bookings from API
const loadBookings = async () => {
  try {
    const response = await fetch('/api/bookings');
    const result = await response.json();
    
    if (result.success) {
      setBookings(result.data);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
};
```

---

## 🔍 Testing the System

### 1. Test Booking Submission
1. Go to any room page
2. Fill out the booking form
3. Select time slots
4. Submit the form
5. Check that:
   - ✅ Booking is saved to database
   - ✅ Confirmation email is sent to customer
   - ✅ Admin notification email is sent

### 2. Test Admin Approval
1. Go to `/admin` page
2. Find the test booking
3. Click "Approve" or "Reject"
4. Check that:
   - ✅ Booking status is updated
   - ✅ Appropriate email is sent to customer

### 3. View Database
```bash
# Open Prisma Studio to view all data
npm run db:studio
```

---

## 🚀 What's Next?

Your booking system now has:
- ✅ **Complete API backend** with PostgreSQL
- ✅ **Email notifications** for all booking states
- ✅ **Admin management** system
- ✅ **Type-safe** database operations
- ✅ **Production-ready** architecture

### Potential Enhancements:
1. **User Authentication** - Login system for customers
2. **Payment Integration** - Stripe/PayPal integration
3. **SMS Notifications** - Twilio integration
4. **Calendar Integration** - Google Calendar sync
5. **Analytics Dashboard** - Booking statistics
6. **Mobile App** - React Native version

---

## 🆘 Troubleshooting

### Common Issues:

**1. Database Connection Error**
```bash
# Check your DATABASE_URL is correct
npx prisma db push
```

**2. Email Not Sending**
```bash
# Verify Gmail app password is correct
# Check GMAIL_USER and GMAIL_APP_PASSWORD in .env
```

**3. Prisma Client Error**
```bash
# Regenerate Prisma client
npm run db:generate
```

**4. Migration Issues**
```bash
# Reset database (WARNING: This will delete all data)
npm run db:reset
```

---

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database is running and accessible
4. Test email credentials with Gmail

Your booking system is now fully integrated with a professional backend! 🎉 