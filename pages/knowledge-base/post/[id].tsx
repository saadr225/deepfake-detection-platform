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
  X,
  AlertCircle,
  FileText,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { toast } from "../../../components/ui/use-toast";
import axios from "axios";

// Add custom styles to ensure content doesn't overflow
const articleContentStyles = `
  .article-content {
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
  
  .article-content * {
    max-width: 100%;
    overflow-wrap: break-word;
  }
  
  .article-content pre, 
  .article-content code {
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  .article-content img, 
  .article-content video,
  .article-content iframe {
    max-width: 100%;
    height: auto;
  }
  
  .article-content table {
    display: block;
    overflow-x: auto;
    width: 100%;
  }
`;

// API base URL
const API_BASE_URL = "http://127.0.0.1:8000";

// Types for API responses
interface Author {
  username: string;
  avatar: string;
  is_verified: boolean;
  join_date: string;
}

interface Topic {
  id: number;
  name: string;
}

interface Attachment {
  id: number;
  filename: string;
  file_url: string;
  file_type: string;
}

interface RelatedArticle {
  id: number;
  title: string;
  created_at: string;
  read_time?: number;
  topic: Topic;
  banner_image?: string;
  author: string;
  preview: string;
}

interface Article {
  id: number;
  title: string;
  banner_image?: string;
  author: Author;
  created_at: string;
  updated_at: string;
  topic: Topic;
  content: string;
  read_time: number;
  view_count: number;
  attachments: Attachment[];
  related_articles: RelatedArticle[];
}

interface ArticleDetailResponse {
  success: boolean;
  article: Article;
  code: string;
}

interface ShareLinks {
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
}

interface ShareLinksResponse {
  success: boolean;
  share_links: ShareLinks;
  error?: string;
  code: string;
}

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLinks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [placeholderImage, setPlaceholderImage] = useState('/placeholder.png');
  const [showAllRelated, setShowAllRelated] = useState(false);

  // Create refs for DOM elements we'll focus
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Preload placeholder image once to prevent multiple requests
  useEffect(() => {
    // Create a new Image object to preload the placeholder
    const img = new Image();
    img.src = '/placeholder.png';
    
    // Once the placeholder is loaded, we can use it without generating new requests
    img.onload = () => {
      setPlaceholderImage('/placeholder.png');
    };
    
    // If loading fails, use a simple data URI instead
    img.onerror = () => {
      console.warn('Failed to load placeholder image');
      setPlaceholderImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==');
    };
  }, []);

  // Fetch article details when id is available
  useEffect(() => {
    if (id && typeof id === 'string') {
      setIsLoading(true);
      setError(null);
      
      const fetchArticle = async () => {
        try {
          const { data } = await axios.get<ArticleDetailResponse>(`${API_BASE_URL}/api/knowledge-base/articles/${id}/`);
          
          if (data.success) {
            setArticle(data.article);
          } else {
            setError('Failed to load article');
          }
        } catch (err) {
          console.error('Error fetching article:', err);
          setError('Failed to load article');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchArticle();
    }
  }, [id]);

  // Fetch share links when article is loaded
  useEffect(() => {
    if (article && typeof id === 'string') {
      const fetchShareLinks = async () => {
        try {
          const { data } = await axios.get<ShareLinksResponse>(`${API_BASE_URL}/api/knowledge-base/articles/${id}/share/`);
          
          if (data.success) {
            setShareLinks(data.share_links);
          } else {
            console.error('Failed to fetch share links:', data.error);
            setShareLinks(null);
          }
        } catch (err) {
          console.error('Error fetching share links:', err);
          setShareLinks(null);
        }
      };
      
      fetchShareLinks();
    }
  }, [article, id]);

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

  // Reset states when modal is opened
  useEffect(() => {
    if (shareModalOpen) {
      setCopySuccess(false);
      setShareError(null);
    }
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
    if (!shareLinks) {
      setShareError('Unable to share - the sharing service is currently unavailable');
      return;
    }
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = shareLinks.facebook;
        break;
      case 'twitter':
        shareUrl = shareLinks.twitter;
        break;
      case 'linkedin':
        shareUrl = shareLinks.linkedin;
        break;
      case 'email':
        shareUrl = shareLinks.email;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      try {
        if (platform === 'email') {
          window.location.href = shareUrl;
        } else {
      window.open(shareUrl, '_blank', 'width=600,height=450');
    }
    // Close the modal
    setShareModalOpen(false);
      } catch (err) {
        console.error(`Error sharing to ${platform}:`, err);
        setShareError(`Failed to share to ${platform}. Please try again.`);
      }
    } else {
      setShareError(`Share links are not properly configured. Please try again later.`);
    }
  };

  // Function to copy link to clipboard
  const copyToClipboard = () => {
    if (!article) return;
    
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/knowledge-base/post/${article.id}`
      : '';
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess(true);
        // Keep the modal open so user can see the success message
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  // Render loading state
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

  // Render error state
  if (error) {
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
            className="flex items-center p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-200" role="alert"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </motion.div>
          <Button onClick={() => router.push("/knowledge-base")}>
            Back to Knowledge Base
          </Button>
        </motion.div>
      </Layout>
    );
  }

  // Render 404 state
  if (!article) {
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
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
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
      {/* Add style tag for custom styles */}
      <style jsx global>{articleContentStyles}</style>
      
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
              size="lg" 
              className="mb-4 pl-0 hover:bg-transparent"
              onClick={() => router.push("/knowledge-base")}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Knowledge Base
            </Button>
            
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card rounded-lg shadow-sm overflow-hidden"
            >
              {article.banner_image && (
                <div className="w-full h-96 md:h-[30rem] bg-gray-100 relative overflow-hidden">
                  <img 
                    src={article.banner_image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
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
                      <Badge 
                        className="mb-3 cursor-pointer"
                        onClick={() => router.push(`/knowledge-base?topic=${article.topic.id}`)}
                      >
                        {article.topic.name}
                      </Badge>
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-3xl md:text-4xl font-bold mb-4"
                    >
                      {article.title}
                    </motion.h1>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {article.created_at}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {article.read_time} min read
                      </div>
                      <div className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        {article.view_count} views
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex items-center space-x-2"
                  >
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
                    {article.author.avatar ? (
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-semibold bg-primary text-primary-foreground">
                        {article.author.username.charAt(0).toUpperCase()}
                    </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {article.author.username}
                      </h3>
                      {article.author.is_verified && (
                        <span className="text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Joined {article.author.join_date}</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="prose prose-lg dark:prose-invert max-w-none overflow-hidden break-words article-content"
                  style={{ 
                    width: '100%', 
                    wordWrap: 'break-word', 
                    overflowWrap: 'break-word' 
                  }}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Attachments */}
                {article.attachments && article.attachments.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-10 pt-6 border-t"
                  >
                    <h3 className="text-xl font-bold mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {article.attachments.map((attachment) => (
                        <a 
                          key={attachment.id}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-md border hover:bg-muted transition-colors"
                        >
                          <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                          <div className="truncate flex-1">
                            <p className="font-medium truncate">{attachment.filename}</p>
                            <p className="text-xs text-muted-foreground uppercase">{attachment.file_type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.article>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="sticky top-24 space-y-6">
              {/* Related Articles */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                  
                  {article.related_articles && article.related_articles.length > 0 ? (
                    <div className="space-y-6">
                      {showAllRelated ? (
                        <>
                          {article.related_articles.map(related => (
                            <div 
                              key={related.id}
                              className="border-b pb-4 last:border-0 last:pb-0"
                            >
                              <div 
                                className="relative h-40 mb-3 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => router.push(`/knowledge-base/post/${related.id}`)}
                              >
                                {related.banner_image ? (
                                  <img 
                                    src={related.banner_image}
                                    alt={related.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                    onError={(e) => {
                                      // Use the preloaded placeholder
                                      (e.target as HTMLImageElement).src = placeholderImage;
                                      // Prevent further error callbacks
                                      (e.target as HTMLImageElement).onerror = null;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                    <FileText className="h-12 w-12 text-primary/40" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2">
                                  <Badge 
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/knowledge-base?topic=${related.topic.id}`);
                                    }}
                                  >
                                    {related.topic.name}
                                  </Badge>
                                </div>
                              </div>
                              
                              <h4 
                                className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer line-clamp-2 mb-2"
                                onClick={() => router.push(`/knowledge-base/post/${related.id}`)}
                              >
                            {related.title}
                          </h4>
                              
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {related.preview}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>By {related.author}</span>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {related.created_at}
                                </div>
                          </div>
                        </div>
                          ))}
                          {article.related_articles.length > 2 && (
                            <div className="text-center py-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowAllRelated(false)}
                              >
                                See Less
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {article.related_articles.slice(0, 2).map(related => (
                            <div 
                              key={related.id}
                              className="border-b pb-6 last:border-0 last:pb-0"
                            >
                              <div 
                                className="relative h-40 mb-3 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => router.push(`/knowledge-base/post/${related.id}`)}
                              >
                                {related.banner_image ? (
                                  <img 
                                    src={related.banner_image}
                                    alt={related.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                    onError={(e) => {
                                      // Use the preloaded placeholder
                                      (e.target as HTMLImageElement).src = placeholderImage;
                                      // Prevent further error callbacks
                                      (e.target as HTMLImageElement).onerror = null;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                    <FileText className="h-12 w-12 text-primary/40" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2">
                      <Badge 
                                    variant="secondary"
                        className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/knowledge-base?topic=${related.topic.id}`);
                                    }}
                      >
                                    {related.topic.name}
                      </Badge>
                                </div>
                              </div>
                              
                              <h4 
                                className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer line-clamp-2 mb-2"
                                onClick={() => router.push(`/knowledge-base/post/${related.id}`)}
                              >
                                {related.title}
                              </h4>
                              
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                {related.preview}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>By {related.author}</span>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {related.created_at}
                                </div>
                              </div>
                            </div>
                          ))}
                          {article.related_articles.length > 2 && (
                            <div className="text-center py-4">
                              <Button 
                    variant="outline"
                                size="sm" 
                                className="w-full"
                                onClick={() => setShowAllRelated(true)}
                              >
                                See More ({article.related_articles.length - 2} more)
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="mb-4 flex justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground/60" />
                      </div>
                      <h4 className="text-base font-medium mb-2">No Related Articles</h4>
                      <p className="text-sm text-muted-foreground">
                        There are no related articles available for this topic yet.
                      </p>
                      <Button 
                    variant="outline"
                        size="sm" 
                        className="mt-4"
                        onClick={() => router.push('/knowledge-base')}
                      >
                        Browse Knowledge Base
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share this article</h3>
                <button
                  ref={closeButtonRef}
                  onClick={() => setShareModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                </div>
              
              {/* Copy Success Message */}
              {copySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md flex items-center"
                >
                  <Check className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  <span>Link copied to clipboard!</span>
                </motion.div>
              )}
              
              {/* Share Error Message */}
              {shareError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md flex items-center"
                >
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  <span>{shareError}</span>
                </motion.div>
              )}
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={() => shareOnSocial('twitter')}
                >
                  <Twitter className="h-5 w-5" /> 
                  Twitter
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                    onClick={() => shareOnSocial('facebook')}
                  >
                    <Facebook className="h-5 w-5" />
                  Facebook
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                    onClick={() => shareOnSocial('linkedin')}
                  >
                    <Linkedin className="h-5 w-5" />
                  LinkedIn
                </Button>
                
                  <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={() => shareOnSocial('email')}
                  >
                  <MessageSquare className="h-5 w-5" /> 
                  Email
                  </Button>
                </div>
                
              <div className="flex flex-col space-y-4">
                <div className="flex bg-muted p-2 rounded-md items-center">
                  <span className="truncate flex-1 pl-2 text-sm">
                    {typeof window !== 'undefined' 
                      ? `${window.location.origin}/knowledge-base/post/${article.id}`
                      : ''}
                  </span>
                </div>
                <Button 
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={copyToClipboard}
                >
                  <LinkIcon className="h-5 w-5" /> 
                  Copy Link
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-center text-muted-foreground">
                <p>Share this article with your colleagues and friends</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
} 