/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import PlaceholderPage from './pages/PlaceholderPage';
import Notifications from './pages/Notifications';
import EmployeeCorner from './pages/EmployeeCorner';
import Gallery from './pages/Gallery';
import SearchResults from './pages/SearchResults';
import ContactUs from './pages/ContactUs';
import Results from './pages/Results.tsx';
import { motion, useScroll } from 'motion/react';

const FONT_SIZE_KEY = 'fontSize';
const DEFAULT_FONT_SIZE = '16px';

function applyStoredFontSize() {
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    const size = stored === '14' || stored === '18' ? `${stored}px` : DEFAULT_FONT_SIZE;
    document.documentElement.style.fontSize = size;
  } catch (_) {
    document.documentElement.style.fontSize = DEFAULT_FONT_SIZE;
  }
}

/** Scroll Progress Bar - must be inside Router to work with useLocation if needed */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 z-[10001] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

export default function App() {
  useEffect(() => {
    applyStoredFontSize();
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <ScrollProgressBar />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="employee" element={<EmployeeCorner />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="results" element={<Results />} />
            <Route path="*" element={<PlaceholderPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
