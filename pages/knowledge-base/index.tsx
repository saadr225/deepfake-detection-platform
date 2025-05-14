import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import { Input } from "../../components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "../../components/ui/pagination";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Search, Bookmark, FileText, CheckCircle2, AlertCircle, Calendar, Clock, Eye } from "lucide-react";
import KnowledgeBaseBreadcrumb from "../../components/KnowledgeBaseBreadcrumb";
import axios from "axios";

// API base URL
const API_BASE_URL = "http://127.0.0.1:8000";

// Types for API responses
interface Author {
  username: string;
  avatar: string;
  is_verified: boolean;
}

interface Topic {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  article_count: number;
}

interface Article {
  id: number;
  title: string;
  author: Author;
  created_at: string;
  topic: Topic;
  preview: string;
  view_count: number;
  has_attachments: boolean;
  read_time?: number;
  banner_image?: string;
}

interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  page: number;
  pages: number;
  total: number;
  code: string;
}

interface TopicsResponse {
  success: boolean;
  topics: Topic[];
  code: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

// Sorting options type
type SortOption = "Most Recent" | "Most Viewed" | "A-Z";

export default function KnowledgeBase() {
  const router = useRouter();
  const { topic: topicFromUrl, page: pageFromUrl } = router.query;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [sortedArticles, setSortedArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("Most Recent");
  const [placeholderImage, setPlaceholderImage] = useState('/placeholder.png');
  
  const itemsPerPage = 10;

  // Load placeholder image once to prevent multiple requests
  useEffect(() => {
    // Create a new Image object to preload the placeholder
    const img = new Image();
    img.src = '/placeholder.png';
    
    // Once the placeholder is loaded, we can use it without generating new requests
    img.onload = () => {
      setPlaceholderImage('/placeholder.png');
    };
    
    // If loading fails, use a simple color instead
    img.onerror = () => {
      console.warn('Failed to load placeholder image');
      setPlaceholderImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==');
    };
  }, []);

  // Fetch topics on initial load
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data } = await axios.get<TopicsResponse>(`${API_BASE_URL}/api/knowledge-base/topics/`);
        if (data.success) {
          setTopics(data.topics);
        } else {
          setError('Failed to load topics');
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics');
      }
    };

    fetchTopics();
  }, []);

  // Set selected topic from URL parameter
  useEffect(() => {
    if (topicFromUrl && typeof topicFromUrl === 'string') {
      const topicId = parseInt(topicFromUrl);
      if (!isNaN(topicId)) {
        setSelectedTopicId(topicId);
      }
    }
    
    if (pageFromUrl && typeof pageFromUrl === 'string') {
      const page = parseInt(pageFromUrl);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, [topicFromUrl, pageFromUrl]);

  // Fetch articles when parameters change
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          items_per_page: itemsPerPage
        };
        
        if (selectedTopicId) {
          params.topic_id = selectedTopicId;
        }
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const { data } = await axios.get<ArticlesResponse>(`${API_BASE_URL}/api/knowledge-base/articles/`, { params });
        
        if (data.success) {
          setArticles(data.articles);
          setTotalPages(data.pages);
          setTotalArticles(data.total);
        } else {
          setError('Failed to load articles');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, selectedTopicId, searchQuery]);

  // Sort articles when articles array or sort option changes
  useEffect(() => {
    if (articles.length === 0) {
      setSortedArticles([]);
      return;
    }

    let sorted = [...articles];
    
    switch (sortOption) {
      case "Most Recent":
        // Assuming created_at is a date string format
        sorted = sorted.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case "Most Viewed":
        sorted = sorted.sort((a, b) => b.view_count - a.view_count);
        break;
      case "A-Z":
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setSortedArticles(sorted);
  }, [articles, sortOption]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      router.push(`/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle topic selection
  const handleTopicClick = (topicId: number) => {
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
      router.push('/knowledge-base', undefined, { shallow: true });
    } else {
      setSelectedTopicId(topicId);
      setCurrentPage(1);
      router.push(`/knowledge-base?topic=${topicId}`, undefined, { shallow: true });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const query: { topic?: string; page?: string } = {};
    
    if (selectedTopicId) {
      query.topic = selectedTopicId.toString();
    }
    
    if (page > 1) {
      query.page = page.toString();
    }
    
    router.push({
      pathname: '/knowledge-base',
      query
    }, undefined, { shallow: true });
  };

  // Handle sort option change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTopicId(null);
    setCurrentPage(1);
    router.push('/knowledge-base', undefined, { shallow: true });
  };

  // Find selected topic name
  const selectedTopicName = selectedTopicId 
    ? topics.find(topic => topic.id === selectedTopicId)?.name 
    : null;

  return (
    <Layout>
      {/* Enhanced Header Section with Background */}
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
                <FileText className="h-4 w-4 mr-2" />
                Expert Resources & Articles
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Explore Our <span className="gradient-text">Knowledge Base</span> on Deepfake Detection
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Access comprehensive resources, expert guides, and cutting-edge research on 
              deepfake detection techniques and AI content analysis
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>{totalArticles}+ Articles & Guides</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>{topics.length} Specialized Topics</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Expert-Verified Content</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col space-y-6">
          {/* Search and Browse Section with Adjusted Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col lg:flex-row justify-between items-stretch gap-6"
          >
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Browse Resources</h2>
              <p className="text-muted-foreground mb-5">
                Filter by topic or search for specific content
              </p>
              
              {/* Search Form - Repositioned */}
              <form onSubmit={handleSearch} className="max-w-[1120px] w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-12 py-6 border-primary/20 focus:border-primary hover:border-primary/30 transition-colors shadow-sm text-base"
                  />
                  {/* <Button 
                    type="submit" 
                    size="sm" 
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-primary/90 hover:bg-primary transition-colors"
                  >
                    Search
                  </Button> */}
                </div>
              </form>
            </div>
          </motion.div>
          
          {/* Active Filters */}
          {(selectedTopicId || searchQuery) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-2 items-center"
            >
              <span className="text-sm font-medium">Active filters:</span>
              {selectedTopicName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setSelectedTopicId(null)}
                  >
                    Topic: {selectedTopicName}
                    <span className="ml-1">×</span>
                  </Badge>
                </motion.div>
              )}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    Search: {searchQuery}
                    <span className="ml-1">×</span>
                  </Badge>
                </motion.div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-sm"
              >
                Clear all
              </Button>
            </motion.div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-200" role="alert">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Posts List - Move back to left side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : articles.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted p-8 rounded-lg text-center"
                >
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    No articles match your current search criteria. Try adjusting your filters or search query.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      {totalArticles} {totalArticles === 1 ? 'Article' : 'Articles'} {selectedTopicName ? `in ${selectedTopicName}` : ''}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sort by:</span>
                      <select 
                        className="text-sm border rounded-md p-1 bg-background"
                        value={sortOption}
                        onChange={handleSortChange}
                      >
                        <option value="Most Recent">Most Recent</option>
                        <option value="Most Viewed">Most Viewed</option>
                        <option value="A-Z">A-Z</option>
                      </select>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    style={{ gap: '1.5rem' }}
                  >
                    {sortedArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (index % 3) }}
                        whileHover={{ y: -5 }}
                        className="h-full knowledge-article-card"
                      >
                        <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all">
                          <div 
                            className="relative overflow-hidden"
                            onClick={() => router.push(`/knowledge-base/post/${article.id}`)}
                            style={{ 
                              height: '200px',
                              cursor: 'pointer',
                              width: '100%',
                              borderRadius: 0,
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0
                            }}
                          >
                            {article.banner_image ? (
                              <img 
                                src={article.banner_image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 0,
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0
                                }}
                                onError={(e) => {
                                  // Use the preloaded placeholder or data URI
                                  e.currentTarget.src = placeholderImage;
                                  // Prevent further error callbacks
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center bg-primary/5"
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 0,
                                  borderTopLeftRadius: 0,
                                  borderTopRightRadius: 0
                                }}
                              >
                                <FileText className="h-12 w-12 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <Badge 
                                className="cursor-pointer"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTopicClick(article.topic.id);
                                }}
                              >
                                {article.topic.name}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="flex flex-col flex-1 p-5">
                            <div className="flex flex-wrap items-center text-xs text-muted-foreground mb-2 gap-2">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {article.created_at}
                              </span>
                              {article.read_time && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {article.read_time} min read
                                </span>
                              )}
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {article.view_count} views
                              </span>
                              {article.has_attachments && (
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Attachments
                                </span>
                              )}
                            </div>
                            
                            <h3 
                              className="text-lg font-bold mb-2 line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                              onClick={() => router.push(`/knowledge-base/post/${article.id}`)}
                            >
                              {article.title}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {article.preview}
                            </p>
                            
                            <div className="mt-auto flex items-center">
                              {article.author.avatar ? (
                                <img 
                                  src={article.author.avatar} 
                                  alt={article.author.username}
                                  className="rounded-full mr-2 border border-border"
                                  style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    minWidth: '20px',
                                    minHeight: '20px',
                                    maxWidth: '20px',
                                    maxHeight: '20px',
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                  onError={(e) => {
                                    // Hide this image and show the fallback letter avatar
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) nextElement.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                style={{ 
                                  width: '20px', 
                                  height: '20px',
                                  minWidth: '20px',
                                  minHeight: '20px',
                                  maxWidth: '20px',
                                  maxHeight: '20px',
                                  display: article.author.avatar ? 'none' : 'flex',
                                  borderRadius: '50%',
                                  marginRight: '0.5rem',
                                  backgroundColor: 'hsl(var(--primary))',
                                  color: 'hsl(var(--primary-foreground))',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {article.author.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                By {article.author.username}
                                {article.author.is_verified && (
                                  <span className="text-blue-500 ml-1">✓</span>
                                )}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Pagination className="mt-8">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }).map((_, i) => {
                            // Show first page, last page, current page, and pages adjacent to current
                            if (
                              i === 0 || 
                              i === totalPages - 1 || 
                              i === currentPage - 1 || 
                              i === currentPage - 2 || 
                              i === currentPage
                            ) {
                              return (
                                <PaginationItem key={i}>
                                  <PaginationLink 
                                    href="#" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(i + 1);
                                    }}
                                    isActive={currentPage === i + 1}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            
                            // Show ellipsis if there's a gap
                            if (
                              (i === 1 && currentPage > 3) || 
                              (i === totalPages - 2 && currentPage < totalPages - 2)
                            ) {
                              return (
                                <PaginationItem key={i}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            
                            return null;
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </motion.div>
                    
                  )}
                </>
              )}
            </motion.div>
            
            {/* Sidebar with Topics - Move back to right side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                <div className="w-full bg-card rounded-xl shadow-sm border border-muted p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-primary/10 p-1.5 rounded-md mr-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </span>
                    Topics
                  </h3>
                  {topics.length === 0 && !error ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                      {topics.map((topic) => (
                        <div 
                          key={topic.id}
                          onClick={() => handleTopicClick(topic.id)}
                          className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                            selectedTopicId === topic.id 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'hover:bg-muted/60 hover:shadow-sm'
                          }`}
                        >
                          <span className="font-medium">{topic.name}</span>
                          <Badge 
                            variant={selectedTopicId === topic.id ? "secondary" : "outline"} 
                            className="ml-auto"
                          >
                            {topic.article_count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 