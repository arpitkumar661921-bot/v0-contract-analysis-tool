# ContractLens - Wedding Venue Contract Analysis Tool

AI-powered platform to analyze wedding venue contracts, detect hidden fees, and help users make informed decisions.

## Features

### Contract Analysis
- Upload contracts (PDF, images, or paste text)
- AI extracts key details: venue name, dates, prices, guest capacity
- Detects hidden fees and charges
- Calculates total costs in Indian Rupees (₹)
- Risk score and recommendations

### AI Assistant
- Ask questions about your uploaded contracts
- Get negotiation tips
- Compare multiple contracts
- Contextual AI chat with contract knowledge

### Venue Search
- Search for wedding venues
- View venue details with images
- Compare venue contracts side-by-side

### Payment System
- Direct bank transfer/UPI payments to your account
- Manual verification by admin
- Three subscription tiers: Individual, Planner, Enterprise
- Admin panel for payment approval

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **AI:** OpenAI GPT-4o-mini via API
- **State Management:** Zustand with localStorage persistence

## Environment Variables

\`\`\`bash
OPENAI_API_KEY=your_openai_key_here
\`\`\`

## Installation

\`\`\`bash
# Install dependencies (handled automatically by Next.js in v0)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Key Files

- `/app/api/analyze-contract/route.ts` - AI contract analysis
- `/app/api/ai-chat/route.ts` - AI chat assistant
- `/app/api/compare-contracts/route.ts` - Contract comparison
- `/app/dashboard/admin/page.tsx` - Admin payment approval panel
- `/components/dashboard/billing-page.tsx` - User billing and subscriptions
- `/lib/payment-store.ts` - Payment data management
- `/lib/user-store.ts` - User data and subscription management

## Usage

### For Users
1. Sign up and start with free trial (3 scans)
2. Upload a contract or paste contract text
3. Get AI analysis with hidden fees detection
4. Upgrade to paid plan for unlimited scans
5. Pay via bank transfer/UPI and submit proof
6. Get access after admin approval

### For Admin
1. Go to `/dashboard/admin`
2. Login with password (default: `ContractLens@2024`)
3. Review pending payments
4. Approve/reject with notes
5. Monitor revenue and subscription stats

## Deployment

App is configured for easy deployment to Vercel:
- `next.config.mjs` includes production settings
- ESLint and TypeScript errors ignored for deployment
- Images are unoptimized for faster builds

## Security Notes

- Admin password should be changed before production
- localStorage is used for demo - use a real database in production
- Add server-side session management for admin auth
- Implement rate limiting on AI API routes
- Add CORS protection for API endpoints

## Support

For issues or questions, contact via admin panel or help section in dashboard.

## License

Proprietary - All rights reserved
