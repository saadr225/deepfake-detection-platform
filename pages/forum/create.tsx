"use client"

import { useState, useEffect, useRef } from "react"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/contexts/UserContext"
import { AlertCircle, ArrowLeft, Check, X, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import Cookies from "js-cookie"

// Constants
const API_URL = "http://localhost:8000"

// Type definitions
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

// Interface for thread creation response
interface ThreadCreateResponse {
  code: string;
  message: string;
  success: boolean;
  thread_id: number;
  approval_status: string;
}

export default function CreateThreadPage() {
  const { user } = useUser()
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Add state for image file and preview
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  
  // Reference for file input element
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])
  
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
  
  // Function to handle topic selection for thread creation
  const handleTopicSelection = (topicId: number) => {
    setSelectedTopic(selectedTopic === topicId ? null : topicId)
  }

  // Function to handle tag selection for thread creation
  const handleTagSelection = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    )
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
  
  // Function to handle thread submission - Update to include media file
  const handleSubmitThread = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset messages
    setErrorMessage("")
    setSuccessMessage("")
    
    if (!title.trim()) {
      setErrorMessage("Please enter a title for your thread.")
      return
    }
    
    if (!content.trim()) {
      setErrorMessage("Please enter content for your thread.")
      return
    }
    
    if (!selectedTopic) {
      setErrorMessage("Please select a topic for your thread.")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const accessToken = Cookies.get('accessToken')
      
      if (!accessToken) {
        setErrorMessage("Authentication required. Please log in.")
        setIsSubmitting(false)
        router.push('/login')
        return
      }
      
      // Create form data for the request
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      formData.append('topic_id', selectedTopic.toString())
      formData.append('is_pinned', 'false')
      
      // Add selected tags
      selectedTags.forEach(tagId => {
        formData.append('tags', tagId.toString())
      })
      
      // Add media file if available
      if (mediaFile) {
        formData.append('media_file', mediaFile)
      }
      
      // Make API request
      const response = await axios.post<ThreadCreateResponse>(
        `${API_URL}/api/forum/threads/create/`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        setSuccessMessage(response.data.message || "Forum thread created successfully and submitted for approval. Once it is approved, it will be displayed on the forum.")
        setIsSuccess(true)
        
        // Reset form
        setTitle("")
        setContent("")
        setSelectedTopic(null)
        setSelectedTags([])
        setMediaFile(null)
        setMediaPreview(null)
      } else {
        setErrorMessage(response.data.message)
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "An error occurred while creating the thread.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If the user is not logged in, we'll show a loading state until redirection happens
  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (isSuccess) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center mb-6 w-16 h-16 rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Thread Created Successfully</h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              Your forum thread has been submitted for approval. Once it is approved, it will be displayed on the forum.
            </p>
            
            <Link href="/forum" passHref>
              <Button size="lg" className="mx-auto">
                Back to Forum
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
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
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Thread</h1>
            <p className="text-muted-foreground">
              Share your knowledge or ask questions to the community
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thread Details</CardTitle>
              <CardDescription>
                Provide information about your thread
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitThread}>
                <div className="space-y-6">
                  {/* Success message */}
                  {successMessage && (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg text-sm flex items-center">
                      <Check size={16} className="mr-2" />
                      {successMessage}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="title" className="text-base">Thread Title</Label>
                    <Input 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title"
                      className="mt-1.5"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content" className="text-base">Content</Label>
                    <Textarea 
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe your topic in detail..."
                      className="mt-1.5 min-h-[250px] rounded-xl"
                      required
                    />
                  </div>
                  
                  {/* Image Upload Section */}
                  <div>
                    <Label className="text-base block mb-3">Attach Image (Optional)</Label>
                    <div className="flex flex-col gap-3">
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {mediaFile ? "Change Image" : "Upload Image"}
                        </Button>
                        
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Supported formats: JPEG, PNG, GIF, WEBP. Maximum size: 5MB.
                        </p>
                      </div>
                      
                      {/* Media preview */}
                      {mediaPreview && (
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
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base block mb-3">Select Topic (required)</Label>
                    <div className="bg-background rounded-xl p-4 border border-input">
                      {isLoadingTopics ? (
                        <div className="flex justify-center py-4">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {topics.map(topic => (
                            <div key={topic.id} className="flex items-start space-x-2">
                              <Checkbox 
                                id={`topic-${topic.id}`}
                                checked={selectedTopic === topic.id}
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
                      )}
                    </div>
                  </div>
                  
                  {/* Tags Selection */}
                  <div>
                    <Label className="text-base block mb-3">Select Tags</Label>
                    <div className="bg-background rounded-xl p-4 border border-input">
                      {isLoadingTags ? (
                        <div className="flex justify-center py-4">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <Badge 
                              key={tag.id} 
                              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => handleTagSelection(tag.id)}
                            >
                              {tag.name} ({tag.thread_count})
                              {selectedTags.includes(tag.id) && (
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
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No tags available</p>
                      )}
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {errorMessage}
                    </div>
                  )}
                
                  <div className="flex justify-end gap-3 pt-3">
                    <Link href="/forum" passHref>
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Thread"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
} 