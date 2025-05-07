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
import { Search, Bookmark, Tag } from "lucide-react";
import KnowledgeBaseBreadcrumb from "../../components/KnowledgeBaseBreadcrumb";

// Mock data for search results - in a real app, this would come from API
const mockPosts = [
  {
    id: 1,
    title: "Introduction to Deepfake Detection Methods",
    excerpt: "Learn about the latest methods used to detect deepfakes in digital media...",
    author: "Dr. Emily Chen",
    date: "2023-10-15",
    readTime: "8 min read",
    topic: "Deepfake Detection",
    category: "Tutorials",
    tags: ["deepfake", "detection", "machinelearning"],
    views: 1245
  },
  {
    id: 2,
    title: "AI Content Detection: Current Challenges and Solutions",
    excerpt: "Explore the challenges in AI-generated content detection and the solutions being developed...",
    author: "James Wilson",
    date: "2023-09-28",
    readTime: "12 min read",
    topic: "AI Content Detection",
    category: "Research",
    tags: ["detection", "aiethics", "machinelearning"],
    views: 980
  },
  {
    id: 3,
    title: "Media Forensics Tools for Everyday Users",
    excerpt: "A comprehensive guide to accessible media forensics tools that anyone can use...",
    author: "Sarah Johnson",
    date: "2023-10-02",
    readTime: "10 min read",
    topic: "Media Forensics",
    category: "Tools",
    tags: ["forensics", "verification", "detection"],
    views: 865
  },
  {
    id: 4,
    title: "Ethical Implications of Deepfake Technology",
    excerpt: "A deep dive into the ethical concerns surrounding deepfake technology and its impact...",
    author: "Dr. Michael Roberts",
    date: "2023-09-18",
    readTime: "15 min read",
    topic: "Ethics in AI",
    category: "Research",
    tags: ["aiethics", "deepfake", "privacy"],
    views: 1120
  },
  {
    id: 5,
    title: "Building Digital Literacy in the Age of Synthetic Media",
    excerpt: "Strategies for improving digital literacy to combat misinformation in synthetic media...",
    author: "Lisa Thompson",
    date: "2023-10-10",
    readTime: "9 min read",
    topic: "Digital Media Literacy",
    category: "Best Practices",
    tags: ["disinformation", "verification", "privacy"],
    views: 735
  },
  {
    id: 6,
    title: "Advanced Techniques in Voice Deepfake Detection",
    excerpt: "Learn about sophisticated methods for detecting voice deepfakes and audio manipulations...",
    author: "Dr. Emily Chen",
    date: "2023-10-08",
    readTime: "11 min read",
    topic: "Deepfake Detection",
    category: "Research",
    tags: ["deepfake", "detection", "forensics"],
    views: 890
  },
];

export default function KnowledgeBaseSearch() {
  const router = useRouter();
  const { q: queryParam } = router.query;
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  // Initialize search query from URL parameter
  useEffect(() => {
    if (queryParam && typeof queryParam === 'string') {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      
      // Simulate API call with timeout
      const timeoutId = setTimeout(() => {
        const filteredResults = mockPosts.filter(post => 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setResults(filteredResults);
        setIsLoading(false);
        setCurrentPage(1); // Reset to first page on new search
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Pagination calculation
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(results.length / resultsPerPage);

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
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </motion.form>
          
          {/* Search Results */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {results.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="space-y-6"
                  >
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="flex items-center justify-between"
                    >
                      <h2 className="text-xl font-semibold">
                        {results.length} {results.length === 1 ? 'Result' : 'Results'} for "{searchQuery}"
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <select className="text-sm border rounded-md p-1 bg-background">
                          <option>Relevance</option>
                          <option>Most Recent</option>
                          <option>Most Viewed</option>
                        </select>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-4">
                      {currentResults.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                          whileHover={{ scale: 1.01 }}
                          className="transition-all"
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-bold hover:text-primary cursor-pointer" onClick={() => router.push(`/knowledge-base/post/${post.id}`)}>
                                  {post.title}
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1 gap-3">
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.readTime}</span>
                                <span>•</span>
                                <span>{post.views} views</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground">{post.excerpt}</p>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 pt-0">
                              <Badge 
                                variant="secondary" 
                                className="cursor-pointer"
                                onClick={() => router.push(`/knowledge-base?topic=${encodeURIComponent(post.topic)}`)}
                              >
                                {post.topic}
                              </Badge>
                              {post.tags.map((tag: string, i: number) => (
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
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                      >
                        <Pagination className="mt-8">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) setCurrentPage(currentPage - 1);
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
                                        setCurrentPage(i + 1);
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
                                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className={searchQuery ? "bg-muted p-8 rounded-lg text-center" : "hidden"}
                  >
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      No posts match your search query "{searchQuery}". Try different keywords or browse all content.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => router.push("/knowledge-base")}
                    >
                      Browse all content
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 