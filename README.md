# ReShoe - Buy & Sell Used Shoes

A full-stack e-commerce marketplace for buying and selling pre-owned shoes. Built with Next.js 14, MongoDB, Razorpay, and Cloudinary.

## Features

### Customer Features
- Browse shoes by category, brand, size, condition, and price
- Search and filter functionality
- View detailed product pages with images and seller info
- Shopping cart and wishlist
- Secure checkout with Razorpay
- Order tracking (pending, shipped, delivered)
- Rate and review purchased shoes

### Seller Features
- Separate seller dashboard
- List shoes for sale with images, description, and pricing
- Manage listings (edit, delete)
- Track sales and earnings
- View commission breakdown
- Request payouts
- Email notifications on sales

### Admin Features
- Comprehensive admin dashboard
- Manage all users (view, block/unblock)
- Manage listings (approve, remove)
- View platform analytics (users, sales, revenue)
- Manage commission rates
- View and manage transactions
- Handle refunds and disputes

### Technical Features
- Role-based authentication (Customer, Seller, Admin)
- JWT token authentication
- MongoDB database with Mongoose
- Cloudinary image uploads
- Razorpay payment integration
- Commission system (10% default)
- Responsive design with Tailwind CSS
- Shadcn UI components
- TypeScript for type safety
- RESTful API architecture

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payment**: Razorpay
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Cloudinary account
- Razorpay account (for payments)

## Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd reshoe
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a `.env.local` file in the root directory and add the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/reshoe
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/reshoe

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Commission Rate (in percentage)
COMMISSION_RATE=10
```

4. **Seed the database with demo data**

```bash
npm run seed
```

This will create:
- 1 Admin user
- 5 Seller users
- 5 Customer users
- 10 Sample shoe listings

All demo accounts use the password: `password123`

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can login with these accounts:

### Admin
- **Email**: admin@reshoe.com
- **Password**: password123
- **Access**: Full admin dashboard, manage users, listings, transactions

### Sellers
- sarah@example.com
- michael@example.com
- emma@example.com
- david@example.com
- lisa@example.com
- **Password**: password123 (for all)
- **Access**: Seller dashboard, create listings, view sales

### Customers
- john@example.com
- jane@example.com
- robert@example.com
- maria@example.com
- james@example.com
- **Password**: password123 (for all)
- **Access**: Browse and purchase shoes, track orders

## Project Structure

```
reshoe/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── shoes/         # Shoe CRUD operations
│   │   │   ├── orders/        # Order management
│   │   │   ├── transactions/  # Transaction history
│   │   │   ├── reviews/       # Review system
│   │   │   ├── razorpay/      # Razorpay integration
│   │   │   └── admin/         # Admin endpoints
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── seller/            # Seller dashboard pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── mongodb.ts         # Database connection
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── razorpay.ts        # Razorpay utilities
│   │   ├── cloudinary.ts      # Image upload utilities
│   │   ├── utils.ts           # Helper functions
│   │   └── api-middleware.ts  # API middleware
│   ├── models/                # MongoDB models
│   │   ├── User.ts
│   │   ├── Shoe.ts
│   │   ├── Order.ts
│   │   ├── Transaction.ts
│   │   ├── Review.ts
│   │   └── Settings.ts
│   └── store/
│       └── authStore.ts       # Zustand auth store
├── scripts/
│   └── seed.js                # Database seeding script
├── .env.example               # Environment variables template
├── .env.local                 # Your local environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Shoes
- `GET /api/shoes` - Get all shoes (with filters)
- `POST /api/shoes` - Create new shoe listing (Seller only)
- `GET /api/shoes/[id]` - Get single shoe
- `PUT /api/shoes/[id]` - Update shoe (Owner/Admin only)
- `DELETE /api/shoes/[id]` - Delete shoe (Owner/Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status (Seller/Admin only)

### Transactions
- `GET /api/transactions` - Get transactions (Seller/Admin only)

### Reviews
- `POST /api/reviews` - Create review (Customer only)

### Razorpay
- `POST /api/razorpay/create-order` - Create Razorpay order
- `POST /api/razorpay/verify-payment` - Verify payment signature

### Admin
- `GET /api/admin/analytics` - Get platform analytics (Admin only)
- `GET /api/admin/settings` - Get platform settings (Admin only)
- `PUT /api/admin/settings` - Update settings (Admin only)

## Payment Flow

1. Customer adds shoe to cart and proceeds to checkout
2. Frontend creates Razorpay order via `/api/razorpay/create-order`
3. Customer completes payment with Razorpay checkout
4. Payment signature is verified via `/api/razorpay/verify-payment`
5. On successful verification, order is created via `/api/orders`
6. Shoe status is updated to "sold"
7. Transaction record is created with commission calculation
8. Seller earnings = Sale price - Commission (default 10%)
9. Admin can manage payouts from admin dashboard

## Commission System

- Default commission rate: 10% (configurable by admin)
- Commission is automatically deducted from each sale
- Sellers see net earnings after commission
- All transactions are tracked in the database
- Admin can view total platform earnings

## Development

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Lint code

```bash
npm run lint
```

## Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your production environment:
- Update `MONGODB_URI` to your production database
- Use production Razorpay keys
- Set secure `JWT_SECRET`
- Configure production Cloudinary credentials

## Features to Add (Future Enhancements)

- Google OAuth authentication
- Email notifications (Nodemailer/Resend)
- Real-time chat between buyer and seller
- AI-based price estimation
- Image moderation with Cloudinary AI
- Advanced search with Algolia
- Wishlist functionality
- Order refund system
- Seller verification badges
- Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@reshoe.com or open an issue in the repository.

## Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Vercel for hosting
- MongoDB for the database
- Razorpay for payment processing
- Cloudinary for image management

---

Built with ❤️ by Claude Code
#   R e S h o e s  
 