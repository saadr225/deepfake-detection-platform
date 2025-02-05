import { useEffect, useState } from "react"
import { useUser } from "../contexts/UserContext"
import Sidebar from "./Sidebar"
import type React from "react" // Added import for React

export default function Layout({ children }: { children: React.ReactNode }) {
  const { authInitialized } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
  }, [isCollapsed])

  if (!authInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 overflow-x-hidden ${isCollapsed ? "ml-24" : "ml-72"} sm:ml-0`}
      >
        {children}
      </main>
    </div>
  )
}

