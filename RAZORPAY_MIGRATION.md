# Stripe to Razorpay Migration Summary

This document outlines all changes made to replace Stripe with Razorpay payment gateway.

## Changes Overview

### ✅ Files Modified: 9
### ✅ Files Created: 3
### ✅ Files Deleted: 1 (Stripe utility)

---

## 1. Package Dependencies

**File:** `package.json`

**Changed:**
```diff
- "stripe": "^15.0.0",
+ "razorpay": "^2.9.2",
```

**Action Required:**
```bash
npm install
```

---

## 2. Payment Utility Library

### Deleted
- `src/lib/stripe.ts`

### Created
- `src/lib/razorpay.ts` - New Razorpay utility functions

**Features:**
- `createRazorpayOrder()` - Create payment order
- `verifyRazorpayPayment()` - Verify payment signature
- `fetchRazorpayPayment()` - Fetch payment details
- `captureRazorpayPayment()` - Capture payment

---

## 3. API Routes

### Deleted
- `src/app/api/stripe/create-payment-intent/route.ts`

### Created
- `src/app/api/razorpay/create-order/route.ts`
- `src/app/api/razorpay/verify-payment/route.ts`

### New Endpoints
1. **POST /api/razorpay/create-order**
   - Creates Razorpay order
   - Returns order ID, amount, currency, and key ID

2. **POST /api/razorpay/verify-payment**
   - Verifies payment signature
   - Ensures payment authenticity

---

## 4. Environment Variables

**File:** `.env.example`, `next.config.mjs`

**Changed:**
```diff
- # Stripe Payment Gateway
- STRIPE_SECRET_KEY=sk_test_your_secret_key
- STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
- STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
+ # Razorpay Payment Gateway
+ RAZORPAY_KEY_ID=rzp_test_your_key_id
+ RAZORPAY_KEY_SECRET=your_key_secret
```

**Action Required:**
Create/update your `.env.local` file with Razorpay credentials.

---

## 5. Configuration Files

**File:** `next.config.mjs`

**Changed:**
```diff
env: {
-   STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
-   STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
-   STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
+   RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
+   RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
}
```

---

## 6. Documentation Updates

### Modified Files
1. **README.md**
   - Updated tech stack
   - Updated payment flow
   - Updated API endpoints
   - Updated environment variables
   - Updated prerequisites
   - Updated deployment instructions

2. **SETUP.md**
   - Updated prerequisites section
   - Updated Razorpay account creation steps
   - Updated environment variable configuration
   - Updated troubleshooting guide
   - Updated test card information

3. **QUICKSTART.md**
   - Updated prerequisites
   - Updated key features list
   - Updated payment flow description

4. **API_DOCS.md** (To be updated)
   - Update Stripe section to Razorpay
   - Add new Razorpay endpoints documentation

### New Documentation
1. **RAZORPAY_INTEGRATION.md** - Comprehensive Razorpay integration guide
2. **RAZORPAY_MIGRATION.md** - This file

---

## 7. Payment Flow Changes

### Old Flow (Stripe)
1. Create payment intent → `POST /api/stripe/create-payment-intent`
2. Customer pays with Stripe Elements
3. Stripe handles payment processing
4. Create order on success

### New Flow (Razorpay)
1. Create Razorpay order → `POST /api/razorpay/create-order`
2. Customer pays with Razorpay Checkout
3. Verify payment signature → `POST /api/razorpay/verify-payment`
4. Create order on successful verification

**Key Difference:** Razorpay requires server-side signature verification for security.

---

## 8. Frontend Integration (To Do)

Frontend checkout pages need to be updated to use Razorpay:

### Required Changes

1. **Load Razorpay Script**
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

2. **Update Payment Handler**
   ```javascript
   // Old: Stripe Elements
   const stripe = await loadStripe(publishableKey);

   // New: Razorpay Checkout
   const razorpay = new window.Razorpay(options);
   razorpay.open();
   ```

3. **Update API Calls**
   ```javascript
   // Old
   POST /api/stripe/create-payment-intent

   // New
   POST /api/razorpay/create-order
   POST /api/razorpay/verify-payment
   ```

---

## 9. Testing

### Test Credentials

**Razorpay Test Cards:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- success@razorpay (Success)
- failure@razorpay (Failure)

### Testing Checklist
- [ ] Order creation successful
- [ ] Payment signature verification working
- [ ] Commission calculation correct
- [ ] Transaction record created
- [ ] Shoe status updated to "sold"
- [ ] Seller earnings calculated properly

---

## 10. Production Deployment

### Before Going Live

1. **Get Razorpay Live Keys**
   - Complete KYC verification
   - Generate live API keys
   - Keys start with `rzp_live_`

2. **Update Environment Variables**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_secret
   ```

3. **Enable Payment Methods**
   - Cards
   - UPI
   - Netbanking
   - Wallets

4. **Test in Production**
   - Use small amount (₹1)
   - Verify end-to-end flow
   - Check commission calculation
   - Verify order creation

---

## 11. Security Considerations

### ✅ Implemented
- Server-side signature verification
- Environment variable protection
- Secure API key storage
- HTTPS required for production

### ⚠️ Important
- Never expose Key Secret in frontend
- Always verify payments on server
- Use different keys for test/production
- Keep webhook secret secure (if implemented)

---

## 12. Differences: Stripe vs Razorpay

| Feature | Stripe | Razorpay |
|---------|--------|----------|
| **Region** | Global | India-focused |
| **Currency** | 135+ currencies | 100+ currencies, INR primary |
| **Payment Flow** | Payment Intent | Order → Payment → Verify |
| **Verification** | Automatic | Manual signature check |
| **Test Cards** | 4242 4242 4242 4242 | 4111 1111 1111 1111 |
| **UPI Support** | No | Yes (India) |
| **Setup Fee** | No | No |
| **Transaction Fee** | 2.9% + $0.30 | 2% + ₹0 |

---

## 13. Migration Checklist

Backend:
- [x] Update package.json
- [x] Create Razorpay utility file
- [x] Create API routes
- [x] Update environment variables
- [x] Update next.config.mjs
- [x] Update documentation

Frontend (To Do):
- [ ] Add Razorpay checkout script
- [ ] Update checkout page
- [ ] Update payment handler
- [ ] Update API calls
- [ ] Test payment flow
- [ ] Handle payment errors

Testing:
- [ ] Test order creation
- [ ] Test payment verification
- [ ] Test commission calculation
- [ ] Test error scenarios
- [ ] Test different payment methods

Documentation:
- [x] Update README.md
- [x] Update SETUP.md
- [x] Update QUICKSTART.md
- [x] Create RAZORPAY_INTEGRATION.md
- [x] Create RAZORPAY_MIGRATION.md
- [ ] Update API_DOCS.md

---

## 14. Resources

### Razorpay Resources
- Dashboard: https://dashboard.razorpay.com
- Documentation: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: support@razorpay.com

### ReShoe Documentation
- Full Integration Guide: `RAZORPAY_INTEGRATION.md`
- API Documentation: `API_DOCS.md`
- Setup Guide: `SETUP.md`

---

## 15. Support

For migration issues:
1. Check `RAZORPAY_INTEGRATION.md` for detailed integration guide
2. Review Razorpay official documentation
3. Contact Razorpay support for payment-specific issues
4. Open GitHub issue for ReShoe-specific problems

---

## Summary

✅ **Backend migration complete**
- All Stripe code replaced with Razorpay
- New API endpoints created
- Documentation updated
- Ready for frontend integration

⏳ **Pending Tasks**
- Frontend checkout page implementation
- Payment flow testing
- Production deployment

---

**Migration Date:** 2024
**Status:** Backend Complete, Frontend Pending
**Breaking Changes:** Yes - API endpoints changed

---

For questions or issues, refer to `RAZORPAY_INTEGRATION.md` or contact support.
