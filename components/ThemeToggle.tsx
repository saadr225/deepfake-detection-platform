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

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="group flex items-center w-full px-5 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
      aria-label="Toggle theme"
    >
      <div className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-200">
        {theme === "light" ? 
          <Sun className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" /> : 
          <Moon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        }
      </div>
      {!isCollapsed && (
        <div className="ml-3 text-sm font-medium">
          {theme === "light" ? "Light Mode" : "Dark Mode"}
        </div>
      )}
    </motion.button>
  )
}

