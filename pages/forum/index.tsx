"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/contexts/UserContext"
import { Plus, MessageSquare, AlertCircle, Users, Tag, ThumbsUp, ThumbsDown, Search, BookmarkIcon, ArrowUp, ArrowDown, Sparkles, TrendingUp, Clock, Filter, X, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"

// Mock data for topics/tags (would come from API)
const MOCK_TOPICS = [
  { 
    id: 1, 
    name: "Deepfakes", 
    description: "Discussion about deepfake technology", 
    members: 4231,
    icon: "🎭",
    topics: [
      { id: 101, name: "Detection Methods", threads: 87, replies: 492 },
      { id: 102, name: "Creation Tools", threads: 45, replies: 210 }
    ]
  },
  { 
    id: 2, 
    name: "Detection Methods", 
    description: "Various methods for detecting AI generated content", 
    members: 3120,
    icon: "🔍",
    topics: [
      { id: 201, name: "Technical Papers", threads: 58, replies: 312 },
      { id: 202, name: "Practical Applications", threads: 73, replies: 415 }
    ]
  },
  { 
    id: 3, 
    name: "Research", 
    description: "Latest research in the field", 
    members: 2845,
    icon: "🧪",
    topics: [
      { id: 301, name: "Academic Papers", threads: 91, replies: 524 },
      { id: 302, name: "New Techniques", threads: 67, replies: 346 }
    ]
  },
  { 
    id: 4, 
    name: "Tools", 
    description: "Tools for detection and analysis", 
    members: 1987,
    icon: "🛠️",
    topics: [
      { id: 401, name: "Software Tools", threads: 53, replies: 287 },
      { id: 402, name: "Hardware Solutions", threads: 34, replies: 189 }
    ]
  },
  { 
    id: 5, 
    name: "News", 
    description: "Latest news and updates", 
    members: 3400,
    icon: "📰",
    topics: [
      { id: 501, name: "Recent Developments", threads: 112, replies: 673 },
      { id: 502, name: "Media Coverage", threads: 87, replies: 452 }
    ]
  },
  { 
    id: 6, 
    name: "Case Studies", 
    description: "Real-world examples and case studies", 
    members: 1426,
    icon: "📊",
    topics: [
      { id: 601, name: "High-Profile Cases", threads: 54, replies: 321 },
      { id: 602, name: "Educational Examples", threads: 48, replies: 256 }
    ]
  },
  { 
    id: 7, 
    name: "Policies", 
    description: "Laws and policies related to AI content", 
    members: 2105,
    icon: "⚖️",
    topics: [
      { id: 701, name: "Regulations", threads: 67, replies: 354 },
      { id: 702, name: "Ethical Discussions", threads: 73, replies: 421 }
    ]
  },
]

// Define reaction types
interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames who reacted with this emoji
}

// Mock data for forum metrics (would come from API)
const FORUM_METRICS = {
  totalThreads: 256,
  totalReplies: 1024,
  activeUsers: 128,
  newThreadsToday: 12,
}

// Mock data for existing threads (would come from API)
const MOCK_THREADS = [
  {
    id: 1, 
    title: "New detection method for face swaps", 
    content: "I've been working on a new technique to detect face-swapped deepfakes by analyzing inconsistencies in facial features...",
    author: { 
      username: "researcher93", 
      avatar: "/images/avatars/avatar-1.png", 
      isVerified: true 
    },
    date: "2023-04-15", 
    timeAgo: "3 days ago",
    replies: 23, 
    views: 156,
    upvotes: 145,
    downvotes: 5,
    tags: ["Detection Methods", "Research"],
    isSticky: false,
    isHot: true,
    reactions: [
      { emoji: "👍", count: 24, users: ["user1", "user2"] },
      { emoji: "🔥", count: 18, users: ["user3"] },
      { emoji: "👏", count: 12, users: [] }
    ]
  },
  {
    id: 2, 
    title: "EU regulation on deepfakes - what's next?", 
    content: "The European Union just passed new regulations concerning the labeling and distribution of synthetic media...",
    author: { 
      username: "policy_expert", 
      avatar: "/images/avatars/avatar-2.png",
      isVerified: true
    },
    date: "2023-04-12", 
    timeAgo: "6 days ago",
    replies: 45, 
    views: 312,
    upvotes: 218,
    downvotes: 12,
    tags: ["Policies", "News"],
    isSticky: true,
    isHot: true,
    reactions: [
      { emoji: "👍", count: 32, users: [] },
      { emoji: "👀", count: 27, users: [] },
      { emoji: "❤️", count: 15, users: [] }
    ]
  },
  {
    id: 3, 
    title: "Improved ELA technique for detecting image manipulation", 
    content: "Error Level Analysis has been around for a while, but I've managed to improve its accuracy by...",
    author: { 
      username: "imagepro", 
      avatar: "/images/avatars/avatar-3.png",
      isVerified: false
    },
    date: "2023-04-10", 
    timeAgo: "8 days ago",
    replies: 15, 
    views: 98,
    upvotes: 87,
    downvotes: 2,
    tags: ["Detection Methods", "Tools"],
    isSticky: false,
    isHot: false
  },
  {
    id: 4, 
    title: "State-of-the-art GAN models and how to detect their output", 
    content: "With the recent advances in generative models, the quality of synthetic images has improved dramatically...",
    author: { 
      username: "ai_specialist", 
      avatar: "/images/avatars/avatar-4.png",
      isVerified: true
    },
    date: "2023-04-08", 
    timeAgo: "10 days ago",
    replies: 31, 
    views: 210,
    upvotes: 192,
    downvotes: 3,
    tags: ["Research", "Detection Methods"],
    isSticky: false,
    isHot: true
  },
  {
    id: 5, 
    title: "Community AMA: I'm a forensic analyst specializing in deepfake detection", 
    content: "Hello everyone! I'm hosting an AMA (Ask Me Anything) to share my experience as a forensic analyst...",
    author: { 
      username: "forensic_expert", 
      avatar: "/images/avatars/avatar-5.png",
      isVerified: true
    },
    date: "2023-04-05", 
    timeAgo: "13 days ago",
    replies: 86, 
    views: 425,
    upvotes: 310,
    downvotes: 1,
    tags: ["Case Studies", "Tools"],
    isSticky: false,
    isHot: false
  },
]

export default function ForumPage() {
  const { user } = useUser()
  const router = useRouter()
  
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot')
  const [searchInput, setSearchInput] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  
  // Function to handle topic selection
  const handleTopicSelection = (topicId: number) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId]
    )
  }

  // Function to handle filter selection
  const handleFilterSelection = (tag: string) => {
    const newFilter = selectedFilter === tag ? null : tag;
    setSelectedFilter(newFilter);
  }
  
  // Function to handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  // Get threads to display based on search results or default threads
  const threadsToDisplay = MOCK_THREADS.filter(thread => {
    return !selectedFilter || thread.tags.includes(selectedFilter);
  });
  
  // Sort threads based on selected sort option
  const sortedThreads = [...threadsToDisplay].sort((a, b) => {
    if (activeSort === 'hot') {
      // Sort by upvotes and recency (weighted)
      return (b.upvotes / (b.upvotes + b.downvotes + 1) * 1000 + new Date(b.date).getTime() / (1000 * 60 * 60 * 24)) - 
             (a.upvotes / (a.upvotes + a.downvotes + 1) * 1000 + new Date(a.date).getTime() / (1000 * 60 * 60 * 24));
    } else if (activeSort === 'new') {
      // Sort by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      // Sort by upvotes
      return b.upvotes - a.upvotes;
    }
  });
  
  // Function to handle upvoting/downvoting threads
  const handleVote = (threadId: number, isUpvote: boolean) => {
    // Placeholder for API call
    console.log(`${isUpvote ? 'Upvoted' : 'Downvoted'} thread ${threadId}`)
  }
  
  // Function to handle thread submission
  const handleSubmitThread = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setErrorMessage("Please enter a title for your thread.")
      return
    }
    
    if (!content.trim()) {
      setErrorMessage("Please enter content for your thread.")
      return
    }
    
    if (selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic.")
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage("")
    
    try {
      // Placeholder for actual API call
      // await api.postThread({ title, content, topics: selectedTopics })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form
      setTitle("")
      setContent("")
      setSelectedTopics([])
      setIsCreatingThread(false)
      
      // This would be replaced with actual data from the API response
      console.log("New thread submitted:", { title, content, topics: selectedTopics })
      
      // Show success message or redirect
      // router.push(`/forum/thread/${newThreadId}`)
    } catch (error) {
      console.error("Error creating thread:", error)
      setErrorMessage("An error occurred while creating your thread. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left sidebar (topics) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                {/* Topics section */}
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {MOCK_TOPICS.map(topic => (
                        <div key={topic.id} className="flex items-center justify-between hover:bg-accent/30 px-2 py-1.5 rounded-md">
                          <Link href={`/forum?topic=${topic.name}`} className="flex-1">
                            <div className="font-medium">{topic.name}</div>
                            <div className="text-xs text-muted-foreground">{topic.members.toLocaleString()} members</div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Topics
                    </Button>
                  </CardFooter>
                </Card>

                {/* Forum stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Forum Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Threads:</span>
                        <span className="font-medium">{FORUM_METRICS.totalThreads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Replies:</span>
                        <span className="font-medium">{FORUM_METRICS.totalReplies.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Users:</span>
                        <span className="font-medium">{FORUM_METRICS.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New Today:</span>
                        <span className="font-medium">{FORUM_METRICS.newThreadsToday.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="lg:col-span-9">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter text-foreground">Community Forum</h1>
                  <p className="text-muted-foreground mt-2">
                    Join discussions about deepfakes and AI content detection
                  </p>
                </div>
                
                {user ? (
                  <Button 
                    onClick={() => setIsCreatingThread(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    New Thread
                  </Button>
                ) : (
                  <Link href="/login" passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus size={16} />
                      Login to Post
                    </Button>
                  </Link>
                )}
              </div>

              {/* Prominent search bar */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Search for threads, topics, or keywords..."
                          className="pl-10 h-12"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 p-0"
                            onClick={() => setSearchInput("")}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        className="h-12"
                        disabled={!searchInput.trim()}
                      >
                        Search
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {/* Active tags/filters */}
                {MOCK_TOPICS.slice(0, 4).map(topic => (
                  <Badge 
                    key={topic.id} 
                    variant={selectedFilter === topic.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => handleFilterSelection(topic.name)}
                  >
                    {topic.name}
                    {selectedFilter === topic.name && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 h-4 w-4 p-0" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFilter(null);
                        }}
                      >
                        <X size={10} />
                      </Button>
                    )}
                  </Badge>
                ))}
                {/* <Link href="/forum/search" passHref>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    <Filter size={12} className="mr-1" />
                    Advanced Search
                  </Badge>
                </Link> */}
              </div>
          
              {/* Thread Creation Form */}
              {isCreatingThread && user && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <Card className="bg-card border-primary/20">
                    <CardHeader>
                      <CardTitle>Create New Thread</CardTitle>
                      <CardDescription>Share your knowledge or ask questions to the community</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitThread}>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Thread Title</Label>
                            <Input 
                              id="title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Enter a descriptive title"
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea 
                              id="content"
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              placeholder="Describe your topic in detail..."
                              className="mt-1 min-h-[150px] rounded-xl"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Select Topics</Label>
                            <div className="bg-background rounded-xl p-4 border border-input">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {MOCK_TOPICS.map(topic => (
                                  <div key={topic.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={`topic-${topic.id}`}
                                      checked={selectedTopics.includes(topic.id)}
                                      onCheckedChange={() => handleTopicSelection(topic.id)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                      <label
                                        htmlFor={`topic-${topic.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {topic.name}
                                      </label>
                                      <p className="text-xs text-muted-foreground">
                                        {topic.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {errorMessage && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center">
                              <AlertCircle size={16} className="mr-2" />
                              {errorMessage}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreatingThread(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Thread"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Sorting options */}
              <div className="border-b border-border mb-6">
                <div className="flex gap-2 -mb-px">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none border-b-2 px-4 ${activeSort === 'hot' ? 'border-primary text-primary' : 'border-transparent'}`}
                    onClick={() => setActiveSort('hot')}
                  >
                    <Sparkles size={16} className="mr-2" />
                    Hot
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none border-b-2 px-4 ${activeSort === 'new' ? 'border-primary text-primary' : 'border-transparent'}`}
                    onClick={() => setActiveSort('new')}
                  >
                    <Clock size={16} className="mr-2" />
                    New
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none border-b-2 px-4 ${activeSort === 'top' ? 'border-primary text-primary' : 'border-transparent'}`}
                    onClick={() => setActiveSort('top')}
                  >
                    <TrendingUp size={16} className="mr-2" />
                    Top
                  </Button>
                </div>
              </div>
              
              {/* Only show popular topics if not in search mode */}
              {sortedThreads.length === 0 ? (
                <Card className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Threads Found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {searchInput 
                      ? `We couldn't find any threads matching "${searchInput}"${selectedFilter ? ` in ${selectedFilter}` : ''}.` 
                      : `We couldn't find any threads${selectedFilter ? ` in ${selectedFilter}` : ''}.`}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setSearchInput("")}>Clear Search</Button>
                    {user && (
                      <Button onClick={() => setIsCreatingThread(true)}>Create Thread</Button>
                    )}
                  </div>
                </Card>
              ) : (
                /* Thread Listing (Reddit-style) */
                <div className="space-y-4">
                  {sortedThreads.map(thread => (
                    <div key={thread.id} className="flex gap-3 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {/* Voting buttons */}
                      <div className="flex flex-col items-center justify-start bg-muted/30 py-4 px-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                          onClick={() => handleVote(thread.id, true)}
                        >
                          <ArrowUp size={20} />
                        </Button>
                        <span className="text-sm font-medium my-1">{thread.upvotes - thread.downvotes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                          onClick={() => handleVote(thread.id, false)}
                        >
                          <ArrowDown size={20} />
                        </Button>
                      </div>

                      {/* Thread content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                          {thread.isSticky && (
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
                        
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {thread.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MessageSquare size={14} className="mr-1" />
                              {thread.replies} comments
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              Last active {thread.timeAgo}
                            </div>
                            <div className="flex items-center">
                              <Users size={14} className="mr-1" />
                              {thread.views} views
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
                      
                      <div className="flex items-start p-2 invisible sm:visible">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                        >
                          <BookmarkIcon size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show load more button only if there are threads and not in search mode or if search has more results */}
              {sortedThreads.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More</Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
