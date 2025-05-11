"use client"

import React, { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/contexts/UserContext"
import { Plus, MessageSquare, AlertCircle, Users, Tag, ThumbsUp, ThumbsDown, Search, BookmarkIcon, ArrowUp, ArrowDown, Sparkles, TrendingUp, Clock, Filter, X, ChevronRight, CheckCircle2, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import Cookies from "js-cookie"

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

// Constants
const API_URL = "http://localhost:8000"

// Update the interfaces to match API responses
interface Tag {
  id: number;
  name: string;
  thread_count: number;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  thread_count: number;
}

interface TagsResponse {
  code: string;
  message: string;
  success: boolean;
  tags: Tag[];
}

interface TopicsResponse {
  code: string;
  message: string;
  success: boolean;
  topics: Topic[];
}

// Interface for thread data from API
interface ThreadData {
  id: number;
  title: string;
  author: string;
  created_at: string;
  last_active: string;
  reply_count: number;
  net_count: number;
  view_count: number;
  user_liked: boolean;
  user_disliked: boolean;
  topic: {
    id: number;
    name: string;
  };
  tags: {
    id: number;
    name: string;
  }[];
  approval_status: string;
  content_preview: string;
  preview?: string;      // For search results
  like_count?: number;   // For search results
}

interface ThreadResponse {
  status: string;
  code: string;
  message: string;
  threads: ThreadData[];
  page: number;
  pages: number;
  total: number;
  query?: string;
}

interface ReactionResponse {
  code: string;
  message: string;
  reaction_counts: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

// Interface for pagination data
interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
}

// Interface for thread creation response
interface ThreadCreateResponse {
  code: string;
  message: string;
  success: boolean;
  thread_id: number;
  approval_status: string;
}

interface VoteResponse {
  code: string;
  message: string;
  success: boolean;
  action: "added" | "removed" | "changed";
  like_type: "like" | "dislike";
  net_count: number;
}

// Function to calculate time ago
const timeAgoFromDate = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Update the DisplayThread interface to include tagIds field
interface DisplayThread {
  id: number;
  title: string;
  content: string;
  author: {
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  date: string;
  timeAgo: string;
  replies: number;
  views: number;
  upvotes: number;
  downvotes: number;
  user_liked: boolean;
  user_disliked: boolean;
  topic: {
    id: number;
    name: string;
  };
  tags: string[];
  tagIds: number[];
  isSticky: boolean;
  isHot: boolean;
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export default function ForumPage() {
  const { user } = useUser()
  const router = useRouter()
  
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot')
  const [searchInput, setSearchInput] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [threads, setThreads] = useState<DisplayThread[]>([])
  const [isLoadingThreads, setIsLoadingThreads] = useState(false)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [showMyThreads, setShowMyThreads] = useState(false)
  
  // Fetch tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true)
      try {
        const response = await axios.get<TagsResponse>(`${API_URL}/api/forum/tags/`)
        if (response.data.success) {
          setTags(response.data.tags)
        } else {
          console.error("Failed to fetch tags:", response.data.message)
        }
      } catch (error) {
        console.error("Error fetching tags:", error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [])

  // Fetch topics when component mounts
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true)
      try {
        const response = await axios.get<TopicsResponse>(`${API_URL}/api/forum/topics/`)
        if (response.data.success) {
          setTopics(response.data.topics)
        } else {
          console.error("Failed to fetch topics:", response.data.message)
        }
      } catch (error) {
        console.error("Error fetching topics:", error)
      } finally {
        setIsLoadingTopics(false)
      }
    }

    fetchTopics()
  }, [])
  
  // Fetch threads when component mounts or filter changes
  const fetchThreads = async () => {
    setIsLoadingThreads(true)
    try {
      // Construct query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('items', '20')
      
      // Get access token for authorization
      const accessToken = Cookies.get('accessToken')
      
      // Determine which endpoint to use
      let endpoint = `${API_URL}/api/forum/threads/`
      
      // Add search param if searching
      if (isSearching && searchQuery) {
        endpoint = `${API_URL}/api/forum/search/`
        params.append('query', searchQuery)
      } else {
        // Only add topic and tag filters if not searching
        if (currentTopicId) {
          params.append('topic_id', currentTopicId.toString())
        }
        
        if (selectedTagId) {
          params.append('tag_id', selectedTagId.toString())
        }
      }
      
      // Only show my threads if the user is logged in and the showMyThreads option is selected
      // Don't apply "my threads" filter during search
      const isMyThreadsRequest = !isSearching && showMyThreads && !!user && !!accessToken
      
      // Prepare headers and request options
      let headers: Record<string, string> = {}
      let requestURL = `${endpoint}?${params.toString()}`
      
      // ALWAYS include Authorization header when user is logged in
      // This ensures we get user_liked and user_disliked flags from the API
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      // Add my_threads parameter for filtering user's threads if needed
      if (isMyThreadsRequest) {
        params.append('my_threads', 'true')
        requestURL = `${endpoint}?${params.toString()}`
        console.log("Fetching MY threads with params:", params.toString())
      } else {
        console.log("Fetching ALL threads with params:", params.toString())
      }
      
      console.log("Request URL:", requestURL)
      console.log("Authorization header present:", !!headers['Authorization'])
      
      const response = await axios.get<ThreadResponse>(requestURL, { headers })
      
      console.log("Threads API response status:", response.status)
      console.log("Threads API response data structure:", {
        threadsCount: response.data?.threads?.length || 0,
        page: response.data?.page,
        pages: response.data?.pages,
        total: response.data?.total
      })
      
      if (response.data && response.data.threads) {
        const transformedThreads = await Promise.all(response.data.threads.map(async (thread) => {
          try {
            // Don't send authorization for reaction requests either for public threads
            const reactionsHeaders = isMyThreadsRequest ? headers : {}
            
            // Get reactions for the thread
            const reactionsResponse = await axios.get<ReactionResponse>(
              `${API_URL}/api/forum/threads/${thread.id}/reactions/`,
              { headers: reactionsHeaders }
            )
            
            return {
              id: thread.id,
              title: thread.title,
              content: thread.content_preview || thread.preview || "", // Handle both normal and search responses
              author: { 
                username: thread.author,
                avatar: '/images/avatars/default.png',
                isVerified: false
              },
              date: thread.created_at,
              timeAgo: timeAgoFromDate(new Date(thread.created_at)),
              replies: thread.reply_count,
              views: thread.view_count || 0, // View count might not be in search results
              upvotes: thread.net_count || thread.like_count || 0, // Handle both formats
              downvotes: 0,
              user_liked: thread.user_liked || false, // Use the API's user_liked value
              user_disliked: thread.user_disliked || false, // Use the API's user_disliked value
              topic: thread.topic,
              tags: thread.tags.map(tag => tag.name),
              tagIds: thread.tags.map(tag => tag.id),
              isSticky: false,
              isHot: false,
              reactions: reactionsResponse.data.reaction_counts.map(reaction => ({
                emoji: reaction.emoji,
                count: reaction.count,
                users: reaction.users
              }))
            }
          } catch (error) {
            console.error(`Error fetching reactions for thread ${thread.id}:`, error)
            return {
              id: thread.id,
              title: thread.title,
              content: thread.content_preview || thread.preview || "",
              author: { 
                username: thread.author,
                avatar: '/images/avatars/default.png',
                isVerified: false
              },
              date: thread.created_at,
              timeAgo: timeAgoFromDate(new Date(thread.created_at)),
              replies: thread.reply_count,
              views: thread.view_count || 0,
              upvotes: thread.net_count || thread.like_count || 0,
              downvotes: 0,
              user_liked: thread.user_liked || false, // Use the API's user_liked value
              user_disliked: thread.user_disliked || false, // Use the API's user_disliked value
              topic: thread.topic,
              tags: thread.tags.map(tag => tag.name),
              tagIds: thread.tags.map(tag => tag.id),
              isSticky: false,
              isHot: false,
              reactions: []
            }
          }
        }))
        
        setThreads(transformedThreads)
        setPagination({
          current_page: response.data.page,
          total_pages: response.data.pages,
          total_items: response.data.total
        })
      } else {
        console.error("Invalid response format:", response.data)
        setThreads([])
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
      setThreads([])
    } finally {
      setIsLoadingThreads(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [currentPage, currentTopicId, selectedTagId, showMyThreads, searchQuery])

  // Function to handle topic selection for filtering threads
  const handleTopicFilter = (topicId: number | null) => {
    // Clear search when filtering by topic
    setSearchQuery("")
    setSearchInput("")
    setIsSearching(false)
    
    setCurrentTopicId(topicId === currentTopicId ? null : topicId)
    setCurrentPage(1) // Reset pagination when changing filters
  }

  // Function to handle tag selection for filtering threads
  const handleTagFilter = (tagId: number | null) => {
    // Clear search when filtering by tag
    setSearchQuery("")
    setSearchInput("")
    setIsSearching(false)
    
    setSelectedTagId(tagId === selectedTagId ? null : tagId)
    setCurrentPage(1) // Reset pagination when changing filters
  }

  // Function to handle filter selection (legacy - can be removed if not needed)
  const handleFilterSelection = (tag: string) => {
    const newFilter = selectedFilter === tag ? null : tag;
    setSelectedFilter(newFilter);
  }
  
  // Update the search function
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchInput.trim().length < 3) {
      // Show minimum character requirement notification
      return
    }
    
    // Clear other filters when searching
    setCurrentTopicId(null)
    setSelectedTagId(null)
    setShowMyThreads(false)
    
    // Set search query and trigger search
    setSearchQuery(searchInput.trim())
    setIsSearching(true)
    setCurrentPage(1) // Reset to page 1 for new search
  }
  
  // Clear search and reset to normal threads view
  const clearSearch = () => {
    setSearchInput("")
    setSearchQuery("")
    setIsSearching(false)
    setCurrentPage(1)
    fetchThreads() // Reload threads without search
  }

  // Get threads to display
  const displayThreads = [...threads].sort((a, b) => {
    if (activeSort === 'hot') {
      // Sort by reply count (comments)
      return b.replies - a.replies;
    } else if (activeSort === 'new') {
      // Sort by last active time (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      // Sort by view count
      return b.views - a.views;
    }
  });

  // Function to handle upvoting/downvoting threads
  const handleVote = async (threadId: number, isUpvote: boolean) => {
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        router.push('/login')
        return
      }

      const endpoint = isUpvote ? `${API_URL}/api/forum/like/` : `${API_URL}/api/forum/dislike/`
      
      const response = await axios.post<VoteResponse>(
        endpoint,
        { thread_id: threadId },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Update the thread's net count in the UI and set the liked/disliked status
        setThreads(prevThreads => 
          prevThreads.map(thread => {
            if (thread.id === threadId) {
              // Set the new vote status based on the action and like_type
              const userLiked = isUpvote && 
                (response.data.action === "added" || response.data.action === "changed");
              
              const userDisliked = !isUpvote && 
                (response.data.action === "added" || response.data.action === "changed");
              
              return { 
                ...thread, 
                upvotes: response.data.net_count,
                downvotes: 0,
                user_liked: userLiked,
                user_disliked: userDisliked
              };
            }
            return thread;
          })
        );
      }
    } catch (error) {
      console.error(`Error ${isUpvote ? 'liking' : 'disliking'} thread:`, error)
    }
  }
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && (!pagination || page <= pagination.total_pages)) {
      setCurrentPage(page);
      window.scrollTo(0, 0); // Scroll to top when changing pages
    }
  }

  // Function to toggle between all threads and user's threads
  const toggleMyThreads = () => {
    setShowMyThreads(prev => !prev)
    setCurrentPage(1) // Reset to first page when switching view
  }

  return (
    <Layout>
      {/* Enhanced Header Section with Background - similar to detect.tsx */}
      <div className="relative">
        {/* Background with visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute mb-10 bottom-1/4 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-black/80 border border-primary/30 text-white text-sm font-medium">
                <MessageSquare className="h-4 w-4 mr-2" />
                Community Knowledge Hub
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Join Our <span className="gradient-text">Discussion Community</span> for Deepfake Analysis
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Connect with experts, researchers, and enthusiasts to discuss deepfake detection techniques, 
              share insights, and stay informed about the latest developments
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>{FORUM_METRICS.totalThreads.toLocaleString()}+ Active Threads</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>{FORUM_METRICS.activeUsers.toLocaleString()}+ Community Members</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Expert Moderation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main content area */}
            <div className="lg:col-span-9">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter text-foreground">Community Forum</h1>
                  <p className="text-muted-foreground mt-2">
                    Join discussions about deepfakes and AI content detection
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {user && (
                    <Button 
                      variant={showMyThreads ? "default" : "outline"}
                      onClick={toggleMyThreads}
                      className="flex items-center gap-2"
                      disabled={isSearching}
                    >
                      <Users size={16} />
                      {showMyThreads ? "All Threads" : "My Threads"}
                    </Button>
                  )}
                  
                  {user ? (
                    <Link href="/forum/create" passHref>
                      <Button 
                        className="flex items-center gap-2"
                      >
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

              {/* Updated search bar */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Search for threads, topics, or keywords... (min 3 characters)"
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
                        disabled={searchInput.trim().length < 3}
                      >
                        Search
                      </Button>
                      
                      {isSearching && (
                        <Button 
                          type="button"
                          variant="outline"
                          className="h-12"
                          onClick={clearSearch}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Active search indicator */}
              {isSearching && (
                <div className="mb-6 flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Search results for: <span className="font-medium">{searchQuery}</span>
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearSearch}
                    className="h-8 text-xs"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}

              {/* Tags Filter - Hide during search */}
              {!isSearching && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {isLoadingTags ? (
                    <div className="w-full py-2 text-center text-muted-foreground">Loading tags...</div>
                  ) : tags.length > 0 ? (
                    <>
                      {tags.map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant={selectedTagId === tag.id ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/20"
                          onClick={() => handleTagFilter(tag.id)}
                        >
                          {tag.name} ({tag.thread_count})
                          {selectedTagId === tag.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-1 h-4 w-4 p-0" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagFilter(null);
                              }}
                            >
                              <X size={10} />
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No tags available</div>
                  )}
                </div>
              )}
              
              {/* Sorting options - Hide during search */}
              {!isSearching && (
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
              )}
              
              {/* Loading and empty states */}
              {isLoadingThreads ? (
                <div className="flex justify-center py-16">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : displayThreads.length === 0 ? (
                <Card className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Threads Found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {isSearching 
                      ? `We couldn't find any threads matching "${searchQuery}".` 
                      : searchInput.trim().length > 0
                        ? `We couldn't find any threads matching "${searchInput}".`
                        : selectedTagId
                          ? "We couldn't find any threads with the selected tag."
                          : currentTopicId 
                            ? "We couldn't find any threads in the selected topic."
                            : showMyThreads
                              ? "You haven't created any threads yet."
                              : "No threads available at the moment."}
                  </p>
                  <div className="flex gap-3">
                    {isSearching && (
                      <Button variant="outline" onClick={clearSearch}>Clear Search</Button>
                    )}
                    {user && (
                      <Link href="/forum/create" passHref>
                        <Button>Create Thread</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ) : (
                /* Thread Listing (Reddit-style) */
                <div className="space-y-4">
                  {displayThreads.map((thread: DisplayThread) => (
                    <div key={thread.id} className="flex gap-3 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {/* Voting buttons */}
                      <div className="flex flex-col items-center justify-start bg-muted/30 py-4 px-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            thread.user_liked 
                              ? "text-primary bg-primary/10" 
                              : "text-muted-foreground hover:text-primary hover:bg-transparent"
                          }`}
                          onClick={() => handleVote(thread.id, true)}
                        >
                          <ArrowUp size={20} />
                        </Button>
                        <span className="text-sm font-medium my-1">{thread.upvotes}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            thread.user_disliked 
                              ? "text-destructive bg-destructive/10" 
                              : "text-muted-foreground hover:text-destructive hover:bg-transparent"
                          }`}
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
              
              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.total_pages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => {
                        // Add ellipsis between non-consecutive pages
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      })
                    }
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!pagination || currentPage === pagination.total_pages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Show load more button only if there are threads and not in search mode or if search has more results */}
              {displayThreads.length > 0 && !pagination && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More</Button>
                </div>
              )}
            </div>
            
            {/* Right sidebar (topics) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                {/* Topics section */}
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoadingTopics ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topics.map(topic => (
                          <div 
                            key={topic.id} 
                            className={`flex items-center justify-between hover:bg-accent/30 px-2 py-1.5 rounded-md cursor-pointer ${
                              currentTopicId === topic.id ? 'bg-accent/50' : ''
                            }`}
                            onClick={() => handleTopicFilter(topic.id)}
                          >
                            <div>
                              <div className="font-medium">{topic.name}</div>
                              <div className="text-xs text-muted-foreground">{topic.thread_count} threads</div>
                            </div>
                            {currentTopicId === topic.id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTopicFilter(null);
                                }}
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Forum stats
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
                </Card> */}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
