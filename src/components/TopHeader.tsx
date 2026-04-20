import { Phone, Mail, Accessibility, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const FONT_SIZE_KEY = 'fontSize';
type FontSizeOption = '14' | '16' | '18';

function getStoredFontSize(): FontSizeOption {
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    if (stored === '14' || stored === '16' || stored === '18') return stored;
  } catch (_) {}
  return '16';
}

export default function TopHeader() {
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSizeOption>(getStoredFontSize);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const applyFontSize = (size: FontSizeOption) => {
    document.documentElement.style.fontSize = size === '14' ? '14px' : size === '18' ? '18px' : '16px';
    try {
      localStorage.setItem(FONT_SIZE_KEY, size);
    } catch (_) {}
    setFontSize(size);
  };

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#0a192f] text-white/90 text-xs sm:text-sm py-2 px-4 border-b border-white/10 relative overflow-hidden">
      {/* Subtle animated overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 relative z-10">
        <div className="flex items-center gap-4">
          <a href="tel:+912782445475" className="flex items-center gap-1.5 hover:text-blue-300 transition-all duration-300 group">
            <Phone size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span>+91 278 2445475</span>
          </a>
          <a href="mailto:cwm.bvp@wr.railnet.gov.in" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
            <Mail size={14} />
            <span>cwm.bvp@wr.railnet.gov.in</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#main-content" className="hover:text-blue-200 transition-colors flex items-center gap-1">
            <Accessibility size={14} />
            <span>{t('Skip to main content')}</span>
          </a>
          <div className="flex items-center gap-2 border-l border-blue-700 pl-4">
            <button
              type="button"
              onClick={() => applyFontSize('14')}
              className={`hover:text-blue-200 transition-colors ${fontSize === '14' ? 'underline font-bold' : ''}`}
              title="Decrease Text Size"
              aria-label="Decrease text size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => applyFontSize('16')}
              className={`hover:text-blue-200 transition-colors ${fontSize === '16' ? 'underline font-bold' : ''}`}
              title="Normal Text Size"
              aria-label="Normal text size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => applyFontSize('18')}
              className={`hover:text-blue-200 transition-colors ${fontSize === '18' ? 'underline font-bold' : ''}`}
              title="Increase Text Size"
              aria-label="Increase text size"
            >
              A+
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="ml-2 px-2 py-1 hover:bg-blue-800 rounded transition-colors text-xs font-medium"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              aria-label="Toggle language"
            >
              हिन्दी / English
            </button>
            <button onClick={toggleDarkMode} className="p-1 hover:bg-blue-800 rounded-full transition-colors" title="Toggle Dark Mode">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
