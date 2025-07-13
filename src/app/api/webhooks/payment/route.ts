import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WebhookPayload {
  id: number;                              // ID giao dịch trên SePay
  gateway: string;                         // Brand name của ngân hàng
  transactionDate: string;                 // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: string;                   // Số tài khoản ngân hàng
  code: string | null;                     // Mã code thanh toán
  content: string;                         // Nội dung chuyển khoản
  transferType: string;                    // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: number;                  // Số tiền giao dịch
  accumulated: number;                     // Số dư tài khoản (lũy kế)
  subAccount: string | null;               // Tài khoản ngân hàng phụ
  referenceCode: string;                   // Mã tham chiếu của tin nhắn sms
  description: string;                     // Toàn bộ nội dung tin nhắn sms
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();
    
    // Validate required fields
    if (!body.id || !body.gateway || !body.transactionDate || !body.transferAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only process incoming transfers
    if (body.transferType !== 'in') {
      return NextResponse.json(
        { success: false, message: 'Only incoming transfers are processed' },
        { status: 400 }
      );
    }

    // Check if webhook already exists
    const existingWebhook = await prisma.paymentWebhook.findFirst({
      where: { sepayId: body.id }
    });

    if (existingWebhook) {
      return NextResponse.json(
        { success: false, message: 'Webhook already processed' },
        { status: 409 }
      );
    }

    // Try to find matching booking based on content (booking ID)
    let bookingId: string | null = null;
    let booking = null;

    // Extract booking ID from content (assuming content contains booking ID)
    if (body.content) {
      const potentialBookingId = body.content;
      
      // Check if this booking ID exists and matches the amount
      booking = await prisma.booking.findFirst({
        where: {
          id: potentialBookingId,
          totalPrice: body.transferAmount,
          status: 'PENDING'
        }
      });
      console.log({booking})
      if (booking) {
        bookingId = booking.id;
      }
    }

    // Store webhook data
    const webhook = await prisma.paymentWebhook.create({
      data: {
        sepayId: body.id,
        gateway: body.gateway,
        transactionDate: new Date(body.transactionDate),
        accountNumber: body.accountNumber,
        code: body.code,
        content: body.content,
        transferType: body.transferType,
        transferAmount: body.transferAmount,
        accumulated: body.accumulated,
        subAccount: body.subAccount,
        referenceCode: body.referenceCode,
        description: body.description,
        bookingId: bookingId,
        isProcessed: bookingId !== null,
        processedAt: bookingId ? new Date() : null
      }
    });

    // If booking found and matched, update booking status
    if (booking && bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentConfirmedAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        webhookId: webhook.id,
        bookingMatched: bookingId !== null,
        bookingId: bookingId
      }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing webhook (remove in production)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Payment webhook endpoint is active'
  });
} 