import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@localhome.vn',
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log('If you need to reset the password, please update it manually.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@localhome.vn',
        name: 'Admin',
        phone: '0932620930',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminUser.email}`);
    console.log('Password: admin123');
    console.log('\n🔐 Login credentials:');
    console.log('Email: admin@localhome.vn');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 