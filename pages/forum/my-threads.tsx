"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUser } from "@/contexts/UserContext"
import { 
  MessageSquare, 
  AlertCircle, 
  Users, 
  Tag, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  Eye,
  ThumbsUp
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import ForumBreadcrumb from "@/components/ForumBreadcrumb"

// Define reaction types
interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // usernames who reacted with this emoji
}

// Mock data for user's threads (would come from API)
const MOCK_USER_THREADS = [
  {
    id: 1, 
    title: "New detection method for face swaps", 
    content: "I've been working on a new technique to detect face-swapped deepfakes by analyzing inconsistencies in facial features...",
    date: "2023-04-15", 
    timeAgo: "3 days ago",
    lastActive: "2023-05-01",
    lastActiveTimeAgo: "5 days ago",
    category: "Detection Methods",
    replies: 23, 
    views: 156,
    tags: ["Detection Methods", "Research"],
    isPinned: false,
    isPrivate: false,
    reactions: [
      { emoji: "👍", count: 24, users: ["user1", "user2"] },
      { emoji: "🔥", count: 18, users: ["user3"] },
      { emoji: "👏", count: 12, users: [] }
    ]
  },
  {
    id: 2, 
    title: "Open source tools for deepfake detection", 
    content: "Here's a list of open source tools I've found useful for detecting synthetic media...",
    date: "2023-03-20", 
    timeAgo: "1 month ago",
    lastActive: "2023-04-18", 
    lastActiveTimeAgo: "2 weeks ago",
    category: "Tools",
    replies: 42, 
    views: 278,
    tags: ["Tools", "Open Source"],
    isPinned: false,
    isPrivate: false,
    reactions: [
      { emoji: "🙏", count: 32, users: [] },
      { emoji: "👀", count: 15, users: [] }
    ]
  },
  {
    id: 3, 
    title: "Draft: Upcoming research on audio deepfakes", 
    content: "I'm working on a paper about detecting AI-generated audio. Here's an outline of my approach...",
    date: "2023-04-28", 
    timeAgo: "2 days ago",
    lastActive: "2023-04-28", 
    lastActiveTimeAgo: "2 days ago",
    category: "Research",
    replies: 0, 
    views: 0,
    tags: ["Research", "Audio"],
    isPinned: false,
    isPrivate: true,
    reactions: []
  },
]

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

export default function MyThreadsPage() {
  const { user } = useUser()
  const router = useRouter()
  
  const [userThreads, setUserThreads] = useState(MOCK_USER_THREADS)
  const [editingThread, setEditingThread] = useState<number | null>(null)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTags, setEditTags] = useState<string[]>([])
  const [editIsPrivate, setEditIsPrivate] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!user) {
      router.push('/login?returnUrl=/forum/my-threads')
    }
  }, [user, router])
  
  // Function to open the edit dialog for a thread
  const handleEditThread = (threadId: number) => {
    const thread = userThreads.find(t => t.id === threadId)
    if (thread) {
      setEditingThread(threadId)
      setEditTitle(thread.title)
      setEditContent(thread.content)
      setEditTags(thread.tags)
      setEditIsPrivate(thread.isPrivate)
      setEditFormOpen(true)
    }
  }
  
  // Function to handle thread update submission
  const handleUpdateThread = async () => {
    // Validate the form
    if (!editTitle.trim()) {
      setErrorMessage("Please enter a title for your thread.")
      return
    }
    
    if (!editContent.trim()) {
      setErrorMessage("Please enter content for your thread.")
      return
    }
    
    if (editTags.length === 0) {
      setErrorMessage("Please select at least one topic.")
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage("")
    
    try {
      // Placeholder for actual API call
      // await api.updateThread(editingThread, { title: editTitle, content: editContent, tags: editTags, isPrivate: editIsPrivate })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state to reflect changes
      setUserThreads(prev => prev.map(thread => 
        thread.id === editingThread 
          ? {
              ...thread,
              title: editTitle,
              content: editContent,
              tags: editTags,
              isPrivate: editIsPrivate
            }
          : thread
      ))
      
      // Close edit form and reset state
      setEditFormOpen(false)
      setEditingThread(null)
    } catch (error) {
      console.error("Error updating thread:", error)
      setErrorMessage("An error occurred while updating your thread. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Function to handle thread deletion
  const handleDeleteThread = async (threadId: number) => {
    try {
      // Placeholder for actual API call
      // await api.deleteThread(threadId)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove deleted thread from the list
      setUserThreads(prev => prev.filter(thread => thread.id !== threadId))
    } catch (error) {
      console.error("Error deleting thread:", error)
      alert("An error occurred while deleting the thread. Please try again.")
    }
  }
  
  // Function to handle tag selection in the edit form
  const handleTagSelection = (tag: string) => {
    setEditTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your threads.</p>
            <Link href="/login?returnUrl=/forum/my-threads" passHref>
              <Button>Log In</Button>
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
          <ForumBreadcrumb 
            items={[
              { label: "My Threads" }
            ]} 
          />
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">My Threads</h1>
              <p className="text-muted-foreground mt-2">
                View, edit, and manage all threads you've created
              </p>
            </div>
            
            <Link href="/forum/thread/new" passHref>
              <Button className="flex items-center gap-2">
                Create New Thread
              </Button>
            </Link>
          </div>
          
          {/* Thread list */}
          {userThreads.length > 0 ? (
            <div className="space-y-4">
              {userThreads.map(thread => (
                <Card key={thread.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Thread content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {thread.category}
                          </Badge>
                          
                          {thread.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                          
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar size={12} className="mr-1" />
                            Created {thread.timeAgo}
                          </span>
                          
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock size={12} className="mr-1" />
                            Last active {thread.lastActiveTimeAgo}
                          </span>
                        </div>
                        
                        <Link href={`/forum/thread/${thread.id}`} passHref>
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
                            {thread.title}
                          </h3>
                        </Link>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {thread.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex flex-wrap gap-2">
                            {thread.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-3 text-xs text-muted-foreground ml-auto">
                            <div className="flex items-center">
                              <MessageSquare size={14} className="mr-1" />
                              {thread.replies} replies
                            </div>
                            <div className="flex items-center">
                              <Eye size={14} className="mr-1" />
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
                      
                      {/* Thread actions */}
                      <div className="flex md:flex-col gap-3 justify-end items-end">
                        <Dialog 
                          open={editFormOpen && editingThread === thread.id} 
                          onOpenChange={(open) => {
                            setEditFormOpen(open);
                            if (!open) setEditingThread(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => handleEditThread(thread.id)}
                            >
                              <Edit size={14} />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Thread</DialogTitle>
                              <DialogDescription>
                                Make changes to your thread. All fields are required.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 my-2">
                              <div>
                                <Label htmlFor="edit-title">Thread Title</Label>
                                <Input 
                                  id="edit-title"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Enter a descriptive title"
                                  className="mt-1"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-content">Thread Content</Label>
                                <Textarea 
                                  id="edit-content"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  placeholder="Describe your topic in detail..."
                                  className="mt-1 min-h-[150px]"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label className="block mb-2">Select Topics</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md">
                                  {MOCK_TOPICS.map(topic => (
                                    <div key={topic.id} className="flex items-start space-x-2">
                                      <Checkbox 
                                        id={`topic-${topic.id}`}
                                        checked={editTags.includes(topic.name)}
                                        onCheckedChange={() => handleTagSelection(topic.name)}
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
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="is-private"
                                  checked={editIsPrivate}
                                  onCheckedChange={(checked) => setEditIsPrivate(!!checked)}
                                />
                                <Label htmlFor="is-private">Make this thread private (only visible to you)</Label>
                              </div>
                              
                              {errorMessage && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center">
                                  <AlertCircle size={16} className="mr-2" />
                                  {errorMessage}
                                </div>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditFormOpen(false);
                                  setEditingThread(null);
                                }}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateThread}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your thread 
                                "{thread.title}" and all associated replies.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDeleteThread(thread.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Threads Found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't created any threads yet. Start a discussion by creating a new thread.
              </p>
              <Link href="/forum/thread/new" passHref>
                <Button>Create Thread</Button>
              </Link>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  )
} 