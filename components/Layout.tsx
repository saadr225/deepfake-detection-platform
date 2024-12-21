import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { Button } from "@/components/ui/button"
import { ThemeToggle } from './ThemeToggle'
import Cookies from 'js-cookie'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useUser()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const refreshToken = Cookies.get('refreshToken');
    setIsLoggedIn(!!refreshToken);
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark:bg-black">
      <header className="bg-white dark:bg-black">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Button variant="ghost" asChild className="flex-shrink-0 flex items-center mt-4">
                <Link href="/">
                  <span className="text-primary text-xl font-bold dark:text-white">DMI</span>
                </Link>
              </Button>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/detect">Deepfake Detection</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/aicontentdetection">AI Content Detection</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/forum">Forum</Link>
              </Button>
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button 
                    onClick={logout} 
                    variant="ghost"
                  >
                    Logout
                  </Button>
                  <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                    <User className="h-5 w-5 mr-1" />
                    {user?.name || 'User'}
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/detect">Deepfake Detection</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/aicontentdetection">AI Content Detection</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/forum">Forum</Link>
              </Button>
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button 
                    onClick={logout} 
                    variant="ghost" 
                    className="w-full"
                  >
                    Logout
                  </Button>
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white">
                    <User className="h-5 w-5 inline mr-1" />
                    {user?.name || 'User'}
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>
      <div className="border-t border-gray-200 dark:border-gray-800 "></div>

      <main className="flex-grow dark:bg-black">
        {children}
      </main>

      <div className="border-t border-gray-200 dark:border-gray-800"></div>

      <footer className="bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
            <div className="px-5 py-2">
              <Button variant="link" asChild>
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
            </div>
            <div className="px-5 py-2">
              <Button variant="link" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
            </div>
            <div className="px-5 py-2">
              <Button variant="link" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-black dark:text-white">
            &copy; 2023 DeepfakeDetect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}