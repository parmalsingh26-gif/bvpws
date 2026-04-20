import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import db from './database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { createGzip } from 'zlib';

// --- Security: JWT Secret ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is not set. Cannot start in production without it.');
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

/** Escape SQL LIKE wildcards in user input */
function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

/** Validate email format */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // --- Gzip Compression for responses ---
  app.use((req, res, next) => {
    const _origJson = res.json.bind(res);
    // Compression handled by reverse proxy in production; keep simple here
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
  const logActivity = (action: string, details: string) => {
    try {
      db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)').run(action, details);
    } catch (e) {
      console.error('Failed to log activity', e);
    }
  };


  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '8h' });
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

  app.put('/api/auth/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const userId = (req as any).user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, userId);
    logActivity('Security', 'Admin password changed successfully');
    res.json({ success: true, message: 'Password updated successfully' });
  });


  // Sliders
  app.get('/api/sliders', (req, res) => {
    const sliders = db.prepare('SELECT * FROM sliders ORDER BY orderIndex ASC').all();
    res.json(sliders);
  });

  app.post('/api/sliders', authenticate, upload.single('image'), (req, res) => {
    const { title, orderIndex } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ error: 'Image is required' });
    
    const stmt = db.prepare('INSERT INTO sliders (title, imageUrl, orderIndex) VALUES (?, ?, ?)');
    const info = stmt.run(title || '', imageUrl, orderIndex || 0);
    logActivity('Added Slider', `Title: ${title || 'Untitled'}`);
    res.json({ id: info.lastInsertRowid, title, imageUrl, orderIndex });
  });

  app.delete('/api/sliders/:id', authenticate, (req, res) => {
    const row = db.prepare('SELECT imageUrl FROM sliders WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM sliders WHERE id = ?').run(req.params.id);
    if (row?.imageUrl) deleteUploadedFile(row.imageUrl);
    logActivity('Deleted Slider', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  app.put('/api/sliders/reorder', authenticate, (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of { id, orderIndex }' });
    const stmt = db.prepare('UPDATE sliders SET orderIndex = ? WHERE id = ?');
    for (const { id, orderIndex } of items) {
      if (typeof id !== 'number' || typeof orderIndex !== 'number') continue;
      stmt.run(orderIndex, id);
    }
    logActivity('Reordered Sliders', 'Updated display order');
    res.json({ success: true });
  });

  // Tickers
  app.get('/api/tickers', (req, res) => {
    const tickers = db.prepare('SELECT * FROM tickers WHERE isActive = 1').all();
    res.json(tickers);
  });

  app.get('/api/admin/tickers', authenticate, (req, res) => {
    const tickers = db.prepare('SELECT * FROM tickers').all();
    res.json(tickers);
  });

  app.post('/api/tickers', authenticate, (req, res) => {
    const { text, isActive } = req.body;
    const stmt = db.prepare('INSERT INTO tickers (text, isActive) VALUES (?, ?)');
    const info = stmt.run(text, isActive === undefined ? 1 : isActive);
    logActivity('Added Ticker', `Text: ${text.substring(0, 30)}...`);
    res.json({ id: info.lastInsertRowid, text, isActive });
  });

  app.put('/api/tickers/:id', authenticate, (req, res) => {
    const id = req.params.id;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    db.prepare('UPDATE tickers SET isActive = ? WHERE id = ?').run(isActive ? 1 : 0, id);
    logActivity('Updated Ticker', `ID: ${id} → ${isActive ? 'Active' : 'Inactive'}`);
    res.json({ success: true, isActive });
  });

  app.delete('/api/tickers/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM tickers WHERE id = ?').run(req.params.id);
    logActivity('Deleted Ticker', `ID: ${req.params.id}`);
    res.json({ success: true });
  });


  // Global search (public)
  app.get('/api/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return res.json({ success: true, results: { notifications: [], tickers: [], gallery: [] } });
    }
    const escaped = escapeLikePattern(q);
    const pattern = `%${escaped}%`;
    const notifications = db.prepare("SELECT id, title, pdfUrl, category, createdAt FROM notifications WHERE title LIKE ? ESCAPE '\\' ORDER BY createdAt DESC LIMIT 20").all(pattern);
    const tickers = db.prepare("SELECT id, text FROM tickers WHERE isActive = 1 AND text LIKE ? ESCAPE '\\' LIMIT 20").all(pattern);
    const gallery = db.prepare("SELECT id, imageUrl, caption, createdAt FROM gallery WHERE caption LIKE ? ESCAPE '\\' ORDER BY createdAt DESC LIMIT 20").all(pattern);
    res.json({ success: true, results: { notifications, tickers, gallery } });
  });


  // Contact (public)
  app.post('/api/contact', (req, res) => {
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
    db.prepare('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)').run(
      name.trim(),
      email.trim(),
      typeof subject === 'string' ? subject.trim().slice(0, 500) : '',
      message.trim()
    );
    res.json({ success: true });
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const { search, category, page = '1', limit = '10' } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += " AND title LIKE ? ESCAPE '\\'";
      params.push(`%${escapeLikePattern(String(search))}%`);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const notifications = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM notifications WHERE 1=1';
    const countParams: any[] = [];
    if (search) {
      countQuery += " AND title LIKE ? ESCAPE '\\'";
      countParams.push(`%${escapeLikePattern(String(search))}%`);
    }
    if (category && category !== 'All') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    const totalCount = (db.prepare(countQuery).get(...countParams) as any).count;

    res.json({ notifications, totalPages: Math.ceil(totalCount / Number(limit)), currentPage: Number(page) });
  });

  app.post('/api/notifications', authenticate, upload.single('pdf'), (req, res) => {
    const { title, category = 'General' } = req.body;
    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : req.body.pdfUrl;
    if (!pdfUrl) return res.status(400).json({ error: 'PDF is required' });

    const stmt = db.prepare('INSERT INTO notifications (title, pdfUrl, category) VALUES (?, ?, ?)');
    const info = stmt.run(title, pdfUrl, category);
    logActivity('Added Notification', `Title: ${title}, Category: ${category}`);
    res.json({ id: info.lastInsertRowid, title, pdfUrl, category });
  });

  app.delete('/api/notifications/:id', authenticate, (req, res) => {
    const row = db.prepare('SELECT pdfUrl FROM notifications WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    if (row?.pdfUrl) deleteUploadedFile(row.pdfUrl);
    logActivity('Deleted Notification', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Results (LDCE/GDCE etc.)
  app.get('/api/results', (req, res) => {
    const { search, category, page = '1', limit = '10' } = req.query;
    let query = 'SELECT * FROM results WHERE 1=1';
    const params: any[] = [];
    if (search) {
      query += " AND title LIKE ? ESCAPE '\\'";
      params.push(`%${escapeLikePattern(String(search))}%`);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);
    const results = db.prepare(query).all(...params);
    let countQuery = 'SELECT COUNT(*) as count FROM results WHERE 1=1';
    const countParams: any[] = [];
    if (search) { countQuery += " AND title LIKE ? ESCAPE '\\'"; countParams.push(`%${escapeLikePattern(String(search))}%`); }
    if (category && category !== 'All') { countQuery += ' AND category = ?'; countParams.push(category); }
    const totalCount = (db.prepare(countQuery).get(...countParams) as any).count;
    res.json({ results, totalPages: Math.ceil(totalCount / Number(limit)), currentPage: Number(page) });
  });

  app.post('/api/results', authenticate, upload.single('pdf'), (req, res) => {
    const { title, category = 'General' } = req.body;
    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : req.body.pdfUrl;
    if (!pdfUrl) return res.status(400).json({ error: 'PDF is required' });
    const stmt = db.prepare('INSERT INTO results (title, pdfUrl, category) VALUES (?, ?, ?)');
    const info = stmt.run(title || '', pdfUrl, category || 'General');
    logActivity('Added Result', `Title: ${title}, Category: ${category}`);
    res.json({ id: info.lastInsertRowid, title, pdfUrl, category });
  });

  app.delete('/api/results/:id', authenticate, (req, res) => {
    const row = db.prepare('SELECT pdfUrl FROM results WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    if (row?.pdfUrl) deleteUploadedFile(row.pdfUrl);
    logActivity('Deleted Result', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Officers
  app.get('/api/officers', (req, res) => {
    const officers = db.prepare('SELECT * FROM officers ORDER BY orderIndex ASC').all();
    res.json(officers);
  });

  app.post('/api/officers', authenticate, upload.single('image'), (req, res) => {
    const { name, designation, orderIndex } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    if (!name || !designation?.trim()) return res.status(400).json({ error: 'Name and designation are required' });
    if (!imageUrl) return res.status(400).json({ error: 'Image file is required' });
    const stmt = db.prepare('INSERT INTO officers (name, designation, imageUrl, orderIndex) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name.trim(), designation.trim(), imageUrl, Number(orderIndex) || 0);
    logActivity('Added Officer', `Name: ${name.trim()}`);
    res.json({ id: info.lastInsertRowid, name: name.trim(), designation: designation.trim(), imageUrl, orderIndex: Number(orderIndex) || 0 });
  });

  app.delete('/api/officers/:id', authenticate, (req, res) => {
    const row = db.prepare('SELECT imageUrl FROM officers WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM officers WHERE id = ?').run(req.params.id);
    if (row?.imageUrl) deleteUploadedFile(row.imageUrl);
    logActivity('Deleted Officer', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  app.put('/api/officers/:id', authenticate, upload.single('image'), (req, res) => {
    const { name, designation, orderIndex } = req.body;
    const id = req.params.id;
    
    let stmt;
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      stmt = db.prepare('UPDATE officers SET name = ?, designation = ?, imageUrl = ?, orderIndex = ? WHERE id = ?');
      stmt.run(name, designation, imageUrl, orderIndex || 0, id);
    } else {
      stmt = db.prepare('UPDATE officers SET name = ?, designation = ?, orderIndex = ? WHERE id = ?');
      stmt.run(name, designation, orderIndex || 0, id);
    }
    logActivity('Updated Officer', `Name: ${name}`);
    res.json({ success: true });
  });

  app.put('/api/officers/reorder', authenticate, (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array of { id, orderIndex }' });
    const stmt = db.prepare('UPDATE officers SET orderIndex = ? WHERE id = ?');
    for (const { id, orderIndex } of items) {
      if (typeof id !== 'number' || typeof orderIndex !== 'number') continue;
      stmt.run(orderIndex, id);
    }
    logActivity('Reordered Officers', 'Updated display order');
    res.json({ success: true });
  });

  // Gallery
  app.get('/api/gallery', (req, res) => {
    const gallery = db.prepare('SELECT * FROM gallery ORDER BY createdAt DESC').all();
    res.json(gallery);
  });

  app.post('/api/gallery', authenticate, upload.single('image'), (req, res) => {
    const { caption } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ error: 'Image is required' });
    
    const stmt = db.prepare('INSERT INTO gallery (imageUrl, caption) VALUES (?, ?)');
    const info = stmt.run(imageUrl, caption || '');
    logActivity('Added Gallery Image', `Caption: ${caption || 'None'}`);
    res.json({ id: info.lastInsertRowid, imageUrl, caption });
  });

  app.delete('/api/gallery/:id', authenticate, (req, res) => {
    const row = db.prepare('SELECT imageUrl FROM gallery WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    if (row?.imageUrl) deleteUploadedFile(row.imageUrl);
    logActivity('Deleted Gallery Image', `ID: ${req.params.id}`);
    res.json({ success: true });
  });

  // Stats
  app.get('/api/stats', (req, res) => {
    const stats = db.prepare('SELECT * FROM stats').all();
    res.json(stats);
  });

  app.put('/api/stats', authenticate, (req, res) => {
    const { stats: statsPayload } = req.body;
    if (!Array.isArray(statsPayload)) return res.status(400).json({ error: 'Invalid format' });

    const transaction = db.transaction((items: { label: string; value: string; icon: string }[]) => {
      db.prepare('DELETE FROM stats').run();
      const insert = db.prepare('INSERT INTO stats (key, value, label, icon) VALUES (?, ?, ?, ?)');
      items.forEach((stat, i) => {
        const label = typeof stat.label === 'string' ? stat.label : '';
        const value = typeof stat.value === 'string' ? stat.value : '';
        const icon = typeof stat.icon === 'string' ? stat.icon : '';
        insert.run(`stat_${i}`, value, label, icon);
      });
    });
    transaction(statsPayload.map((s: any) => ({
      label: typeof s?.label === 'string' ? s.label : '',
      value: typeof s?.value === 'string' ? s.value : '',
      icon: typeof s?.icon === 'string' ? s.icon : '',
    })));
    logActivity('Updated Stats', 'Workshop stats updated');
    const updated = db.prepare('SELECT * FROM stats ORDER BY id ASC').all();
    res.json({ success: true, stats: updated });
  });

  // Admin Quick Stats & Logs
  app.get('/api/admin/quick-stats', authenticate, (req, res) => {
    const totalPdfs = (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any).count;
    const totalSliders = (db.prepare('SELECT COUNT(*) as count FROM sliders').get() as any).count;
    const totalNews = (db.prepare('SELECT COUNT(*) as count FROM tickers').get() as any).count;
    res.json({ totalPdfs, totalSliders, totalNews });
  });

  app.get('/api/admin/activity-logs', authenticate, (req, res) => {
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20').all();
    res.json(logs);
  });

  // 1-Click Database Backup (authenticated)
  app.get('/api/admin/backup', authenticate, (req, res) => {
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    logActivity('Security', 'System database backup downloaded');
    res.download(dbPath, 'database.sqlite');
  });

  // Analytics for dashboard charts (authenticated)
  app.get('/api/admin/analytics', authenticate, (req, res) => {
    const notificationsByCategory = db.prepare(
      'SELECT category AS name, COUNT(*) AS value FROM notifications GROUP BY category'
    ).all() as { name: string; value: number }[];
    const resultsByCategory = db.prepare(
      'SELECT category AS name, COUNT(*) AS value FROM results GROUP BY category'
    ).all() as { name: string; value: number }[];
    const readCount = (db.prepare('SELECT COUNT(*) AS count FROM messages WHERE isRead = 1').get() as { count: number }).count;
    const unreadCount = (db.prepare('SELECT COUNT(*) AS count FROM messages WHERE isRead = 0').get() as { count: number }).count;
    const messagesStats = [
      { name: 'Read', value: readCount },
      { name: 'Unread', value: unreadCount },
    ];
    res.json({ notificationsByCategory, resultsByCategory, messagesStats });
  });

  app.get('/api/admin/messages', authenticate, (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY createdAt DESC').all();
    res.json(messages);
  });

  app.put('/api/admin/messages/:id/read', authenticate, (req, res) => {
    db.prepare('UPDATE messages SET isRead = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Pages (public read)
  app.get('/api/pages/:slug', (req, res) => {
    const page = db.prepare('SELECT title, content FROM pages WHERE slug = ?').get(req.params.slug) as any;
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ success: true, page: { title: page.title, content: page.content } });
  });

  app.put('/api/admin/pages/:slug', authenticate, (req, res) => {
    const slug = req.params.slug;
    const { title, content } = req.body;
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string') {
      return res.status(400).json({ error: 'title and content are required; title must be non-empty' });
    }
    db.prepare(`
      INSERT INTO pages (slug, title, content, updatedAt) VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(slug) DO UPDATE SET title = excluded.title, content = excluded.content, updatedAt = datetime('now')
    `).run(slug, title.trim(), content);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
