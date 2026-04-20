import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slider {
  id: number;
  title: string;
  imageUrl: string;
  orderIndex: number;
}

// Static particles generated once (not on every render) to avoid jitter
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 3) % 100}%`,
  duration: `${12 + (i % 10) * 2}s`,
  delay: `${(i * 1.7) % 12}s`,
  size: 3 + (i % 3),
  opacity: 0.3 + (i % 4) * 0.1,
}));

export default function HeroSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch('/api/sliders')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSliders(data);
        } else {
          console.error('Expected array from /api/sliders, got:', data);
          setSliders([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch sliders:', err);
        setSliders([]);
      });
  }, []);

  useEffect(() => {
    if (sliders.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders, isPaused]);

  const nextSlide = useCallback(() => {
    if (sliders.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  }, [sliders.length]);

  const prevSlide = useCallback(() => {
    if (sliders.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
  }, [sliders.length]);

  if (!Array.isArray(sliders) || sliders.length === 0) {
    return (
      <div className="h-[500px] md:h-[700px] bg-[#0a192f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        <div className="flex flex-col items-center gap-4 text-white/30">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  const currentSlider = sliders[currentIndex];
  if (!currentSlider) return null;

  return (
    <div
      className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-black group font-heading select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Particles - static positions, CSS animated */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: p.left,
              bottom: '-10px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationName: 'particle-float',
              animationDuration: p.duration,
              animationDelay: p.delay,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          />
        ))}
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Slow Ken Burns zoom */}
          <motion.img
            src={currentSlider.imageUrl}
            alt={currentSlider.title}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 9, ease: 'linear' }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/95 via-[#0a192f]/35 to-transparent" />
          {/* Side gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/40 via-transparent to-[#0a192f]/20" />

          {/* Title text */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-24 md:pb-32 px-4">
            <motion.div
              initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="text-center max-w-5xl relative z-30"
            >
              {/* Decorative line above title */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-300 mx-auto mb-6 rounded-full"
              />
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] leading-tight">
                {currentSlider.title.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="inline-block mr-[0.3em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              {/* Slide count badge */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-4 text-white/50 text-sm font-medium tracking-widest uppercase"
              >
                {currentIndex + 1} / {sliders.length}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next Buttons */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 -translate-x-8 group-hover:translate-x-0"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 translate-x-8 group-hover:translate-x-0"
      >
        <ChevronRight size={28} />
      </button>

      {/* Progress Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className="relative h-2 rounded-full overflow-hidden transition-all duration-500 ease-out focus:outline-none"
            style={{
              width: index === currentIndex ? '3rem' : '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.25)',
            }}
          >
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: isPaused ? 0 : 6, ease: 'linear' }}
                key={`progress-${currentIndex}`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
