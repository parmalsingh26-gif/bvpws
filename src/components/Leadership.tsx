import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Skeleton from './ui/Skeleton';

interface Officer {
  id: number;
  name: string;
  designation: string;
  imageUrl: string;
  orderIndex: number;
}

export default function Leadership() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/officers')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setOfficers(data);
        } else {
          console.error('Expected array from /api/officers, got:', data);
          setOfficers([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch officers:', err);
        setOfficers([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 font-heading tracking-tight">Our Leadership</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-3xl animate-pulse aspect-[3/4] glass"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (officers.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-6 font-heading tracking-tight drop-shadow-sm">
            Our Leadership
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {officers.map((officer, index) => (
            <motion.div
              key={officer.id}
              initial={{ opacity: 0, y: 50, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.7, type: "spring", bounce: 0.4 }}
              className="card-3d relative group h-[420px] rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/10 bg-white dark:bg-slate-800"
            >
              {/* Image Container */}
              <div className="absolute inset-0">
                <img
                  src={officer.imageUrl}
                  alt={officer.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Tint overlay that fades on hover */}
              <div className="absolute inset-0 bg-blue-900/10 dark:bg-blue-900/30 group-hover:opacity-0 transition-opacity duration-500 z-10"></div>
              
              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-20"></div>

              {/* Content Panel */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center justify-end z-30 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"></div>
                <h3 className="text-2xl font-black text-white text-center mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight tracking-wide font-heading">
                  {officer.name}
                </h3>
                <p className="text-cyan-300 font-bold text-sm text-center uppercase tracking-widest drop-shadow-sm group-hover:text-cyan-200 transition-colors">
                  {officer.designation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
