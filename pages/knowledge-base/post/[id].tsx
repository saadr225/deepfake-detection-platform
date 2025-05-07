import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../../components/Layout";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { 
  ArrowLeft, 
  Bookmark, 
  Calendar, 
  Clock, 
  Eye, 
  MessageSquare, 
  Share2, 
  Tag, 
  ThumbsUp,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { toast } from "../../../components/ui/use-toast";

// Mock post data
const mockPosts = [
  {
    id: "1",
    title: "Introduction to Deepfake Detection Methods",
    content: `
      <h2>Introduction</h2>
      <p>Deepfakes represent one of the most challenging threats to information integrity in the digital age. As artificial intelligence technologies advance, the ability to create convincing fake media has become increasingly accessible, raising significant concerns for privacy, security, and public trust.</p>
      
      <p>This article provides an overview of current deepfake detection methods, explaining key approaches and their effectiveness.</p>
      
      <figure class="my-8">
        <img src="/images/knowledge-base/deepfake-example.jpg" alt="Example of a deepfake detection visualization" class="rounded-lg shadow-md w-full" />
        <figcaption class="text-sm text-center mt-2 text-muted-foreground">Fig 1: Visual analysis of deepfake artifacts</figcaption>
      </figure>
      
      <h2>Visual Artifact Analysis</h2>
      <p>One of the most basic approaches to deepfake detection involves identifying visual artifacts or inconsistencies in manipulated media. Even sophisticated deepfakes often contain subtle errors that can be detected:</p>
      
      <ul>
        <li>Inconsistent blinking patterns</li>
        <li>Unnatural facial movements</li>
        <li>Lighting inconsistencies</li>
        <li>Blurring around facial boundaries</li>
        <li>Unrealistic skin texture</li>
      </ul>
      
      <figure class="my-8">
        <img src="/images/knowledge-base/facial-analysis.jpg" alt="Facial analysis for deepfake detection" class="rounded-lg shadow-md w-full" />
        <figcaption class="text-sm text-center mt-2 text-muted-foreground">Fig 2: Facial feature analysis in deepfake detection</figcaption>
      </figure>
      
      <h2>Deep Learning-Based Detection</h2>
      <p>Advanced detection systems utilize neural networks trained to identify deepfakes:</p>
      
      <ul>
        <li><strong>Convolutional Neural Networks (CNNs):</strong> These networks analyze spatial features in images to identify manipulation patterns.</li>
        <li><strong>Recurrent Neural Networks (RNNs):</strong> These are effective for analyzing temporal inconsistencies in video sequences.</li>
        <li><strong>Generative Adversarial Networks (GANs):</strong> Ironically, the same technology used to create deepfakes can be used to detect them.</li>
      </ul>
      
      <h2>Biological Signal Analysis</h2>
      <p>Humans exhibit certain biological signals that are difficult to fake convincingly:</p>
      
      <ul>
        <li><strong>Pulse detection:</strong> Analyzing subtle color changes in skin that correspond to blood flow.</li>
        <li><strong>Eye movement patterns:</strong> Natural eye movements follow specific patterns that deepfakes often fail to replicate accurately.</li>
        <li><strong>Micro-expressions:</strong> Brief facial expressions that occur involuntarily are difficult for AI to simulate perfectly.</li>
      </ul>
      
      <h2>Metadata Analysis</h2>
      <p>Digital media contains metadata that can provide clues about manipulation:</p>
      
      <ul>
        <li>Compression artifacts</li>
        <li>Noise patterns</li>
        <li>Digital fingerprints</li>
        <li>File modification history</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>As deepfake technology evolves, detection methods must continuously improve. A multi-modal approach combining various detection techniques currently offers the most robust defense against sophisticated deepfakes. Ongoing research in this field remains crucial for maintaining trust in digital media.</p>
    `,
    author: {
      name: "Dr. Emily Chen",
      avatar: "/avatars/emily-chen.jpg",
      title: "AI Research Scientist"
    },
    date: "2023-10-15",
    readTime: "8 min read",
    topic: "Deepfake Detection",
    category: "Tutorials",
    tags: ["deepfake", "detection", "machinelearning"],
    views: 1245,
    likes: 87,
    comments: 23,
    relatedPosts: [3, 6]
  },
  {
    id: "2",
    title: "AI Content Detection: Current Challenges and Solutions",
    content: `<p>This is a sample content for the second article...</p>`,
    author: {
      name: "James Wilson",
      avatar: "/avatars/james-wilson.jpg",
      title: "Digital Forensics Expert"
    },
    date: "2023-09-28",
    readTime: "12 min read",
    topic: "AI Content Detection",
    category: "Research",
    tags: ["detection", "aiethics", "machinelearning"],
    views: 980,
    likes: 65,
    comments: 18,
    relatedPosts: [4, 5]
  },
  {
    id: "3",
    title: "Media Forensics Tools for Everyday Users",
    content: `<p>This is a sample content for the third article...</p>`,
    author: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah-johnson.jpg",
      title: "Cybersecurity Analyst"
    },
    date: "2023-10-02",
    readTime: "10 min read",
    topic: "Media Forensics",
    category: "Tools",
    tags: ["forensics", "verification", "detection"],
    views: 865,
    likes: 42,
    comments: 15,
    relatedPosts: [1, 6]
  },
  {
    id: "4",
    title: "Ethical Implications of Deepfake Technology",
    content: `<p>This is a sample content for the fourth article...</p>`,
    author: {
      name: "Dr. Michael Roberts",
      avatar: "/avatars/michael-roberts.jpg",
      title: "Ethics Professor"
    },
    date: "2023-09-18",
    readTime: "15 min read",
    topic: "Ethics in AI",
    category: "Research",
    tags: ["aiethics", "deepfake", "privacy"],
    views: 1120,
    likes: 92,
    comments: 31,
    relatedPosts: [2, 5]
  },
  {
    id: "5",
    title: "Building Digital Literacy in the Age of Synthetic Media",
    content: `<p>This is a sample content for the fifth article...</p>`,
    author: {
      name: "Lisa Thompson",
      avatar: "/avatars/lisa-thompson.jpg",
      title: "Media Education Specialist"
    },
    date: "2023-10-10",
    readTime: "9 min read",
    topic: "Digital Media Literacy",
    category: "Best Practices",
    tags: ["disinformation", "verification", "privacy"],
    views: 735,
    likes: 56,
    comments: 12,
    relatedPosts: [2, 4]
  },
  {
    id: "6",
    title: "Advanced Techniques in Voice Deepfake Detection",
    content: `<p>This is a sample content for the sixth article...</p>`,
    author: {
      name: "Dr. Emily Chen",
      avatar: "/avatars/emily-chen.jpg",
      title: "AI Research Scientist"
    },
    date: "2023-10-08",
    readTime: "11 min read",
    topic: "Deepfake Detection",
    category: "Research",
    tags: ["deepfake", "detection", "forensics"],
    views: 890,
    likes: 64,
    comments: 19,
    relatedPosts: [1, 3]
  }
];

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("article");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  // Create refs for DOM elements we'll focus
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Simulating API call to fetch post details
      setTimeout(() => {
        const foundPost = mockPosts.find(p => p.id === id);
        if (foundPost) {
          setPost(foundPost);
          setLikes(foundPost.likes);
          
          // Fetch related posts
          const related = mockPosts.filter(p => 
            foundPost.relatedPosts.includes(parseInt(p.id))
          );
          setRelatedPosts(related);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  useEffect(() => {
    // Set the post URL for sharing
    if (typeof window !== 'undefined') {
      setPostUrl(window.location.href);
    }
  }, [id]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShareModalOpen(false);
      }
    };
    
    if (shareModalOpen) {
      document.addEventListener('keydown', handleEsc);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the close button for accessibility
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [shareModalOpen]);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShareModalOpen(false);
      }
    };
    
    if (shareModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shareModalOpen]);

  // Function to share on social media
  const shareOnSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(post?.title || 'Check out this article');
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=450');
    }
    
    // Close the modal
    setShareModalOpen(false);
  };

  // Function to copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      })
      .finally(() => {
        // Always close the modal regardless of success/failure
        setShareModalOpen(false);
      });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/knowledge-base")}>
              Back to Knowledge Base
            </Button>
          </motion.div>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-9"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 pl-0 hover:bg-transparent"
              onClick={() => router.push("/knowledge-base")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Knowledge Base
            </Button>
            
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex justify-between items-start mb-6"
                >
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Badge className="mb-3">{post.category}</Badge>
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-3xl md:text-4xl font-bold mb-4"
                    >
                      {post.title}
                    </motion.h1>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        {post.views} views
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        {post.comments} comments
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-center space-x-2"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                    
                    {/* Share button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Share this article"
                      onClick={() => setShareModalOpen(true)}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center space-x-4 mb-8 pb-6 border-b"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xl font-semibold bg-primary text-primary-foreground">
                      {post.author.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.author.title}</div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                      <TabsTrigger value="article">Article</TabsTrigger>
                      <TabsTrigger value="comments">{`Comments (${post?.comments})`}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="article" className="mt-6">
                      <div 
                        className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-3xl prose-h1:lg:text-4xl prose-h2:text-2xl prose-h2:lg:text-3xl prose-h3:text-xl prose-h3:lg:text-2xl prose-h4:text-lg prose-h4:lg:text-xl prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-img:mx-auto"
                        dangerouslySetInnerHTML={{ __html: post?.content }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="comments" className="mt-6">
                      <div className="bg-muted p-8 rounded-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">Comments coming soon</h3>
                        <p className="text-muted-foreground">
                          The comments feature is under development and will be available soon.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="border-t pt-6 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setLikes(likes + 1)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Like</span>
                        <Badge variant="secondary">{likes}</Badge>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => setActiveTab("comments")}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Comment</span>
                        <Badge variant="secondary">{post?.comments}</Badge>
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {post?.tags.map((tag: string, i: number) => (
                        <Badge 
                          key={i} 
                          variant="outline"
                          className="cursor-pointer flex items-center"
                          onClick={() => router.push(`/knowledge-base?tag=${encodeURIComponent(tag)}`)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.article>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="sticky top-24">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-lg font-semibold mb-4"
              >
                Related Articles
              </motion.h3>
              
              {relatedPosts.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-4"
                >
                  {relatedPosts.map((related, index) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <h4 className="font-medium mb-2 hover:text-primary cursor-pointer" onClick={() => router.push(`/knowledge-base/post/${related.id}`)}>
                            {related.title}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{related.date}</span>
                            <span className="mx-1">•</span>
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{related.readTime}</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="text-muted-foreground text-sm"
                >
                  No related articles found.
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.7 + (i * 0.05) }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge 
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => router.push(`/knowledge-base?tag=${encodeURIComponent(tag)}`)}
                      >
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                  <Badge 
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => router.push("/knowledge-base?tag=verification")}
                  >
                    verification
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => router.push("/knowledge-base?tag=disinformation")}
                  >
                    disinformation
                  </Badge>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Custom Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
              onClick={() => setShareModalOpen(false)}
            >
              {/* Modal */}
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md mx-auto bg-background p-6 shadow-lg rounded-lg border"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing when clicking the modal itself
              >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                  <h3 className="text-lg font-semibold leading-none tracking-tight">Share this article</h3>
                  <p className="text-sm text-muted-foreground">
                    Share this article with your friends and colleagues on social media
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-4 py-4">
                  <button 
                    className="rounded-full h-12 w-12 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 flex items-center justify-center"
                    onClick={() => shareOnSocial('facebook')}
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Share on Facebook</span>
                  </button>
                  <button 
                    className="rounded-full h-12 w-12 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 flex items-center justify-center"
                    onClick={() => shareOnSocial('twitter')}
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Share on Twitter</span>
                  </button>
                  <button 
                    className="rounded-full h-12 w-12 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 flex items-center justify-center"
                    onClick={() => shareOnSocial('linkedin')}
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </button>
                  <button 
                    className="rounded-full h-12 w-12 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    onClick={copyToClipboard}
                  >
                    <LinkIcon className="h-5 w-5" />
                    <span className="sr-only">Copy link</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 bg-secondary p-3 rounded-md">
                  <input 
                    className="flex-1 bg-transparent outline-none text-sm"
                    value={postUrl}
                    readOnly
                  />
                  <Button 
                    size="sm" 
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                </div>
                
                <button
                  ref={closeButtonRef}
                  type="button" 
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setShareModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
} 