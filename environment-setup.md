# Environment Setup Instructions

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

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

## Setup Instructions

### 1. Database Setup (PostgreSQL)

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `booking_app`
3. Update the `DATABASE_URL` with your credentials

**Option B: Using Docker**
```bash
docker run --name booking-postgres -e POSTGRES_DB=booking_app -e POSTGRES_USER=username -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

**Option C: Cloud Database (Recommended)**
- Use services like Railway, Supabase, or Neon
- They provide free PostgreSQL databases with connection URLs

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to "App passwords" section
4. Generate a new app password for "Mail"
5. Use this app password in `GMAIL_APP_PASSWORD` (not your regular password)

### 3. JWT Secret

Generate a random string for JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Admin Email

Set the admin email address where booking notifications will be sent.

## Database Migration

After setting up the environment variables, run:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This will create the database tables and generate the Prisma client. 