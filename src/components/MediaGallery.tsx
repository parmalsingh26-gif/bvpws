import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, ArrowRight, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from './ui/Skeleton';

interface GalleryImage {
  id: number;
  imageUrl: string;
  caption: string;
}

export default function MediaGallery({ limit = 6, showHeader = true }: { limit?: number, showHeader?: boolean }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data.slice(0, limit));
        } else {
          console.error('Expected array from /api/gallery, got:', data);
          setImages([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch gallery:', err);
        setImages([]);
      })
      .finally(() => setIsLoading(false));
  }, [limit]);

  if (isLoading) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showHeader && (
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <Skeleton className="h-10 w-64 mb-4" />
                <Skeleton className="h-5 w-96 rounded-full" />
              </div>
              <Skeleton className="h-10 w-28 rounded-xl mt-4 md:mt-0" />
            </div>
          )}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="break-inside-avoid space-y-3 glass bg-white/50 dark:bg-slate-800/50 p-2 rounded-3xl animate-pulse">
                <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-5 w-2/3 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showHeader && (
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-blue-400 mb-3 flex items-center gap-4 font-heading tracking-tight drop-shadow-sm">
                <span className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                  <ImageIcon className="text-blue-600 dark:text-blue-500" size={36} />
                </span>
                Media Gallery
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Glimpses of our workshop activities and infrastructure.</p>
            </div>
            <Link to="/gallery" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 transition-all mt-6 md:mt-0 group px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl">
              View All <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        )}

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
              className="break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700/50"
            >
              <div className="relative overflow-hidden rounded-2xl w-full h-full bg-slate-100 dark:bg-slate-900">
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-auto min-h-[250px] object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end p-6">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white mb-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:animate-pulse-glow">
                    <Maximize2 size={20} />
                  </div>
                  {img.caption && (
                    <p className="text-white font-bold text-lg text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 font-heading">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
