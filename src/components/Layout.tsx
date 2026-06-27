import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, LayoutGrid, Settings } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/add', label: 'Add Phrase', icon: <PlusCircle size={20} /> },
    { path: '/browse', label: 'Categories', icon: <LayoutGrid size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 eyecare:bg-[#fbf8f1] text-gray-900 dark:text-gray-100 eyecare:text-[#433422] overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 eyecare:bg-[#f4ebd8] border-t border-gray-200 dark:border-gray-700 eyecare:border-[#e6d5b8] md:relative md:w-64 md:border-t-0 md:border-r flex md:flex-col justify-around md:justify-start z-10 transition-colors duration-300">
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-gray-100 dark:border-gray-700 eyecare:border-[#e6d5b8]">
          <div className="w-8 h-8 bg-blue-600 dark:bg-indigo-600 eyecare:bg-[#8b5a2b] rounded-lg flex items-center justify-center text-white eyecare:text-[#f4ebd8] font-bold transition-colors">P</div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 eyecare:text-[#433422] transition-colors">My Phrasebank</h1>
        </div>
        <div className="flex w-full justify-around md:flex-col md:p-4 md:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-none md:rounded-xl transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 eyecare:text-[#8b5a2b] md:bg-blue-50 dark:md:bg-blue-900/30 eyecare:md:bg-[#e6d5b8] md:text-blue-700 dark:md:text-blue-300 eyecare:md:text-[#5c3a21] font-medium' 
                    : 'text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] hover:text-gray-900 dark:hover:text-gray-200 eyecare:hover:text-[#433422] md:hover:bg-gray-100 dark:md:hover:bg-gray-700/50 eyecare:md:hover:bg-[#e8dec7]'
                }`}
              >
                {item.icon}
                <span className="text-xs md:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-white dark:bg-gray-900 eyecare:bg-[#fbf8f1] transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
}
