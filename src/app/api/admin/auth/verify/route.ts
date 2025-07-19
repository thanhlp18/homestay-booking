import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { 
        id: decoded.id,
        email: decoded.email,
        role: 'ADMIN'
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Người dùng không tồn tại hoặc không có quyền admin' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token hợp lệ',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' },
      { status: 401 }
    );
  }
} 