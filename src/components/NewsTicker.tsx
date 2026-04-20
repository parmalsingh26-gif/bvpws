import { useState, useEffect } from 'react';
import { Bell, Zap } from 'lucide-react';

interface Ticker {
  id: number;
  text: string;
  isActive: boolean;
}

export default function NewsTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    fetch('/api/tickers')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTickers(data.filter((t: Ticker) => t.isActive !== false));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch tickers:', err);
        setTickers([]);
      });
  }, []);

  if (tickers.length === 0) return null;

  // Duplicate enough times to ensure seamless scroll
  const scrollItems = [...tickers, ...tickers, ...tickers, ...tickers];

  return (
    <div className="relative bg-gradient-to-r from-red-900 via-rose-800 to-red-900 text-white flex items-center overflow-hidden h-11 shadow-[0_4px_20px_rgba(225,29,72,0.3)] border-b border-rose-500/30 z-[90]">
      {/* Left fade gradient */}
      <div className="absolute left-[110px] sm:left-[140px] top-0 bottom-0 w-12 bg-gradient-to-r from-red-900 to-transparent z-20 pointer-events-none" />
      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-red-900 to-transparent z-20 pointer-events-none" />

      {/* Label */}
      <div className="relative bg-gradient-to-r from-red-950 to-red-900 px-4 sm:px-6 h-full flex items-center gap-2 font-bold z-30 shrink-0 uppercase tracking-widest text-xs sm:text-sm shadow-[10px_0_20px_-5px_rgba(0,0,0,0.5)]">
        <div className="relative flex items-center justify-center">
          <Bell size={16} className="text-rose-300 relative z-10" />
          <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-40"></div>
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-rose-200">
          News Flashes
        </span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-black/10">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center">
          {scrollItems.map((ticker, index) => (
            <div key={`${ticker.id}-${index}`} className="flex items-center group shrink-0">
              <span className="mx-6 font-medium text-sm text-red-50 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 cursor-pointer">
                {ticker.text}
              </span>
              <span className="text-rose-500/60 group-hover:text-rose-400 transition-colors mx-2 flex items-center shrink-0">
                <Zap size={14} className="animate-pulse" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
