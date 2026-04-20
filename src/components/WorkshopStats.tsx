import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';
import { Train, Users, Building, Wrench } from 'lucide-react';
import Skeleton from './ui/Skeleton';

// Animated Counter Component
function AnimatedCounter({ value }: { value: string }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const prefix = value.replace(/[0-9].*/, '');
  const suffix = value.replace(/.*?[0-9]+/, '');
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, { bounce: 0, duration: 2500 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (isInView && !isNaN(numericValue)) {
      spring.set(numericValue);
    }
  }, [isInView, numericValue, spring]);

  if (isNaN(numericValue)) return <span>{value}</span>;

  return (
    <span ref={ref} className="flex items-center justify-center">
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

interface Stat {
  id: number;
  key: string;
  value: string;
  label: string;
  icon: string;
}

const iconMap: Record<string, any> = { Train, Users, Building, Wrench };

export default function WorkshopStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setStats(data);
        } else {
          console.error('Expected array from /api/stats, got:', data);
          setStats([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setStats([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-[#0a192f] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass p-8 rounded-3xl animate-pulse bg-white/5 border border-white/10 h-48"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a192f] text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-white drop-shadow-sm font-heading">
            Workshop at a Glance
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Wrench;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring", bounce: 0.4 }}
                className="group relative glass p-8 rounded-3xl border border-white/10 hover:border-blue-400/50 transition-all duration-500 overflow-hidden card-3d bg-[#112240]/80"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1d4ed8] to-[#06b6d4] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:shadow-[0_10px_40px_rgba(6,182,212,0.6)] group-hover:-translate-y-2 transition-all duration-300 transform group-hover:rotate-6">
                    <IconComponent size={36} className="text-white drop-shadow-md" />
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] font-heading">
                    <AnimatedCounter value={stat.value} />
                  </h3>
                  
                  <p className="text-blue-300 font-medium tracking-widest text-xs uppercase text-center opacity-80 group-hover:opacity-100 transition-opacity">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
