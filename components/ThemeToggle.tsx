"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

interface ThemeToggleProps {
  isCollapsed?: boolean
}

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} py-2`}>
      {!isCollapsed && (
        <span className="text-sm font-medium text-white/80 mr-auto">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`relative h-8 rounded-full overflow-hidden ${isCollapsed ? 'w-14' : 'w-16'} transition-all duration-300`}
        aria-label="Toggle theme"
        style={{ 
          background: isDark ? "#1e1e1e" : "#e7e7e7",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Toggle Thumb */}
        <motion.div 
          className="absolute top-1 h-6 w-6 rounded-full z-10"
          initial={false}
          animate={{ 
            left: isDark ? "2px" : isCollapsed ? "calc(100% - 26px)" : "calc(100% - 26px)",
            background: isDark ? "#f1f1f1" : "#333333" 
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {/* Icons inside thumb */}
          <div className="h-full w-full flex items-center justify-center text-primary-500">
            {isDark ? (
              <Moon className="h-3.5 w-3.5 text-primary-700" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-yellow-500" />
            )}
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          {/* Dark mode icon */}
          <div className="flex items-center justify-center h-5 w-5 text-primary-700">
            <Moon className="h-3.5 w-3.5" />
          </div>
          
          {/* Light mode icon */}
          <div className="flex items-center justify-center h-5 w-5 text-yellow-500">
            <Sun className="h-3.5 w-3.5" />
          </div>
        </div>
      </motion.button>
    </div>
  )
}

