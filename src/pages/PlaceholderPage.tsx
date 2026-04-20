import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';

/** Slugs that can have dynamic content (admin Pages). Avoids 404 API calls for parent routes like /about, /departments, /news. */
const KNOWN_PAGE_SLUGS = new Set([
  'about-history',
  'about-vision-mission',
  'about-our-team',
  'departments-mechanical',
  'departments-electrical',
  'departments-personnel',
  'departments-stores',
]);

export default function PlaceholderPage() {
  const location = useLocation();
  const slug = location.pathname.slice(1).replace(/\//g, '-');
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setPage(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (!KNOWN_PAGE_SLUGS.has(slug)) {
      setPage(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    fetch(`/api/pages/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          setPage(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.page) setPage(data.page);
        else if (!notFound) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const fallbackPageName = location.pathname
    .split('/')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-6 rounded" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 text-center transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400 mb-4">
            {fallbackPageName || 'Page'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            This section is currently under development. Please check back later for updates.
          </p>
          <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 mx-auto rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400">
            {page.title}
          </h1>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
          <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {page.content}
          </div>
        </div>
      </div>
    </div>
  );
}
