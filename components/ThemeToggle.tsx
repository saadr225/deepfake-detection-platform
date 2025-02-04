import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  isCollapsed?: boolean;
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
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="flex items-center w-full px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-background transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-black dark:text-white" />
      ) : (
        <Moon className="h-5 w-5 text-white dark:text-white" />
      )}
      {!isCollapsed && (
        <span className="ml-3 text-sm font-medium text-black dark:text-white">
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}