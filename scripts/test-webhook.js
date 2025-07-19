// Test script to simulate webhook calls
// Usage: node scripts/test-webhook.js <bookingId> <amount>

const bookingId = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!bookingId || !amount) {
  console.log('Usage: node scripts/test-webhook.js <bookingId> <amount>');
  console.log('Example: node scripts/test-webhook.js clx123456789 50000');
  process.exit(1);
}

const webhookPayload = {
  "id": Math.floor(Math.random() * 100000) + 1,
  "gateway": "TPBank",
  "transactionDate": new Date().toISOString().slice(0, 19).replace('T', ' '),
  "accountNumber": "43218082002",
  "code": null,
  "content": bookingId,
  "transferType": "in",
  "transferAmount": amount,
  "accumulated": 100000000,
  "subAccount": null,
  "referenceCode": "TPB.TEST." + Math.random().toString(36).substr(2, 9),
  "description": `Chuyển khoản thanh toán đặt phòng ${bookingId}`
};

async function testWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    
    console.log('Webhook Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Webhook processed successfully');
      if (result.data.bookingMatched) {
        console.log('✅ Booking matched and payment confirmed');
      } else {
        console.log('⚠️  Booking not matched');
      }
    } else {
      console.log('❌ Webhook failed:', result.message);
    }
    
  } catch (error) {
    console.error('Error calling webhook:', error);
  }
}

testWebhook(); 