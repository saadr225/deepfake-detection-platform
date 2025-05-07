"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/UserContext"
import { 
  MessageSquare, ThumbsUp, Flag, Share2, ArrowLeft, Send, AlertCircle, 
  Image as ImageIcon, X, CornerUpRight, Upload, BookmarkIcon, ArrowUp, 
  ArrowDown, Link as LinkIcon, Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

// Type definitions
interface Author {
  username: string;
  avatar: string;
  joinDate: string;
  postCount: number;
  isVerified?: boolean;
}

interface UserData {
  username?: string;
  email?: string;
  avatar?: string;
}

// Define reaction types
interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames who reacted with this emoji
}

interface ThreadReply {
  id: number;
  content: string;
  author: Author;
  date: string;
  likes: number;
  isVerified: boolean;
  media: string | null;
  replies?: ThreadReply[];
  upvotes?: number;
  downvotes?: number;
  timeAgo?: string;
  reactions?: Reaction[]; // Add reactions field
  hasReacted?: boolean; // Tracks if current user has reacted
}

interface ThreadData {
  id: number;
  title: string;
  content: string;
  author: Author;
  date: string;
  views: number;
  likes: number;
  tags: string[];
  status: string;
  upvotes?: number;
  downvotes?: number;
  timeAgo?: string;
  reactions?: Reaction[]; // Add reactions field
  hasReacted?: boolean; // Tracks if current user has reacted
}

// Mock data for the thread
const MOCK_THREAD: ThreadData = {
  id: 1,
  title: "New detection method for face swaps",
  content: `I've been working on a new technique to detect face-swapped deepfakes by analyzing the inconsistencies in facial features. The method combines traditional computer vision techniques with deep learning models.

The approach focuses on three key areas:
1. Eye and eyebrow region analysis
2. Mouth movement consistency
3. Skin texture transitions

Initial results are promising, with our model achieving 94% accuracy on the FaceForensics++ dataset. We're still working on improving performance on heavily compressed videos, which remain challenging.

Has anyone else been exploring similar methods? I'd love to get feedback from the community.`,
  author: {
    username: "researcher93",
    avatar: "/images/avatars/avatar-1.png",
    joinDate: "January 2022",
    postCount: 142,
    isVerified: true
  },
  date: "April 15, 2023",
  timeAgo: "3 days ago",
  views: 156,
  likes: 32,
  upvotes: 145,
  downvotes: 8,
  tags: ["Detection Methods", "Research"],
  status: "open",
  reactions: [
    { emoji: "👍", count: 24, users: ["user1", "user2"] },
    { emoji: "🔥", count: 18, users: ["user3"] },
    { emoji: "👏", count: 12, users: [] },
    { emoji: "🧠", count: 9, users: [] }
  ]
}

// Mock data for replies
const MOCK_REPLIES: ThreadReply[] = [
  {
    id: 1,
    content: "This sounds really promising! Have you tried validating your approach on the WildDeepfake dataset as well? It contains more in-the-wild samples that might present different challenges than FaceForensics++.",
    author: {
      username: "aiexpert",
      avatar: "/images/avatars/avatar-2.png",
      joinDate: "March 2021",
      postCount: 256,
      isVerified: true
    },
    date: "April 15, 2023",
    timeAgo: "3 days ago",
    likes: 8,
    upvotes: 12,
    downvotes: 2,
    isVerified: true,
    media: null,
    replies: [],
    reactions: [
      { emoji: "👍", count: 8, users: ["user1"] },
      { emoji: "👀", count: 5, users: [] }
    ]
  },
  {
    id: 2,
    content: "I've been working on something similar but focusing more on temporal inconsistencies across video frames. Your spatial approach could complement our work nicely. Would you be open to collaboration?",
    author: {
      username: "deeplearn42",
      avatar: "/images/avatars/avatar-3.png",
      joinDate: "November 2022",
      postCount: 87,
      isVerified: false
    },
    date: "April 16, 2023",
    timeAgo: "2 days ago",
    likes: 12,
    upvotes: 18,
    downvotes: 0,
    isVerified: false,
    media: "/images/forum/temporal-inconsistency.png",
    replies: [
      {
        id: 21,
        content: "I'd be very interested in seeing how these approaches could work together. Let's connect!",
        author: {
          username: "researcher93",
          avatar: "/images/avatars/avatar-1.png",
          joinDate: "January 2022",
          postCount: 144,
          isVerified: true
        },
        date: "April 16, 2023",
        timeAgo: "2 days ago",
        likes: 3,
        upvotes: 5,
        downvotes: 0,
        isVerified: false,
        media: null
      }
    ]
  },
  {
    id: 3,
    content: "Have you considered how your method performs against different types of deepfakes? For example, Whole-GAN approaches vs face-swapping methods might leave different artifacts.",
    author: {
      username: "security_researcher",
      avatar: "/images/avatars/avatar-4.png",
      joinDate: "June 2020",
      postCount: 324,
      isVerified: true
    },
    date: "April 17, 2023",
    timeAgo: "1 day ago",
    likes: 5,
    upvotes: 7,
    downvotes: 1,
    isVerified: true,
    media: null,
    replies: []
  }
]

export default function ThreadPage() {
  const { user } = useUser()
  const router = useRouter()
  const { id } = router.query
  
  const [replyContent, setReplyContent] = useState("")
  const [inlineReplyContent, setInlineReplyContent] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyToMain, setReplyToMain] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [thread, setThread] = useState<ThreadData>(MOCK_THREAD)
  const [replies, setReplies] = useState<ThreadReply[]>(MOCK_REPLIES)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [sortBy, setSortBy] = useState<'best' | 'top' | 'new' | 'old'>('best')
  
  // Add state for reaction UI
  const [showReactionPicker, setShowReactionPicker] = useState<{ type: 'thread' | 'reply'; id: number } | null>(null)
  const [reactionAdded, setReactionAdded] = useState<number | null>(null)
  
  // Available emoji reactions
  const availableReactions = [
    { emoji: "👍", name: "thumbs up" },
    { emoji: "🔥", name: "fire" },
    { emoji: "😂", name: "laugh" },
    { emoji: "😮", name: "wow" },
    { emoji: "👏", name: "clap" },
    { emoji: "❤️", name: "heart" },
    { emoji: "🧠", name: "smart" },
    { emoji: "👀", name: "eyes" }
  ]
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Determine which content to use based on whether it's a main reply or inline reply
    const content = replyToMain ? replyContent : inlineReplyContent
    
    if (!content.trim()) {
      setErrorMessage("Please enter your reply.")
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage("")
    
    try {
      // Placeholder for actual API call
      // const uploadData = new FormData();
      // if (mediaFile) uploadData.append('media', mediaFile);
      // uploadData.append('content', content);
      // uploadData.append('threadId', String(id));
      // if (replyTo) uploadData.append('replyTo', String(replyTo));
      // await api.postReply(uploadData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add mock reply to the state (would be replaced with data from API)
      const newReply: ThreadReply = {
        id: Date.now(), // Using timestamp as unique ID
        content: content,
        author: {
          username: user?.username || "current_user",
          avatar: "/images/avatars/avatar-5.png",
          joinDate: "2023",
          postCount: 1,
          isVerified: false
        },
        date: new Date().toLocaleDateString(),
        timeAgo: "Just now",
        likes: 0,
        upvotes: 0,
        downvotes: 0,
        isVerified: false,
        media: mediaPreview,
        replies: []
      }
      
      if (replyToMain) {
        // Adding reply to main thread
        setReplies([...replies, newReply])
      } else if (replyTo) {
        // Adding nested reply
        const updatedReplies = replies.map(r => {
          if (r.id === replyTo) {
            return {
              ...r,
              replies: [...(r.replies || []), newReply]
            }
          }
          return r
        })
        setReplies(updatedReplies)
      }
      
      // Reset form
      setReplyContent("")
      setInlineReplyContent("")
      setReplyTo(null)
      setReplyToMain(true)
      setMediaPreview(null)
      setMediaFile(null)
    } catch (error) {
      console.error("Error posting reply:", error)
      setErrorMessage("An error occurred while posting your reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Function to handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload only image files (JPEG, PNG, GIF, WEBP).")
      return
    }
    
    if (file.size > maxSize) {
      setErrorMessage("File size must be less than 5MB.")
      return
    }
    
    setMediaFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setErrorMessage("")
  }
  
  // Function to remove uploaded media
  const removeMedia = () => {
    setMediaPreview(null)
    setMediaFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  // Function to handle reply to specific comment
  const handleReplyToComment = (replyId: number) => {
    setReplyTo(replyId)
    setReplyToMain(false)
    
    // Don't scroll to bottom form - we'll use the inline form instead
  }
  
  // Function to cancel replying to specific comment
  const cancelReplyToComment = () => {
    setReplyTo(null)
    setReplyToMain(true)
    setInlineReplyContent("")
  }
  
  // Function to handle voting
  const handleVote = (type: 'thread' | 'reply', id: number, isUpvote: boolean) => {
    if (type === 'thread') {
      setThread(prev => ({
        ...prev,
        upvotes: isUpvote ? (prev.upvotes || 0) + 1 : prev.upvotes,
        downvotes: !isUpvote ? (prev.downvotes || 0) + 1 : prev.downvotes
      }))
    } else {
      // Deep clone of replies to ensure we don't mutate state directly
      const updatedReplies = JSON.parse(JSON.stringify(replies)) as ThreadReply[]
      
      // Recursive function to find and update the voted reply
      const updateVotes = (replies: ThreadReply[]): boolean => {
        for (let i = 0; i < replies.length; i++) {
          if (replies[i].id === id) {
            if (isUpvote) {
              replies[i].upvotes = (replies[i].upvotes || 0) + 1;
            } else {
              replies[i].downvotes = (replies[i].downvotes || 0) + 1;
            }
            return true;
          }
          
          const nestedReplies = replies[i].replies;
          if (nestedReplies && nestedReplies.length > 0) {
            if (updateVotes(nestedReplies)) {
              return true;
            }
          }
        }
        return false;
      }
      
      updateVotes(updatedReplies);
      setReplies(updatedReplies);
    }
  }
  
  // Function to toggle the reaction picker
  const toggleReactionPicker = (type: 'thread' | 'reply', id: number) => {
    if (showReactionPicker && showReactionPicker.type === type && showReactionPicker.id === id) {
      setShowReactionPicker(null)
    } else {
      setShowReactionPicker({ type, id })
    }
  }
  
  // Function to handle adding a reaction
  const handleAddReaction = (type: 'thread' | 'reply', id: number, emoji: string) => {
    if (!user) {
      // Prompt login if user is not logged in
      alert("Please log in to react to posts")
      return
    }
    
    if (type === 'thread') {
      setThread(prev => {
        // Create reactions array if it doesn't exist
        const reactions = prev.reactions || []
        const username = user.username || 'anonymous'
        
        // Find if this emoji already exists
        const existingIndex = reactions.findIndex(r => r.emoji === emoji)
        
        // Make a copy of the reactions array
        const updatedReactions = [...reactions]
        
        if (existingIndex >= 0) {
          // Check if user already reacted with this emoji
          const existingUserIndex = updatedReactions[existingIndex].users.indexOf(username)
          
          if (existingUserIndex >= 0) {
            // User already reacted with this emoji, remove their reaction
            const updatedUsers = [...updatedReactions[existingIndex].users]
            updatedUsers.splice(existingUserIndex, 1)
            
            if (updatedUsers.length === 0) {
              // No users left, remove the reaction
              updatedReactions.splice(existingIndex, 1)
            } else {
              // Update the users and count
              updatedReactions[existingIndex] = {
                ...updatedReactions[existingIndex],
                users: updatedUsers,
                count: updatedReactions[existingIndex].count - 1
              }
            }
          } else {
            // Add user to existing emoji
            updatedReactions[existingIndex] = {
              ...updatedReactions[existingIndex],
              users: [...updatedReactions[existingIndex].users, username],
              count: updatedReactions[existingIndex].count + 1
            }
          }
        } else {
          // This emoji doesn't exist yet, add it
          updatedReactions.push({
            emoji,
            count: 1,
            users: [username]
          })
        }
        
        // Sort reactions by count
        updatedReactions.sort((a, b) => b.count - a.count)
        
        // Visual feedback
        setReactionAdded(Date.now())
        
        // Hide the reaction picker
        setShowReactionPicker(null)
        
        return {
          ...prev,
          reactions: updatedReactions
        }
      })
    } else {
      // Deep clone of replies to ensure we don't mutate state directly
      const updatedReplies = JSON.parse(JSON.stringify(replies)) as ThreadReply[]
      
      // Recursive function to find and update the reaction
      const updateReactions = (replies: ThreadReply[]): boolean => {
        for (let i = 0; i < replies.length; i++) {
          if (replies[i].id === id) {
            // Create reactions array if it doesn't exist
            const reactions = replies[i].reactions || []
            const username = user.username || 'anonymous'
            
            // Find if this emoji already exists
            const existingIndex = reactions.findIndex(r => r.emoji === emoji)
            
            if (existingIndex >= 0) {
              // Check if user already reacted with this emoji
              const existingUserIndex = reactions[existingIndex].users.indexOf(username)
              
              if (existingUserIndex >= 0) {
                // User already reacted with this emoji, remove their reaction
                const updatedUsers = [...reactions[existingIndex].users]
                updatedUsers.splice(existingUserIndex, 1)
                
                if (updatedUsers.length === 0) {
                  // No users left, remove the reaction
                  reactions.splice(existingIndex, 1)
                } else {
                  // Update the users and count
                  reactions[existingIndex] = {
                    ...reactions[existingIndex],
                    users: updatedUsers,
                    count: reactions[existingIndex].count - 1
                  }
                }
              } else {
                // Add user to existing emoji
                reactions[existingIndex] = {
                  ...reactions[existingIndex],
                  users: [...reactions[existingIndex].users, username],
                  count: reactions[existingIndex].count + 1
                }
              }
            } else {
              // This emoji doesn't exist yet, add it
              reactions.push({
                emoji,
                count: 1,
                users: [username]
              })
            }
            
            // Sort reactions by count
            reactions.sort((a, b) => b.count - a.count)
            
            // Update the reply with the new reactions
            replies[i].reactions = reactions
            
            // Visual feedback
            setReactionAdded(Date.now())
            
            // Hide the reaction picker
            setShowReactionPicker(null)
            
            return true
          }
          
          const nestedReplies = replies[i].replies
          if (nestedReplies && nestedReplies.length > 0) {
            if (updateReactions(nestedReplies)) {
              return true
            }
          }
        }
        return false
      }
      
      updateReactions(updatedReplies)
      setReplies(updatedReplies)
    }
  }
  
  // Function to check if current user has reacted with a specific emoji
  const hasUserReacted = (reactions: Reaction[] | undefined, emoji: string): boolean => {
    if (!user || !reactions) return false
    
    const username = user.username || 'anonymous'
    const reaction = reactions.find(r => r.emoji === emoji)
    
    return reaction ? reaction.users.includes(username) : false
  }
  
  // Loading state for SSR
  if (router.isFallback) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }
  
  // Find the reply that the user is responding to
  const currentReplyTo = replyTo ? replies.find(r => r.id === replyTo) : null

  // Sort replies based on selected sort option
  const sortedReplies = [...replies].sort((a, b) => {
    if (sortBy === 'best') {
      // Sort by ratio of upvotes to total votes
      const ratioA = (a.upvotes || 0) / ((a.upvotes || 0) + (a.downvotes || 0) + 1);
      const ratioB = (b.upvotes || 0) / ((b.upvotes || 0) + (b.downvotes || 0) + 1);
      return ratioB - ratioA;
    } else if (sortBy === 'top') {
      // Sort by total upvotes
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (sortBy === 'new') {
      // Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      // Sort by date (oldest first)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
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
          
          {/* Thread details - Reddit-style */}
          <div className="flex gap-3 bg-card rounded-xl shadow-sm overflow-hidden mb-6">
            {/* Voting buttons */}
            <div className="flex flex-col items-center justify-start bg-muted/30 py-4 px-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                onClick={() => handleVote('thread', thread.id, true)}
              >
                <ArrowUp size={20} />
              </Button>
              <span className="text-sm font-medium my-1">{(thread.upvotes || 0) - (thread.downvotes || 0)}</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                onClick={() => handleVote('thread', thread.id, false)}
              >
                <ArrowDown size={20} />
              </Button>
            </div>

            {/* Thread content */}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <span className="flex items-center">
                  <div className="h-6 w-6 rounded-full overflow-hidden mr-1.5">
                    <Image 
                      src={thread.author.avatar || '/images/avatars/default.png'} 
                      alt={thread.author.username}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-foreground">{thread.author.username}</span>
                  {thread.author.isVerified && (
                    <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Verified</Badge>
                  )}
                </span>
                <span className="ml-1">• {thread.timeAgo || thread.date}</span>
                <span className="ml-1">• {thread.views} views</span>
                {thread.status === 'open' && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary text-primary ml-1">
                    <Sparkles size={10} className="mr-0.5" />
                    ACTIVE
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-3">{thread.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {thread.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                {thread.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {replies.reduce((total, reply) => total + 1 + (reply.replies?.length || 0), 0)} Comments
                </Button>
                
                {/* Add Reaction Button */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground flex items-center"
                    onClick={() => toggleReactionPicker('thread', thread.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    React
                  </Button>
                  
                  {/* Emoji Reaction Picker */}
                  {showReactionPicker && 
                   showReactionPicker.type === 'thread' && 
                   showReactionPicker.id === thread.id && (
                    <div className="absolute bottom-full mb-2 bg-card rounded-xl border border-border shadow-lg p-2 z-10">
                      <div className="flex flex-wrap gap-2 max-w-[220px]">
                        {availableReactions.map(reaction => (
                          <button 
                            key={reaction.emoji}
                            className={`text-xl p-1.5 rounded-full transition-all hover:bg-accent ${
                              hasUserReacted(thread.reactions, reaction.emoji) ? 'bg-accent/50' : ''
                            }`}
                            onClick={() => handleAddReaction('thread', thread.id, reaction.emoji)}
                            title={reaction.name}
                          >
                            {reaction.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground flex items-center"
                >
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  Save
                </Button>
                
                {/* Display Reactions */}
                {thread.reactions && thread.reactions.length > 0 && (
                  <div className="ml-auto flex flex-wrap gap-1">
                    {thread.reactions.map(reaction => (
                      <motion.button
                        key={reaction.emoji}
                        className={`text-sm px-2 py-1 rounded-full flex items-center gap-1 border ${
                          hasUserReacted(thread.reactions, reaction.emoji) 
                            ? 'bg-accent border-primary/30' 
                            : 'bg-background border-border hover:bg-accent/50'
                        }`}
                        onClick={() => handleAddReaction('thread', thread.id, reaction.emoji)}
                        whileTap={{ scale: 0.95 }}
                        animate={
                          reactionAdded && hasUserReacted(thread.reactions, reaction.emoji) 
                            ? { scale: [1, 1.2, 1] } 
                            : {}
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-xs font-medium">{reaction.count}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Reply form at the top */}
          {user ? (
            <Card className="bg-card mb-6" id="reply-form-top">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image 
                      src={user?.avatar || "/images/avatars/default.png"}
                      alt={user?.username || "User"}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Textarea 
                      placeholder="What are your thoughts on this discussion?"
                      className="min-h-[100px] rounded-xl mb-3"
                      value={replyToMain ? replyContent : ""}
                      onChange={(e) => replyToMain && setReplyContent(e.target.value)}
                      onClick={() => {
                        setReplyTo(null);
                        setReplyToMain(true);
                      }}
                    />
                    
                    <div className="flex justify-between items-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Attach Image
                      </Button>
                      
                      <Button 
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim() || isSubmitting || !replyToMain}
                        size="sm"
                      >
                        {isSubmitting ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                
                {/* Media preview */}
                {mediaPreview && replyToMain && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-border max-w-md ml-12">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                      onClick={removeMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Image 
                      src={mediaPreview} 
                      alt="Media preview"
                      width={400}
                      height={300}
                      className="object-contain"
                    />
                  </div>
                )}
                
                {errorMessage && replyToMain && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center mt-3 ml-12">
                    <AlertCircle size={16} className="mr-2" />
                    {errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-4 mb-6">
              <CardContent>
                <p className="mb-3">You need to be logged in to comment on this discussion.</p>
                <Link href="/login" passHref>
                  <Button variant="default" size="sm">
                    Log In to Comment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {/* Comments sorting options */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {replies.reduce((total, reply) => total + 1 + (reply.replies?.length || 0), 0)} Comments
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="h-8 font-medium">
                  {sortBy === 'best' && 'Best'}
                  {sortBy === 'top' && 'Top'}
                  {sortBy === 'new' && 'New'}
                  {sortBy === 'old' && 'Old'}
                </Button>
                <div className="absolute right-0 top-full mt-1 p-1 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10 w-36">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${sortBy === 'best' ? 'bg-accent/50' : ''}`}
                    onClick={() => setSortBy('best')}
                  >
                    Best
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${sortBy === 'top' ? 'bg-accent/50' : ''}`}
                    onClick={() => setSortBy('top')}
                  >
                    Top
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${sortBy === 'new' ? 'bg-accent/50' : ''}`}
                    onClick={() => setSortBy('new')}
                  >
                    New
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${sortBy === 'old' ? 'bg-accent/50' : ''}`}
                    onClick={() => setSortBy('old')}
                  >
                    Old
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Replies section - Reddit style */}
          <div className="mb-8 space-y-4">
            {sortedReplies.map((reply) => (
              <div key={reply.id} className="mb-4">
                {/* Main reply */}
                <div className="flex gap-3 bg-card rounded-xl shadow-sm overflow-hidden">
                  {/* Voting buttons */}
                  <div className="flex flex-col items-center justify-start bg-muted/30 py-3 px-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                      onClick={() => handleVote('reply', reply.id, true)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <span className="text-xs font-medium my-0.5">{(reply.upvotes || 0) - (reply.downvotes || 0)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                      onClick={() => handleVote('reply', reply.id, false)}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </div>
                  
                  {/* Reply content */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
                      <div className="h-5 w-5 rounded-full overflow-hidden mr-1">
                        <Image 
                          src={reply.author.avatar || '/images/avatars/default.png'} 
                          alt={reply.author.username}
                          width={20}
                          height={20}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-foreground">{reply.author.username}</span>
                      {reply.author.isVerified && (
                        <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Verified</Badge>
                      )}
                      <span className="ml-1">• {reply.timeAgo || reply.date}</span>
                    </div>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                      {reply.content}
                    </div>
                    
                    {/* Display media if any */}
                    {reply.media && (
                      <div className="mb-4">
                        <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                          <Image 
                            src={reply.media} 
                            alt="Attached media"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {user && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                          onClick={() => handleReplyToComment(reply.id)}
                        >
                          <CornerUpRight className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      )}
                      
                      {/* Add Reaction Button for Reply */}
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                          onClick={() => toggleReactionPicker('reply', reply.id)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          React
                        </Button>
                        
                        {/* Emoji Reaction Picker */}
                        {showReactionPicker && 
                         showReactionPicker.type === 'reply' && 
                         showReactionPicker.id === reply.id && (
                          <div className="absolute bottom-full left-0 mb-2 bg-card rounded-xl border border-border shadow-lg p-1.5 z-10">
                            <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                              {availableReactions.map(reaction => (
                                <button 
                                  key={reaction.emoji}
                                  className={`text-sm p-1 rounded-full transition-all hover:bg-accent ${
                                    hasUserReacted(reply.reactions, reaction.emoji) ? 'bg-accent/50' : ''
                                  }`}
                                  onClick={() => handleAddReaction('reply', reply.id, reaction.emoji)}
                                  title={reaction.name}
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive/80 flex items-center"
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                      
                      {/* Display Reply Reactions */}
                      {reply.reactions && reply.reactions.length > 0 && (
                        <div className="ml-auto flex flex-wrap gap-1">
                          {reply.reactions.map(reaction => (
                            <motion.button
                              key={reaction.emoji}
                              className={`text-[10px] px-1 py-0.5 rounded-full flex items-center gap-0.5 border ${
                                hasUserReacted(reply.reactions, reaction.emoji) 
                                  ? 'bg-accent border-primary/30' 
                                  : 'bg-background border-border hover:bg-accent/50'
                              }`}
                              onClick={() => handleAddReaction('reply', reply.id, reaction.emoji)}
                              whileTap={{ scale: 0.95 }}
                              animate={
                                reactionAdded && hasUserReacted(reply.reactions, reaction.emoji) 
                                  ? { scale: [1, 1.2, 1] } 
                                  : {}
                              }
                              transition={{ duration: 0.3 }}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-[8px] font-medium">{reaction.count}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Inline reply form */}
                {user && replyTo === reply.id && (
                  <div className="ml-6 mt-2 p-3 border-l-2 border-primary/30 bg-card/50 rounded-r-lg">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image 
                          src={user?.avatar || "/images/avatars/default.png"}
                          alt={user?.username || "User"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">
                            Replying to <span className="font-medium text-foreground">{reply.author.username}</span>
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0" 
                            onClick={cancelReplyToComment}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                        
                        <Textarea 
                          placeholder={`Reply to ${reply.author.username}...`}
                          className="min-h-[100px] rounded-xl mb-3"
                          value={inlineReplyContent}
                          onChange={(e) => setInlineReplyContent(e.target.value)}
                        />
                        
                        {/* Media preview */}
                        {mediaPreview && !replyToMain && (
                          <div className="mb-3 relative rounded-lg overflow-hidden border border-border max-w-sm">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                              onClick={removeMedia}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Image 
                              src={mediaPreview} 
                              alt="Media preview"
                              width={300}
                              height={200}
                              className="object-contain"
                            />
                          </div>
                        )}
                        
                        {errorMessage && !replyToMain && (
                          <div className="bg-destructive/10 text-destructive p-2 rounded-lg text-sm flex items-center mb-3">
                            <AlertCircle size={14} className="mr-2" />
                            {errorMessage}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="h-3 w-3" />
                            Image
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs"
                              onClick={cancelReplyToComment}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              className="text-xs"
                              onClick={handleSubmitReply}
                              disabled={!inlineReplyContent || isSubmitting}
                            >
                              {isSubmitting ? "Posting..." : "Reply"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Display nested replies */}
                {reply.replies && reply.replies.length > 0 && (
                  <div className="ml-6 pl-6 border-l-2 border-muted pt-2 space-y-3">
                    {reply.replies.map((nestedReply) => (
                      <div key={nestedReply.id} className="flex gap-3 bg-card/60 rounded-xl shadow-sm overflow-hidden">
                        {/* Voting buttons */}
                        <div className="flex flex-col items-center justify-start bg-muted/20 py-3 px-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-primary hover:bg-transparent"
                            onClick={() => handleVote('reply', nestedReply.id, true)}
                          >
                            <ArrowUp size={12} />
                          </Button>
                          <span className="text-xs font-medium my-0.5">{(nestedReply.upvotes || 0) - (nestedReply.downvotes || 0)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                            onClick={() => handleVote('reply', nestedReply.id, false)}
                          >
                            <ArrowDown size={12} />
                          </Button>
                        </div>
                        
                        {/* Reply content */}
                        <div className="flex-1 p-3">
                          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-1.5">
                            <div className="h-4 w-4 rounded-full overflow-hidden mr-1">
                              <Image 
                                src={nestedReply.author.avatar || '/images/avatars/default.png'} 
                                alt={nestedReply.author.username}
                                width={16}
                                height={16}
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium text-foreground">{nestedReply.author.username}</span>
                            {nestedReply.author.isVerified && (
                              <Badge variant="secondary" className="ml-1 text-[8px] py-0 px-1">Verified</Badge>
                            )}
                            <span className="ml-1">• {nestedReply.timeAgo || nestedReply.date}</span>
                          </div>
                          
                          <div className="prose prose-sm dark:prose-invert max-w-none mb-2 text-sm">
                            {nestedReply.content}
                          </div>
                          
                          {/* Display media if any */}
                          {nestedReply.media && (
                            <div className="mb-3">
                              <div className="relative rounded-lg overflow-hidden border border-border max-w-sm">
                                <Image 
                                  src={nestedReply.media} 
                                  alt="Attached media"
                                  width={300}
                                  height={200}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 text-[10px] text-muted-foreground hover:text-foreground flex items-center"
                            >
                              <Share2 className="h-2.5 w-2.5 mr-1" />
                              Share
                            </Button>
                            
                            {/* Add Reaction Button for Nested Reply */}
                            <div className="relative">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 text-[10px] text-muted-foreground hover:text-foreground flex items-center"
                                onClick={() => toggleReactionPicker('reply', nestedReply.id)}
                              >
                                <ThumbsUp className="h-2.5 w-2.5 mr-1" />
                                React
                              </Button>
                              
                              {/* Emoji Reaction Picker */}
                              {showReactionPicker && 
                               showReactionPicker.type === 'reply' && 
                               showReactionPicker.id === nestedReply.id && (
                                <div className="absolute bottom-full left-0 mb-2 bg-card rounded-xl border border-border shadow-lg p-1.5 z-10">
                                  <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                    {availableReactions.map(reaction => (
                                      <button 
                                        key={reaction.emoji}
                                        className={`text-sm p-1 rounded-full transition-all hover:bg-accent ${
                                          hasUserReacted(nestedReply.reactions, reaction.emoji) ? 'bg-accent/50' : ''
                                        }`}
                                        onClick={() => handleAddReaction('reply', nestedReply.id, reaction.emoji)}
                                        title={reaction.name}
                                      >
                                        {reaction.emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 text-[10px] text-destructive hover:text-destructive/80 flex items-center"
                            >
                              <Flag className="h-2.5 w-2.5 mr-1" />
                              Report
                            </Button>
                            
                            {/* Display Nested Reply Reactions */}
                            {nestedReply.reactions && nestedReply.reactions.length > 0 && (
                              <div className="ml-auto flex flex-wrap gap-1">
                                {nestedReply.reactions.map(reaction => (
                                  <motion.button
                                    key={reaction.emoji}
                                    className={`text-[10px] px-1 py-0.5 rounded-full flex items-center gap-0.5 border ${
                                      hasUserReacted(nestedReply.reactions, reaction.emoji) 
                                        ? 'bg-accent border-primary/30' 
                                        : 'bg-background border-border hover:bg-accent/50'
                                    }`}
                                    onClick={() => handleAddReaction('reply', nestedReply.id, reaction.emoji)}
                                    whileTap={{ scale: 0.95 }}
                                    animate={
                                      reactionAdded && hasUserReacted(nestedReply.reactions, reaction.emoji) 
                                        ? { scale: [1, 1.2, 1] } 
                                        : {}
                                    }
                                    transition={{ duration: 0.3 }}
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-[8px] font-medium">{reaction.count}</span>
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Reply form at the bottom */}
          {user && (
            <Card className="bg-card" id="reply-form">
              <CardHeader className="pb-3">
                <CardTitle>Post a Comment</CardTitle>
                <CardDescription>
                  Join the discussion on this topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReply}>
                  <div className="space-y-4">
                    <Textarea 
                      value={replyToMain ? replyContent : ""}
                      onChange={(e) => replyToMain && setReplyContent(e.target.value)}
                      placeholder="What are your thoughts on this discussion?"
                      className="min-h-[150px] rounded-xl"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyToMain(true);
                      }}
                      required
                    />
                    
                    {/* Media upload preview */}
                    {mediaPreview && replyToMain && (
                      <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                          onClick={removeMedia}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Image 
                          src={mediaPreview} 
                          alt="Media preview"
                          width={400}
                          height={300}
                          className="object-contain"
                        />
                      </div>
                    )}
                    
                    {errorMessage && replyToMain && (
                      <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        {errorMessage}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      
                      {/* Media upload button */}
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                        disabled={isSubmitting || !replyToMain}
                      >
                        <Upload className="h-4 w-4" />
                        Attach Media
                      </Button>
                      
                      <Button 
                        type="submit"
                        disabled={!replyContent.trim() || isSubmitting || !replyToMain}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  )
} 