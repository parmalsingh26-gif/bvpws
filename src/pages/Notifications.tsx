import NotificationBoard from '../components/NotificationBoard';

export default function Notifications() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400 mb-4">All Notifications</h1>
        <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
      </div>
      <NotificationBoard limit={10} showSearch={true} category="All" />
    </div>
  );
}
