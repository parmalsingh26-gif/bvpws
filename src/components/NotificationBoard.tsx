import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, ArrowRight, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import PdfPreviewModal from './PdfPreviewModal';
import Skeleton from './ui/Skeleton';

interface Notification {
  id: number;
  title: string;
  pdfUrl: string;
  category: string;
  createdAt: string;
}

export default function NotificationBoard({ limit = 5, showSearch = false, category = 'All' }: { limit?: number, showSearch?: boolean, category?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(category !== 'All' && { category })
      });
      try {
        const res = await fetch(`/api/notifications?${params}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchNotifications, 300);
    return () => clearTimeout(timeoutId);
  }, [page, limit, searchQuery, category]);

  if (!showSearch && !isLoading && notifications.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-3">
              <FileText className="text-blue-600 dark:text-blue-500" size={32} />
              {category === 'All' ? 'Notifications & Circulars' : category}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Stay updated with the latest announcements, orders, and notices.</p>
          </div>
          {!showSearch && (
            <Link to="/notifications" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors mt-4 md:mt-0 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {showSearch && (
          <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search notifications by keyword..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between gap-4 glass bg-white/50 dark:bg-slate-800/50 rounded-2xl animate-pulse">
                  <div className="flex items-start gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0 mt-1" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <Skeleton className="h-5 w-full max-w-sm" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-28 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 glass rounded-2xl">
              <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg">No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05, duration: 0.4, type: "spring" }}
                className="group glass dark:glass-light bg-white/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] overflow-hidden relative"
              >
                {/* Decorative glowing orb on hover */}
                <div className="absolute -inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-slate-800 text-blue-600 dark:text-blue-400 p-3.5 rounded-xl shrink-0 shadow-inner group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-shadow">
                      <FileText size={24} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-2">
                        {notification.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">
                          {notification.category}
                        </span>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                          <Calendar size={12} />
                          {notification.createdAt ? new Date(notification.createdAt.replace(' ', 'T')).toLocaleString('en-IN', {
                           year: 'numeric', month: 'short', day: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 sm:self-center self-end mt-2 sm:mt-0">
                    <button
                      onClick={() => setPreviewPdf({ url: notification.pdfUrl, title: notification.title })}
                      className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white border border-slate-200 dark:border-slate-700 hover:border-transparent text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm group/btn"
                      title="Preview PDF"
                    >
                      <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                    <a
                      href={notification.pdfUrl}
                      download
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white w-10 h-10 rounded-xl font-medium transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_15px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 group/dl"
                      title="Download PDF"
                    >
                      <Download size={18} className="group-hover/dl:animate-bounce-subtle" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>

        {showSearch && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <PdfPreviewModal
        isOpen={!!previewPdf}
        onClose={() => setPreviewPdf(null)}
        pdfUrl={previewPdf?.url || ''}
        title={previewPdf?.title || ''}
      />
    </section>
  );
}
