import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ShieldAlert, MessageSquare, User, LogOut, LogIn, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import Image from 'next/image';

export default function Sidebar() {
  // Initialize state from localStorage if available, otherwise default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const { user, logout } = useUser();
  const router = useRouter();

  // Save collapse state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/detect', label: 'Deepfake Detection', icon: ShieldAlert },
    { href: '/aicontentdetection', label: 'AI Content Detection', icon: ShieldAlert },
    { href: '/forum', label: 'Forum', icon: MessageSquare },
    { href: '/dashboard', label: 'Dashboard', icon: User, auth: true },
  ];

  return (
    <div className={`min-h-screen fixed left-0 top-0 h-full bg-white dark:bg-black flex flex-col ${
      isCollapsed ? 'w-20' : 'w-60'
    } transition-all duration-300 shadow-lg`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Image src="/assets/logo.jpg" alt="DMI Logo" width={isCollapsed ? 40 : 120} height={40} />
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          {menuItems.map((item) => (
            (!item.auth || user) && (
              <Link href={item.href} key={item.label} legacyBehavior>
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  ${router.pathname === item.href 
                    ? 'bg-gray-200 dark:bg-gray-700 text-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    router.pathname === item.href 
                      ? 'text-primary' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                </a>
              </Link>
            )
          ))}
        </div>

        <div className="p-2 mt-auto">
          {user ? (
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <Link href="/login" legacyBehavior>
                <a className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <LogIn className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">Login</span>
                  )}
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <LogIn className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">Sign Up</span>
                  )}
                </a>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}