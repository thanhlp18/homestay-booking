import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingApproval } from '@/lib/email';

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
        },
        include: {
          bookingSlots: {
            include: {
              room: {
                include: {
                  branch: true,
                },
              },
              timeSlot: true,
            },
          },
        },
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

    // If booking found and matched, auto-approve and send email
    if (booking && bookingId) {
      // Auto-approve the booking since payment has been confirmed via webhook
      // This eliminates the need for manual admin approval after payment confirmation
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          paymentConfirmedAt: new Date(),
          approvedAt: new Date(),
          adminNotes: 'Tự động phê duyệt sau khi xác nhận thanh toán qua webhook',
          updatedAt: new Date()
        }
      });

      // Send approval email to customer if email exists
      if (booking.email) {
        try {
          const emailData = {
            id: booking.id,
            fullName: booking.fullName,
            phone: booking.phone,
            email: booking.email,
            cccd: booking.cccd,
            guests: booking.guests,
            notes: booking.notes || undefined,
            paymentMethod: booking.paymentMethod,
            room: booking.bookingSlots[0]?.room?.name || 'Unknown',
            location: booking.bookingSlots[0]?.room?.branch?.location || 'Unknown',
            totalPrice: booking.totalPrice,
            basePrice: booking.basePrice,
            discountAmount: booking.discountAmount,
            discountPercentage: booking.discountPercentage,
          };

          await sendBookingApproval(emailData);
          console.log(`Approval email sent to ${booking.email} for booking ${bookingId}`);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't fail the webhook if email sending fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: booking && bookingId 
        ? 'Webhook processed successfully - Booking auto-approved and email sent'
        : 'Webhook processed successfully - No matching booking found',
      data: {
        webhookId: webhook.id,
        bookingMatched: bookingId !== null,
        bookingId: bookingId,
        autoApproved: booking && bookingId ? true : false
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