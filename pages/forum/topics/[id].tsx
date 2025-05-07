"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useUser } from "@/contexts/UserContext"
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Tag, 
  Filter,
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Clock, 
  BookmarkIcon, 
  Sparkles,
  ArrowLeft,
  ThumbsUp
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"

// Mock topic data
const MOCK_TOPICS = {
  101: {
    id: 101,
    name: "Welcome & Introductions",
    description: "Introduce yourself to the community and get to know other members",
    category: { id: 1, name: "General Discussion" },
    totalThreads: 32,
    lastActive: "2023-05-01"
  },
  201: {
    id: 201,
    name: "Technical Papers",
    description: "Discuss recent academic papers and technical advances in deepfake detection",
    category: { id: 2, name: "Detection Technology" },
    totalThreads: 58,
    lastActive: "2023-05-05"
  },
  301: {
    id: 301,
    name: "Research Findings",
    description: "Share and discuss the latest research findings in the field",
    category: { id: 3, name: "Research & Academia" },
    totalThreads: 73,
    lastActive: "2023-05-03"
  },
  401: {
    id: 401,
    name: "Regulations & Laws",
    description: "Discussion on legal frameworks and regulations around deepfakes",
    category: { id: 4, name: "Policy & Ethics" },
    totalThreads: 67,
    lastActive: "2023-04-28"
  },
  501: {
    id: 501,
    name: "High-Profile Cases",
    description: "Analysis of notable deepfake incidents and cases",
    category: { id: 5, name: "Case Studies" },
    totalThreads: 54,
    lastActive: "2023-05-06"
  },
  999: {
    id: 999,
    name: "Empty Topic",
    description: "This topic has no threads yet",
    category: { id: 6, name: "Coming Soon" },
    totalThreads: 0,
    lastActive: null
  }
}

// Define reaction types
interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames who reacted with this emoji
}

// Mock threads data
const MOCK_THREADS = [
  {
    id: 1001,
    title: "Welcome to the Deepfake Detection Platform Community!",
    content: "Hello everyone! This is an official welcome thread for all new members...",
    author: {
      username: "admin",
      avatar: "/images/avatars/admin.png",
      isVerified: true
    },
    topicId: 101,
    date: "2023-04-15",
    timeAgo: "21 days ago",
    lastActive: "2023-05-01",
    lastActiveTimeAgo: "5 days ago",
    replies: 42,
    views: 312,
    upvotes: 87,
    downvotes: 2,
    tags: ["Welcome", "Community"],
    isPinned: true,
    isHot: true,
    reactions: [
      { emoji: "👋", count: 42, users: ["user1", "user2"] },
      { emoji: "❤️", count: 28, users: ["user3"] },
      { emoji: "🎉", count: 16, users: [] }
    ]
  },
  {
    id: 1002,
    title: "Please introduce yourself here",
    content: "Use this thread to tell us a bit about yourself, your background, and your interest in deepfake detection...",
    author: {
      username: "moderator",
      avatar: "/images/avatars/mod.png",
      isVerified: true
    },
    topicId: 101,
    date: "2023-04-16",
    timeAgo: "20 days ago",
    lastActive: "2023-04-30",
    lastActiveTimeAgo: "6 days ago",
    replies: 78,
    views: 256,
    upvotes: 64,
    downvotes: 0,
    tags: ["Introductions"],
    isPinned: true,
    isHot: false,
    reactions: [
      { emoji: "👍", count: 32, users: [] },
      { emoji: "👋", count: 25, users: [] }
    ]
  },
  {
    id: 1003,
    title: "New member from AI research lab",
    content: "Hello everyone! I'm a researcher from XYZ Lab specializing in computer vision...",
    author: {
      username: "ai_researcher",
      avatar: "/images/avatars/avatar-3.png",
      isVerified: false
    },
    topicId: 101,
    date: "2023-04-20",
    timeAgo: "16 days ago",
    lastActive: "2023-04-25",
    lastActiveTimeAgo: "11 days ago",
    replies: 12,
    views: 98,
    upvotes: 23,
    downvotes: 1,
    tags: ["Introductions", "Research"],
    isPinned: false,
    isHot: false
  },
  {
    id: 1004,
    title: "Journalist interested in deepfake detection",
    content: "Hi all, I'm a technology journalist covering AI ethics and deepfakes...",
    author: {
      username: "tech_journalist",
      avatar: "/images/avatars/avatar-4.png",
      isVerified: true
    },
    topicId: 101,
    date: "2023-04-22",
    timeAgo: "14 days ago",
    lastActive: "2023-04-28",
    lastActiveTimeAgo: "8 days ago",
    replies: 8,
    views: 87,
    upvotes: 19,
    downvotes: 0,
    tags: ["Introductions", "Media"],
    isPinned: false,
    isHot: false
  },
  {
    id: 1005,
    title: "Student working on deepfake detection project",
    content: "Hello! I'm a computer science student working on my final year project about deepfake detection...",
    author: {
      username: "cs_student",
      avatar: "/images/avatars/avatar-5.png",
      isVerified: false
    },
    topicId: 101,
    date: "2023-04-25",
    timeAgo: "11 days ago",
    lastActive: "2023-05-01",
    lastActiveTimeAgo: "5 days ago",
    replies: 15,
    views: 103,
    upvotes: 28,
    downvotes: 1,
    tags: ["Introductions", "Education"],
    isPinned: false,
    isHot: false
  },
  {
    id: 1006,
    title: "Greetings from a policymaker",
    content: "Hello everyone. I work in digital policy development with a focus on misinformation...",
    author: {
      username: "policy_expert",
      avatar: "/images/avatars/avatar-6.png",
      isVerified: true
    },
    topicId: 101,
    date: "2023-04-28",
    timeAgo: "8 days ago",
    lastActive: "2023-04-29",
    lastActiveTimeAgo: "7 days ago",
    replies: 6,
    views: 74,
    upvotes: 15,
    downvotes: 0,
    tags: ["Introductions", "Policy"],
    isPinned: false,
    isHot: false
  },
  {
    id: 1007,
    title: "Cybersecurity professional joining the community",
    content: "Hey there! I'm a cybersecurity specialist with an interest in digital forensics...",
    author: {
      username: "security_pro",
      avatar: "/images/avatars/avatar-7.png",
      isVerified: false
    },
    topicId: 101,
    date: "2023-04-30",
    timeAgo: "6 days ago",
    lastActive: "2023-04-30",
    lastActiveTimeAgo: "6 days ago",
    replies: 4,
    views: 56,
    upvotes: 12,
    downvotes: 0,
    tags: ["Introductions", "Security"],
    isPinned: false,
    isHot: false
  },
  {
    id: 1008,
    title: "New member with legal background",
    content: "Greetings! I'm an attorney specializing in digital rights and technology law...",
    author: {
      username: "legal_expert",
      avatar: "/images/avatars/avatar-8.png",
      isVerified: true
    },
    topicId: 101,
    date: "2023-05-01",
    timeAgo: "5 days ago",
    lastActive: "2023-05-01",
    lastActiveTimeAgo: "5 days ago",
    replies: 3,
    views: 42,
    upvotes: 9,
    downvotes: 0,
    tags: ["Introductions", "Legal"],
    isPinned: false,
    isHot: false
  }
]

// Sorting and pagination options
const SORT_OPTIONS = [
  { value: "latest", label: "Latest Activity" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "votes", label: "Most Votes" }
]

const ITEMS_PER_PAGE = 5

export default function TopicPage() {
  const { user } = useUser()
  const router = useRouter()
  const { id } = router.query
  
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Get current topic data
  const topicId = typeof id === 'string' ? parseInt(id) : 0
  const currentTopic = MOCK_TOPICS[topicId as keyof typeof MOCK_TOPICS] || null
  
  // Get available tags for filtering
  const allTags = MOCK_THREADS
    .filter(thread => thread.topicId === topicId)
    .flatMap(thread => thread.tags)
    .filter((tag, index, self) => self.indexOf(tag) === index)
  
  // Filter threads by topic and search/tags
  const filteredThreads = MOCK_THREADS.filter(thread => {
    // First filter by topic
    if (thread.topicId !== topicId) return false
    
    // Then filter by search query
    const matchesSearch = searchQuery ? 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true
    
    // Filter by selected tags
    const matchesTags = selectedTags.length > 0 ? 
      selectedTags.some(tag => thread.tags.includes(tag)) : 
      true
    
    return matchesSearch && matchesTags
  })
  
  // Sort threads
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    // Always put pinned threads first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    // Then sort by selected criteria
    switch (sortBy) {
      case "latest":
        return new Date(b.lastActive || b.date).getTime() - new Date(a.lastActive || a.date).getTime()
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "popular":
        return b.views - a.views
      case "votes":
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      default:
        return 0
    }
  })
  
  // Paginate threads
  const indexOfLastThread = currentPage * ITEMS_PER_PAGE
  const indexOfFirstThread = indexOfLastThread - ITEMS_PER_PAGE
  const currentThreads = sortedThreads.slice(indexOfFirstThread, indexOfLastThread)
  const totalPages = Math.ceil(sortedThreads.length / ITEMS_PER_PAGE)
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
    // Reset to first page when filter changes
    setCurrentPage(1)
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when search changes
    setCurrentPage(1)
  }
  
  // Handle sorting change
  const handleSortChange = (value: string) => {
    setSortBy(value)
    // Reset to first page when sort changes
    setCurrentPage(1)
  }
  
  // Generate pagination
  const renderPagination = () => {
    const pages = []
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => setCurrentPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last pages as they're always shown
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return pages
  }
  
  if (!currentTopic) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
            <p className="text-muted-foreground mb-6">The topic you are looking for doesn't exist or has been moved.</p>
            <Link href="/forum/topics" passHref>
              <Button>Browse All Topics</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb navigation */}
          <div className="mb-4 flex flex-wrap items-center text-sm">
            <Link href="/forum" className="text-muted-foreground hover:text-foreground">
              Forum
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link href="/forum/topics" className="text-muted-foreground hover:text-foreground">
              Topics
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link href={`/forum/topics/${currentTopic.category.id}`} className="text-muted-foreground hover:text-foreground">
              {currentTopic.category.name}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{currentTopic.name}</span>
          </div>
          
          {/* Topic Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter">{currentTopic.name}</h1>
                <p className="text-muted-foreground mt-2">{currentTopic.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {currentTopic.totalThreads} Threads
                  </Badge>
                  {currentTopic.lastActive && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar size={12} />
                      Last Active: {new Date(currentTopic.lastActive).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
              
              {user ? (
                <Link href={`/forum/thread/new?topic=${currentTopic.id}`} passHref>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    New Thread
                  </Button>
                </Link>
              ) : (
                <Link href="/login" passHref>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} />
                    Login to Post
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Filters and Sorting */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threads..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            {/* Sorting */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <Label htmlFor="sort-by" className="whitespace-nowrap">
                Sort by:
              </Label>
              <Select
                value={sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger id="sort-by" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tags filters */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <Label className="mb-2 block">Filter by tags:</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
                {selectedTags.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTags([])}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Threads List */}
          {sortedThreads.length > 0 ? (
            <div className="space-y-4 mb-8">
              {currentThreads.map(thread => (
                <Card key={thread.id} className="flex overflow-hidden hover:shadow-md transition-shadow duration-300">
                  {/* Voting */}
                  <div className="flex flex-col items-center justify-start bg-muted/30 py-4 px-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                    >
                      <ArrowUp size={20} />
                    </Button>
                    <span className="text-sm font-medium my-1">{thread.upvotes - thread.downvotes}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                    >
                      <ArrowDown size={20} />
                    </Button>
                  </div>
                  
                  {/* Thread Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                      {thread.isPinned && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary text-primary">
                          PINNED
                        </Badge>
                      )}
                      {thread.isHot && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 border-amber-500 text-amber-500">
                          <Sparkles size={10} className="mr-0.5" />
                          HOT
                        </Badge>
                      )}
                      <span className="flex items-center">
                        <div className="h-5 w-5 rounded-full overflow-hidden mr-1">
                          <Image 
                            src={thread.author.avatar || '/images/avatars/default.png'} 
                            alt={thread.author.username}
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                        </div>
                        {thread.author.username}
                        {thread.author.isVerified && (
                          <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Verified</Badge>
                        )}
                      </span>
                      <span className="ml-1">• {thread.timeAgo}</span>
                    </div>
                    
                    <Link href={`/forum/thread/${thread.id}`} className="hover:underline">
                      <h3 className="text-lg font-semibold mb-2">{thread.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{thread.content}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                        {thread.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MessageSquare size={14} className="mr-1" />
                          {thread.replies} comments
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          Last active {thread.lastActiveTimeAgo}
                        </div>
                      </div>
                    </div>
                    
                    {/* Display Reactions */}
                    {thread.reactions && thread.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                        {thread.reactions.map(reaction => (
                          <Link 
                            key={reaction.emoji} 
                            href={`/forum/thread/${thread.id}`}
                            className="text-sm px-2 py-1 rounded-full flex items-center gap-1 border bg-background border-border hover:bg-accent/50"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs font-medium">{reaction.count}</span>
                          </Link>
                        ))}
                        <Link 
                          href={`/forum/thread/${thread.id}`}
                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                        >
                          <ThumbsUp size={12} className="mr-1" />
                          React
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Threads Available</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchQuery || selectedTags.length > 0
                  ? "No threads match your current search or filter criteria."
                  : "There are no threads in this topic yet. Be the first to start a discussion!"}
              </p>
              {searchQuery || selectedTags.length > 0 ? (
                <Button onClick={() => {
                  setSearchQuery("")
                  setSelectedTags([])
                }}>
                  Clear Filters
                </Button>
              ) : user ? (
                <Link href={`/forum/thread/new?topic=${currentTopic.id}`} passHref>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Create Thread
                  </Button>
                </Link>
              ) : (
                <Link href="/login" passHref>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} />
                    Login to Post
                  </Button>
                </Link>
              )}
            </Card>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {renderPagination()}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </motion.div>
      </div>
    </Layout>
  )
} 