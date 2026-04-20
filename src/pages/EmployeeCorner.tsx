import NotificationBoard from '../components/NotificationBoard';

export default function EmployeeCorner() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-400 mb-4">Employee Corner</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Important documents, seniority lists, and transfer orders for workshop staff.</p>
        <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 rounded-full mt-4"></div>
      </div>
      
      <div className="space-y-12">
        <NotificationBoard limit={5} showSearch={true} category="Seniority List" />
        <NotificationBoard limit={5} showSearch={true} category="Transfer Orders" />
      </div>
    </div>
  );
}
