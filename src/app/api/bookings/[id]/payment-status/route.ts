import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        paymentWebhooks: {
          where: { isProcessed: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if payment is confirmed
    const hasConfirmedPayment = booking.paymentWebhooks.length > 0;
    const latestWebhook = booking.paymentWebhooks[0];

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        status: booking.status,
        totalPrice: booking.totalPrice,
        paymentConfirmed: hasConfirmedPayment,
        paymentConfirmedAt: booking.paymentConfirmedAt,
        latestWebhook: latestWebhook ? {
          id: latestWebhook.id,
          sepayId: latestWebhook.sepayId,
          gateway: latestWebhook.gateway,
          transactionDate: latestWebhook.transactionDate,
          transferAmount: latestWebhook.transferAmount,
          content: latestWebhook.content,
          processedAt: latestWebhook.processedAt
        } : null
      }
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking payment status' 
      },
      { status: 500 }
    );
  }
} 