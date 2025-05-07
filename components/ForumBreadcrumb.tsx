import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface ForumBreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function ForumBreadcrumb({ items }: ForumBreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            href="/" 
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home size={14} className="mr-1" />
            Home
          </Link>
        </li>
        
        <li className="flex items-center">
          <ChevronRight size={14} className="mx-1" />
          <Link 
            href="/forum" 
            className="hover:text-foreground transition-colors"
          >
            Forum
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight size={14} className="mx-1" />
            {item.href ? (
              <Link 
                href={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
} 