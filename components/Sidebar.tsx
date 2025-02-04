import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ShieldAlert, MessageSquare, User, LogOut, LogIn, Menu, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const { user, logout } = useUser();
  const router = useRouter();

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
          <Image src="/assets/logo.jpg" alt="DMI Logo" width={isCollapsed ? 40 : 80} height={40} />
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
                <a className="group flex items-center justify-between px-5 py-3 rounded-lg transition-colors duration-200 relative
                  hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center min-w-0">
                    <item.icon className={`h-5 w-5 ${
                      router.pathname === item.href 
                        ? 'text-primary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight className="h-4 w-4 text-gray-400 transform translate-x-3 opacity-0 transition-all duration-200 
                      group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </a>
              </Link>
            )
          ))}
        </div>

        <div className="p-2 mt-auto space-y-2">
          {user ? (
            <button 
              onClick={logout}
              className="group flex items-center justify-between w-full px-5 py-3 rounded-lg transition-colors duration-200
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center min-w-0">
                <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">Logout</span>
                )}
              </div>
              {!isCollapsed && (
                <ArrowRight className="h-4 w-4 text-gray-400 transform translate-x-3 opacity-0 transition-all duration-200 
                  group-hover:translate-x-0 group-hover:opacity-100" />
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <Link href="/login" legacyBehavior>
                <a className="group flex items-center justify-between w-full px-5 py-3 rounded-lg transition-colors duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center min-w-0">
                    <LogIn className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium">Login</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight className="h-4 w-4 text-gray-400 transform translate-x-3 opacity-0 transition-all duration-200 
                      group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a className="group flex items-center justify-between w-full px-5 py-3 rounded-lg transition-colors duration-200
                  hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex items-center min-w-0">
                    <LogIn className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    {!isCollapsed && (
                      <span className="ml-3 text-sm font-medium">Sign Up</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight className="h-4 w-4 text-gray-400 transform translate-x-3 opacity-0 transition-all duration-200 
                      group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </a>
              </Link>
            </div>
          )}
          
          {/* Theme Toggle */}
          <div className="p-2">
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </div>
  );
}