"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "../contexts/UserContext"
import Sidebar from "./Sidebar"
import type React from "react"
import Link from "next/link"

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
  
  // Track if sidebar has been toggled by user
  const hasToggledRef = useRef(false);
  
  // Custom function to handle toggling that tracks user interaction
  const handleToggleCollapse = (value: boolean) => {
    hasToggledRef.current = true;
    setIsCollapsed(value);
  }

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
      <div className="flex min-h-screen h-full bg-background overflow-x-hidden">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={handleToggleCollapse} />
        <div className="flex items-center justify-center w-full">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen h-full bg-background overflow-x-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={handleToggleCollapse} />
      <div 
        className="flex-1 min-h-screen overflow-x-hidden"
        style={{ 
          marginLeft: isCollapsed ? '6rem' : '18rem',
          transition: hasToggledRef.current ? 'margin-left 300ms ease' : 'none'
        }}
      >
        <main className="">{children}</main>
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-card">
          <div className="container mx-auto px-4 py-10">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <Link href="/" className="text-2xl font-bold mb-4 block text-gradient">
                  DMI
                </Link>
                <p className="text-sm text-muted-foreground">
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
                  <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item}>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-muted-foreground">
              © 2024 Deep Media Inspection. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}