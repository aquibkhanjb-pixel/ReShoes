require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reshoe';

// Define schemas inline for seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const shoeSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  brand: String,
  size: Number,
  condition: String,
  price: Number,
  description: String,
  images: [String],
  status: String,
  approvalStatus: String,
  rejectionReason: String,
  category: String,
  views: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const settingsSchema = new mongoose.Schema({
  commissionRate: Number,
  platformName: String,
  contactEmail: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Shoe = mongoose.models.Shoe || mongoose.model('Shoe', shoeSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// Demo data
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Shoe.deleteMany({});
    await Settings.deleteMany({});
    console.log('Existing data cleared');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@reshoe.com',
      password: hashedPassword,
      role: 'admin',
      profileImage: '',
    });
    console.log('Admin created:', admin.email);

    // Create Sellers
    console.log('Creating seller users...');
    const sellers = [];
    const sellerData = [
      { name: 'Sarah Johnson', email: 'sarah@example.com' },
      { name: 'Michael Chen', email: 'michael@example.com' },
      { name: 'Emma Williams', email: 'emma@example.com' },
      { name: 'David Martinez', email: 'david@example.com' },
      { name: 'Lisa Anderson', email: 'lisa@example.com' },
    ];

    for (const seller of sellerData) {
      const user = await User.create({
        ...seller,
        password: hashedPassword,
        role: 'seller',
        profileImage: '',
      });
      sellers.push(user);
      console.log('Seller created:', user.email);
    }

    // Create Customers
    console.log('Creating customer users...');
    const customerData = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Robert Brown', email: 'robert@example.com' },
      { name: 'Maria Garcia', email: 'maria@example.com' },
      { name: 'James Wilson', email: 'james@example.com' },
    ];

    for (const customer of customerData) {
      const user = await User.create({
        ...customer,
        password: hashedPassword,
        role: 'customer',
        profileImage: '',
      });
      console.log('Customer created:', user.email);
    }

    // Create Shoes
    console.log('Creating shoe listings...');
    const shoeData = [
      {
        seller: sellers[0]._id,
        title: 'Nike Air Max 90 White',
        brand: 'Nike',
        size: 10,
        condition: 'like-new',
        price: 7499,
        description: 'Barely worn Nike Air Max 90 in white colorway. Excellent condition with minimal signs of wear. Comes with original box.',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'men',
        views: 45,
      },
      {
        seller: sellers[0]._id,
        title: 'Adidas Ultraboost Black',
        brand: 'Adidas',
        size: 9.5,
        condition: 'good',
        price: 6299,
        description: 'Comfortable Adidas Ultraboost in black. Some wear on the sole but still plenty of life left. Perfect for daily runners.',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'men',
        views: 32,
      },
      {
        seller: sellers[1]._id,
        title: 'Converse Chuck Taylor High Top',
        brand: 'Converse',
        size: 8,
        condition: 'fair',
        price: 2999,
        description: 'Classic Chuck Taylor All Stars in red. Well-loved with character. Great for casual wear.',
        images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'unisex',
        views: 28,
      },
      {
        seller: sellers[1]._id,
        title: 'New Balance 574 Grey',
        brand: 'New Balance',
        size: 11,
        condition: 'new',
        price: 7999,
        description: 'Brand new New Balance 574 in grey colorway. Never worn, still has tags. Decided they were not my style.',
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'men',
        views: 67,
      },
      {
        seller: sellers[2]._id,
        title: 'Vans Old Skool Black/White',
        brand: 'Vans',
        size: 7,
        condition: 'good',
        price: 3799,
        description: 'Classic Vans Old Skool in the iconic black and white colorway. Some wear but still in great shape.',
        images: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'unisex',
        views: 41,
      },
      {
        seller: sellers[2]._id,
        title: 'Nike Blazer Mid Vintage',
        brand: 'Nike',
        size: 8.5,
        condition: 'like-new',
        price: 6899,
        description: 'Nike Blazer Mid in vintage style. Worn only a handful of times. Excellent condition with minimal creasing.',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'women',
        views: 53,
      },
      {
        seller: sellers[3]._id,
        title: 'Puma RS-X Colorful',
        brand: 'Puma',
        size: 9,
        condition: 'good',
        price: 5699,
        description: 'Vibrant Puma RS-X sneakers. Perfect for making a statement. Some wear on the outsole.',
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'women',
        views: 36,
      },
      {
        seller: sellers[3]._id,
        title: 'Reebok Club C 85 White',
        brand: 'Reebok',
        size: 10.5,
        condition: 'like-new',
        price: 4899,
        description: 'Clean white Reebok Club C 85. Timeless design in excellent condition. Minor yellowing on the sole.',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'men',
        views: 29,
      },
      {
        seller: sellers[4]._id,
        title: 'Jordan 1 Mid Chicago',
        brand: 'Nike',
        size: 10,
        condition: 'good',
        price: 10499,
        description: 'Air Jordan 1 Mid in the classic Chicago colorway. Some creasing and wear but still a great shoe.',
        images: ['https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'men',
        views: 89,
      },
      {
        seller: sellers[4]._id,
        title: 'Saucony Jazz Original Blue',
        brand: 'Saucony',
        size: 9,
        condition: 'fair',
        price: 3499,
        description: 'Retro Saucony Jazz Original in blue and grey. Vintage vibes with some wear showing.',
        images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800'],
        status: 'approved',
        approvalStatus: 'approved',
        category: 'unisex',
        views: 22,
      },
    ];

    for (const shoe of shoeData) {
      const created = await Shoe.create(shoe);
      console.log('Shoe created:', created.title);
    }

    // Create Settings
    console.log('Creating platform settings...');
    await Settings.create({
      commissionRate: 10,
      platformName: 'ReShoe',
      contactEmail: 'support@reshoe.com',
    });
    console.log('Settings created');

    console.log('\n=================================');
    console.log('Database seeded successfully! 🎉');
    console.log('=================================');
    console.log('\nDemo Accounts:');
    console.log('\nAdmin:');
    console.log('  Email: admin@reshoe.com');
    console.log('  Password: password123');
    console.log('\nSellers (all use password: password123):');
    sellerData.forEach(s => console.log(`  - ${s.email}`));
    console.log('\nCustomers (all use password: password123):');
    customerData.forEach(c => console.log(`  - ${c.email}`));
    console.log('\nTotal Shoes Created: 10');
    console.log('=================================\n');

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
