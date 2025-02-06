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
      className="flex items-center w-full px-3 py-3 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 text-sidebar-foreground"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      {!isCollapsed && (
        <div className="ml-3 text-sm font-medium">
          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
        </div>
      )}
    </button>
)
}