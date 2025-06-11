# Razorpay Integration Setup Guide

## Step 1: Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a new account or login if you already have one
3. Complete the KYC verification process
4. Get your business approved for live payments

## Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate your API Keys:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret** (keep this secret and secure)

## Step 3: Update Your Website
1. Open `payment.html`
2. Find the `RAZORPAY_CONFIG` object around line 639
3. Replace `"rzp_test_1234567890"` with your actual Key ID
```javascript
const RAZORPAY_CONFIG = {
    key: "rzp_test_wprLXkrhIRnVmn", // Replace with your Key ID
    currency: "INR",
    name: "Aadya Fashions",
    description: "Stylish Kurtis for Modern Women",
    image: "https://placehold.co/150x150/FFDAB9/2F2F2F?text=Aadya", // Your logo URL
    theme: {
        color: "#FF7F50"
    }
};
```

## Step 4: Test Payments
### Test Mode Key IDs start with `rzp_test_`
- Use test card numbers provided by Razorpay
- Test cards: 4111 1111 1111 1111 (Visa), 5555 5555 5555 4444 (Mastercard)
- Use any future date for expiry and any 3-digit CVV

### Test UPI IDs:
- `success@razorpay` - Always succeeds
- `failure@razorpay` - Always fails

## Step 5: Go Live
1. Complete business verification in Razorpay Dashboard
2. Replace test key with live key (starts with `rzp_live_`)
3. Update webhook URLs if using backend
4. Test with small amounts first

## Important Notes
- **Never expose your Key Secret** in frontend code
- The current implementation is frontend-only (good for testing)
- For production, implement a backend to create orders and verify payments
- Consider implementing webhook verification for order confirmation

## Webhook Setup (Optional - for Production)
1. Create an endpoint in your backend to handle Razorpay webhooks
2. Add webhook URL in Razorpay Dashboard → Settings → Webhooks
3. Verify webhook signatures for security

## Payment Flow
1. Customer fills checkout form
2. Selects "Online Payment (Razorpay)"
3. Razorpay checkout opens with payment options
4. Customer completes payment
5. Order is saved and customer is redirected to confirmation page

## Supported Payment Methods
- Credit/Debit Cards
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Net Banking
- Wallets (Paytm, Freecharge, etc.)
- EMI options (for eligible cards)

## Security Features
- PCI DSS compliant
- 256-bit SSL encryption
- Two-factor authentication
- Real-time fraud detection

## Contact Support
- Razorpay Support: support@razorpay.com
- Documentation: https://razorpay.com/docs/
