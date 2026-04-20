import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as Models from './models.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bvpws';

export async function connectDB() {
  console.log('💾 [DB] Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ [DB] Connected to MongoDB');
    await seedDatabase();
  } catch (err) {
    console.error('❌ [DB] MongoDB connection error:', err);
    throw err; // Let the caller handle the fatal error
  }
}

async function seedDatabase() {
  try {
    // Seed AI model setting
    const aiModel = await Models.Setting.findOne({ key: 'ai_model' });
    if (!aiModel) {
      await Models.Setting.create({ key: 'ai_model', value: 'models/gemini-2.5-flash' });
    }

    // Seed admin user
    const adminExists = await Models.User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await Models.User.create({ username: 'admin', password: hashedPassword });
      console.warn('\n⚠️  DEFAULT ADMIN CREATED: username=admin, password=admin123');
      console.warn('   CHANGE THIS PASSWORD before going live!\n');
    }

    // Seed officers
    const officersCount = await Models.Officer.countDocuments();
    if (officersCount === 0) {
      console.log('🌱 [DB] Seeding officers...');
      const seedOfficers = [
        { name: 'Shri A. K. Sharma', designation: 'Chief Workshop Manager (CWM)', imageUrl: '/uploads/placeholder-cwm.jpg', orderIndex: 1 },
        { name: 'Shri R. K. Singh', designation: 'Dy. Chief Mechanical Engineer (Dy. CME)', imageUrl: '/uploads/placeholder-dycme.jpg', orderIndex: 2 },
        { name: 'Shri P. Patel', designation: 'Works Manager (WM)', imageUrl: '/uploads/placeholder-wm.jpg', orderIndex: 3 },
        { name: 'Shri M. Kumar', designation: 'Assistant Works Manager (AWM)', imageUrl: '/uploads/placeholder-awm.jpg', orderIndex: 4 },
      ];
      await Models.Officer.insertMany(seedOfficers);
    }

    // Seed sliders
    const slidersCount = await Models.Slider.countDocuments();
    if (slidersCount === 0) {
      console.log('🌱 [DB] Seeding sliders...');
      const seedSliders = [
        { title: 'Welcome to Bhavnagar Workshop', imageUrl: '/uploads/placeholder-workshop1.jpg', orderIndex: 1 },
        { title: 'Excellence in Railway Maintenance', imageUrl: '/uploads/placeholder-workshop2.jpg', orderIndex: 2 },
        { title: 'Modern Infrastructure', imageUrl: '/uploads/placeholder-workshop3.jpg', orderIndex: 3 },
      ];
      await Models.Slider.insertMany(seedSliders);
    }

    // Seed tickers
    const tickersCount = await Models.Ticker.countDocuments();
    if (tickersCount === 0) {
      console.log('🌱 [DB] Seeding tickers...');
      const seedTickers = [
        { text: 'Latest Flash: New promotion list for technicians has been published.', isActive: true },
        { text: 'Important: Safety week observation starting from next Monday.', isActive: true },
      ];
      await Models.Ticker.insertMany(seedTickers);
    }

    // Seed notifications
    const notificationsCount = await Models.Notification.countDocuments();
    if (notificationsCount === 0) {
      console.log('🌱 [DB] Seeding notifications...');
      const seedNotifications = [
        { title: 'Promotion Order - Technicians Grade I', pdfUrl: '#' },
        { title: 'Circular regarding Holiday on 15th August', pdfUrl: '#' },
        { title: 'Notice for Departmental Exam', pdfUrl: '#' },
      ];
      await Models.Notification.insertMany(seedNotifications);
    }

    // Seed stats
    const statsCount = await Models.Stat.countDocuments();
    if (statsCount === 0) {
      console.log('🌱 [DB] Seeding stats...');
      const seedStats = [
        { key: 'locos', value: '500+', label: 'Locos Repaired', icon: 'Train' },
        { key: 'staff', value: '1000+', label: 'Dedicated Staff', icon: 'Users' },
        { key: 'estb', value: '19XX', label: 'Established', icon: 'Building' },
      ];
      await Models.Stat.insertMany(seedStats);
    }

    // Seed gallery
    const galleryCount = await Models.Gallery.countDocuments();
    if (galleryCount === 0) {
      console.log('🌱 [DB] Seeding gallery...');
      const seedGallery = [
        { imageUrl: '/uploads/placeholder-gal1.jpg', caption: 'Workshop Floor' },
        { imageUrl: '/uploads/placeholder-gal2.jpg', caption: 'Maintenance Work' },
        { imageUrl: '/uploads/placeholder-gal3.jpg', caption: 'Team Meeting' },
        { imageUrl: '/uploads/placeholder-gal4.jpg', caption: 'Safety Drill' },
        { imageUrl: '/uploads/placeholder-gal5.jpg', caption: 'New Equipment' },
      ];
      await Models.Gallery.insertMany(seedGallery);
    }

    console.log('✅ [DB] Database initialized and seeded.');
  } catch (err) {
    console.error('❌ [DB] Seeding error:', err);
  }
}

export default mongoose;
