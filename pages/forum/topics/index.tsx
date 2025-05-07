"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/UserContext"
import { Search, ChevronRight, Tag, Users, MessageSquare, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"

// Mock data for categories
const MOCK_CATEGORIES = [
  { 
    id: 1, 
    name: "General Discussion", 
    description: "General discussion about deepfakes and AI-generated content",
    icon: "🌐",
    topics: [
      { id: 101, name: "Welcome & Introductions", threads: 32, replies: 156 },
      { id: 102, name: "Announcements", threads: 18, replies: 73 },
      { id: 103, name: "Site Feedback", threads: 24, replies: 98 }
    ]
  },
  { 
    id: 2, 
    name: "Detection Technology", 
    description: "Discussion on methods and technologies for detecting deepfakes",
    icon: "🔍",
    topics: [
      { id: 201, name: "Technical Papers", threads: 58, replies: 312 },
      { id: 202, name: "Detection Methods", threads: 87, replies: 492 },
      { id: 203, name: "Tool Discussion", threads: 46, replies: 283 }
    ]
  },
  { 
    id: 3, 
    name: "Research & Academia", 
    description: "Academic research, papers, and discussions",
    icon: "🎓",
    topics: [
      { id: 301, name: "Research Findings", threads: 73, replies: 426 },
      { id: 302, name: "Peer Reviews", threads: 42, replies: 198 },
      { id: 303, name: "Academic Collaboration", threads: 35, replies: 187 }
    ]
  },
  { 
    id: 4, 
    name: "Policy & Ethics", 
    description: "Discussions on regulations, ethics, and policy developments",
    icon: "⚖️",
    topics: [
      { id: 401, name: "Regulations & Laws", threads: 67, replies: 354 },
      { id: 402, name: "Ethical Considerations", threads: 49, replies: 287 },
      { id: 403, name: "Industry Standards", threads: 28, replies: 146 }
    ]
  },
  { 
    id: 5, 
    name: "Case Studies", 
    description: "Real-world examples and cases of deepfakes",
    icon: "📊",
    topics: [
      { id: 501, name: "High-Profile Cases", threads: 54, replies: 321 },
      { id: 502, name: "Detection Success Stories", threads: 37, replies: 215 },
      { id: 503, name: "Learning from Failures", threads: 19, replies: 124 }
    ]
  }
]

// Forum stats
const FORUM_STATS = {
  totalTopics: MOCK_CATEGORIES.reduce((acc, cat) => acc + cat.topics.length, 0),
  totalThreads: MOCK_CATEGORIES.reduce((acc, cat) => acc + cat.topics.reduce((sum, topic) => sum + topic.threads, 0), 0),
  totalReplies: MOCK_CATEGORIES.reduce((acc, cat) => acc + cat.topics.reduce((sum, topic) => sum + topic.replies, 0), 0),
  activeUsers: 872
}

// Empty topic data for demonstration
const EMPTY_CATEGORY = {
  id: 6,
  name: "Coming Soon",
  description: "New topics will be added here as our community grows",
  icon: "🔜",
  topics: []
}

export default function TopicsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/forum?search=${encodeURIComponent(searchQuery)}`)
    }
  }
  
  // Filter categories based on search
  const filteredCategories = [
    ...MOCK_CATEGORIES,
    EMPTY_CATEGORY // Include empty category for demonstration
  ].filter(category => 
    searchQuery ? (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.topics.some(topic => 
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) : true
  )
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb navigation */}
          <div className="mb-4">
            <Link href="/forum" className="text-primary hover:text-primary/80 flex items-center">
              <ArrowLeft size={16} className="mr-2" />
              Back to Forum
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">Forum Categories</h1>
              <p className="text-muted-foreground mt-2">
                Browse through all topics and categories within our community forum
              </p>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  className="pl-10 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          {/* Forum Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{FORUM_STATS.totalTopics}</p>
                  <p className="text-sm text-muted-foreground">Topics</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{FORUM_STATS.totalThreads}</p>
                  <p className="text-sm text-muted-foreground">Threads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{FORUM_STATS.totalReplies}</p>
                  <p className="text-sm text-muted-foreground">Replies</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{FORUM_STATS.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Categories List */}
          <div className="space-y-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <Card key={category.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <CardTitle className="text-xl">{category.name}</CardTitle>
                          <CardDescription className="mt-1">{category.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {category.topics.length} Topics
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.topics.length > 0 ? (
                      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.topics.map(topic => (
                          <Link key={topic.id} href={`/forum/topics/${topic.id}`} passHref>
                            <div className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors duration-200 cursor-pointer">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-medium">{topic.name}</h3>
                                <ChevronRight size={16} className="text-muted-foreground" />
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground gap-3 mt-2">
                                <span className="flex items-center">
                                  <Tag size={12} className="mr-1" />
                                  {topic.threads} Threads
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare size={12} className="mr-1" />
                                  {topic.replies} Replies
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground mb-2">No topics available in this category yet.</p>
                        <p className="text-sm">Check back later as we expand our community discussions.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    We couldn't find any categories matching your search query. Try different keywords or browse all categories.
                  </p>
                  <Button onClick={() => setSearchQuery("")}>View All Categories</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
} 