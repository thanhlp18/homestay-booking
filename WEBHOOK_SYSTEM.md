# Payment Webhook System

## Overview

This system handles bank transfer notifications from SePay to automatically confirm payments and update booking statuses.

## Database Schema

### PaymentWebhook Table

```sql
CREATE TABLE payment_webhooks (
  id TEXT PRIMARY KEY,
  sepay_id INTEGER NOT NULL,
  gateway TEXT NOT NULL,
  transaction_date TIMESTAMP NOT NULL,
  account_number TEXT NOT NULL,
  code TEXT,
  content TEXT NOT NULL,
  transfer_type TEXT NOT NULL,
  transfer_amount INTEGER NOT NULL,
  accumulated INTEGER NOT NULL,
  sub_account TEXT,
  reference_code TEXT NOT NULL,
  description TEXT NOT NULL,
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  booking_id TEXT REFERENCES bookings(id)
);
```

## API Endpoints

### 1. Webhook Receiver
**POST** `/api/webhooks/payment`

Receives webhook notifications from SePay.

**Webhook Payload:**
```json
{
  "id": 92704,
  "gateway": "TPBank",
  "transactionDate": "2023-03-25 14:02:37",
  "accountNumber": "43218082002",
  "code": null,
  "content": "clx123456789",
  "transferType": "in",
  "transferAmount": 50000,
  "accumulated": 19077000,
  "subAccount": null,
  "referenceCode": "MBVCB.3278907687",
  "description": "Chuyển khoản thanh toán đặt phòng clx123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "webhookId": "webhook_id",
    "bookingMatched": true,
    "bookingId": "clx123456789"
  }
}
```

### 2. Payment Status Check
**GET** `/api/bookings/{id}/payment-status`

Checks the payment status of a specific booking.

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "clx123456789",
    "status": "PAYMENT_CONFIRMED",
    "totalPrice": 50000,
    "paymentConfirmed": true,
    "paymentConfirmedAt": "2023-03-25T14:02:37Z",
    "latestWebhook": {
      "id": "webhook_id",
      "sepayId": 92704,
      "gateway": "TPBank",
      "transactionDate": "2023-03-25T14:02:37Z",
      "transferAmount": 50000,
      "content": "clx123456789",
      "processedAt": "2023-03-25T14:02:37Z"
    }
  }
}
```

### 3. Admin Webhook Viewer
**GET** `/api/admin/webhooks`

Admin endpoint to view all webhooks (for debugging).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isProcessed`: Filter by processed status (true/false)

## Frontend Integration

### Payment Page Polling

The payment page automatically polls for payment status every 5 seconds:

```typescript
// Poll for payment status every 5 seconds
useEffect(() => {
  if (!bookingData?.bookingId) return;

  // Check immediately
  checkPaymentStatus();

  // Then check every 5 seconds
  const paymentTimer = setInterval(() => {
    checkPaymentStatus();
  }, 5000);

  return () => clearInterval(paymentTimer);
}, [bookingData?.bookingId]);
```

### Status Display

The payment page shows real-time status updates:

- **Pending**: "Trạng thái: Chờ thanh toán... ⏳"
- **Confirmed**: "✅ Thanh toán thành công! Đang xử lý..."

## Webhook Processing Logic

1. **Validation**: Checks required fields and transfer type
2. **Duplicate Prevention**: Prevents processing the same webhook twice
3. **Booking Matching**: Extracts booking ID from content and matches with amount
4. **Status Update**: Updates booking status to `PAYMENT_CONFIRMED`
5. **Webhook Storage**: Stores all webhook data for audit trail

## Testing

### Test Script

Use the test script to simulate webhook calls:

```bash
node scripts/test-webhook.js <bookingId> <amount>
```

Example:
```bash
node scripts/test-webhook.js clx123456789 50000
```

### Manual Testing

1. Create a booking with transfer payment method
2. Note the booking ID and amount
3. Run the test script with those values
4. Check the payment page for status updates
5. Verify the booking status in the database

## Security Considerations

1. **Webhook Authentication**: In production, implement webhook signature verification
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **IP Whitelisting**: Restrict webhook endpoints to SePay IPs
4. **Logging**: Log all webhook activities for audit purposes

## Production Deployment

1. **Environment Variables**: Set up proper environment variables
2. **SSL/TLS**: Ensure HTTPS for webhook endpoints
3. **Monitoring**: Set up monitoring for webhook failures
4. **Backup**: Regular backups of webhook data
5. **Error Handling**: Implement proper error handling and retry mechanisms 