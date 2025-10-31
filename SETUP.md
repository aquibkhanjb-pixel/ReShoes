# ReShoe - Setup Guide

This guide will walk you through setting up ReShoe on your local machine step-by-step.

## Prerequisites Installation

### 1. Install Node.js
- Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install MongoDB

#### Option A: Local MongoDB
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 3. Create Cloudinary Account
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard
3. Note down:
   - Cloud Name
   - API Key
   - API Secret

### 4. Create Razorpay Account
1. Sign up at [razorpay.com](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate and copy:
   - Key ID (starts with `rzp_test_`)
   - Key Secret
4. Note: Razorpay provides test mode keys automatically for development

## Project Setup

### Step 1: Clone or Download Project

```bash
# If using git
git clone <repository-url>
cd reshoe

# Or extract the ZIP file and navigate to the folder
cd reshoe
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages. It may take a few minutes.

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   # On Windows
   copy .env.example .env.local

   # On Mac/Linux
   cp .env.example .env.local
   ```

2. Open `.env.local` in your text editor and fill in your credentials:

```env
# Database - Use one of these
MONGODB_URI=mongodb://localhost:27017/reshoe
# OR
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/reshoe

# JWT Secret - Generate a random string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Cloudinary - From your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay - From your Razorpay dashboard
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Platform Settings
COMMISSION_RATE=10
```

#### How to generate JWT_SECRET:
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random string generator online
```

### Step 4: Seed the Database

```bash
npm run seed
```

This will:
- Connect to your MongoDB database
- Clear any existing data
- Create 11 demo users (1 admin, 5 sellers, 5 customers)
- Create 10 sample shoe listings
- Set up platform settings

You should see output like:
```
Connected to MongoDB
Creating admin user...
Creating seller users...
Creating shoe listings...
Database seeded successfully! 🎉
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Testing the Application

### 1. Test Customer Flow

1. Go to http://localhost:3000
2. Click "Login"
3. Use credentials:
   - Email: `john@example.com`
   - Password: `password123`
4. Browse shoes on homepage
5. Click on a shoe to view details
6. Test adding to cart (if implemented)

### 2. Test Seller Dashboard

1. Logout if logged in
2. Login with seller account:
   - Email: `sarah@example.com`
   - Password: `password123`
3. You'll be redirected to `/seller`
4. View your dashboard with listings
5. Try creating a new shoe listing
6. Manage existing listings

### 3. Test Admin Dashboard

1. Logout if logged in
2. Login with admin account:
   - Email: `admin@reshoe.com`
   - Password: `password123`
3. You'll be redirected to `/admin`
4. View platform analytics
5. See all users, listings, and transactions
6. Test managing commission rates

## Common Issues and Solutions

### Issue: MongoDB connection error
**Solution**:
- Check if MongoDB is running (if using local)
- Verify connection string in `.env.local`
- For Atlas, check IP whitelist and database user credentials

### Issue: "Cannot find module" errors
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Port 3000 already in use
**Solution**:
```bash
# Run on different port
npm run dev -- -p 3001
```

### Issue: Images not uploading
**Solution**:
- Verify Cloudinary credentials
- Check internet connection
- Ensure API key has upload permissions

### Issue: Razorpay payment not working
**Solution**:
- Use Razorpay test card: 4111 1111 1111 1111 (any CVV, future expiry)
- Verify Razorpay test keys are used (starting with rzp_test_)
- Check browser console for errors
- Ensure Razorpay checkout script is loaded

## Next Steps

1. **Customize Branding**
   - Update logo in homepage
   - Change color scheme in `tailwind.config.ts`
   - Update platform name in Settings model

2. **Add Real Images**
   - Replace demo images with real shoe photos
   - Update seed script with your images
   - Test Cloudinary upload functionality

3. **Configure Email Notifications**
   - Set up Nodemailer or Resend
   - Add email templates
   - Configure SMTP settings

4. **Test Payment Flow**
   - Use Razorpay test cards
   - Test payment verification
   - Verify commission calculations

5. **Deploy to Production**
   - See DEPLOYMENT.md for instructions
   - Update environment variables for production
   - Test thoroughly before going live

## Development Tips

- Use `console.log()` for debugging
- Check browser DevTools Network tab for API calls
- MongoDB Compass for database visualization
- Razorpay Dashboard for payment testing
- Cloudinary Media Library for image management

## Getting Help

- Check README.md for full documentation
- Review API documentation in API_DOCS.md
- Open an issue on GitHub
- Contact: support@reshoe.com

## Verification Checklist

- [ ] MongoDB connected successfully
- [ ] Database seeded with demo data
- [ ] Can login as customer
- [ ] Can login as seller
- [ ] Can login as admin
- [ ] Homepage displays shoes
- [ ] Shoe detail page works
- [ ] Seller dashboard displays correctly
- [ ] Admin dashboard shows analytics
- [ ] Images can be viewed
- [ ] All demo accounts accessible

If all items are checked, you're ready to start developing!

---

Happy coding! 🚀
