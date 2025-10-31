# Razorpay Integration Guide

Complete guide for integrating Razorpay payment gateway in ReShoe.

## Overview

ReShoe uses Razorpay for secure payment processing. This guide covers:
- Setting up Razorpay account
- Configuring environment variables
- Testing payments
- Production deployment

---

## 1. Create Razorpay Account

### Sign Up
1. Visit [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create an account
3. Complete KYC verification (required for production)

### Get API Keys
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (for development)
4. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secure)

---

## 2. Configure Environment Variables

Update your `.env.local` file:

```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Important:**
- Never commit your Key Secret to version control
- Use test keys for development (starts with `rzp_test_`)
- Use live keys only in production (starts with `rzp_live_`)

---

## 3. How Payment Flow Works

### Step-by-Step Process

1. **Customer initiates checkout**
   - Selects a shoe to purchase
   - Proceeds to checkout

2. **Create Razorpay Order**
   ```javascript
   POST /api/razorpay/create-order
   Body: { shoeId: "shoe_id_here" }
   ```
   Returns:
   ```json
   {
     "orderId": "order_xxxxxxxxxxxxx",
     "amount": 89.99,
     "currency": "INR",
     "keyId": "rzp_test_xxxxxxxxxxxxx"
   }
   ```

3. **Open Razorpay Checkout**
   - Frontend loads Razorpay checkout script
   - Opens payment modal with order details
   - Customer completes payment

4. **Verify Payment**
   ```javascript
   POST /api/razorpay/verify-payment
   Body: {
     razorpay_order_id: "order_xxxxxxxxxxxxx",
     razorpay_payment_id: "pay_xxxxxxxxxxxxx",
     razorpay_signature: "signature_here"
   }
   ```

5. **Create Order**
   - If payment verified successfully
   - Create order in database
   - Update shoe status to "sold"
   - Create transaction with commission

---

## 4. Testing Payments

### Test Cards

Razorpay provides test cards for development:

**Success Scenarios:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Other Test Cards:**

| Card Number | Scenario |
|-------------|----------|
| 4111 1111 1111 1111 | Success |
| 4012 8888 8888 1881 | Success |
| 5555 5555 5555 4444 | Success |
| 3782 822463 10005 | Success (Amex) |

**Test UPI IDs:**
- success@razorpay
- failure@razorpay

**Test Netbanking:**
- Select any bank in test mode
- All transactions will succeed

### Test Payment Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login as a customer:
   - Email: john@example.com
   - Password: password123

3. Browse shoes and click on any shoe

4. Click "Buy Now" or "Add to Cart"

5. Proceed to checkout

6. Use test card details above

7. Complete payment

8. Verify order is created in database

---

## 5. Frontend Integration

### Load Razorpay Script

Add to your checkout page:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Initialize Razorpay Checkout

```javascript
const handlePayment = async () => {
  // Step 1: Create order
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ shoeId })
  });

  const { orderId, amount, currency, keyId } = await response.json();

  // Step 2: Configure Razorpay options
  const options = {
    key: keyId,
    amount: amount * 100, // Amount in paise
    currency: currency,
    name: 'ReShoe',
    description: 'Purchase Shoe',
    order_id: orderId,
    handler: async function (response) {
      // Step 3: Verify payment
      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      if (verifyResponse.ok) {
        // Step 4: Create order
        await createOrder(response.razorpay_payment_id);
      }
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: '#3B82F6'
    }
  };

  // Step 3: Open Razorpay checkout
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

---

## 6. Security Best Practices

### Server-Side Verification

Always verify payment on the server:

```typescript
// src/lib/razorpay.ts
export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
```

**Never trust client-side payment confirmation alone!**

### Environment Variables

- ✅ Store keys in `.env.local`
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use different keys for test and production
- ❌ Never expose Key Secret in frontend code
- ❌ Never commit keys to version control

---

## 7. Production Deployment

### Get Live API Keys

1. Complete KYC verification on Razorpay
2. Submit business documents
3. Wait for approval (1-2 business days)
4. Generate live API keys from dashboard

### Update Environment Variables

In production environment:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```

### Enable Payment Methods

In Razorpay Dashboard:
1. Go to **Settings** → **Payment Methods**
2. Enable desired payment methods:
   - Cards (Visa, Mastercard, Amex, Rupay)
   - UPI
   - Netbanking
   - Wallets (Paytm, PhonePe, etc.)
   - EMI options

### Webhook Configuration (Optional)

For advanced payment notifications:

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - payment.authorized
   - payment.captured
   - payment.failed
4. Copy webhook secret
5. Add to environment variables:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## 8. Currency Support

Razorpay supports multiple currencies:

- INR (Indian Rupee) - Default
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- And 100+ more currencies

Update currency in API:
```typescript
const order = await createRazorpayOrder({
  amount: 89.99,
  currency: "USD", // Change as needed
  receipt: `receipt_${Date.now()}`
});
```

---

## 9. Troubleshooting

### Common Issues

**1. Payment not processing**
- Verify API keys are correct
- Check if test mode is enabled
- Ensure Razorpay script is loaded
- Check browser console for errors

**2. Signature verification failed**
- Verify Key Secret is correct
- Check if order ID and payment ID match
- Ensure signature is not modified

**3. Amount mismatch**
- Razorpay uses smallest currency unit (paise for INR)
- Always multiply amount by 100: `amount * 100`

**4. CORS errors**
- Razorpay checkout runs on their domain
- No CORS configuration needed for standard integration

### Debug Mode

Enable debug mode in Razorpay options:

```javascript
const options = {
  // ... other options
  modal: {
    ondismiss: function() {
      console.log('Payment cancelled by user');
    }
  }
};
```

---

## 10. Commission Handling

ReShoe automatically handles commission:

```typescript
// On successful payment
const commissionRate = 10; // 10% default
const sellerEarnings = amount - (amount * commissionRate / 100);

await Transaction.create({
  seller: sellerId,
  amount: amount,
  commission: amount * commissionRate / 100,
  sellerEarnings: sellerEarnings,
  payoutStatus: "pending"
});
```

Sellers see net earnings after commission deduction.

---

## 11. Resources

### Official Documentation
- Razorpay Docs: https://razorpay.com/docs/
- Payment Gateway Guide: https://razorpay.com/docs/payments/
- API Reference: https://razorpay.com/docs/api/

### Support
- Razorpay Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com
- Status Page: https://status.razorpay.com

### Testing Tools
- Test Card Numbers: https://razorpay.com/docs/payments/payments/test-card-details/
- Razorpay Postman Collection: Available on their docs

---

## 12. Checklist

Before going live:

- [ ] KYC verification completed
- [ ] Live API keys generated
- [ ] Environment variables updated
- [ ] Payment methods enabled
- [ ] Test transactions successful
- [ ] Signature verification working
- [ ] Commission calculation verified
- [ ] Order creation tested
- [ ] Webhook configured (optional)
- [ ] SSL certificate installed
- [ ] Terms and conditions updated

---

## Support

For integration issues:
- Check [Razorpay Documentation](https://razorpay.com/docs/)
- Contact Razorpay Support
- Review ReShoe API documentation in `API_DOCS.md`
- Open an issue on GitHub

---

Built with Razorpay ❤️
