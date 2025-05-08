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
  Archive,
  BookOpen,
  Code,
  Heart,
  Sparkles,
  Gauge,
} from "lucide-react"
import { useRouter } from "next/router"
import { useUser } from "../contexts/UserContext"
import { ThemeToggle } from "./ThemeToggle"
import Image from "next/image"

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
    { href: "/pda", label: "Public Deepfake Archive", icon: Archive },
    { href: "/forum", label: "Community Forum", icon: MessageSquare },
    { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
    { href: "/api-services", label: "API Services", icon: Code },
    { href: "/donate", label: "Donate", icon: Heart },
    { href: "/dashboard", label: "Dashboard", icon: Gauge, auth: true },
  ]

  return (
    <div
      // className={`fixed left-0 top-0 bottom-0 h-screen bg-gradient-to-b from-primary-600 to-primary-700 text-white flex flex-col z-50 ${
      className={`fixed left-0 top-0 bottom-0 h-screen bg-gradient-to-b from-primary-700 to-primary-900 text-white flex flex-col z-50 ${  
        isCollapsed ? "w-[6.5rem]" : "w-72"
      } transition-all duration-300 shadow-elevation`}
    >
      <div className="flex items-center justify-between p-6 border-b border-primary-500/30 relative">
        <div className="flex items-center justify-center w-full">
          {isCollapsed ? (
            <div className="text-white text-2xl font-bold">DMI</div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-white/80" />
              <div className="text-white text-xl font-bold">Deep Media Inspection</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-[-16px] top-[23px] transform bg-white dark:bg-gray-800 text-primary p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-subtle-md z-[60]"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Update the nav element to have proper scrolling */}
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin flex flex-col justify-between">
        <div className="space-y-1 px-3">
          {menuItems.map(
            (item) =>
              (!item.auth || user) && (
                <Link href={item.href} key={item.label} legacyBehavior>
                  <a
                    className={`group flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
                hover:bg-white/10 ${
                  router.pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:text-white"
                }`}
                  >
                    <div className="flex items-center min-w-0">
                      <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${
                        router.pathname === item.href ? "bg-white/20" : "bg-transparent"
                      } transition-colors duration-200`}>
                        <item.icon
                          className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                            router.pathname === item.href ? "text-white" : "text-white/90"
                          }`}
                        />
                      </div>
                      {!isCollapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ArrowRight
                        className="h-4 w-4 text-white/70 transform translate-x-3 opacity-0 transition-all duration-200 
                  group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    )}
                    {/* Active indicator */}
                    {router.pathname === item.href && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full" />
                    )}
                  </a>
                </Link>
              ),
          )}
        </div>

        <div className="px-3 space-y-3 mt-auto">
          {user ? (
            <>
              {/* User profile section when logged in */}
              {!isCollapsed ? (
                <div className="px-5 py-4 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-primary-700"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.username || "User"}</p>
                      <p className="text-xs text-white/70 truncate">{user.email || "user@example.com"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-4 mb-2">
                  <div className="relative">
                    <div className="h-10 w-10 mr-1 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-primary-700"></div>
                  </div>
                </div>
              )}
              
              <button
                onClick={logout}
                className="group flex items-center justify-between w-full px-5 py-3 rounded-xl transition-all duration-200
        hover:bg-white/10 text-white/90 hover:text-white"
              >
                <div className="flex items-center min-w-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-200">
                    <LogOut className="h-5 w-5 text-white/90 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
                </div>
                {!isCollapsed && (
                  <ArrowRight
                    className="h-4 w-4 text-white/70 transform translate-x-3 opacity-0 transition-all duration-200 
          group-hover:translate-x-0 group-hover:opacity-100"
                  />
                )}
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <Link href="/login" legacyBehavior>
                <a
                  className={`group flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
            hover:bg-white/10 ${
              router.pathname === "/login"
                ? "bg-white/20 text-white"
                : "text-white/90 hover:text-white"
            }`}
                >
                  <div className="flex items-center min-w-0">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${
                      router.pathname === "/login" ? "bg-white/20" : "bg-transparent"
                    } transition-colors duration-200`}>
                      <LogIn
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          router.pathname === "/login" ? "text-white" : "text-white/90"
                        }`}
                      />
                    </div>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Login</span>}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight
                      className="h-4 w-4 text-white/70 transform translate-x-3 opacity-0 transition-all duration-200 
              group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  )}
                  {router.pathname === "/login" && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full" />
                  )}
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a
                  className={`group flex items-center justify-between px-5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
          hover:bg-white/10 ${
            router.pathname === "/register"
              ? "bg-white/20 text-white"
              : "text-white/90 hover:text-white"
          }`}
                >
                  <div className="flex items-center min-w-0">
                    <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${
                      router.pathname === "/register" ? "bg-white/20" : "bg-transparent"
                    } transition-colors duration-200`}>
                      <User
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          router.pathname === "/register" ? "text-white" : "text-white/90"
                        }`}
                      />
                    </div>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Sign Up</span>}
                  </div>
                  {!isCollapsed && (
                    <ArrowRight
                      className="h-4 w-4 text-white/70 transform translate-x-3 opacity-0 transition-all duration-200 
              group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  )}
                  {router.pathname === "/register" && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full" />
                  )}
                </a>
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="px-3 pt-2 pb-4">
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </div>
  )
}

