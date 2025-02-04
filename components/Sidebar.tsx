import { useState } from 'react';
import Link from 'next/link';
import { Home, ShieldAlert, MessageSquare, User, LogOut, LogIn, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import Image from 'next/image';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useUser();
  const router = useRouter();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/detect', label: 'Deepfake Detection', icon: ShieldAlert },
    { href: '/aicontentdetection', label: 'AI Content Detection', icon: ShieldAlert },
    { href: '/forum', label: 'Forum', icon: MessageSquare },
    { href: '/dashboard', label: 'Dashboard', icon: User, auth: true },
  ];

  return (
    <div className={`h-screen bg-white dark:bg-black flex flex-col ${isCollapsed ? 'w-20' : 'w-60'} transition-width duration-300 shadow-lg`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Image src="/assets/logo.jpg" alt="DMI Logo" width={isCollapsed ? 40 : 120} height={40} />
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>
      </div>
      <nav className="flex flex-col flex-grow">
        {menuItems.map((item) => (
          (!item.auth || user) && (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={`flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 ${router.pathname === item.href ? 'bg-gray-300 dark:bg-gray-600' : ''} text-sm transition-all duration-200`}>
                <item.icon className="h-6 w-6 mr-2" />
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            </Link>
          )
        ))}
        {user ? (
          <button onClick={logout} className="flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-all duration-200">
            <LogOut className="h-6 w-6 mr-2" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        ) : (
          <>
            <Link href="/login" legacyBehavior>
              <a className="flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-all duration-200">
                <LogIn className="h-6 w-6 mr-2" />
                {!isCollapsed && <span>Login</span>}
              </a>
            </Link>
            <Link href="/register" legacyBehavior>
              <a className="flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-all duration-200">
                <LogIn className="h-6 w-6 mr-2" />
                {!isCollapsed && <span>Sign Up</span>}
              </a>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}