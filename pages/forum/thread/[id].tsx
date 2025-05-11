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
import axios from "axios"
import Cookies from "js-cookie"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Type definitions
interface Author {
  username: string;
  avatar: string;
  joinDate: string;
  postCount?: number;
  isVerified: boolean;
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
  created_at: string;
  updated_at?: string;
  timeAgo: string;
  replies?: ThreadReply[];
  likes: number;
  dislikes: number;
  net_count: number;
  reactions: Reaction[];
  user_liked: boolean;
  user_disliked: boolean;
  media: {
    url: string | null;
    type: string | null;
  } | null;
  is_solution: boolean;
}

interface ThreadData {
  id: number;
  title: string;
  content: string;
  author: Author;
  date: string;
  timeAgo: string;
  views: number;
  likes: number;
  dislikes: number;
  net_count: number;
  tags: string[];
  tagIds?: number[]; // Add optional tagIds for editing
  status: string;
  reactions: Reaction[];
  created_at: string;
  updated_at?: string;
  last_active: string;
  approval_status: string;
  is_pinned: boolean;
  is_locked: boolean;
  topic: {
    id: number;
    name: string;
    description: string;
    icon: string | null;
  };
  media: {
    url: string | null;
    type: string | null;
  } | null;
  replies: ThreadReply[];
  reply_count: number;
  user_liked: boolean;
  user_disliked: boolean;
}

// Constants
const API_URL = "http://localhost:8000"

interface ThreadDetailResponse {
  status: string;
  code: string;
  message: string;
  data: ThreadData;
}

interface VoteResponse {
  code: string;
  message: string;
  success: boolean;
  action: "added" | "removed" | "changed";
  like_type: "like" | "dislike";
  net_count: number;
}

interface TopicsResponse {
  code: string;
  message: string;
  success: boolean;
  topics: Topic[];
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

interface Tag {
  id: number;
  name: string;
  thread_count: number;
}

// Add a recursive component to render replies and their nested replies
const ReplyItem = ({ 
  reply, 
  level = 0, 
  user, 
  handleVote, 
  toggleReactionPicker, 
  showReactionPicker, 
  availableReactions, 
  hasUserReacted, 
  handleAddReaction, 
  replyTo, 
  replyToMain, 
  handleReplyToComment, 
  inlineReplyContent, 
  setInlineReplyContent, 
  cancelReplyToComment, 
  handleSubmitReply, 
  isSubmitting, 
  errorMessage,
  editingReplyId, 
  handleEditReply,
  editReplyContent, 
  setEditReplyContent,
  submitEditReply,
  cancelEditReply, 
  isEditingReply,
  deleteConfirmReplyId,
  confirmDeleteReply,
  cancelDeleteReply,
  deleteReply,
  isDeletingReply,
  inlineMediaFile,
  inlineMediaPreview,
  inlineFileInputRef,
  handleInlineFileUpload,
  removeInlineMedia
}: { 
  reply: ThreadReply; 
  level?: number; 
  user: UserData | null;
  handleVote: (type: 'thread' | 'reply', id: number, isUpvote: boolean) => void;
  toggleReactionPicker: (type: 'thread' | 'reply', id: number) => void;
  showReactionPicker: { type: 'thread' | 'reply'; id: number } | null;
  availableReactions: { emoji: string; name: string }[];
  hasUserReacted: (reactions: Reaction[] | undefined, emoji: string) => boolean;
  handleAddReaction: (type: 'thread' | 'reply', id: number, emoji: string) => void;
  replyTo: number | null;
  replyToMain: boolean;
  handleReplyToComment: (replyId: number) => void;
  inlineReplyContent: string;
  setInlineReplyContent: (content: string) => void;
  cancelReplyToComment: () => void;
  handleSubmitReply: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMessage: string;
  editingReplyId: number | null;
  handleEditReply: (replyId: number, content: string) => void;
  editReplyContent: string;
  setEditReplyContent: (content: string) => void;
  submitEditReply: () => void;
  cancelEditReply: () => void;
  isEditingReply: boolean;
  deleteConfirmReplyId: number | null;
  confirmDeleteReply: (replyId: number) => void;
  cancelDeleteReply: () => void;
  deleteReply: (replyId: number) => void;
  isDeletingReply: boolean;
  inlineMediaFile: File | null;
  inlineMediaPreview: string | null;
  inlineFileInputRef: React.RefObject<HTMLInputElement>;
  handleInlineFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeInlineMedia: () => void;
}) => {
  const isNested = level > 0;
  const isEditing = editingReplyId === reply.id;
  const isConfirmingDelete = deleteConfirmReplyId === reply.id;
  const isCurrentUserAuthor = user?.username === reply.author.username;
  
  return (
    <div className={`mb-3 ${isNested ? 'pl-4 sm:pl-8' : ''} ${level > 0 ? 'relative' : ''}`}>
      {/* Connection Line for nested replies */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-[1px] bg-border"
          style={{ 
            top: '0',
            bottom: '0', 
            left: '10px'
          }}
        ></div>
      )}
      
      {/* Horizontal connection line */}
      {level > 0 && (
        <div 
          className="absolute left-0 top-8 w-[10px] h-[1px] bg-border"
          style={{ 
            left: '10px'
          }}
        ></div>
      )}
      
      {/* Main reply */}
      <div className="flex gap-3 bg-card rounded-xl shadow-sm overflow-hidden">
        {/* Voting buttons */}
        <div className="flex flex-col items-center justify-start bg-muted/30 py-3 px-2">
          <Button 
            variant="ghost" 
            size="sm"
            className={`h-6 w-6 p-0 ${
              reply.user_liked 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-transparent"
            }`}
            onClick={() => handleVote('reply', reply.id, true)}
          >
            <ArrowUp size={16} />
          </Button>
          <span className="text-xs font-medium my-0.5">{reply.net_count}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className={`h-6 w-6 p-0 ${
              reply.user_disliked 
                ? "text-destructive bg-destructive/10" 
                : "text-muted-foreground hover:text-destructive hover:bg-transparent"
            }`}
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
            <span className="ml-1">• {reply.timeAgo}</span>
            {reply.updated_at && reply.updated_at !== reply.created_at && (
              <span className="ml-1">(edited)</span>
            )}
          </div>
          
          {isEditing ? (
            <div className="mb-3">
              <Textarea 
                value={editReplyContent}
                onChange={(e) => setEditReplyContent(e.target.value)}
                className="min-h-[100px] rounded-xl mb-3 text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={cancelEditReply}
                  disabled={isEditingReply}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  size="sm"
                  onClick={submitEditReply}
                  disabled={!editReplyContent.trim() || isEditingReply}
                >
                  {isEditingReply ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : isConfirmingDelete ? (
            <div className="bg-destructive/10 p-3 rounded-lg mb-3">
              <p className="text-sm text-destructive mb-3">Are you sure you want to delete this reply? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={cancelDeleteReply}
                  disabled={isDeletingReply}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteReply(reply.id)}
                  disabled={isDeletingReply}
                >
                  {isDeletingReply ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
              {reply.content}
            </div>
          )}
          
          {/* Display media if any */}
          {reply.media && reply.media.url && !isEditing && !isConfirmingDelete && (
            <div className="mb-4">
              <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                <Image 
                  src={reply.media.url} 
                  alt="Attached media"
                  width={400}
                  height={300}
                  className="object-contain w-full"
                />
              </div>
            </div>
          )}
          
          {!isEditing && !isConfirmingDelete && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                    onClick={() => handleReplyToComment(reply.id)}
                  >
                    <CornerUpRight className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  
                  {/* Edit/Delete buttons (only visible to author) */}
                  {isCurrentUserAuthor && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                        onClick={() => handleEditReply(reply.id, reply.content)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 flex items-center"
                        onClick={() => confirmDeleteReply(reply.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </Button>
                    </>
                  )}
                </>
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
                  <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-card border border-border rounded-lg shadow-lg z-10 w-[350px]">
                    <div className="flex flex-wrap gap-1.5">
                      {availableReactions.map(reaction => (
                        <button 
                          key={reaction.emoji}
                          className={`text-sm p-1.5 rounded-full transition-all hover:bg-accent ${
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
              
              {/* Display Reactions */}
              {reply.reactions && reply.reactions.length > 0 && (
                <div className="ml-auto flex flex-wrap gap-1">
                  {reply.reactions.map(reaction => (
                    <motion.button
                      key={reaction.emoji}
                      className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        hasUserReacted(reply.reactions, reaction.emoji) 
                          ? 'bg-accent border-primary/30' 
                          : 'bg-background border-border hover:bg-accent/50'
                      }`}
                      onClick={() => handleAddReaction('reply', reply.id, reaction.emoji)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-xs font-medium">{reaction.count}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Inline reply form */}
      {replyTo === reply.id && !replyToMain && (
        <div className="ml-8 mt-3 bg-card border border-border rounded-xl p-3">
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
              <Textarea 
                placeholder={`Replying to ${reply.author.username}...`}
                className="min-h-[80px] rounded-xl mb-3 text-sm"
                value={inlineReplyContent}
                onChange={(e) => setInlineReplyContent(e.target.value)}
              />
              
              {/* Media upload preview for inline reply */}
              {inlineMediaPreview && (
                <div className="relative rounded-lg overflow-hidden border border-border max-w-md mb-3">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    onClick={removeInlineMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Image 
                    src={inlineMediaPreview} 
                    alt="Media preview"
                    width={400}
                    height={300}
                    className="object-contain w-full"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => inlineFileInputRef.current?.click()}
                    className="flex items-center gap-1"
                  >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {inlineMediaFile ? "Change" : "Attach Image"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={cancelReplyToComment}
                  >
                    Cancel
                  </Button>
                  
                  {/* Hidden file input for inline replies */}
                  <input
                    type="file"
                    ref={inlineFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleInlineFileUpload}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitReply}
                  disabled={!inlineReplyContent.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </Button>
              </div>
              
              {errorMessage && !replyToMain && (
                <div className="bg-destructive/10 text-destructive p-2 rounded-lg text-xs flex items-center mt-2">
                  <AlertCircle size={12} className="mr-1" />
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-2 space-y-2 relative">
          {reply.replies.map(nestedReply => (
            <ReplyItem 
              key={nestedReply.id} 
              reply={nestedReply} 
              level={level + 1}
              user={user}
              handleVote={handleVote}
              toggleReactionPicker={toggleReactionPicker}
              showReactionPicker={showReactionPicker}
              availableReactions={availableReactions}
              hasUserReacted={hasUserReacted}
              handleAddReaction={handleAddReaction}
              replyTo={replyTo}
              replyToMain={replyToMain}
              handleReplyToComment={handleReplyToComment}
              inlineReplyContent={inlineReplyContent}
              setInlineReplyContent={setInlineReplyContent}
              cancelReplyToComment={cancelReplyToComment}
              handleSubmitReply={handleSubmitReply}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              editingReplyId={editingReplyId}
              handleEditReply={handleEditReply}
              editReplyContent={editReplyContent}
              setEditReplyContent={setEditReplyContent}
              submitEditReply={submitEditReply}
              cancelEditReply={cancelEditReply}
              isEditingReply={isEditingReply}
              deleteConfirmReplyId={deleteConfirmReplyId}
              confirmDeleteReply={confirmDeleteReply}
              cancelDeleteReply={cancelDeleteReply}
              deleteReply={deleteReply}
              isDeletingReply={isDeletingReply}
              inlineMediaFile={inlineMediaFile}
              inlineMediaPreview={inlineMediaPreview}
              inlineFileInputRef={inlineFileInputRef}
              handleInlineFileUpload={handleInlineFileUpload}
              removeInlineMedia={removeInlineMedia}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [thread, setThread] = useState<ThreadData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [sortBy, setSortBy] = useState<'best' | 'top' | 'new' | 'old'>('best')
  
  // Add state for reaction UI
  const [showReactionPicker, setShowReactionPicker] = useState<{ type: 'thread' | 'reply'; id: number } | null>(null)
  const [reactionAdded, setReactionAdded] = useState<number | null>(null)
  
  // Add state for share functionality
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  
  // Add these new state variables after the existing state declarations
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")
  const [isEditingReply, setIsEditingReply] = useState(false)
  const [deleteConfirmReplyId, setDeleteConfirmReplyId] = useState<number | null>(null)
  const [isDeletingReply, setIsDeletingReply] = useState(false)
  
  // Add these new state variables for thread editing and deletion
  const [isEditingThread, setIsEditingThread] = useState(false)
  const [editThreadTitle, setEditThreadTitle] = useState("")
  const [editThreadContent, setEditThreadContent] = useState("")
  const [editThreadTags, setEditThreadTags] = useState<number[]>([])
  const [isSubmittingThreadEdit, setIsSubmittingThreadEdit] = useState(false)
  const [showDeleteThreadConfirm, setShowDeleteThreadConfirm] = useState(false)
  const [isDeletingThread, setIsDeletingThread] = useState(false)
  
  // Add state for available tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  
  // Available emoji reactions
  const availableReactions = [
    { emoji: "👍", name: "Thumbs Up" },
    { emoji: "❤️", name: "Heart" },
    { emoji: "😂", name: "Laugh" },
    { emoji: "😮", name: "Wow" },
    { emoji: "😢", name: "Sad" },
    { emoji: "😡", name: "Angry" },
    { emoji: "🔥", name: "Fire" },
    { emoji: "👏", name: "Clap" },
    { emoji: "🧠", name: "Brain" }
  ]
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Add state for inline reply media
  const [inlineMediaFile, setInlineMediaFile] = useState<File | null>(null)
  const [inlineMediaPreview, setInlineMediaPreview] = useState<string | null>(null)
  
  // Add ref for inline file input
  const inlineFileInputRef = useRef<HTMLInputElement>(null)
  
  // Fetch thread data
  useEffect(() => {
    const fetchThread = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get access token for authorization
        const accessToken = Cookies.get('accessToken');
        
        // Prepare headers with authorization if token exists
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        const response = await axios.get<ThreadDetailResponse>(
          `${API_URL}/api/forum/threads/${id}/`,
          { headers }
        );
        
        if (response.data && response.data.data) {
          setThread(response.data.data);
        } else {
          console.error("Invalid response format:", response.data);
          setErrorMessage("Failed to load thread details");
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
        setErrorMessage("An error occurred while fetching thread details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThread();
  }, [id]);

  // Fetch tags when needed for editing
  useEffect(() => {
    if (isEditingThread) {
      fetchTags();
    }
  }, [isEditingThread]);
  
  // Function to fetch tags
  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const response = await axios.get<TagsResponse>(`${API_URL}/api/forum/tags/`);
      if (response.data.success) {
        setAvailableTags(response.data.tags);
      } else {
        console.error("Failed to fetch tags:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

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
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        router.push('/login')
        setIsSubmitting(false)
        return
      }
      
      // Create form data for the request
      const formData = new FormData()
      formData.append('content', content)
      
      // Add parent reply ID if this is a nested reply
      if (!replyToMain && replyTo) {
        formData.append('parent_reply_id', String(replyTo))
      }
      
      // Add media file if available - choose the appropriate media file based on reply type
      if (replyToMain && mediaFile) {
        formData.append('media_file', mediaFile)
      } else if (!replyToMain && inlineMediaFile) {
        formData.append('media_file', inlineMediaFile)
      }
      
      // Make API request
      const response = await axios.post(
        `${API_URL}/api/forum/threads/${id}/reply/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        // Fetch the updated thread data to get the new reply structure
        const threadResponse = await axios.get(
          `${API_URL}/api/forum/threads/${id}/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        )
        
        if (threadResponse.data && threadResponse.data.data) {
          // Update thread with new data including the new reply
          setThread(threadResponse.data.data)
        } else {
          // If we can't fetch the whole thread, at least show the new reply
          // This is a fallback in case the thread fetch fails
          const newReply: ThreadReply = {
            id: response.data.reply_id,
            content: content,
            author: {
              username: user?.username || "current_user",
              avatar: user?.avatar || "/images/avatars/default.png",
              joinDate: new Date().toISOString(),
              isVerified: false
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            timeAgo: "Just now",
            likes: 0,
            dislikes: 0,
            net_count: 0,
            is_solution: false,
            media: response.data.media || null,
            reactions: [],
            user_liked: false,
            user_disliked: false,
            replies: []
          }
          
          if (thread) {
            if (replyToMain) {
              // Adding reply to main thread
              setThread({
                ...thread,
                replies: [...thread.replies, newReply],
                reply_count: thread.reply_count + 1
              })
            } else if (replyTo) {
              // Adding nested reply
              const updateReplies = (replies: ThreadReply[]): ThreadReply[] => {
                return replies.map(reply => {
                  if (reply.id === replyTo) {
                    return {
                      ...reply,
                      replies: [...(reply.replies || []), newReply]
                    }
                  }
                  
                  if (reply.replies && reply.replies.length > 0) {
                    return {
                      ...reply,
                      replies: updateReplies(reply.replies)
                    }
                  }
                  
                  return reply
                })
              }
              
              setThread({
                ...thread,
                replies: updateReplies(thread.replies),
                reply_count: thread.reply_count + 1
              })
            }
          }
        }
      
        // Reset form
        setReplyContent("")
        setInlineReplyContent("")
        setReplyTo(null)
        setReplyToMain(true)
        setMediaPreview(null)
        setMediaFile(null)
        setInlineMediaPreview(null)
        setInlineMediaFile(null)
        
        // Scroll to the new reply if needed
        // This could be implemented with useRef and scrollIntoView
      } else {
        setErrorMessage(response.data.message || "Failed to post reply")
      }
    } catch (error: any) {
      console.error("Error posting reply:", error)
      setErrorMessage(error.response?.data?.message || "An error occurred while posting your reply. Please try again.")
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
    setInlineMediaFile(null)
    setInlineMediaPreview(null)
  }
  
  // Function to handle vote
  const handleVote = async (type: 'thread' | 'reply', id: number, isUpvote: boolean) => {
    try {
      const accessToken = Cookies.get('accessToken');
      
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const endpoint = isUpvote ? `${API_URL}/api/forum/like/` : `${API_URL}/api/forum/dislike/`;
      
      const payload = type === 'thread' 
        ? { thread_id: id }
        : { reply_id: id };
      
      const response = await axios.post<VoteResponse>(
        endpoint,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        if (type === 'thread' && thread) {
          // Update thread votes in UI
          setThread({
            ...thread,
            net_count: response.data.net_count,
            user_liked: isUpvote && 
              (response.data.action === "added" || response.data.action === "changed"),
            user_disliked: !isUpvote && 
              (response.data.action === "added" || response.data.action === "changed")
          });
        } else if (thread) {
          // Update reply votes in UI
          const updateRepliesVotes = (replies: ThreadReply[]): ThreadReply[] => {
            return replies.map(reply => {
              if (reply.id === id) {
                return {
                  ...reply,
                  net_count: response.data.net_count,
                  user_liked: isUpvote && 
                    (response.data.action === "added" || response.data.action === "changed"),
                  user_disliked: !isUpvote && 
                    (response.data.action === "added" || response.data.action === "changed")
                };
              }
              
              if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateRepliesVotes(reply.replies)
                };
              }
              
              return reply;
            });
          };
          
          if (thread !== null) {
            setThread({
              ...thread,
              replies: updateRepliesVotes(thread.replies)
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error ${isUpvote ? 'liking' : 'disliking'} ${type}:`, error);
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
  const handleAddReaction = async (type: 'thread' | 'reply', id: number, emoji: string) => {
    if (!user) {
      // Prompt login if user is not logged in
      router.push('/login');
      return;
    }
    
    try {
      const accessToken = Cookies.get('accessToken');
      
      if (!accessToken) {
        router.push('/login');
        return;
      }
      
      // Prepare request data
      const payload = type === 'thread' 
        ? { reaction_type: emoji, thread_id: id }
        : { reaction_type: emoji, reply_id: id };
      
      // Make the API request
      const response = await axios.post(
        `${API_URL}/api/forum/reaction/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Hide the reaction picker
        setShowReactionPicker(null);
        
        // Update the UI
        if (type === 'thread' && thread) {
          // Fetch updated thread reactions
          const reactionsResponse = await axios.get(
            `${API_URL}/api/forum/threads/${id}/reactions/`
          );
          
          if (reactionsResponse.data) {
            const updatedThread = { ...thread };
            updatedThread.reactions = reactionsResponse.data.reaction_counts;
            setThread(updatedThread);
            
            // Visual feedback
            setReactionAdded(Date.now());
          }
        } else if (thread) {
          // Fetch updated reply reactions
          const reactionsResponse = await axios.get(
            `${API_URL}/api/forum/replies/${id}/reactions/`
          );
          
          if (reactionsResponse.data) {
            // Deep clone of thread to ensure we don't mutate state directly
            const updatedThread = JSON.parse(JSON.stringify(thread)) as ThreadData;
            
            // Recursive function to find and update the reply reactions
            const updateReplyReactions = (replies: ThreadReply[]): boolean => {
              for (let i = 0; i < replies.length; i++) {
                if (replies[i].id === id) {
                  // Update the reply with the new reactions
                  replies[i].reactions = reactionsResponse.data.reaction_counts;
                  
                  // Visual feedback
                  setReactionAdded(Date.now());
                  return true;
                }
                
                const nestedReplies = replies[i].replies;
                if (nestedReplies && nestedReplies.length > 0) {
                  if (updateReplyReactions(nestedReplies)) {
                    return true;
                  }
                }
              }
              return false;
            };
            
            if (updateReplyReactions(updatedThread.replies)) {
              setThread(updatedThread);
            }
            }
          }
        } else {
        console.error("Failed to add reaction:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  }
  
  // Function to check if current user has reacted with a specific emoji
  const hasUserReacted = (reactions: Reaction[] | undefined, emoji: string): boolean => {
    if (!user || !reactions) return false;
    
    const username = user.username || 'anonymous';
    const reaction = reactions.find(r => r.emoji === emoji);
    
    return reaction ? reaction.users.includes(username) : false;
  }
  
  // Function to handle editing a reply
  const handleEditReply = async (replyId: number, content: string) => {
    // If we're already editing a different reply, cancel that edit first
    if (editingReplyId !== null && editingReplyId !== replyId) {
      cancelEditReply()
    }
    
    // Set up the new editing state
    setEditingReplyId(replyId)
    setEditReplyContent(content)
    setIsEditingReply(false) // Make sure we start with isEditingReply set to false
    setErrorMessage("") // Clear any previous error messages
  }
  
  // Function to cancel editing a reply
  const cancelEditReply = () => {
    setEditingReplyId(null)
    setEditReplyContent("")
    setIsEditingReply(false)
    setErrorMessage("") // Clear any error messages when canceling edit
  }
  
  // Function to submit an edited reply
  const submitEditReply = async () => {
    if (!editingReplyId || !editReplyContent.trim()) return
    
    console.log("Starting edit submission, setting isEditingReply to true")
    setIsEditingReply(true)
    setErrorMessage("") // Clear any previous error messages
    
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        router.push('/login')
        setIsEditingReply(false)
        return
      }
      
      // Make API request to edit the reply
      const response = await axios.put(
        `${API_URL}/api/forum/replies/${editingReplyId}/edit/`,
        { content: editReplyContent },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log("Response received:", response.data)
      
      if (response.data.success) {
        // Update the reply in the UI
        if (thread) {
          const updateReplyContent = (replies: ThreadReply[]): ThreadReply[] => {
            return replies.map(reply => {
              if (reply.id === editingReplyId) {
                return {
                  ...reply,
                  content: editReplyContent,
                  updated_at: new Date().toISOString() // Update the timestamp
                }
              }
              
              if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateReplyContent(reply.replies)
                }
              }
              
              return reply
            })
          }
          
          setThread({
            ...thread,
            replies: updateReplyContent(thread.replies)
          })
        }
        
        // Reset edit state
        console.log("Edit successful, resetting state")
        cancelEditReply()
      } else {
        console.log("Edit failed:", response.data.message)
        setErrorMessage(response.data.message || "Failed to update reply")
      }
    } catch (error: any) {
      console.error("Error updating reply:", error)
      setErrorMessage(error.response?.data?.message || "An error occurred while updating your reply.")
    } finally {
      // Ensure the editing state is set to false regardless of success or failure
      console.log("Setting isEditingReply to false in finally block")
      setIsEditingReply(false)
    }
  }
  
  // Function to confirm delete a reply
  const confirmDeleteReply = (replyId: number) => {
    setDeleteConfirmReplyId(replyId)
  }
  
  // Function to cancel delete a reply
  const cancelDeleteReply = () => {
    setDeleteConfirmReplyId(null)
  }
  
  // Function to delete a reply
  const deleteReply = async (replyId: number) => {
    setIsDeletingReply(true)
    
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        router.push('/login')
        setIsDeletingReply(false)
        return
      }
      
      // Make API request to delete the reply
      const response = await axios.delete(
        `${API_URL}/api/forum/replies/${replyId}/delete/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      if (response.data.success) {
        // Update the UI by removing the reply
        if (thread) {
          // Function to remove the reply from the thread
          const filterDeletedReply = (replies: ThreadReply[]): ThreadReply[] => {
            // First, filter out the top-level reply if it matches
            const filteredReplies = replies.filter(reply => reply.id !== replyId)
            
            // Then, check for nested replies
            return filteredReplies.map(reply => {
              if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: filterDeletedReply(reply.replies)
                }
              }
              return reply
            })
          }
          
          setThread({
            ...thread,
            replies: filterDeletedReply(thread.replies),
            reply_count: Math.max(0, thread.reply_count - 1) // Decrement reply count
          })
        }
        
        // Reset delete confirmation
        cancelDeleteReply()
      } else {
        setErrorMessage(response.data.message || "Failed to delete reply")
      }
    } catch (error: any) {
      console.error("Error deleting reply:", error)
      setErrorMessage(error.response?.data?.message || "An error occurred while deleting the reply.")
    } finally {
      setIsDeletingReply(false)
    }
  }
  
  // Function to start editing a thread
  const handleEditThread = () => {
    if (!thread) return
    
    setEditThreadTitle(thread.title)
    setEditThreadContent(thread.content)
    // Set initial tag IDs from thread's tags if available
    if (thread.tagIds && Array.isArray(thread.tagIds)) {
      setEditThreadTags(thread.tagIds)
    } else {
      setEditThreadTags([])
    }
    setIsEditingThread(true)
  }
  
  // Function to cancel thread editing
  const cancelEditThread = () => {
    setIsEditingThread(false)
    setEditThreadTitle("")
    setEditThreadContent("")
    setEditThreadTags([])
    setErrorMessage("")
  }
  
  // Function to handle tag selection when editing thread
  const handleTagSelection = (tagId: number) => {
    setEditThreadTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
  }
  
  // Function to submit thread edit
  const submitThreadEdit = async () => {
    if (!thread || !editThreadTitle.trim() || !editThreadContent.trim()) {
      setErrorMessage("Title and content are required.")
      return
    }
    
    setIsSubmittingThreadEdit(true)
    setErrorMessage("")
    
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        router.push('/login')
        setIsSubmittingThreadEdit(false)
        return
      }
      
      // Prepare request data
      const threadData = {
        title: editThreadTitle.trim(),
        content: editThreadContent.trim(),
        tags: editThreadTags
      }
      
      // Make API request
      const response = await axios.put(
        `${API_URL}/api/forum/threads/${id}/edit/`,
        threadData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log("Thread edit response:", response.data)
      
      if (response.data.success) {
        // Update the thread data in state
        if (thread) {
          // Get tag names from availableTags
          const updatedTags = editThreadTags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? tag.name : `Tag ${tagId}`;
          });
          
          setThread({
            ...thread,
            title: editThreadTitle,
            content: editThreadContent,
            tags: updatedTags,
            tagIds: editThreadTags,
            updated_at: new Date().toISOString() // Update the timestamp
          })
        }
        
        // Exit edit mode
        setIsEditingThread(false)
        setEditThreadTitle("")
        setEditThreadContent("")
        setEditThreadTags([])
      } else {
        setErrorMessage(response.data.message || "Failed to update thread.")
      }
    } catch (error: any) {
      console.error("Error updating thread:", error)
      setErrorMessage(error.response?.data?.message || "An error occurred while updating the thread.")
    } finally {
      setIsSubmittingThreadEdit(false)
    }
  }
  
  // Function to confirm thread deletion
  const confirmDeleteThread = () => {
    setShowDeleteThreadConfirm(true)
  }
  
  // Function to cancel thread deletion
  const cancelDeleteThread = () => {
    setShowDeleteThreadConfirm(false)
  }
  
  // Function to delete a thread
  const deleteThread = async () => {
    if (!thread) return
    
    setIsDeletingThread(true)
    setErrorMessage("")
    
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        router.push('/login')
        setIsDeletingThread(false)
        return
      }
      
      // Make API request
      const response = await axios.delete(
        `${API_URL}/api/forum/threads/${id}/delete/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      console.log("Thread delete response:", response.data)
      
      if (response.data.success) {
        // Redirect to forum home after successful deletion
        router.push('/forum')
      } else {
        setErrorMessage(response.data.message || "Failed to delete thread.")
        setShowDeleteThreadConfirm(false)
      }
    } catch (error: any) {
      console.error("Error deleting thread:", error)
      setErrorMessage(error.response?.data?.message || "An error occurred while deleting the thread.")
      setShowDeleteThreadConfirm(false)
    } finally {
      setIsDeletingThread(false)
    }
  }
  
  // Add function to handle copying thread link to clipboard
  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareOptions(false);
      }, 2000);
    }).catch(err => {
      console.error("Could not copy link: ", err);
    });
  }

  // Add function to share on social media
  const shareOnSocialMedia = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(thread?.title || "Check out this thread!");
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareOptions(false);
    }
  }
  
  // Function to handle file upload for inline replies
  const handleInlineFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setInlineMediaFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setInlineMediaPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setErrorMessage("")
  }
  
  // Function to remove uploaded inline media
  const removeInlineMedia = () => {
    setInlineMediaPreview(null)
    setInlineMediaFile(null)
    if (inlineFileInputRef.current) {
      inlineFileInputRef.current.value = ""
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (!thread) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Thread Not Found</h1>
            <p className="text-muted-foreground mb-6">The thread you're looking for doesn't exist or has been removed.</p>
            <Link href="/forum" passHref>
              <Button>Return to Forum</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Find the reply that the user is responding to
  const currentReplyTo = replyTo ? thread.replies.find(r => r.id === replyTo) : null;

  // Sort replies based on selected sort option
  const sortedReplies = [...thread.replies].sort((a, b) => {
    if (sortBy === 'best') {
      // Sort by net vote count (likes - dislikes)
      return b.net_count - a.net_count;
    } else if (sortBy === 'top') {
      // Sort by total likes
      return b.likes - a.likes;
    } else if (sortBy === 'new') {
      // Sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      // Sort by date (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
                className={`h-8 w-8 p-0 ${
                  thread?.user_liked 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-transparent"
                }`}
                onClick={() => thread && handleVote('thread', thread.id, true)}
              >
                <ArrowUp size={20} />
              </Button>
              <span className="text-sm font-medium my-1">{thread?.net_count || 0}</span>
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-8 w-8 p-0 ${
                  thread?.user_disliked 
                    ? "text-destructive bg-destructive/10" 
                    : "text-muted-foreground hover:text-destructive hover:bg-transparent"
                }`}
                onClick={() => thread && handleVote('thread', thread.id, false)}
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
                      src={thread?.author.avatar || '/images/avatars/default.png'} 
                      alt={thread?.author.username || 'Author'}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-foreground">{thread?.author.username}</span>
                  {thread?.author.isVerified && (
                    <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Verified</Badge>
                  )}
                </span>
                <span className="ml-1">• {thread?.timeAgo || thread?.date}</span>
                <span className="ml-1">• {thread?.views} views</span>
                {thread?.status === 'open' && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary text-primary ml-1">
                    <Sparkles size={10} className="mr-0.5" />
                    ACTIVE
                  </Badge>
                )}
                {/* Add Edit/Delete buttons for thread author */}
                {user && thread && user.username === thread.author.username && !isEditingThread && !showDeleteThreadConfirm && (
                  <div className="ml-auto flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      onClick={handleEditThread}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs flex items-center gap-1 text-destructive"
                      onClick={confirmDeleteThread}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {isEditingThread ? (
                <div className="mb-6">
                  <div className="mb-4">
                    <Label htmlFor="thread-title" className="block mb-2 text-sm font-medium">Thread Title</Label>
                    <Input
                      id="thread-title"
                      value={editThreadTitle}
                      onChange={(e) => setEditThreadTitle(e.target.value)}
                      className="w-full mb-4"
                      placeholder="Enter thread title"
                    />
                    
                    <Label htmlFor="thread-content" className="block mb-2 text-sm font-medium">Thread Content</Label>
                    <Textarea
                      id="thread-content"
                      value={editThreadContent}
                      onChange={(e) => setEditThreadContent(e.target.value)}
                      className="w-full min-h-[200px]"
                      placeholder="Enter thread content"
                    />
                    
                    {/* Tags Selection */}
                    <div className="mt-4">
                      <Label className="block mb-2 text-sm font-medium">Tags</Label>
                      {isLoadingTags ? (
                        <div className="flex justify-center py-4">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="bg-background rounded-xl p-4 border border-input">
                          <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                              <Badge 
                                key={tag.id} 
                                variant={editThreadTags.includes(tag.id) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/20"
                                onClick={() => handleTagSelection(tag.id)}
                              >
                                {tag.name} ({tag.thread_count})
                                {editThreadTags.includes(tag.id) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="ml-1 h-4 w-4 p-0" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTagSelection(tag.id);
                                    }}
                                  >
                                    <X size={10} />
                                  </Button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center mb-4">
                      <AlertCircle size={16} className="mr-2" />
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelEditThread}
                      disabled={isSubmittingThreadEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitThreadEdit}
                      disabled={!editThreadTitle.trim() || !editThreadContent.trim() || isSubmittingThreadEdit}
                    >
                      {isSubmittingThreadEdit ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : showDeleteThreadConfirm ? (
                <div className="bg-destructive/10 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Delete Thread</h3>
                  <p className="text-sm mb-4">
                    Are you sure you want to delete this thread? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelDeleteThread}
                      disabled={isDeletingThread}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={deleteThread}
                      disabled={isDeletingThread}
                    >
                      {isDeletingThread ? "Deleting..." : "Delete Thread"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-3">{thread?.title}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread?.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                    {thread?.content.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  
                  {/* Display thread image if any */}
                  {thread?.media && thread.media.url && (
                    <div className="mb-6">
                      <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                        <Image 
                          src={thread.media.url} 
                          alt="Thread image"
                          width={600}
                          height={400}
                          className="object-contain w-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Add Thread Reactions and Stats */}
                  <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-border">
                    {/* Left side: Reply Count */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare size={16} className="mr-2" />
                      <span>{thread?.reply_count || 0} replies</span>
                    </div>
                    
                    {/* Right side: Reactions & React Button */}
                    <div className="flex items-center gap-2">
                      {/* Display Reactions */}
                      {thread?.reactions && thread.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {thread.reactions.map(reaction => (
                            <motion.button
                              key={reaction.emoji}
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 border ${
                                hasUserReacted(thread.reactions, reaction.emoji) 
                                  ? 'bg-accent border-primary/30' 
                                  : 'bg-background border-border hover:bg-accent/50'
                              }`}
                              onClick={() => thread && handleAddReaction('thread', thread.id, reaction.emoji)}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs font-medium">{reaction.count}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Reaction Button */}
                      {user && (
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                            onClick={() => thread && toggleReactionPicker('thread', thread.id)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            React
                          </Button>
                          
                          {/* Emoji Reaction Picker */}
                          {showReactionPicker && 
                           showReactionPicker.type === 'thread' && 
                           thread && showReactionPicker.id === thread.id && (
                            <div className="absolute bottom-full right-0 mb-2 p-1.5 bg-card border border-border rounded-lg shadow-lg z-10 w-[200px]">
                              <div className="flex flex-wrap gap-1.5">
                                {availableReactions.map(reaction => (
                                  <button 
                                    key={reaction.emoji}
                                    className={`text-sm p-1.5 rounded-full transition-all hover:bg-accent ${
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
                      )}
                      
                      {/* Add Share Button */}
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center"
                          onClick={() => setShowShareOptions(!showShareOptions)}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        
                        {/* Share Options Dropdown */}
                        {showShareOptions && (
                          <div className="absolute bottom-full right-0 mb-2 p-1.5 bg-card border border-border rounded-lg shadow-lg z-10 w-[200px]">
                            <div className="flex flex-col gap-1">
                              <button 
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
                                onClick={copyLinkToClipboard}
                              >
                                <LinkIcon className="h-4 w-4" />
                                {shareSuccess ? "Copied!" : "Copy Link"}
                              </button>
                              <button 
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
                                onClick={() => shareOnSocialMedia('twitter')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                </svg>
                                Twitter
                              </button>
                              <button 
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
                                onClick={() => shareOnSocialMedia('facebook')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                                Facebook
                              </button>
                              <button 
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
                                onClick={() => shareOnSocialMedia('linkedin')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                  <rect x="2" y="9" width="4" height="12"></rect>
                                  <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                                LinkedIn
                              </button>
                              <button 
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
                                onClick={() => shareOnSocialMedia('whatsapp')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                WhatsApp
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Reply form at the top */}
          {user ? (
            <Card className="bg-card mb-6" id="reply-form">
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
                      className="min-h-[80px] rounded-xl"
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
                          className="object-contain w-full"
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
              {thread.replies.reduce((total, reply) => total + 1 + (reply.replies?.length || 0), 0)} Comments
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
              <ReplyItem 
                key={reply.id} 
                reply={reply} 
                user={user}
                handleVote={handleVote}
                toggleReactionPicker={toggleReactionPicker}
                showReactionPicker={showReactionPicker}
                availableReactions={availableReactions}
                hasUserReacted={hasUserReacted}
                handleAddReaction={handleAddReaction}
                replyTo={replyTo}
                replyToMain={replyToMain}
                handleReplyToComment={handleReplyToComment}
                inlineReplyContent={inlineReplyContent}
                setInlineReplyContent={setInlineReplyContent}
                cancelReplyToComment={cancelReplyToComment}
                handleSubmitReply={handleSubmitReply}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                editingReplyId={editingReplyId}
                handleEditReply={handleEditReply}
                editReplyContent={editReplyContent}
                setEditReplyContent={setEditReplyContent}
                submitEditReply={submitEditReply}
                cancelEditReply={cancelEditReply}
                isEditingReply={isEditingReply}
                deleteConfirmReplyId={deleteConfirmReplyId}
                confirmDeleteReply={confirmDeleteReply}
                cancelDeleteReply={cancelDeleteReply}
                deleteReply={deleteReply}
                isDeletingReply={isDeletingReply}
                inlineMediaFile={inlineMediaFile}
                inlineMediaPreview={inlineMediaPreview}
                inlineFileInputRef={inlineFileInputRef}
                handleInlineFileUpload={handleInlineFileUpload}
                removeInlineMedia={removeInlineMedia}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
} 