import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'language';

type Language = 'en' | 'hi';

const translations: Record<Language, Record<string, string>> = {
  en: {
    Home: 'Home',
    'About Us': 'About Us',
    Departments: 'Departments',
    'News & Updates': 'News & Updates',
    Notifications: 'Notifications',
    'Employee Corner': 'Employee Corner',
    'Contact Us': 'Contact Us',
    'Search...': 'Search...',
    'Important Links': 'Important Links',
    'Quick Links': 'Quick Links',
    History: 'History',
    'Vision & Mission': 'Vision & Mission',
    'Our Team': 'Our Team',
    Mechanical: 'Mechanical',
    Electrical: 'Electrical',
    Personnel: 'Personnel',
    Stores: 'Stores',
    'Documents & Circulars': 'Documents & Circulars',
    'Exam Results': 'Exam Results',
    'Contact Info': 'Contact Info',
    'Admin Login': 'Admin Login',
    'Skip to main content': 'Skip to main content',
  },
  hi: {
    Home: 'होम',
    'About Us': 'हमारे बारे में',
    Departments: 'विभाग',
    'News & Updates': 'समाचार और अपडेट',
    Notifications: 'अधिसूचनाएं',
    'Employee Corner': 'कर्मचारी कोना',
    'Contact Us': 'संपर्क करें',
    'Search...': 'खोजें...',
    'Important Links': 'महत्वपूर्ण लिंक',
    'Quick Links': 'त्वरित लिंक',
    History: 'इतिहास',
    'Vision & Mission': 'विजन और मिशन',
    'Our Team': 'हमारी टीम',
    Mechanical: 'यांत्रिक',
    Electrical: 'विद्युत',
    Personnel: 'कार्मिक',
    Stores: 'स्टोर',
    'Documents & Circulars': 'दस्तावेज़ और परिपत्र',
    'Exam Results': 'परीक्षा परिणाम',
    'Contact Info': 'संपर्क जानकारी',
    'Admin Login': 'व्यवस्थापक लॉगिन',
    'Skip to main content': 'मुख्य सामग्री पर जाएं',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') return stored;
  } catch (_) {}
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {}
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[language];
      return dict[key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
