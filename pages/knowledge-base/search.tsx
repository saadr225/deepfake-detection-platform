import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "../../components/ui/pagination";
import { Search, Bookmark, FileText, AlertCircle } from "lucide-react";
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
}

interface SearchResponse {
  success: boolean;
  articles: Article[];
  page: number;
  pages: number;
  total: number;
  code: string;
}

export default function KnowledgeBaseSearch() {
  const router = useRouter();
  const { q: queryParam, page: pageParam } = router.query;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Initialize search query and page from URL parameters
  useEffect(() => {
    if (queryParam && typeof queryParam === 'string') {
      setSearchQuery(queryParam);
    }
    
    if (pageParam && typeof pageParam === 'string') {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, [queryParam, pageParam]);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 3) {
      performSearch();
    } else if (searchQuery) {
      setError("Search query must be at least 3 characters");
      setResults([]);
    }
  }, [searchQuery, currentPage]);

  const performSearch = async () => {
      setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.get<SearchResponse>(`${API_BASE_URL}/api/knowledge-base/search/`, {
        params: {
          query: searchQuery,
          page: currentPage,
          items_per_page: itemsPerPage
        }
      });
      
      if (data.success) {
        setResults(data.articles);
        setTotalPages(data.pages);
        setTotalResults(data.total);
      } else {
        setError('Failed to search articles');
        setResults([]);
      }
    } catch (err: any) {
      console.error('Error searching articles:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
    } else {
        setError('An error occurred while searching');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      router.push({
        pathname: '/knowledge-base/search',
        query: { q: searchQuery }
      });
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push({
      pathname: '/knowledge-base/search',
      query: { 
        q: searchQuery,
        page: page > 1 ? page.toString() : undefined
      }
    }, undefined, { shallow: true });
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <KnowledgeBaseBreadcrumb 
            items={[
              { label: "Knowledge Base", href: "/knowledge-base" },
              { label: "Search", href: `/knowledge-base/search?q=${encodeURIComponent(searchQuery)}` }
            ]} 
          />
        </motion.div>
        
        <div className="flex flex-col space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">Knowledge Base Search</h1>
              <p className="text-muted-foreground mt-2">
                Search for resources, guides, and articles about deepfake detection
              </p>
            </div>
          </motion.div>
          
          {/* Search Form */}
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch} 
            className="w-full"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24 h-12 text-base rounded-md"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
              >
                Search
              </Button>
            </div>
          </motion.form>
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-200" role="alert">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Search Results */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : searchQuery && results.length === 0 && !error ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
                    >
                <h2 className="text-2xl font-bold mb-2">No results found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any articles matching '{searchQuery}'
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <p className="text-sm text-muted-foreground">Try:</p>
                  <ul className="list-disc text-left max-w-xs space-y-2 text-sm">
                    <li>Checking your spelling</li>
                    <li>Using more general keywords</li>
                    <li>Exploring topics in the knowledge base</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => router.push("/knowledge-base")}
                  >
                    Browse Knowledge Base
                  </Button>
                      </div>
                    </motion.div>
            ) : searchQuery && results.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {totalResults} {totalResults === 1 ? 'Result' : 'Results'} for "{searchQuery}"
                  </h2>
                </div>
                    
                    <div className="space-y-4">
                  {results.map((article, index) => (
                        <motion.div
                      key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                          whileHover={{ scale: 1.01 }}
                          className="transition-all"
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                            <CardTitle 
                              className="text-xl font-bold hover:text-primary cursor-pointer"
                              onClick={() => router.push(`/knowledge-base/post/${article.id}`)}
                            >
                              {article.title}
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1 gap-3">
                            <span>{article.created_at}</span>
                            <span>•</span>
                            {article.read_time && (
                              <>
                                <span>{article.read_time} min read</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{article.view_count} views</span>
                            {article.has_attachments && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Has attachments
                                </span>
                              </>
                            )}
                              </div>
                            </CardHeader>
                            <CardContent>
                          <p className="text-muted-foreground">{article.preview}</p>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 pt-0">
                              <Badge 
                                variant="secondary" 
                                className="cursor-pointer"
                            onClick={() => router.push(`/knowledge-base?topic=${encodeURIComponent(article.topic.id)}`)}
                              >
                            {article.topic.name}
                                </Badge>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                  <Pagination>
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
                )}
              </>
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 