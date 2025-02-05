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
  //const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/detect", label: "Deepfake Detection", icon: ShieldAlert },
    { href: "/aicontentdetection", label: "AI Content Detection", icon: ShieldAlert },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/dashboard", label: "Dashboard", icon: User, auth: true },
  ]

  return (
    <div
      className={`min-h-screen fixed left-0 top-0 h-full bg-gray-200 dark:bg-[#121212] text-sidebar-foreground flex flex-col z-50 ${
        isCollapsed ? "w-24" : "w-72"
      } transition-width duration-300 shadow-lg sm:relative`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-full">
          <Image src="/assets/logo.jpg" alt="DMI Logo" width={isCollapsed ? 40 : 60} height={40} />
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-sidebar-accent p-2 rounded-full hover:bg-sidebar-accent-foreground transition-colors duration-200"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
        )}
      </button>

      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          {menuItems.map(
            (item) =>
              (!item.auth || user) && (
                <Link href={item.href} key={item.label} legacyBehavior>
                  <a
                    className={`group flex items-center justify-between px-5 py-3 rounded-lg transition-colors duration-200 relative
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

        <div className="p-2 mt-auto space-y-2">
          {user ? (
            <button
              onClick={logout}
              className="group flex items-center justify-between w-full px-5 py-3 rounded-lg transition-colors duration-200
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
            <div className="space-y-2">
              <Link href="/login" legacyBehavior>
                <a
                  className={`group flex items-center justify-between px-5 py-3 rounded-lg transition-colors duration-200 relative
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
                  className={`group flex items-center justify-between px-5 py-3 rounded-lg transition-colors duration-200 relative
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
          <div className="p-2">
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </div>
  )
}

