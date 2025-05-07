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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Search, Tag, Bookmark } from "lucide-react";
import KnowledgeBaseBreadcrumb from "../../components/KnowledgeBaseBreadcrumb";

// Mock data for topics, categories, and tags
const mockTopics = [
  { id: 1, name: "Deepfake Detection", count: 24 },
  { id: 2, name: "AI Content Detection", count: 18 },
  { id: 3, name: "Media Forensics", count: 15 },
  { id: 4, name: "Ethics in AI", count: 12 },
  { id: 5, name: "Digital Media Literacy", count: 10 }
];

const mockCategories = [
  { id: 1, name: "Tutorials", count: 35 },
  { id: 2, name: "Research", count: 28 },
  { id: 3, name: "Tools", count: 22 },
  { id: 4, name: "Best Practices", count: 19 },
  { id: 5, name: "News", count: 15 }
];

const mockTags = [
  { id: 1, name: "deepfake", count: 45 },
  { id: 2, name: "machinelearning", count: 38 },
  { id: 3, name: "aiethics", count: 30 },
  { id: 4, name: "detection", count: 27 },
  { id: 5, name: "verification", count: 23 },
  { id: 6, name: "forensics", count: 19 },
  { id: 7, name: "disinformation", count: 17 },
  { id: 8, name: "privacy", count: 15 }
];

// Mock data for posts
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

export default function KnowledgeBase() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(mockPosts);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  // Filter posts based on search query, selected topic, category, and tag
  useEffect(() => {
    let filtered = [...mockPosts];
    
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedTopic) {
      filtered = filtered.filter(post => post.topic === selectedTopic);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }
    
    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page on new filter
  }, [searchQuery, selectedTopic, selectedCategory, selectedTag]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Pagination calculation
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTopic(null);
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <KnowledgeBaseBreadcrumb items={[{ label: "Knowledge Base", href: "/knowledge-base" }]} />
        
        <div className="flex flex-col space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">Knowledge Base</h1>
              <p className="text-muted-foreground mt-2">
                Browse resources, guides, and articles about deepfake detection and AI content analysis
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Submit a Post Button */}
              <Button 
                onClick={() => router.push("/knowledge-base/submit")}
                className="hidden md:flex"
              >
                Submit a Post
              </Button>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-full md:w-[300px]"
                  />
                </div>
              </form>
            </div>
          </motion.div>
          
          {/* Active Filters */}
          {(selectedTopic || selectedCategory || selectedTag || searchQuery) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-2 items-center"
            >
              <span className="text-sm font-medium">Active filters:</span>
              {selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Topic: {selectedTopic}
                    <span className="ml-1">×</span>
                  </Badge>
                </motion.div>
              )}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Category: {selectedCategory}
                    <span className="ml-1">×</span>
                  </Badge>
                </motion.div>
              )}
              {selectedTag && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setSelectedTag(null)}
                  >
                    Tag: {selectedTag}
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
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Sidebar with Filters */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                <Tabs defaultValue="topics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="tags">Tags</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="topics" className="space-y-2 mt-4">
                    {mockTopics.map((topic) => (
                      <div 
                        key={topic.id}
                        onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                        className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${
                          selectedTopic === topic.name 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-medium">{topic.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {topic.count}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="categories" className="space-y-2 mt-4">
                    {mockCategories.map((category) => (
                      <div 
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${
                          selectedCategory === category.name 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="tags" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {mockTags.map((tag) => (
                        <Badge 
                          key={tag.id}
                          variant={selectedTag === tag.name ? "default" : "outline"}
                          className="cursor-pointer py-1 px-3"
                          onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name} ({tag.count})
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
            
            {/* Posts List */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              {filteredPosts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted p-8 rounded-lg text-center"
                >
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    No posts match your current search criteria. Try adjusting your filters or search query.
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {filteredPosts.length} {filteredPosts.length === 1 ? 'Result' : 'Results'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sort by:</span>
                      <select className="text-sm border rounded-md p-1 bg-background">
                        <option>Most Recent</option>
                        <option>Most Viewed</option>
                        <option>A-Z</option>
                      </select>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-1 gap-6">
                    {currentPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
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
                              onClick={() => setSelectedTopic(post.topic)}
                            >
                              {post.topic}
                            </Badge>
                            {post.tags.map((tag, i) => (
                              <Badge 
                                key={i} 
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => setSelectedTag(tag)}
                              >
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
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 