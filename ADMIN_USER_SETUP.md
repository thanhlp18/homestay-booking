# Admin User Setup Guide

This guide will help you create admin users for the TidyToto Homestay admin dashboard.

## Prerequisites

1. **Database Setup**: Ensure your database is running and migrations are applied
2. **Dependencies**: Make sure `bcryptjs` is installed
3. **Environment**: Set up your `.env` file with database connection

## Method 1: Using Prisma Seed (Recommended)

The easiest way to create an admin user is using the Prisma seed script.

### Step 1: Run the seed script

```bash
# Run the seed script to create sample data and admin user
npx prisma db seed
```

This will create:
- Sample branches, rooms, and time slots
- **Admin user with credentials:**
  - Email: `admin@localhome.vn`
  - Password: `admin123`

### Step 2: Verify the admin user was created

```bash
# Check if the admin user exists
npx prisma studio
```

Navigate to the User table and verify the admin user exists.

## Method 2: Using the Custom Script

If you want to create an admin user manually or the seed script doesn't work:

### Step 1: Run the custom script

```bash
# Run the TypeScript script
npx tsx scripts/create-admin.ts
```

This will:
- Check if an admin user already exists
- Create a new admin user if none exists
- Display the login credentials

### Step 2: Alternative - Run with ts-node

```bash
# If you have ts-node installed
npx ts-node scripts/create-admin.ts
```

## Method 3: Manual Database Insert

If you prefer to create the admin user directly in the database:

### Step 1: Generate a hashed password

Create a simple script to generate a hashed password:

```typescript
// create-password.ts
import bcrypt from 'bcryptjs';

async function generatePassword() {
  const password = 'admin123'; // Change this to your desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

generatePassword();
```

Run it:
```bash
npx tsx create-password.ts
```

### Step 2: Insert into database

Use Prisma Studio or your database client to insert:

```sql
INSERT INTO User (id, email, name, phone, password, role, createdAt, updatedAt)
VALUES (
  'admin-user-id',
  'admin@localhome.vn',
  'Admin',
  '0932620930',
  'your-hashed-password-here',
  'ADMIN',
  NOW(),
  NOW()
);
```

## Method 4: Using Prisma Studio

### Step 1: Open Prisma Studio

```bash
npx prisma studio
```

### Step 2: Create admin user manually

1. Navigate to the User table
2. Click "Add record"
3. Fill in the details:
   - Email: `admin@localhome.vn`
   - Name: `Admin`
   - Phone: `0932620930`
   - Role: `ADMIN`
   - Password: (use a hashed password from Method 3)

## Default Admin Credentials

After using any of the methods above, you can login with:

- **Email**: `admin@localhome.vn`
- **Password**: `admin123`

## Security Recommendations

### 1. Change Default Password

After first login, immediately change the default password:

1. Go to Admin Dashboard → Settings
2. Update your password (if password change feature is implemented)
3. Or update directly in the database

### 2. Use Strong Passwords

When creating admin users, use strong passwords:
- At least 8 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Avoid common words or patterns

### 3. Environment Variables

Set up your `.env` file:

```env
# Database
DATABASE_URL="your-database-connection-string"

# JWT Secret (for admin authentication)
JWT_SECRET="your-secure-jwt-secret-key"

# Other environment variables...
```

### 4. Multiple Admin Users

For production, consider creating multiple admin users with different roles:

```typescript
// Example: Create different admin roles
const adminUsers = [
  {
    email: 'superadmin@localhome.vn',
    name: 'Super Admin',
    password: 'super-secure-password',
    role: 'ADMIN'
  },
  {
    email: 'manager@localhome.vn',
    name: 'Manager',
    password: 'manager-password',
    role: 'ADMIN'
  }
];
```

## Troubleshooting

### Issue: "Admin user already exists"

**Solution**: The script detected an existing admin user. You can:
1. Use the existing credentials
2. Reset the password manually
3. Delete the existing user and recreate

### Issue: "bcrypt not found"

**Solution**: Install bcryptjs:
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### Issue: "Database connection failed"

**Solution**: 
1. Check your `.env` file has the correct `DATABASE_URL`
2. Ensure your database is running
3. Run `npx prisma generate` to update Prisma client

### Issue: "JWT_SECRET not set"

**Solution**: Add JWT_SECRET to your `.env` file:
```env
JWT_SECRET="your-secure-secret-key-here"
```

## Testing the Admin Login

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to admin dashboard**:
   ```
   http://localhost:3000/admin
   ```

3. **Login with credentials**:
   - Email: `admin@localhome.vn`
   - Password: `admin123`

4. **Verify access**: You should see the admin dashboard with statistics and navigation.

## Next Steps

After creating the admin user:

1. **Test all features**: Navigate through all admin pages
2. **Create sample data**: Add branches, rooms, and test bookings
3. **Configure settings**: Set up system preferences
4. **Change password**: Update the default password
5. **Backup**: Create a backup of your admin user credentials

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check the Prisma schema matches your database
5. Review the admin dashboard documentation in `ADMIN_DASHBOARD_SUMMARY.md` 