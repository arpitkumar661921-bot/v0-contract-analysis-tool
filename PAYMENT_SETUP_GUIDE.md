# Payment System Setup Guide

## Overview
Your app has a complete payment verification system where users pay you directly via bank transfer/UPI, and you manually approve their subscriptions.

## How It Works

### For Users:
1. User selects a plan on `/dashboard/billing` page
2. They see your bank details:
   - **Account Name:** Arpit Kumar
   - **Account Number:** 1285538701
   - **IFSC Code:** AIRP0000001
   - **UPI ID:** arpitkumar@upi

3. After payment, user submits:
   - Transaction ID / UTR number
   - Payment screenshot

4. Their subscription status changes to "pending"
5. Once you approve, they get full access to features based on their plan

### For You (Admin):
1. Go to `/dashboard/admin`
2. Login password: `ContractScan@2024` (you can change this in the code)
3. Review pending payments with screenshots
4. Approve or reject payments
5. When approved, user's plan is automatically activated

## Payment Plans

### Individual - ₹99/month
- 5 contract scans/month
- Hidden fee detection
- Cost calculator
- 1-page summary PDF

### Planner - ₹1,999/month (Most Popular)
- Unlimited contract scans
- AI negotiation suggestions
- Venue comparison (up to 5)
- Contract templates
- Budget planner
- Priority support

### Enterprise - ₹4,999/month
- Everything in Planner
- Team dashboard (10 users)
- Client sharing links
- API access
- Whitelabel branding
- Dedicated support

## Money Flow

When users pay:
1. They transfer money to YOUR bank account (Account: 1285538701)
2. OR send via UPI to YOUR UPI ID (arpitkumar@upi)
3. Money goes directly to your account (no middleman, no platform fees)
4. You verify the payment manually via transaction ID and screenshot
5. You approve in admin panel, and user gets access

## Important Notes

- **YOU RECEIVE THE MONEY DIRECTLY** - Not through any payment gateway
- **NO PLATFORM FEES** - 100% of payment goes to you
- **MANUAL VERIFICATION** - You check each payment personally before approval
- **STORED LOCALLY** - All payment data is stored in browser localStorage (for demo)
- **FOR PRODUCTION** - You should:
  - Connect to a real database (Supabase, Neon, etc.)
  - Add email notifications for new payments
  - Set up automated reminders for pending reviews
  - Consider adding SMS/WhatsApp notifications

## Security

- Admin panel is password-protected
- Session-based authentication for admin access
- Payment screenshots are stored as base64 in localStorage
- All payment records include unique IDs and timestamps

## Customization

To change admin password, edit line 8 in `/app/dashboard/admin/page.tsx`:
\`\`\`typescript
const ADMIN_PASSWORD = "YourNewPassword123"
\`\`\`

To change bank details, edit `/components/dashboard/billing-page.tsx`:
\`\`\`typescript
const BANK_DETAILS = {
  accountName: "Your Name",
  accountNumber: "Your Account Number",
  ifscCode: "Your IFSC Code",
  upiId: "your-upi@provider",
}
\`\`\`

## Testing the System

1. Go to `/dashboard/billing`
2. Click "Subscribe" on any plan
3. Enter a test transaction ID (e.g., "TEST123456")
4. Upload a screenshot
5. Submit
6. Go to `/dashboard/admin`
7. Login with password: `ContractScan@2024`
8. Review and approve the payment
9. Go back to billing page - subscription should now be active

## Deployment Checklist

- [ ] Change admin password
- [ ] Update bank details to your actual account
- [ ] Test payment flow end-to-end
- [ ] Set up database for production (currently using localStorage)
- [ ] Add email notifications for new payments
- [ ] Consider adding webhook for real-time updates
- [ ] Set up backup system for payment records
- [ ] Add audit logs for admin actions
