# Webhook Auto-Approval Update

## Overview
Updated the payment webhook API to automatically approve bookings when payment is confirmed, eliminating the need for manual admin approval after payment confirmation.

## Changes Made

### 1. Payment Webhook API (`/api/webhooks/payment`)
- **Before**: When payment confirmed → Set booking status to `PAYMENT_CONFIRMED`
- **After**: When payment confirmed → Set booking status to `APPROVED` + Send approval email

### 2. Auto-Approval Process
When a webhook payment is processed and matches a booking:

1. **Booking Status Update**:
   - Status: `PENDING` → `APPROVED`
   - Sets `paymentConfirmedAt` timestamp
   - Sets `approvedAt` timestamp
   - Adds admin notes: "Tự động phê duyệt sau khi xác nhận thanh toán qua webhook"

2. **Email Notification**:
   - Automatically sends booking approval email to customer
   - Includes room details, booking information, and pricing
   - Uses the same email template as manual admin approval

3. **Error Handling**:
   - If email sending fails, the webhook doesn't fail
   - Email errors are logged but don't affect the booking approval

### 3. Enhanced Webhook Response
The webhook now returns additional information:
```json
{
  "success": true,
  "message": "Webhook processed successfully - Booking auto-approved and email sent",
  "data": {
    "webhookId": "webhook_id",
    "bookingMatched": true,
    "bookingId": "booking_id",
    "autoApproved": true
  }
}
```

## Benefits

1. **Improved User Experience**: Customers receive immediate confirmation after payment
2. **Reduced Admin Workload**: No manual approval needed for paid bookings
3. **Faster Processing**: Bookings are approved instantly upon payment confirmation
4. **Consistent Communication**: Same email template and content as manual approval

## Testing

Use the test script to simulate webhook payments:
```bash
node scripts/test-webhook.js <bookingId> <amount>
```

The script will show if the booking was automatically approved and email sent.

## Flow Diagram

```
Payment Received → Webhook Triggered → Booking Found & Amount Matched → Auto-Approve Booking → Send Approval Email → Complete
```

## Database Changes
The booking record will show:
- `status`: 'APPROVED'
- `paymentConfirmedAt`: timestamp of payment
- `approvedAt`: timestamp of auto-approval
- `adminNotes`: explanation of auto-approval

This maintains full audit trail while providing automated approval. 