"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/contexts/UserContext"
import { MessageSquare, AlertCircle, Users, Tag, BookmarkIcon, ArrowUp, ArrowDown, Search, Filter, X, Clock, ChevronLeft, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import ForumBreadcrumb from "@/components/ForumBreadcrumb"

// Import mock data (would be replaced with API calls in a real application)
// Mock data for topics/tags (would come from API)
const MOCK_TOPICS = [
  { id: 1, name: "Deepfakes" },
  { id: 2, name: "Detection Methods" },
  { id: 3, name: "Research" },
  { id: 4, name: "Tools" },
  { id: 5, name: "News" },
  { id: 6, name: "Case Studies" },
  { id: 7, name: "Policies" },
]

// Define reaction types
interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames who reacted with this emoji
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

export default function ForumSearchPage() {
  const { user } = useUser()
  const router = useRouter()
  const { q: initialQuery } = router.query
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<typeof MOCK_THREADS | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [sortOrder, setSortOrder] = useState<'relevance' | 'newest' | 'most_replies'>('relevance')
  
  // Set initial query from URL params
  useEffect(() => {
    if (initialQuery && typeof initialQuery === 'string') {
      setSearchQuery(initialQuery)
      performSearch(initialQuery, selectedTopics)
    }
  }, [initialQuery])
  
  // Function to handle topic selection
  const handleTopicSelection = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    )
  }
  
  // Function to handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, selectedTopics)
  }
  
  // Function to perform search
  const performSearch = async (query: string, topics: string[]) => {
    if (!query && topics.length === 0) {
      setSearchResults(null)
      setSearchPerformed(false)
      return
    }
    
    setIsSearching(true)
    setSearchPerformed(true)
    
    try {
      // In a real application, this would be an API call
      // await api.searchThreads(query, topics)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter threads based on search query and selected topics
      const results = MOCK_THREADS.filter(thread => {
        const matchesQuery = !query || 
          thread.title.toLowerCase().includes(query.toLowerCase()) ||
          thread.content.toLowerCase().includes(query.toLowerCase()) ||
          thread.author.username.toLowerCase().includes(query.toLowerCase());
        
        const matchesTopics = topics.length === 0 || 
          topics.some(topic => thread.tags.includes(topic));
        
        return matchesQuery && matchesTopics;
      });
      
      // Sort results based on sort order
      const sortedResults = [...results].sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortOrder === 'most_replies') {
          return b.replies - a.replies;
        } else {
          // Relevance - factors in upvotes, replies, and views with weighting
          const relevanceA = (a.upvotes * 2) + a.replies + (a.views * 0.1);
          const relevanceB = (b.upvotes * 2) + b.replies + (b.views * 0.1);
          return relevanceB - relevanceA;
        }
      });
      
      setSearchResults(sortedResults)
    } catch (error) {
      console.error("Error searching threads:", error)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Function to clear search results
  const clearSearch = () => {
    setSearchQuery("")
    setSelectedTopics([])
    setSearchResults(null)
    setSearchPerformed(false)
    
    // Remove query from URL
    router.replace('/forum/search', undefined, { shallow: true })
  }
  
  // Function to handle changing sort order
  const handleSortChange = (order: 'relevance' | 'newest' | 'most_replies') => {
    setSortOrder(order)
    if (searchResults) {
      performSearch(searchQuery, selectedTopics)
    }
  }
  
  // Function to handle upvoting/downvoting threads
  const handleVote = (threadId: number, isUpvote: boolean) => {
    // Placeholder for API call
    console.log(`${isUpvote ? 'Upvoted' : 'Downvoted'} thread ${threadId}`)
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb navigation
          <ForumBreadcrumb 
            items={[
              { label: "Forum", href: "/forum" },
              { label: "Search" }
            ]} 
          /> */}
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">Forum Search</h1>
              <p className="text-muted-foreground mt-2">
                Search for threads, topics, and content across the forum
              </p>
            </div>
            
            <Link href="/forum" passHref>
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft size={16} />
                Back to Forum
              </Button>
            </Link>
          </div>
          
          {/* Search form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search the Community Forum</CardTitle>
              <CardDescription>
                Enter keywords, phrases, or select topics to find relevant discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit}>
                <div className="space-y-6">
                  {/* Search input */}
                  <div>
                    <Label htmlFor="search-query" className="text-base mb-2 block">Search Query</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="search-query"
                        placeholder="Enter keywords, thread titles, or content..."
                        className="pl-10 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                          onClick={() => setSearchQuery("")}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Topic selection */}
                  <div>
                    <Label className="text-base mb-2 block">Filter by Topics</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {MOCK_TOPICS.map(topic => (
                        <div key={topic.id} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`topic-${topic.id}`}
                            checked={selectedTopics.includes(topic.name)}
                            onCheckedChange={() => handleTopicSelection(topic.name)}
                          />
                          <Label
                            htmlFor={`topic-${topic.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {topic.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Search actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={clearSearch} 
                      disabled={isSearching}
                    >
                      Clear
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSearching || (!searchQuery && selectedTopics.length === 0)}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Search Results */}
          {searchPerformed && (
            <div className="space-y-6">
              {/* Results header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {searchResults && searchResults.length > 0 
                      ? `Search Results (${searchResults.length})` 
                      : 'No Results Found'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery && (
                      <>
                        Showing threads matching "{searchQuery}"
                        {selectedTopics.length > 0 && ` in topics: ${selectedTopics.join(', ')}`}
                      </>
                    )}
                    {!searchQuery && selectedTopics.length > 0 && (
                      <>Showing threads in topics: {selectedTopics.join(', ')}</>
                    )}
                  </p>
                </div>
                
                {/* Sort options */}
                {searchResults && searchResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`px-3 ${sortOrder === 'relevance' ? 'text-primary font-medium' : ''}`}
                        onClick={() => handleSortChange('relevance')}
                      >
                        Relevance
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`px-3 ${sortOrder === 'newest' ? 'text-primary font-medium' : ''}`}
                        onClick={() => handleSortChange('newest')}
                      >
                        Newest
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`px-3 ${sortOrder === 'most_replies' ? 'text-primary font-medium' : ''}`}
                        onClick={() => handleSortChange('most_replies')}
                      >
                        Most Replies
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Empty state when no threads match search criteria */}
              {(!searchResults || searchResults.length === 0) ? (
                <Card className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Threads Found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    We couldn't find any threads matching your search criteria. Try adjusting your search terms or filters.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={clearSearch}>Clear Search</Button>
                    <Link href="/forum" passHref>
                      <Button variant="secondary">
                        Browse All Threads
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                /* Thread Listing */
                <div className="space-y-4">
                  {searchResults.map(thread => (
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
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => {
                                  if (!selectedTopics.includes(tag)) {
                                    handleTopicSelection(tag);
                                    performSearch(searchQuery, [...selectedTopics, tag]);
                                  }
                                }}
                              >
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
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
} 