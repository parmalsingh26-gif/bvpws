# Project Roadmap & Technical Documentation

**Document purpose:** Share with another AI or team to plan and build new features.  
**Project:** Bhavnagar Workshop — Western Railway CMS & public website.  
**Last updated:** Generated from codebase scan.

---

## 1. Project Overview & Tech Stack

### 1.1 What This App Is

A **content management system (CMS) and public website** for **Bhavnagar Workshop, Western Railway (Indian Railways)**. It provides:

- **Public site:** Home page with hero sliders, news ticker, leadership, workshop stats, media gallery, and notifications/circulars. Dedicated pages for Notifications, Employee Corner (seniority/transfer docs), and Photo Gallery.
- **Admin panel:** Secure dashboard to manage sliders, gallery, news tickers, notifications (PDFs), officers, and workshop stats. Activity logging and quick stats.

The app was exported from **Google AI Studio**; the stack is full-stack Node + React with SQLite.

### 1.2 Tech Stack Summary

| Layer | Technology | Notes |
|-------|------------|--------|
| **Frontend** | React 19, TypeScript | `src/` — JSX/TSX |
| **Build / Dev** | Vite 6 | `vite.config.ts`, dev server via Express middleware |
| **Routing** | React Router 7 | `BrowserRouter`, routes in `App.tsx` |
| **Styling** | Tailwind CSS 4 | `@tailwindcss/vite`, `src/index.css` |
| **Animation** | Motion (framer-motion fork) | `motion/react` for transitions/gestures |
| **Icons** | Lucide React | Used across components |
| **Utilities** | clsx, tailwind-merge, date-fns | Class names, date formatting |
| **Backend** | Node.js, Express 4 | `server.ts` — API + static/Vite in dev |
| **Runtime (server)** | tsx | Runs `server.ts` without pre-compiling (e.g. `npm run dev`) |
| **Database** | SQLite | better-sqlite3, file: `database.sqlite` |
| **Auth** | JWT + cookies | jsonwebtoken, bcryptjs, cookie-parser |
| **File uploads** | Multer | Stores under `uploads/` (images, PDFs) |
| **Env** | dotenv | Server loads `.env`; Vite uses `loadEnv` for `GEMINI_API_KEY` |

**Dependencies present but not used in application code (yet):**

- **@google/genai** — Gemini AI SDK; `GEMINI_API_KEY` is wired in Vite config for client env but no AI calls exist in `src/` or `server.ts`.
- **puppeteer** — Likely intended for PDF/headless use; no imports in app code.

**Key config files:** `package.json`, `tsconfig.json`, `vite.config.ts`, `.env` / `.env.example`.

---

## 2. Current Features

### 2.1 Public Website

- **Layout**
  - **TopHeader:** Contact (phone, email), “Skip to main content”, text-size buttons (A-, A, A+), dark/light theme toggle (persisted in `localStorage`).
  - **Navbar:** Logo + “Bhavnagar Workshop / Western Railway”, desktop + mobile menu; links: Home, About Us, Departments, News & Updates, Notifications, Employee Corner, Contact Us. Active route indicator (Motion).
  - **Footer:** Short description, Quick Links (Home, About, Departments, Contact), Important Links (Indian Railways, Western Railway, IREPS, Admin Login), contact/address block, copyright.
  - **BackToTop:** Floating button after 300px scroll; smooth scroll to top.

- **Home (`/`)**
  - **HeroSlider:** Fetches `/api/sliders`, auto-advances every 5s; prev/next and dot indicators; title overlay on image.
  - **NewsTicker:** Fetches `/api/tickers` (active only); marquee of “Latest Flashes” with red bar UI.
  - **WorkshopStats:** Fetches `/api/stats`; cards with value + label + Lucide icon (Train, Users, Building, Wrench).
  - **Leadership:** Fetches `/api/officers`; grid of officer cards (photo, name, designation) with hover effects.
  - **MediaGallery:** Fetches `/api/gallery`, shows first 6; masonry-style; “View All” links to `/gallery`.
  - **NotificationBoard:** Fetches notifications (limit 5); “View All” links to `/notifications`.

- **Notifications (`/notifications`)**
  - Full **NotificationBoard** with search, pagination, category “All”; preview modal and download for each PDF.

- **Employee Corner (`/employee`)**
  - Two **NotificationBoard** sections: “Seniority List” and “Transfer Orders” (each with search, limit 5).

- **Gallery (`/gallery`)**
  - **MediaGallery** with high limit (100), no section header; same masonry layout and captions.

- **Placeholder routes (`/about`, `/departments`, `/news`, `/contact`, etc.)**
  - **PlaceholderPage:** Title derived from path; “Under development” message.

### 2.2 Admin

- **Login (`/admin/login`)**
  - Username/password form; POST `/api/auth/login`; on success redirect to `/admin/dashboard`. Error message on invalid credentials. Motion-based UI.

- **Dashboard (`/admin/dashboard`)**
  - Protected by `/api/auth/me`; redirect to login if unauthorized.
  - **Sidebar:** Dashboard, Hero Sliders, Media Gallery, News Ticker, Notifications, Officers, Workshop Stats; Logout.
  - **Tabs:**
    - **Dashboard:** Quick stats (total PDFs, slider images, news flashes) + recent activity log (last 20).
    - **Hero Sliders:** Add (title + image file), list with delete.
    - **Media Gallery:** Add (caption + image), grid with delete.
    - **News Ticker:** Add text (active by default), list with delete.
    - **Notifications:** Add (title, category dropdown: General / Seniority List / Transfer Orders, PDF file), list with “View PDF” and delete.
    - **Officers:** List of officers; edit (name, designation, optional new photo) via inline form; no add/delete.
    - **Workshop Stats:** Edit label, value, and icon name (Lucide) for each stat; “Save All Stats”.

### 2.3 Cross-Cutting

- **ErrorBoundary:** Wraps app in `main.tsx`; catches React errors and shows message + component stack.
- **PDF preview:** **PdfPreviewModal** — iframe preview, open in new tab, download, close.
- **Dark mode:** TopHeader toggles `document.documentElement.classList` and `localStorage.theme`; Tailwind `dark:` used across components.
- **Responsiveness:** Tailwind breakpoints (sm, md, lg) and mobile navbar.

---

## 3. Database Schema

**Database:** SQLite, single file `database.sqlite`. Schema and seeds are in `database.ts` (run at server startup).

### 3.1 Tables, Columns, and Types

- **users**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `username` TEXT UNIQUE NOT NULL
  - `password` TEXT NOT NULL (bcrypt hash)
  - *Purpose:* Admin login. Seeded: `admin` / `admin123`.

- **sliders**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `title` TEXT
  - `imageUrl` TEXT NOT NULL (path, e.g. `/uploads/...`)
  - `orderIndex` INTEGER DEFAULT 0
  - *Purpose:* Hero carousel on home; ordered by `orderIndex`.

- **tickers**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `text` TEXT NOT NULL
  - `isActive` BOOLEAN DEFAULT 1
  - *Purpose:* News ticker; only `isActive = 1` shown on public API.

- **notifications**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `title` TEXT NOT NULL
  - `pdfUrl` TEXT NOT NULL (path or URL)
  - `category` TEXT DEFAULT 'General' (e.g. General, Seniority List, Transfer Orders)
  - `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
  - *Purpose:* Circulars/notices; filterable by category and search.

- **gallery**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `imageUrl` TEXT NOT NULL
  - `caption` TEXT
  - `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
  - *Purpose:* Media gallery images.

- **stats**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `key` TEXT UNIQUE NOT NULL (e.g. locos, staff, estb)
  - `value` TEXT NOT NULL (e.g. "500+", "1000+")
  - `label` TEXT NOT NULL (e.g. "Locos Repaired")
  - `icon` TEXT (Lucide icon name, e.g. Train, Users, Building, Wrench)
  - *Purpose:* Workshop-at-a-glance stats on home.

- **activity_logs**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `action` TEXT NOT NULL
  - `details` TEXT
  - `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
  - *Purpose:* Admin audit trail (last 20 shown on dashboard).

- **officers**
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `name` TEXT NOT NULL
  - `designation` TEXT NOT NULL
  - `imageUrl` TEXT NOT NULL
  - `orderIndex` INTEGER DEFAULT 0
  - *Purpose:* Leadership section; ordered by `orderIndex`.

### 3.2 Relationships

- No foreign keys. Tables are independent; relationships are logical only (e.g. notifications by category, sliders/officers by order).

### 3.3 Seeds (in `database.ts`)

- **users:** One row `admin` / bcrypt hash of `admin123`.
- **officers:** 4 placeholder officers (CWM, Dy. CME, WM, AWM) with picsum image URLs.
- **sliders:** 3 placeholder slides (Bhavnagar Workshop, Excellence, Modern Infrastructure).
- **tickers:** 2 sample ticker texts.
- **notifications:** 3 sample notifications with `pdfUrl: '#'`.
- **stats:** 3 rows (locos, staff, estb) with labels and icons.
- **gallery:** 5 placeholder images (picsum) with captions.

All seeds run only if the corresponding table is empty.

---

## 4. Core API Routes & Functions

**Base URL:** Same origin as the app (e.g. `http://localhost:3000`).  
**Auth:** JWT in HTTP-only cookie `admin_token`. Middleware `authenticate` reads cookie and attaches `req.user`.

### 4.1 Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Body: `{ username, password }`. Returns 401 on failure. On success: sets `admin_token` cookie, returns `{ success: true }`. |
| POST | `/api/auth/logout` | No | Clears `admin_token` cookie; returns `{ success: true }`. |
| GET | `/api/auth/me` | Yes | Returns `{ user }` (id, username). Used to protect dashboard. |

### 4.2 Sliders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sliders` | No | All sliders, ordered by `orderIndex` ASC. |
| POST | `/api/sliders` | Yes | Multipart: `title`, `orderIndex`, `image` (file). Or `imageUrl`. Inserts and logs activity. |
| DELETE | `/api/sliders/:id` | Yes | Deletes slider; logs activity. |

### 4.3 Tickers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tickers` | No | Only tickers where `isActive = 1`. |
| GET | `/api/admin/tickers` | Yes | All tickers (including inactive). |
| POST | `/api/tickers` | Yes | Body: `{ text, isActive }`. Inserts; logs activity. |
| DELETE | `/api/tickers/:id` | Yes | Deletes ticker; logs activity. |

### 4.4 Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | No | Query: `search`, `category`, `page`, `limit`. Paginated list; total count. Returns `{ notifications, totalPages, currentPage }`. |
| POST | `/api/notifications` | Yes | Multipart: `title`, `category`, `pdf` (file). Inserts; logs activity. |
| DELETE | `/api/notifications/:id` | Yes | Deletes notification; logs activity. |

### 4.5 Officers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/officers` | No | All officers, ordered by `orderIndex` ASC. |
| PUT | `/api/officers/:id` | Yes | Multipart: `name`, `designation`, `orderIndex`, optional `image`. Updates row; logs activity. |

### 4.6 Gallery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/gallery` | No | All gallery images, newest first. |
| POST | `/api/gallery` | Yes | Multipart: `caption`, `image` (file). Inserts; logs activity. |
| DELETE | `/api/gallery/:id` | Yes | Deletes gallery row; logs activity. |

### 4.7 Stats

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | No | All stats rows. |
| PUT | `/api/stats` | Yes | Body: `{ stats: [ { key, value } ] }`. Updates `value` for each key in a transaction; logs activity. |

### 4.8 Admin Helpers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/quick-stats` | Yes | Returns `{ totalPdfs, totalSliders, totalNews }` (counts from notifications, sliders, tickers). |
| GET | `/api/admin/activity-logs` | Yes | Last 20 activity_logs, newest first. |

### 4.9 Static & SPA

- **GET** `/uploads/*` — Static files from `uploads/` directory.
- **Dev:** Vite middleware serves SPA and assets.
- **Production:** `express.static('dist')` and `GET *` → `dist/index.html`.

**Helper in server:** `logActivity(action, details)` writes to `activity_logs`.

---

## 5. Future Roadmap Ideas

### 5.1 Content & CMS

- **Officers:** Add “Add officer” and “Delete” in admin; drag-and-drop or numeric reorder for `orderIndex`.
- **Sliders:** Reorder slides (e.g. drag-and-drop); optional link URL per slide.
- **Tickers:** Toggle active/inactive from admin list without deleting; optional expiry date.
- **Notifications:** Edit existing notification (title, category, replace PDF); optional “pinned” or “featured”; categories configurable (e.g. from DB or env).
- **Gallery:** Edit caption; bulk upload; optional album/folder or tags for filtering.
- **Stats:** Add/remove stat rows; restrict to a fixed set of keys if needed.

### 5.2 Security & Auth

- **JWT:** Use `JWT_SECRET` from env in production; short-lived access + refresh token if desired.
- **Admin:** Change default password flow; optional “forgot password” or invite-only signup.
- **Roles:** If multiple admins, add roles (e.g. editor vs super-admin) and permission checks per route.
- **Rate limiting:** Add rate limiting on `/api/auth/login` and sensitive APIs.

### 5.3 UX & UI

- **Placeholder pages:** Replace with real About Us, Departments, News & Updates, Contact (form or info); consider a simple “News” model if different from tickers.
- **Navbar/Footer:** Keep nav in sync with real routes; add Gallery if not already; optional mega-menu or dropdowns.
- **Accessibility:** Wire TopHeader A-/A+ to actual font-size or zoom; ensure focus order and ARIA where needed; skip-link target `#main-content` on main content.
- **Loading & errors:** Global loading states or skeletons for data fetches; toast or inline errors for API failures; ErrorBoundary recovery (e.g. “Try again”).
- **Mobile:** Touch-friendly slider and ticker; test PDF modal and forms on small screens.
- **SEO:** Meta tags per route (e.g. React Helmet or similar); sitemap/robots if public deployment.

### 5.4 Features

- **Search:** Site-wide search (notifications, maybe titles of other content) with a dedicated search page or modal.
- **Gemini AI:** Use `@google/genai` for e.g. summarising notifications, suggested categories, or internal admin tools; keep API key server-side and expose via backend endpoints only.
- **Puppeteer:** Use for generating PDFs (e.g. circular cover page) or server-side screenshots if needed.
- **Notifications:** Optional email digest or “notify me” for new notifications; RSS feed for power users.
- **Employee Corner:** Optional login for employees (separate from admin) to “favourite” or track read circulars.
- **Multilingual:** i18n for Hindi/English if required by policy.

### 5.5 Technical & Ops

- **API versioning:** Prefix routes with `/api/v1/` if you expect breaking changes.
- **Validation:** Request validation (e.g. zod/joi) and consistent error shape (code + message).
- **Logging:** Structured logs (e.g. request id, user, duration) for production.
- **Database:** Migrations (e.g. sqlite3 + migration runner or manual SQL files) instead of only schema in code; backups for `database.sqlite`.
- **Deployment:** Env for `NODE_ENV`, `PORT`, `APP_URL`; build step for server (e.g. `tsc` or `esbuild`) if not using `tsx` in production; optional reverse proxy and HTTPS.

### 5.6 Optional Integrations

- **Indian Railways / Western Railway:** Links already in footer; optional “live” data (e.g. announcements) if APIs exist.
- **Analytics:** Privacy-compliant analytics for public pages only.
- **Captcha:** On admin login or contact form to reduce abuse.

---

## File & Folder Reference (High Level)

- **Root:** `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `server.ts`, `database.ts`, `.env`, `.env.example`, `project_roadmap.md`, `README.md`, `.gitignore`, `metadata.json`.
- **Frontend:** `src/main.tsx`, `src/App.tsx`, `src/index.css`; `src/pages/*` (Home, AdminLogin, AdminDashboard, Notifications, EmployeeCorner, Gallery, PlaceholderPage); `src/components/*` (Layout, Navbar, Footer, TopHeader, HeroSlider, NewsTicker, Leadership, WorkshopStats, NotificationBoard, MediaGallery, PdfPreviewModal, BackToTop, ErrorBoundary).
- **Data:** `database.sqlite` (created at runtime); `uploads/` (created at runtime).

Use this document together with the codebase to plan and implement new features consistently with the existing tech stack and patterns.
