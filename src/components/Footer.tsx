import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Train, ExternalLink, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative bg-[#0a192f] text-slate-300 pt-20 pb-12 overflow-hidden transition-colors duration-300">
      {/* Premium subtle noise overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600"></div>
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Train size={20} />
            </div>
            <h3 className="text-white text-xl font-black font-heading tracking-tight">Bhavnagar Workshop</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 font-medium opacity-80">
            A premier maintenance workshop of Western Railway, dedicated to excellence, safety, and innovation in Indian railway operations since its inception.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {t('Quick Links')}
          </h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link to="/" className="group flex items-center text-slate-400 hover:text-white transition-colors duration-300"><span className="w-0 group-hover:w-3 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>{t('Home')}</Link></li>
            <li><Link to="/about" className="group flex items-center text-slate-400 hover:text-white transition-colors duration-300"><span className="w-0 group-hover:w-3 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>{t('About Us')}</Link></li>
            <li><Link to="/departments" className="group flex items-center text-slate-400 hover:text-white transition-colors duration-300"><span className="w-0 group-hover:w-3 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>{t('Departments')}</Link></li>
            <li><Link to="/contact" className="group flex items-center text-slate-400 hover:text-white transition-colors duration-300"><span className="w-0 group-hover:w-3 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>{t('Contact Us')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            {t('Important Links')}
          </h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><a href="https://indianrailways.gov.in" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-300">Indian Railways <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
            <li><a href="https://wr.indianrailways.gov.in" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-300">Western Railway <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
            <li><a href="https://ireps.gov.in" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-300">IREPS <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
            <li><Link to="/admin/login" className="group flex items-center mt-2 text-blue-400 hover:text-blue-300 transition-colors duration-300 underline decoration-blue-500/30 underline-offset-4">{t('Admin Portal')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-lg tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            {t('Contact Info')}
          </h4>
          <address className="not-italic text-sm text-slate-400 space-y-4 font-medium">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">Bhavnagar Workshop,<br/>Western Railway,<br/>Bhavnagar Para,<br/>Gujarat - 364003</p>
            </div>
            <div className="flex items-center gap-3 group">
              <Phone size={16} className="text-blue-400 shrink-0" />
              <a href="tel:+912782445475" className="group-hover:text-white transition-colors">+91 278 2445475</a>
            </div>
            <div className="flex items-center gap-3 group">
              <Mail size={16} className="text-blue-400 shrink-0" />
              <a href="mailto:cwm.bvp@wr.railnet.gov.in" className="group-hover:text-white transition-colors pr-2">cwm.bvp@wr.railnet.gov.in</a>
            </div>
          </address>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-xs sm:text-sm text-center text-slate-500 font-medium flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <p>&copy; {new Date().getFullYear()} Bhavnagar Workshop, Western Railway. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
          <Link to="/accessibility" className="hover:text-slate-300 transition-colors">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
