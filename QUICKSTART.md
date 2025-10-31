# ReShoe - Quick Start Guide

Get ReShoe up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Login

### Customer
- Email: `john@example.com`
- Password: `password123`

### Seller
- Email: `sarah@example.com`
- Password: `password123`

### Admin
- Email: `admin@reshoe.com`
- Password: `password123`

## What's Included

✅ Complete authentication system
✅ Customer shopping experience
✅ Seller dashboard
✅ Admin dashboard
✅ Payment integration (Razorpay)
✅ Image uploads (Cloudinary)
✅ Commission system
✅ Order tracking
✅ Review system
✅ Analytics dashboard
✅ Demo data (10 shoes, 11 users)

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # Reusable components
├── lib/             # Utilities and helpers
├── models/          # Database models
└── store/           # State management
```

## Key Features

1. **Role-Based Access**
   - Customer: Browse and buy
   - Seller: List and manage shoes
   - Admin: Full platform control

2. **Payment Flow**
   - Razorpay integration
   - Automatic commission deduction
   - Transaction tracking

3. **Image Management**
   - Cloudinary integration
   - Automatic optimization
   - Multiple image support

4. **Analytics**
   - User statistics
   - Sales tracking
   - Revenue reports

## Next Steps

- [ ] Customize branding
- [ ] Add real product images
- [ ] Test payment flow
- [ ] Configure email notifications
- [ ] Deploy to production

## Need Help?

- 📖 Full docs: See `README.md`
- 🔧 Setup guide: See `SETUP.md`
- 🌐 API docs: See `API_DOCS.md`

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed database
npm run lint     # Lint code
```

## Support

- GitHub Issues
- Email: support@reshoe.com

---

Happy building! 🚀
