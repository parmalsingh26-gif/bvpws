import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './database.js';
import * as Models from './models.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

console.log('🚀 [Server] Initializing...');

// --- Security: JWT Secret ---
const JWT_SECRET = process.env.JWT_SECRET;
console.log(`🔍 [Auth] JWT_SECRET is ${JWT_SECRET ? 'SET' : 'NOT SET'}`);

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Cannot start in production without it.');
  process.exit(1);
}
const jwtSecret = JWT_SECRET || 'dev-only-secret-' + Date.now();


// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- File Upload: Validated with size limits and type filtering ---
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_PDF_TYPES = ['application/pdf'];
const ALLOWED_ALL_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_ALL_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: images (JPEG, PNG, WebP, GIF) and PDF.`));
    }
  },
});

/** Safely delete an uploaded file from disk */
function deleteUploadedFile(fileUrl: string) {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    const filename = path.basename(fileUrl);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error('Failed to delete uploaded file:', fileUrl, e);
  }
}

/** Escape regex wildcards in user input for MongoDB text search */
function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/** Validate email format */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function startServer() {
  // Connect to MongoDB FIRST before starting the server
  await connectDB();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // --- Security & middleware (strict order for CRIS compliance) ---
  const isProduction = process.env.NODE_ENV === 'production';
  app.use(helmet({
    crossOriginResourcePolicy: false,
    hsts: isProduction,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:", "https:"],
        ...(isProduction && { upgradeInsecureRequests: [] }),
      },
    },
  }));
  app.use(cors({ origin: isProduction ? false : true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // --- Gzip Compression dummy (standardized in middleware) ---
  app.use((req, res, next) => {
    next();
  });

  // --- Multer error handler ---
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 15MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err?.message?.startsWith('Invalid file type')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }));
  app.use('/assets', express.static(path.resolve(process.cwd(), 'assets'), { maxAge: '30d' }));

  // --- Health Check Endpoint ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Auth Middleware ---
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Helper ---
  const logActivity = async (action: string, details: string) => {
    try {
      await Models.ActivityLog.create({ action, details });
    } catch (e) {
      console.error('Failed to log activity', e);
    }
  };


  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await Models.User.findOne({ username: username.trim() });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, { expiresIn: '8h' });
    res.cookie('admin_token', token, { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/' });
    res.json({ success: true });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ user: (req as any).user });
  });

  app.put('/api/auth/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const userId = (req as any).user.id;
    const user = await Models.User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    logActivity('Security', 'Admin password changed successfully');
    res.json({ success: true, message: 'Password updated successfully' });
  });


  // Sliders
  app.get('/api/sliders', async (req, res) => {
    const sliders = await Models.Slider.find().sort({ orderIndex: 1 });
    res.json(sliders.map(s => ({ ...s.toObject(), id: s._id })));
  });

  app.post('/api/sliders', authenticate, upload.single('image'), async (req, res) => {
    const { title, orderIndex } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ error: 'Image is required' });
    
    const slider = await Models.Slider.create({ title: title || '', imageUrl, orderIndex: Number(orderIndex) || 0 });
    logActivity('Added Slider', `Title: ${title || 'Untitled'}`);
    res.json({ ...slider.toObject(), id: slider._id });
  });

  app.delete('/api/sliders/:id', authenticate, async (req, res) => {
    const slider = await Models.Slider.findById(req.params.id);
    if (slider?.imageUrl) deleteUploadedFile(slider.imageUrl);
    await Models.Slider.findByIdAndDelete(req.params.id);
    logActivity('Deleted Slider', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  app.put('/api/sliders/reorder', authenticate, async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of { id, orderIndex }' });
    
    for (const { id, orderIndex } of items) {
      if (!id || typeof orderIndex !== 'number') continue;
      await Models.Slider.findByIdAndUpdate(id, { orderIndex });
    }
    logActivity('Reordered Sliders', 'Updated display order');
    res.json({ success: true });
  });

  // Tickers
  app.get('/api/tickers', async (req, res) => {
    const tickers = await Models.Ticker.find({ isActive: true });
    res.json(tickers.map(t => ({ ...t.toObject(), id: t._id })));
  });

  app.get('/api/admin/tickers', authenticate, async (req, res) => {
    const tickers = await Models.Ticker.find();
    res.json(tickers.map(t => ({ ...t.toObject(), id: t._id })));
  });

  app.post('/api/tickers', authenticate, async (req, res) => {
    const { text, isActive } = req.body;
    const ticker = await Models.Ticker.create({ text, isActive: isActive === undefined ? true : isActive });
    logActivity('Added Ticker', `Text: ${text.substring(0, 30)}...`);
    res.json({ ...ticker.toObject(), id: ticker._id });
  });

  app.put('/api/tickers/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    await Models.Ticker.findByIdAndUpdate(id, { isActive });
    logActivity('Updated Ticker', `ID: ${id} → ${isActive ? 'Active' : 'Inactive'}`);
    res.json({ success: true, isActive });
  });

  app.delete('/api/tickers/:id', authenticate, async (req, res) => {
    await Models.Ticker.findByIdAndDelete(req.params.id);
    logActivity('Deleted Ticker', `ID: ${req.params.id}`);
    res.json({ success: true });
  });


  // Global search (public)
  app.get('/api/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return res.json({ success: true, results: { notifications: [], tickers: [], gallery: [] } });
    }
    const regex = new RegExp(escapeRegex(q), 'i');
    
    const notifications = await Models.Notification.find({ title: regex }).sort({ createdAt: -1 }).limit(20);
    const tickers = await Models.Ticker.find({ isActive: true, text: regex }).limit(20);
    const gallery = await Models.Gallery.find({ caption: regex }).sort({ createdAt: -1 }).limit(20);
    
    res.json({ 
      success: true, 
      results: { 
        notifications: notifications.map(n => ({ ...n.toObject(), id: n._id })), 
        tickers: tickers.map(t => ({ ...t.toObject(), id: t._id })), 
        gallery: gallery.map(g => ({ ...g.toObject(), id: g._id })) 
      } 
    });
  });


  // Contact (public)
  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (name.trim().length > 200 || message.trim().length > 5000) {
      return res.status(400).json({ error: 'Input too long. Name max 200 chars, message max 5000 chars.' });
    }
    await Models.Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === 'string' ? subject.trim().slice(0, 500) : '',
      message: message.trim()
    });
    res.json({ success: true });
  });

  // Notifications
  app.get('/api/notifications', async (req, res) => {
    const { search, category, page = '1', limit = '10' } = req.query;
    const filter: any = {};

    if (search) {
      filter.title = new RegExp(escapeRegex(String(search)), 'i');
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Models.Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const totalCount = await Models.Notification.countDocuments(filter);

    res.json({ 
      notifications: notifications.map(n => ({ ...n.toObject(), id: n._id })), 
      totalPages: Math.ceil(totalCount / Number(limit)), 
      currentPage: Number(page) 
    });
  });

  app.post('/api/notifications', authenticate, upload.single('pdf'), async (req, res) => {
    const { title, category = 'General' } = req.body;
    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : req.body.pdfUrl;
    if (!pdfUrl) return res.status(400).json({ error: 'PDF is required' });

    const notification = await Models.Notification.create({ title, pdfUrl, category });
    logActivity('Added Notification', `Title: ${title}, Category: ${category}`);
    res.json({ ...notification.toObject(), id: notification._id });
  });

  app.delete('/api/notifications/:id', authenticate, async (req, res) => {
    const notification = await Models.Notification.findById(req.params.id);
    if (notification?.pdfUrl) deleteUploadedFile(notification.pdfUrl);
    await Models.Notification.findByIdAndDelete(req.params.id);
    logActivity('Deleted Notification', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Results (LDCE/GDCE etc.)
  app.get('/api/results', async (req, res) => {
    const { search, category, page = '1', limit = '10' } = req.query;
    const filter: any = {};
    if (search) filter.title = new RegExp(escapeRegex(String(search)), 'i');
    if (category && category !== 'All') filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const results = await Models.Result.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const totalCount = await Models.Result.countDocuments(filter);

    res.json({ 
      results: results.map(r => ({ ...r.toObject(), id: r._id })), 
      totalPages: Math.ceil(totalCount / Number(limit)), 
      currentPage: Number(page) 
    });
  });

  app.post('/api/results', authenticate, upload.single('pdf'), async (req, res) => {
    const { title, category = 'General' } = req.body;
    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : req.body.pdfUrl;
    if (!pdfUrl) return res.status(400).json({ error: 'PDF is required' });
    const result = await Models.Result.create({ title: title || '', pdfUrl, category: category || 'General' });
    logActivity('Added Result', `Title: ${title}, Category: ${category}`);
    res.json({ ...result.toObject(), id: result._id });
  });

  app.delete('/api/results/:id', authenticate, async (req, res) => {
    const result = await Models.Result.findById(req.params.id);
    if (result?.pdfUrl) deleteUploadedFile(result.pdfUrl);
    await Models.Result.findByIdAndDelete(req.params.id);
    logActivity('Deleted Result', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Officers
  app.get('/api/officers', async (req, res) => {
    const officers = await Models.Officer.find().sort({ orderIndex: 1 });
    res.json(officers.map(o => ({ ...o.toObject(), id: o._id })));
  });

  app.post('/api/officers', authenticate, upload.single('image'), async (req, res) => {
    const { name, designation, orderIndex } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    if (!name || !designation?.trim()) return res.status(400).json({ error: 'Name and designation are required' });
    if (!imageUrl) return res.status(400).json({ error: 'Image file is required' });
    const officer = await Models.Officer.create({ name: name.trim(), designation: designation.trim(), imageUrl, orderIndex: Number(orderIndex) || 0 });
    logActivity('Added Officer', `Name: ${name.trim()}`);
    res.json({ ...officer.toObject(), id: officer._id });
  });

  app.delete('/api/officers/:id', authenticate, async (req, res) => {
    const officer = await Models.Officer.findById(req.params.id);
    if (officer?.imageUrl) deleteUploadedFile(officer.imageUrl);
    await Models.Officer.findByIdAndDelete(req.params.id);
    logActivity('Deleted Officer', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  app.put('/api/officers/:id', authenticate, upload.single('image'), async (req, res) => {
    const { name, designation, orderIndex } = req.body;
    const id = req.params.id;
    
    const updateData: any = { name, designation, orderIndex: Number(orderIndex) || 0 };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await Models.Officer.findByIdAndUpdate(id, updateData);
    logActivity('Updated Officer', `Name: ${name}`);
    res.json({ success: true });
  });

  app.put('/api/officers/reorder', authenticate, async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of { id, orderIndex }' });
    for (const { id, orderIndex } of items) {
      if (!id || typeof orderIndex !== 'number') continue;
      await Models.Officer.findByIdAndUpdate(id, { orderIndex });
    }
    logActivity('Reordered Officers', 'Updated display order');
    res.json({ success: true });
  });

  // Gallery
  app.get('/api/gallery', async (req, res) => {
    const gallery = await Models.Gallery.find().sort({ createdAt: -1 });
    res.json(gallery.map(g => ({ ...g.toObject(), id: g._id })));
  });

  app.post('/api/gallery', authenticate, upload.single('image'), async (req, res) => {
    const { caption } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ error: 'Image is required' });
    
    const image = await Models.Gallery.create({ imageUrl, caption: caption || '' });
    logActivity('Added Gallery Image', `Caption: ${caption || 'None'}`);
    res.json({ ...image.toObject(), id: image._id });
  });

  app.delete('/api/gallery/:id', authenticate, async (req, res) => {
    const image = await Models.Gallery.findById(req.params.id);
    if (image?.imageUrl) deleteUploadedFile(image.imageUrl);
    await Models.Gallery.findByIdAndDelete(req.params.id);
    logActivity('Deleted Gallery Image', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Stats
  app.get('/api/stats', async (req, res) => {
    const stats = await Models.Stat.find();
    res.json(stats.map(s => ({ ...s.toObject(), id: s._id })));
  });

  app.put('/api/stats', authenticate, async (req, res) => {
    const { stats: statsPayload } = req.body;
    if (!Array.isArray(statsPayload)) return res.status(400).json({ error: 'Invalid format' });

    await Models.Stat.deleteMany({});
    const items = statsPayload.map((s, i) => ({
      key: `stat_${i}`,
      value: String(s?.value || ''),
      label: String(s?.label || ''),
      icon: String(s?.icon || '')
    }));
    await Models.Stat.insertMany(items);
    
    logActivity('Updated Stats', 'Workshop stats updated');
    const updated = await Models.Stat.find().sort({ _id: 1 });
    res.json({ success: true, stats: updated.map(s => ({ ...s.toObject(), id: s._id })) });
  });

  // Admin Quick Stats & Logs
  app.get('/api/admin/quick-stats', authenticate, async (req, res) => {
    const totalPdfs = await Models.Notification.countDocuments();
    const totalSliders = await Models.Slider.countDocuments();
    const totalNews = await Models.Ticker.countDocuments();
    res.json({ totalPdfs, totalSliders, totalNews });
  });

  app.get('/api/admin/activity-logs', authenticate, async (req, res) => {
    const logs = await Models.ActivityLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs.map(l => ({ ...l.toObject(), id: l._id })));
  });

  // Analytics for dashboard charts (authenticated)
  app.get('/api/admin/analytics', authenticate, async (req, res) => {
    const notificationsByCategory = await Models.Notification.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);
    const resultsByCategory = await Models.Result.aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);
    const readCount = await Models.Message.countDocuments({ isRead: true });
    const unreadCount = await Models.Message.countDocuments({ isRead: false });
    const messagesStats = [
      { name: 'Read', value: readCount },
      { name: 'Unread', value: unreadCount },
    ];
    res.json({ notificationsByCategory, resultsByCategory, messagesStats });
  });

  app.get('/api/admin/messages', authenticate, async (req, res) => {
    const messages = await Models.Message.find().sort({ createdAt: -1 });
    res.json(messages.map(m => ({ ...m.toObject(), id: m._id })));
  });

  app.put('/api/admin/messages/:id/read', authenticate, async (req, res) => {
    await Models.Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  });

  // Pages (public read)
  app.get('/api/pages/:slug', async (req, res) => {
    const page = await Models.Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ success: true, page: { title: page.title, content: page.content } });
  });

  app.put('/api/admin/pages/:slug', authenticate, async (req, res) => {
    const slug = req.params.slug;
    const { title, content } = req.body;
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string') {
      return res.status(400).json({ error: 'title and content are required; title must be non-empty' });
    }
    await Models.Page.findOneAndUpdate(
      { slug },
      { title: title.trim(), content, updatedAt: new Date() },
      { upsert: true }
    );
    logActivity('Page Updated', `Slug: ${slug}`);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ [Server] Running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('❌ [Server] Failed to bind to port:', err);
    process.exit(1);
  }
}

// Global Error Handlers
process.on('uncaughtException', (err) => {
  console.error('💥 [Server] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Server] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🎬 [Server] Calling startServer()...');
startServer().catch(err => {
  console.error('❌ [Server] Fatal error in startServer:', err);
  process.exit(1);
});
