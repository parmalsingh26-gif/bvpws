import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sliders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    imageUrl TEXT NOT NULL,
    orderIndex INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    isActive BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    pdfUrl TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imageUrl TEXT NOT NULL,
    caption TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS officers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    orderIndex INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    pdfUrl TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed default AI model if not set (from supported_models.txt — prefer Gemini 2.5 Flash)
db.prepare(
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_model', 'models/gemini-2.5-flash')`
).run();

// Seed admin user if not exists
// ⚠️ SECURITY: Change this password IMMEDIATELY before production deployment!
// Run: node -e "console.log(require('bcryptjs').hashSync('YOUR_NEW_PASSWORD', 10))" to generate a new hash
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  console.warn('\n⚠️  DEFAULT ADMIN CREATED: username=admin, password=admin123');
  console.warn('   CHANGE THIS PASSWORD before going live!\n');
}

// Seed officers if not exists
const officersCount = db.prepare('SELECT COUNT(*) as count FROM officers').get() as { count: number };
if (officersCount.count === 0) {
  const seedOfficers = [
    { name: 'Shri A. K. Sharma', designation: 'Chief Workshop Manager (CWM)', imageUrl: '/uploads/placeholder-cwm.jpg', orderIndex: 1 },
    { name: 'Shri R. K. Singh', designation: 'Dy. Chief Mechanical Engineer (Dy. CME)', imageUrl: '/uploads/placeholder-dycme.jpg', orderIndex: 2 },
    { name: 'Shri P. Patel', designation: 'Works Manager (WM)', imageUrl: '/uploads/placeholder-wm.jpg', orderIndex: 3 },
    { name: 'Shri M. Kumar', designation: 'Assistant Works Manager (AWM)', imageUrl: '/uploads/placeholder-awm.jpg', orderIndex: 4 },
  ];
  const insertOfficer = db.prepare('INSERT INTO officers (name, designation, imageUrl, orderIndex) VALUES (?, ?, ?, ?)');
  seedOfficers.forEach(o => insertOfficer.run(o.name, o.designation, o.imageUrl, o.orderIndex));
}

// Seed sliders if not exists
const slidersCount = db.prepare('SELECT COUNT(*) as count FROM sliders').get() as { count: number };
if (slidersCount.count === 0) {
  const seedSliders = [
    { title: 'Welcome to Bhavnagar Workshop', imageUrl: '/uploads/placeholder-workshop1.jpg', orderIndex: 1 },
    { title: 'Excellence in Railway Maintenance', imageUrl: '/uploads/placeholder-workshop2.jpg', orderIndex: 2 },
    { title: 'Modern Infrastructure', imageUrl: '/uploads/placeholder-workshop3.jpg', orderIndex: 3 },
  ];
  const insertSlider = db.prepare('INSERT INTO sliders (title, imageUrl, orderIndex) VALUES (?, ?, ?)');
  seedSliders.forEach(s => insertSlider.run(s.title, s.imageUrl, s.orderIndex));
}

// Seed tickers if not exists
const tickersCount = db.prepare('SELECT COUNT(*) as count FROM tickers').get() as { count: number };
if (tickersCount.count === 0) {
  const seedTickers = [
    { text: 'Latest Flash: New promotion list for technicians has been published.', isActive: 1 },
    { text: 'Important: Safety week observation starting from next Monday.', isActive: 1 },
  ];
  const insertTicker = db.prepare('INSERT INTO tickers (text, isActive) VALUES (?, ?)');
  seedTickers.forEach(t => insertTicker.run(t.text, t.isActive));
}

// Seed notifications if not exists
const notificationsCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number };
if (notificationsCount.count === 0) {
  const seedNotifications = [
    { title: 'Promotion Order - Technicians Grade I', pdfUrl: '#' },
    { title: 'Circular regarding Holiday on 15th August', pdfUrl: '#' },
    { title: 'Notice for Departmental Exam', pdfUrl: '#' },
  ];
  const insertNotification = db.prepare('INSERT INTO notifications (title, pdfUrl) VALUES (?, ?)');
  seedNotifications.forEach(n => insertNotification.run(n.title, n.pdfUrl));
}

// Seed stats if not exists
const statsCount = db.prepare('SELECT COUNT(*) as count FROM stats').get() as { count: number };
if (statsCount.count === 0) {
  const seedStats = [
    { key: 'locos', value: '500+', label: 'Locos Repaired', icon: 'Train' },
    { key: 'staff', value: '1000+', label: 'Dedicated Staff', icon: 'Users' },
    { key: 'estb', value: '19XX', label: 'Established', icon: 'Building' },
  ];
  const insertStat = db.prepare('INSERT INTO stats (key, value, label, icon) VALUES (?, ?, ?, ?)');
  seedStats.forEach(s => insertStat.run(s.key, s.value, s.label, s.icon));
}

// Seed gallery if not exists
const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get() as { count: number };
if (galleryCount.count === 0) {
  const seedGallery = [
    { imageUrl: '/uploads/placeholder-gal1.jpg', caption: 'Workshop Floor' },
    { imageUrl: '/uploads/placeholder-gal2.jpg', caption: 'Maintenance Work' },
    { imageUrl: '/uploads/placeholder-gal3.jpg', caption: 'Team Meeting' },
    { imageUrl: '/uploads/placeholder-gal4.jpg', caption: 'Safety Drill' },
    { imageUrl: '/uploads/placeholder-gal5.jpg', caption: 'New Equipment' },
  ];
  const insertGallery = db.prepare('INSERT INTO gallery (imageUrl, caption) VALUES (?, ?)');
  seedGallery.forEach(g => insertGallery.run(g.imageUrl, g.caption));
}

export default db;
