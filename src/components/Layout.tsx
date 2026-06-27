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
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 md:relative md:w-64 md:border-t-0 md:border-r flex md:flex-col justify-around md:justify-start z-10">
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-800">My Phrasebank</h1>
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
                    ? 'text-blue-600 md:bg-blue-50 md:text-blue-700 font-medium' 
                    : 'text-gray-500 hover:text-gray-900 md:hover:bg-gray-100'
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
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
