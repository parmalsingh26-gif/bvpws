import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, Image as ImageIcon, Bell, Users, FileText, Plus, Trash2, Edit, Activity, BarChart3, Save, ArrowUp, ArrowDown, Settings, Mail, Check, Download, GraduationCap, Database } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ username: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#070b14] flex relative overflow-hidden">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Sidebar */}
      {/* Sidebar navigation */}
      <aside className="w-72 bg-[#0a192f] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">CWM Console</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">Admin Authority</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
            { id: 'sliders', icon: ImageIcon, label: 'Hero Sliders' },
            { id: 'gallery', icon: ImageIcon, label: 'Media Gallery' },
            { id: 'tickers', icon: Bell, label: 'News Ticker' },
            { id: 'notifications', icon: FileText, label: 'Circulars' },
            { id: 'pages', icon: FileText, label: 'Web Content' },
            { id: 'results', icon: GraduationCap, label: 'Exam Results' },
            { id: 'officers', icon: Users, label: 'Leadership' },
            { id: 'stats', icon: BarChart3, label: 'System Stats' },
            { id: 'messages', icon: Mail, label: 'Citizen Portal' },
            { id: 'settings', icon: Settings, label: 'Core Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium group',
                activeTab === item.id 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <item.icon size={20} className={clsx('transition-transform duration-300 group-hover:scale-110', activeTab === item.id ? 'text-blue-400' : 'text-slate-500')} /> 
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
          >
            <LogOut size={18} /> Exit System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 overflow-y-auto relative z-10 custom-scrollbar">
        <div className="glass bg-[#0d1629]/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 p-8 min-h-[calc(100vh-4rem)] text-slate-200">
          {activeTab === 'dashboard' && <MainDashboard />}
          {activeTab === 'sliders' && <SliderManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'tickers' && <TickerManager />}
          {activeTab === 'notifications' && <NotificationManager />}
          {activeTab === 'pages' && <PageManager />}
          {activeTab === 'results' && <ResultsManager />}
          {activeTab === 'officers' && <OfficerManager />}
          {activeTab === 'stats' && <StatsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}

// --- Sub Components ---

const CHART_COLORS = { emerald: '#059669', blue: '#2563eb', purple: '#7c3aed' };
const PIE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.blue];

function MainDashboard() {
  const [stats, setStats] = useState({ totalPdfs: 0, totalSliders: 0, totalNews: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{
    notificationsByCategory: { name: string; value: number }[];
    resultsByCategory: { name: string; value: number }[];
    messagesStats: { name: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/quick-stats').then(res => res.json()).then(setStats);
    fetch('/api/admin/activity-logs').then(res => res.json()).then(setLogs);
    fetch('/api/admin/analytics')
      .then(res => res.ok ? res.json() : null)
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  const categoryMap = new Map<string, { name: string; notifications: number; results: number }>();
  (analytics?.notificationsByCategory ?? []).forEach(({ name, value }) => {
    categoryMap.set(name, { name, notifications: value, results: categoryMap.get(name)?.results ?? 0 });
  });
  (analytics?.resultsByCategory ?? []).forEach(({ name, value }) => {
    const existing = categoryMap.get(name);
    categoryMap.set(name, {
      name,
      notifications: existing?.notifications ?? 0,
      results: value,
    });
  });
  const barChartData = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] font-heading mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-cyan-400" /> Command Center
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative group bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-cyan-500/20 text-cyan-400 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.5)]"><FileText size={28} /></div>
            <div>
              <p className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">Total PDFs</p>
              <p className="text-4xl font-black text-white drop-shadow-md mt-1">{stats.totalPdfs}</p>
            </div>
          </div>
        </div>
        
        <div className="relative group bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.5)]"><ImageIcon size={28} /></div>
            <div>
              <p className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">Slider Images</p>
              <p className="text-4xl font-black text-white drop-shadow-md mt-1">{stats.totalSliders}</p>
            </div>
          </div>
        </div>

        <div className="relative group bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-amber-500/20 text-amber-400 p-4 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.5)]"><Bell size={28} /></div>
            <div>
              <p className="text-sm text-amber-400 font-semibold uppercase tracking-wider">News Flashes</p>
              <p className="text-4xl font-black text-white drop-shadow-md mt-1">{stats.totalNews}</p>
            </div>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#112240]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h4 className="text-xl font-bold text-white mb-6">Distribution Overview</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="notifications" name="Notifications" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="results" name="Results" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#112240]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h4 className="text-xl font-bold text-white mb-6">Messages Status</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.messagesStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.messagesStats.map((_, index) => (
                      <Cell key={index} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <Activity size={24} className="text-cyan-400" /> Recent System Logs
      </h4>
      <div className="bg-[#112240]/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <ul className="divide-y divide-slate-800">
          {logs.map(log => (
            <li key={log.id} className="p-5 hover:bg-slate-800/50 transition-colors flex justify-between items-center group">
              <div>
                <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{log.action}</p>
                <p className="text-sm text-slate-400 mt-1">{log.details}</p>
              </div>
              <span className="text-xs font-medium text-cyan-300 bg-cyan-900/30 border border-cyan-800/50 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                {new Date(log.timestamp.replace(' ', 'T')).toLocaleString('en-IN')}
              </span>
            </li>
          ))}
          {logs.length === 0 && <li className="p-8 text-slate-400 text-center italic">No recent network activity</li>}
        </ul>
      </div>
    </motion.div>
  );
}

function SliderManager() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchSliders = () => fetch('/api/sliders').then(res => res.json()).then(setSliders);
  useEffect(() => { fetchSliders(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select an image');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);
    formData.append('orderIndex', sliders.length.toString());

    await fetch('/api/sliders', { method: 'POST', body: formData });
    setTitle('');
    setFile(null);
    fetchSliders();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
    fetchSliders();
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;
    const reordered = [...sliders];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const payload = reordered.map((item, i) => ({ id: item.id, orderIndex: i }));
    await fetch('/api/sliders/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    fetchSliders();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><ImageIcon className="text-cyan-400" /> Hero Sliders</h3>
      <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-4">Add New Slide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title (Optional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" placeholder="e.g. Workshop Inauguration" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">High-Res Image</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-2.5 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 transition-colors cursor-pointer" required />
          </div>
        </div>
        <button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(6,182,212,0.4)]">
          <Plus size={20} /> Upload Slide
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sliders.map((slider, index) => (
          <div key={slider.id} className="group border border-white/10 rounded-2xl overflow-hidden bg-[#112240]/40 backdrop-blur-md shadow-lg hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-video overflow-hidden">
              <img src={slider.imageUrl} alt={slider.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="font-semibold text-white tracking-wide truncate">{slider.title || 'Untitled Image'}</span>
              </div>
            </div>
            <div className="p-4 bg-[#0a192f]/50 flex justify-between items-center gap-2">
              <span className="font-medium text-slate-300 truncate min-w-0 group-hover:hidden">{slider.title || 'Untitled'}</span>
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                <button type="button" onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shadow-inner" title="Move up">
                  <ArrowUp size={18} />
                </button>
                <button type="button" onClick={() => handleReorder(index, 'down')} disabled={index === sliders.length - 1} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shadow-inner" title="Move down">
                  <ArrowDown size={18} />
                </button>
                <button onClick={() => handleDelete(slider.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2.5 rounded-xl transition-colors shadow-inner" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TickerManager() {
  const [tickers, setTickers] = useState<any[]>([]);
  const [text, setText] = useState('');

  const fetchTickers = () => fetch('/api/admin/tickers').then(res => res.json()).then(setTickers);
  useEffect(() => { fetchTickers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    await fetch('/api/tickers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, isActive: true })
    });
    setText('');
    fetchTickers();
  };


  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/tickers/${id}`, { method: 'DELETE' });
    fetchTickers();
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    await fetch(`/api/tickers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    fetchTickers();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><Bell className="text-amber-400" /> Manage News Ticker</h3>
      <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-300 mb-2">News Text</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="Enter breaking news..." required />
        </div>
        <div className="flex gap-4 flex-wrap pb-1">
          <button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(245,158,11,0.4)]">
            <Plus size={20} /> Add
          </button>
        </div>
      </form>

      <ul className="space-y-4">
        {tickers.map((ticker, index) => {
          const isActive = !!ticker.isActive;
          return (
            <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={ticker.id} className="flex justify-between items-center gap-4 p-5 border border-white/10 rounded-2xl bg-[#0a192f]/80 backdrop-blur-md shadow-lg hover:shadow-[0_5px_20px_rgba(0,0,0,0.5)] transition-all">
              <span className={clsx('flex-1 min-w-0 font-medium text-lg', isActive ? 'text-white' : 'text-slate-500 line-through')}>{ticker.text}</span>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label={isActive ? 'Mark inactive' : 'Mark active'}
                  onClick={() => handleToggleActive(ticker.id, isActive)}
                  className={clsx(
                    'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#0a192f]',
                    isActive ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-700'
                  )}
                >
                  <span
                    className={clsx(
                      'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition',
                      isActive ? 'translate-x-7' : 'translate-x-0'
                    )}
                  />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={() => handleDelete(ticker.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2.5 rounded-xl transition-colors shadow-inner" title="Delete"><Trash2 size={18} /></button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function NotificationManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);

  const fetchNotifications = () => fetch('/api/notifications?limit=100').then(res => res.json()).then(data => setNotifications(data.notifications || []));
  useEffect(() => { fetchNotifications(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert('Please provide title and PDF');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('pdf', file);

    await fetch('/api/notifications', { method: 'POST', body: formData });
    setTitle('');
    setCategory('General');
    setFile(null);
    fetchNotifications();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    fetchNotifications();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><FileText className="text-blue-400" /> Notifications & Circulars</h3>
      <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-4">Publish Notification</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Notification Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g. Promotion Order 2024" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-blue-500 transition-colors">
              <option value="General">General</option>
              <option value="Seniority List">Seniority List</option>
              <option value="Transfer Orders">Transfer Orders</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">PDF File</label>
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-2.5 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer" required />
          </div>
        </div>
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(37,99,235,0.4)]">
          <Plus size={20} /> Publish PDF
        </button>
      </form>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.map((notif, index) => (
          <motion.li initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} key={notif.id} className="flex justify-between items-center p-5 border border-white/10 rounded-2xl bg-[#0a192f]/80 backdrop-blur-md shadow-lg hover:shadow-[0_5px_20px_rgba(37,99,235,0.2)] transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl border border-blue-500/30">
                <FileText size={24} />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{notif.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="bg-blue-900/50 border border-blue-700/50 text-blue-300 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">{notif.category}</span>
                  <a href={notif.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-sm">View Document</a>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(notif.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2.5 rounded-xl transition-colors shadow-inner shrink-0" title="Delete"><Trash2 size={18} /></button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function GalleryManager() {
  const [images, setImages] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchImages = () => fetch('/api/gallery').then(res => res.json()).then(setImages);
  useEffect(() => { fetchImages(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select an image');
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('image', file);

    await fetch('/api/gallery', { method: 'POST', body: formData });
    setCaption('');
    setFile(null);
    fetchImages();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    fetchImages();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><ImageIcon className="text-pink-400" /> Multi-Media Gallery</h3>
      <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-4">Add Media</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Caption (Optional)</label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors" placeholder="Image Caption" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Image File</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-2.5 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 transition-colors cursor-pointer" required />
          </div>
        </div>
        <button type="submit" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(236,72,153,0.4)]">
          <Plus size={20} /> Add to Gallery
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, index) => (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} key={img.id} className="group border border-white/10 rounded-2xl overflow-hidden bg-[#112240]/40 backdrop-blur-md shadow-lg hover:shadow-[0_10px_30px_rgba(236,72,153,0.2)] transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden">
              <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="font-semibold text-white truncate text-sm mb-2">{img.caption || 'No caption'}</span>
                <button onClick={() => handleDelete(img.id)} className="self-end text-red-400 hover:text-white bg-red-500/20 hover:bg-red-500 p-2.5 rounded-full transition-colors backdrop-blur-md border border-white/10 shadow-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function StatsManager() {
  const [stats, setStats] = useState<{ id?: number; key?: string; label: string; value: string; icon: string }[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = stats.map(s => ({ label: s.label ?? '', value: s.value ?? '', icon: s.icon ?? '' }));
    const res = await fetch('/api/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats: payload }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.stats)) {
      setStats(data.stats);
      alert('Stats updated successfully!');
    } else {
      alert(data?.error || 'Failed to save stats.');
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const handleDelete = (index: number) => {
    if (stats.length <= 1) {
      alert('At least one stat row is required.');
      return;
    }
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleAddNew = () => {
    setStats([...stats, { label: '', value: '', icon: '' }]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><BarChart3 className="text-emerald-400" /> Manage Workshop Statistics</h3>
      <form onSubmit={handleUpdate} className="space-y-6">
        {stats.map((stat, index) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} key={stat.id ?? `new-${index}`} className="bg-[#112240]/60 backdrop-blur-md shadow-lg p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 items-center hover:shadow-[0_5px_20px_rgba(16,185,129,0.1)] transition-all">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Stat Label</label>
              <input type="text" value={stat.label ?? ''} onChange={e => handleChange(index, 'label', e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" required placeholder="e.g. Locos Repaired" />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Numerical Value</label>
              <input type="text" value={stat.value ?? ''} onChange={e => handleChange(index, 'value', e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" required placeholder="e.g. 1500+" />
            </div>
            <div className="w-full md:w-1/3 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">Icon (Lucide)</label>
                <input type="text" value={stat.icon ?? ''} onChange={e => handleChange(index, 'icon', e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. Train, Users" required />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="shrink-0 p-3 h-[50px] text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-xl transition-colors shadow-inner flex items-center justify-center"
                title="Delete stat"
                aria-label="Delete stat row"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
        <div className="flex flex-wrap gap-4 items-center bg-[#0d1629]/80 rounded-2xl p-6 border border-white/5 shadow-inner mt-8">
          <button
            type="button"
            onClick={handleAddNew}
            className="border-2 border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Add New Stat Marker
          </button>
          <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(16,185,129,0.4)] ml-auto">
            <Save size={20} /> Deploy All Stats
          </button>
        </div>
      </form>
    </motion.div>
  );
}

const PAGE_SLUG_OPTIONS = [
  { value: 'about-history', label: 'About › History' },
  { value: 'about-vision-mission', label: 'About › Vision & Mission' },
  { value: 'about-our-team', label: 'About › Our Team' },
  { value: 'departments-mechanical', label: 'Departments › Mechanical' },
  { value: 'departments-electrical', label: 'Departments › Electrical' },
  { value: 'departments-personnel', label: 'Departments › Personnel' },
  { value: 'departments-stores', label: 'Departments › Stores' },
];

function PageManager() {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPage = (selectedSlug: string) => {
    if (!selectedSlug) {
      setTitle('');
      setContent('');
      return;
    }
    setLoading(true);
    fetch(`/api/pages/${selectedSlug}`)
      .then((res) => {
        if (res.ok) return res.json();
        setTitle('');
        setContent('');
      })
      .then((data) => {
        if (data?.page) {
          setTitle(data.page.title);
          setContent(data.page.content ?? '');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (slug) loadPage(slug);
  }, [slug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSlug(e.target.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      });
      alert('Page saved successfully.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><FileText className="text-indigo-400" /> Manage Pages Content</h3>
      <div className="mb-6 bg-[#112240]/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg inline-block w-full max-w-xl">
        <label className="block text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wider">Select Page to Edit</label>
        <select
          value={slug}
          onChange={handleSlugChange}
          className="w-full border border-white/20 rounded-xl px-4 py-3 bg-[#0a192f] text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner font-medium text-lg appearance-none cursor-pointer"
        >
          <option value="">— Choose a section —</option>
          {PAGE_SLUG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {slug && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSave} className="bg-gradient-to-br from-[#112240]/80 to-[#0a192f]/80 backdrop-blur-md shadow-2xl p-8 rounded-3xl border border-indigo-500/20 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Page Heading / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0d1629] border border-white/10 text-white rounded-xl px-4 py-3 disabled:opacity-50 focus:border-indigo-500 transition-colors shadow-inner text-lg font-medium"
              placeholder="e.g. Overview of Mechanical Department"
              required
            />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between gap-4 mb-3">
              <label className="block text-sm font-medium text-slate-300">Body Content (Markdown/HTML supported)</label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={16}
              className="w-full bg-[#0d1629] border border-white/10 text-slate-200 rounded-xl px-5 py-4 resize-y disabled:opacity-50 focus:border-indigo-500 transition-colors shadow-inner leading-relaxed custom-scrollbar font-medium"
              placeholder="Start writing page content here... line breaks will be preserved."
            />
          </div>
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading || saving}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:translate-y-0"
            >
              <Save size={20} /> {saving ? 'Saving Changes...' : 'Publish Content'}
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}

function OfficerManager() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [addName, setAddName] = useState('');
  const [addDesignation, setAddDesignation] = useState('');
  const [addOrderIndex, setAddOrderIndex] = useState(0);
  const [addFile, setAddFile] = useState<File | null>(null);

  const fetchOfficers = () => fetch('/api/officers').then(res => res.json()).then(setOfficers);
  useEffect(() => { fetchOfficers(); }, []);

  const handleEdit = (officer: any) => {
    setEditingId(officer.id);
    setName(officer.name);
    setDesignation(officer.designation);
    setFile(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFile || !addName.trim() || !addDesignation.trim()) return alert('Name, designation, and image are required');
    const formData = new FormData();
    formData.append('name', addName.trim());
    formData.append('designation', addDesignation.trim());
    formData.append('orderIndex', String(addOrderIndex));
    formData.append('image', addFile);
    await fetch('/api/officers', { method: 'POST', body: formData });
    setAddName('');
    setAddDesignation('');
    setAddOrderIndex(officers.length);
    setAddFile(null);
    fetchOfficers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this officer?')) return;
    await fetch(`/api/officers/${id}`, { method: 'DELETE' });
    fetchOfficers();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const formData = new FormData();
    formData.append('name', name);
    formData.append('designation', designation);
    if (file) formData.append('image', file);

    await fetch(`/api/officers/${editingId}`, { method: 'PUT', body: formData });
    setEditingId(null);
    fetchOfficers();
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= officers.length) return;
    const reordered = [...officers];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const payload = reordered.map((item, i) => ({ id: item.id, orderIndex: i }));
    await fetch('/api/officers/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    fetchOfficers();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><Users className="text-purple-400" /> Manage Leadership Profiles</h3>

      {editingId ? (
        <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleUpdate} className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl mb-10 shadow-[0_10px_40px_rgba(168,85,247,0.2)]">
          <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Edit size={20} className="text-purple-400" /> Edit Officer Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Officer Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0a192f] border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Designation</label>
              <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-[#0a192f] border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Update Photo</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-purple-500/30 text-white rounded-xl px-4 py-2 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_5px_15px_rgba(168,85,247,0.4)] transition-all hover:-translate-y-1">Save Changes</button>
            <button type="button" onClick={() => setEditingId(null)} className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all">Cancel</button>
          </div>
        </motion.form>
      ) : (
        <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h4 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Onboard New Executive</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
              <input type="text" value={addName} onChange={e => setAddName(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-purple-500 transition-colors" placeholder="Full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Designation *</label>
              <input type="text" value={addDesignation} onChange={e => setAddDesignation(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-purple-500 transition-colors" placeholder="e.g. CWM" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Display Order</label>
              <input type="number" min={0} value={addOrderIndex} onChange={e => setAddOrderIndex(Number(e.target.value) || 0)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-purple-500 transition-colors text-center font-bold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Portrait Photo *</label>
              <input type="file" accept="image/*" onChange={e => setAddFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-2 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors cursor-pointer" required />
            </div>
          </div>
          <button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_5px_15px_rgba(168,85,247,0.4)] transition-all hover:-translate-y-1">
            <Plus size={20} /> Add Officer Record
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {officers.map((officer, index) => (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} key={officer.id} className="group relative border border-white/10 rounded-3xl overflow-hidden bg-[#112240]/60 backdrop-blur-xl shadow-2xl flex flex-col hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] transition-all duration-300 transform hover:-translate-y-2">
            <div className="relative h-64 overflow-hidden bg-gradient-to-b from-transparent to-[#0a192f]">
              <img src={officer.imageUrl} alt={officer.name} className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#112240] via-[#112240]/40 to-transparent"></div>
            </div>
            
            <div className="p-6 relative -mt-16 flex-1 flex flex-col items-center text-center">
              <h4 className="text-xl font-black text-white drop-shadow-md tracking-wide">{officer.name}</h4>
              <p className="text-sm font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">{officer.designation}</p>
              
              <div className="mt-8 mb-2 w-full flex items-center justify-center gap-2">
                <button type="button" onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/5 transition-all shadow-inner" title="Move Top">
                  <ArrowUp size={18} />
                </button>
                <button type="button" onClick={() => handleReorder(index, 'down')} disabled={index === officers.length - 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/5 transition-all shadow-inner" title="Move Bottom">
                  <ArrowDown size={18} />
                </button>
                <button onClick={() => handleEdit(officer)} className="flex-1 max-w-[120px] h-10 flex items-center justify-center gap-1.5 bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/40 text-blue-300 font-semibold rounded-xl transition-all shadow-inner">
                  <Edit size={16} /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(officer.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-inner" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ResultsManager() {
  const [results, setResults] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LDCE');
  const [file, setFile] = useState<File | null>(null);

  const fetchResults = () => fetch('/api/results?limit=100').then(res => res.json()).then(data => setResults(data.results || []));
  useEffect(() => { fetchResults(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert('Please provide title and PDF');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('pdf', file);
    await fetch('/api/results', { method: 'POST', body: formData });
    setTitle('');
    setCategory('LDCE');
    setFile(null);
    fetchResults();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/results/${id}`, { method: 'DELETE' });
    fetchResults();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3"><GraduationCap className="text-blue-400" /> Professional Exam Results</h3>
      <form onSubmit={handleAdd} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-4">Publish New Results Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Result Heading</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-blue-500 transition-colors shadow-inner" placeholder="e.g. Apprentice Intake 2024" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-3 focus:border-blue-500 transition-colors cursor-pointer">
              <option value="LDCE">LDCE (Internal)</option>
              <option value="GDCE">GDCE (Open)</option>
              <option value="Trade Test">Trade Test</option>
              <option value="Other">Miscellaneous</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">PDF Document</label>
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-[#0a192f] border border-white/20 text-white rounded-xl px-4 py-2 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer shadow-inner" required />
          </div>
        </div>
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transform transition-all hover:-translate-y-1 shadow-[0_5px_15px_rgba(37,99,235,0.4)]">
          <Plus size={20} /> Deploy Results
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((item, index) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={item.id} className="flex justify-between items-center p-5 border border-white/10 rounded-2xl bg-[#0a192f]/80 backdrop-blur-md shadow-lg hover:shadow-[0_5px_20px_rgba(37,99,235,0.2)] transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <p className="font-bold text-white text-lg tracking-tight">{item.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="bg-blue-900/40 border border-blue-700/50 text-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-widest leading-none">{item.category}</span>
                  <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-200 hover:underline font-bold text-sm">Download PDF</a>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 p-2.5 rounded-xl transition-all shadow-inner" title="Delete record"><Trash2 size={20} /></button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function MessagesManager() {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = () => fetch('/api/admin/messages').then(res => res.json()).then(setMessages);
  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'PUT' });
    fetchMessages();
  };

  const escapeCsvField = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    return '"' + str.replace(/"/g, '""') + '"';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date', 'Status'];
    const rows = messages.map((msg) => [
      escapeCsvField(msg.name),
      escapeCsvField(msg.email),
      escapeCsvField(msg.subject ?? ''),
      escapeCsvField(msg.message ?? ''),
      escapeCsvField(msg.createdAt ? new Date(msg.createdAt.replace(' ', 'T')).toLocaleString('en-IN') : ''),
      escapeCsvField(msg.isRead ? 'Read' : 'Unread'),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workshop_enquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mail className="text-emerald-400" /> Citizen Feedback Portal
        </h3>
        <button
          type="button"
          onClick={exportToCSV}
          disabled={messages.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-emerald-500/5 active:scale-95"
        >
          <Download size={20} /> Export Audit Log (CSV)
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-[#112240]/20 rounded-3xl border border-dashed border-white/10">
          <Mail size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 font-medium italic">The communication vault is currently empty.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {messages.map((msg, index) => {
            const unread = !msg.isRead;
            return (
              <motion.li
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={msg.id}
                className={clsx(
                  'relative border rounded-3xl p-6 transition-all duration-300 overflow-hidden group shadow-xl',
                  unread
                    ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-blue-500/40 shadow-blue-500/10 hover:shadow-blue-500/20'
                    : 'bg-[#112240]/40 border-white/5 hover:bg-[#112240]/60'
                )}
              >
                {unread && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                    </span>
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-xl font-black text-slate-300 uppercase shadow-inner">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={clsx('text-lg font-bold truncate tracking-tight', unread ? 'text-white' : 'text-slate-300')}>{msg.name}</h4>
                      <p className="text-sm text-slate-500 font-medium truncate">{msg.email}</p>
                    </div>
                  </div>

                  {msg.subject && (
                    <div className="mb-4">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Subject Matter</span>
                      <p className="text-white font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg inline-block">{msg.subject}</p>
                    </div>
                  )}

                  <div className="bg-black/20 rounded-2xl p-4 shadow-inner mb-6 min-h-[100px]">
                    <p className={clsx('text-slate-300 leading-relaxed text-sm whitespace-pre-wrap', unread && 'font-medium text-slate-100')}>
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Received On</span>
                      <p className="text-xs text-slate-400 font-bold">
                        {new Date(msg.createdAt?.replace(' ', 'T')).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    {unread && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(msg.id)}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        <Check size={18} /> Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

function SettingsManager() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to update password.');
        return;
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-3xl font-bold text-white mb-10 pb-6 border-b border-white/10 flex items-center gap-3">
        <Settings className="text-slate-400" /> Core System Settings
      </h3>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-4">Identity & Security</h4>
          <form onSubmit={handleSubmit} className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <LogOut size={80} />
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold flex items-center gap-2">
                <Activity size={18} /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2">
                <Check size={18} /> Master password updated successfully.
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Credential</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0a192f] border border-white/10 text-white rounded-xl px-5 py-4 focus:border-blue-500 transition-colors shadow-inner font-medium"
                  placeholder="Verify existing password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a192f] border border-white/10 text-white rounded-xl px-5 py-4 focus:border-blue-500 transition-colors shadow-inner font-medium"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0a192f] border border-white/10 text-white rounded-xl px-5 py-4 focus:border-blue-500 transition-colors shadow-inner font-medium"
                    placeholder="Repeat password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Re-Key Security System'}
            </button>
          </form>
        </div>

        <div className="space-y-10">

          <section>
            <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Database size={24} className="text-emerald-400" /> Infrastructure Maintenance
            </h4>
            <div className="bg-[#112240]/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl group border-dashed hover:border-emerald-500/30 transition-colors">
              <p className="text-slate-400 font-medium mb-6 leading-relaxed">Ensure structural integrity of all application records by maintaining regular remote snapshot backups.</p>
              <a
                href="/api/admin/backup"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                <Download size={24} />
                Download System Snapshot
              </a>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
