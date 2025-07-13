import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const isProcessed = url.searchParams.get('isProcessed');
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: { isProcessed?: boolean } = {};
    
    if (isProcessed !== null) {
      where.isProcessed = isProcessed === 'true';
    }
    
    // Get webhooks with pagination
    const [webhooks, total] = await Promise.all([
      prisma.paymentWebhook.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              totalPrice: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.paymentWebhook.count({ where })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        webhooks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching webhooks' 
      },
      { status: 500 }
    );
  }
} 