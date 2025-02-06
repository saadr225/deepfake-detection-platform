import { useEffect, useState } from "react"
import { useUser } from "../contexts/UserContext"
import Sidebar from "./Sidebar"
import type React from "react" // Added import for React
import Link from 'next/link' // Added import for Link

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
      <div className="flex items-center min-h-screen bg-background">
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
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="text-2xl font-bold mb-4 block text-gray-900 dark:text-gray-100">
                DMI
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Protecting digital authenticity through advanced AI detection technology.
              </p>
            </div>
            {[
              {
                title: "Product",
                items: ["Features", "Pricing", "API", "Documentation"],
              },
              {
                title: "Company",
                items: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Legal",
                items: ["Privacy", "Terms", "Security", "Contact"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-300">
            © 2024 Deep Media Inspection. All rights reserved.
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}

