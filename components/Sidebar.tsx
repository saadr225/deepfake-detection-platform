"use client"

import Link from "next/link"
import {
  Home,
  ShieldAlert,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
} from "lucide-react"
import { useRouter } from "next/router"
import { useUser } from "../contexts/UserContext"
import { ThemeToggle } from "./ThemeToggle"
import { motion } from "framer-motion"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useUser()
  const router = useRouter()

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/detect", label: "Deepfake Detection", icon: ShieldAlert },
    { href: "/aicontentdetection", label: "AI Content Detection", icon: FileText },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/dashboard", label: "Dashboard", icon: User, auth: true },
  ]

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-0 bottom-0 bg-sidebar text-sidebar-foreground flex flex-col z-50 ${
        isCollapsed ? "w-24" : "w-72"
      } transition-width duration-300 shadow-xl sm:relative`}
    >
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border mb-4">
        <div className="flex items-center justify-center w-full">
          {isCollapsed ? (
            <div className="text-white text-2xl font-bold">DMI</div>
          ) : (
            <div className="text-white text-2xl font-bold">Deep Media Inspection</div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-[-16px] top-[20px] transform bg-white dark:bg-gray-800 text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map(
            (item) =>
              (!item.auth || user) && (
                <Link href={item.href} key={item.label} legacyBehavior>
                  <a
                    className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 relative
                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      router.pathname === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground"
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <item.icon
                        className={`h-5 w-5 ${
                          router.pathname === item.href ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                        }`}
                      />
                      {!isCollapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ArrowRight
                        className="h-4 w-4 text-sidebar-foreground transform translate-x-3 opacity-0 transition-all duration-200 
                        group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    )}
                  </a>
                </Link>
              ),
          )}
        </div>

        <div className="px-3 mt-auto space-y-1 absolute bottom-4 w-full">
          {user ? (
            <button
              onClick={logout}
              className="group flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors duration-200
                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <div className="flex items-center min-w-0">
                <LogOut className="h-5 w-5 text-sidebar-foreground" />
                {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
              </div>
              {!isCollapsed && (
                <ArrowRight
                  className="h-4 w-4 text-sidebar-foreground transform translate-x-3 opacity-0 transition-all duration-200 
                  group-hover:translate-x-0 group-hover:opacity-100"
                />
              )}
            </button>
          ) : (
            <div className="space-y-1">
              <Link href="/login" legacyBehavior>
                <a
                  className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 relative
                    hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      router.pathname === "/login"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground"
                    }`}
                >
                  <div className="flex items-center min-w-0">
                    <LogIn
                      className={`h-5 w-5 ${
                        router.pathname === "/login" ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                      }`}
                    />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Login</span>}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight
                      className="h-4 w-4 text-sidebar-foreground transform translate-x-3 opacity-0 transition-all duration-200 
                      group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  )}
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a
                  className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 relative
                  hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    router.pathname === "/register"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <LogIn
                      className={`h-5 w-5 ${
                        router.pathname === "/register" ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                      }`}
                    />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Sign Up</span>}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight
                      className="h-4 w-4 text-sidebar-foreground transform translate-x-3 opacity-0 transition-all duration-200 
                      group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  )}
                </a>
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="px-1 pt-2">
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </motion.div>
  )
}

