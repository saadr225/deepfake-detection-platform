"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "../contexts/UserContext"
import Sidebar from "./Sidebar"
import type React from "react"
import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react"

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
        className="flex-1 min-h-screen  flex flex-col"
        style={{ 
          marginLeft: isCollapsed ? '6rem' : '18rem',
          transition: hasToggledRef.current ? 'margin-left 300ms ease' : 'none'
        }}
      >
        <main className="flex-grow">{children}</main>
        <footer className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="grid gap-10 md:grid-cols-4">
              <div>
                <Link href="/" className="text-2xl font-bold mb-4 block gradient-text">
                  DMI
                </Link>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Protecting digital authenticity through advanced AI detection technology. We help you identify deepfakes and AI-generated content.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
              {[
                {
                  title: "Product",
                  items: [
                    { label: "Features", href: "#" },
                    { label: "Pricing", href: "#" },
                    { label: "API", href: "/api-services" },
                    { label: "Documentation", href: "/knowledge-base" },
                  ],
                },
                {
                  title: "Resources",
                  items: [
                    { label: "Knowledge Base", href: "/knowledge-base" },
                    { label: "Community Forum", href: "/forum" },
                    { label: "Deepfake Archive", href: "/pda" },
                    { label: "Education", href: "/education" },
                  ],
                },
                {
                  title: "Company",
                  items: [
                    { label: "About", href: "#" },
                    { label: "Privacy", href: "#" },
                    { label: "Terms", href: "#" },
                    { label: "Contact", href: "#" },
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold mb-5 text-foreground tracking-wide">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link 
                          href={item.href} 
                          className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                        >
                          {item.label}
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
              <div>© 2024 Deep Media Inspection. All rights reserved.</div>
              <div className="mt-4 md:mt-0">Powered by advanced AI detection technology</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}