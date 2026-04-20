import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Bell, Image as ImageIcon, Search } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';

interface SearchResultsData {
  notifications: { id: number; title: string; pdfUrl: string; category: string; createdAt: string }[];
  tickers: { id: number; text: string }[];
  gallery: { id: number; imageUrl: string; caption: string; createdAt: string }[];
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [data, setData] = useState<SearchResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setData({ notifications: [], tickers: [], gallery: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.results ?? { notifications: [], tickers: [], gallery: [] });
      })
      .catch(() => setData({ notifications: [], tickers: [], gallery: [] }))
      .finally(() => setIsLoading(false));
  }, [q]);

  const hasAnyResults =
    data &&
    (data.notifications.length > 0 || data.tickers.length > 0 || data.gallery.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-3">
            <Search className="text-blue-600 dark:text-blue-500" size={36} />
            Search Results
          </h1>
          {q && (
            <p className="text-slate-600 dark:text-slate-400">
              Showing results for <strong className="text-slate-800 dark:text-slate-200">&quot;{q}&quot;</strong>
            </p>
          )}
          <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 rounded-full mt-4" />
        </div>

        {!q.trim() ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Enter a search term in the navbar to find notifications, news flashes, and gallery items.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-10">
            <div>
              <Skeleton className="h-7 w-48 mb-4 rounded" />
              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full max-w-md" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Skeleton className="h-7 w-32 mb-4 rounded" />
              <ul className="space-y-2">
                {[1, 2].map((i) => (
                  <li key={i}>
                    <Skeleton className="h-5 w-full max-w-xl rounded" />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Skeleton className="h-7 w-36 mb-4 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        ) : !hasAnyResults ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No results found for &quot;<span className="font-medium text-slate-800 dark:text-slate-200">{q}</span>&quot;. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {data!.notifications.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <FileText size={24} className="text-blue-600 dark:text-blue-500" />
                  Notifications
                </h2>
                <ul className="space-y-3">
                  {data!.notifications.map((n) => (
                    <li
                      key={n.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <a
                        href={n.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {n.title}
                        </span>
                        <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium rounded">
                          {n.category}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data!.tickers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Bell size={24} className="text-blue-600 dark:text-blue-500" />
                  News Flashes
                </h2>
                <ul className="space-y-2">
                  {data!.tickers.map((t) => (
                    <li
                      key={t.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-700 dark:text-slate-300"
                    >
                      {t.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data!.gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <ImageIcon size={24} className="text-blue-600 dark:text-blue-500" />
                  Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data!.gallery.map((g) => (
                    <Link
                      key={g.id}
                      to="/gallery"
                      className="group block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <img
                        src={g.imageUrl}
                        alt={g.caption || 'Gallery image'}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {g.caption && (
                        <p className="p-2 text-sm text-slate-600 dark:text-slate-400 truncate">
                          {g.caption}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
