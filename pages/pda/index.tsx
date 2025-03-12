"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Calendar, Eye, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

// Types for PDA submissions
// Types for PDA submissions - update to match API response
interface Category {
    code: string
    name: string
  }
  
  interface DetectionResult {
    is_deepfake: boolean
    confidence_score: number
    frames_analyzed: number
    fake_frames: number
  }
  
  interface PDASubmission {
    id: number
    title: string
    category: string
    category_display: string
    submission_identifier: string
    pda_submission_identifier: string  // Add this field
    description: string
    context: string
    source_url: string
    file_type: string
    submission_date: string
    file_url: string
    detection_result: DetectionResult
  }

export default function PublicDeepfakeArchive() {
  const router = useRouter()

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // State for API data
  const [submissions, setSubmissions] = useState<PDASubmission[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Fetch submissions from API
  // Replace the fetchSubmissions function with this real API call
const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
  
      // Make the actual API call
      const response = await fetch(`http://127.0.0.1:8000/api/pda/search/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with response data
      setSubmissions(data.data.results);
      setCategories(data.data.categories);
      setTotalItems(data.data.total);
    } catch (err) {
      console.error("Error fetching PDA submissions:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when search params change
  useEffect(() => {
    fetchSubmissions()
  }, [searchQuery, selectedCategory, currentPage, itemsPerPage])

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1) // Reset to first page on category change
  }

  // Handle view details click
  // Handle view details click - updated to use pda_submission_identifier
const handleViewDetails = (submission: PDASubmission) => {
    router.push(`/pda/${submission.pda_submission_identifier}`)
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setCurrentPage(1)
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage(i)
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage(totalPages)
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-gradient">Public Deepfake Archive</h1>
          <p className="text-muted-foreground mb-8">
            Browse our curated collection of verified deepfake media for research and educational purposes.
          </p>

          {/* Search and Filter Section */}
          <div className="bg-card rounded-2xl p-6 shadow-md mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title, description or context..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.code} value={category.code}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="md:w-auto">
                Search
              </Button>
            </form>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {submissions.length} of {totalItems} results
              {selectedCategory &&
                categories.find((c) => c.code === selectedCategory) &&
                ` in ${categories.find((c) => c.code === selectedCategory)?.name}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchSubmissions} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold mb-2">No results found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-muted">
                      <img
                        src={submission.file_url || "/placeholder.svg"}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for broken images
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384"
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={submission.detection_result.is_deepfake ? "bg-red-500" : "bg-green-500"}>
                          {submission.detection_result.is_deepfake ? (
                            <div className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Deepfake
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Authentic
                            </div>
                          )}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                          {submission.file_type}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="secondary">{submission.category_display}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(submission.submission_date)}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{submission.title}</h3>

                      <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{submission.description}</p>

                      <div className="mt-auto">
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1 flex justify-between">
                            <span>Confidence Score</span>
                            <span>{(submission.detection_result.confidence_score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${submission.detection_result.is_deepfake ? "bg-red-500" : "bg-green-500"}`}
                              style={{ width: `${submission.detection_result.confidence_score * 100}%` }}
                            />
                          </div>
                        </div>

                        <Button className="w-full" onClick={() => handleViewDetails(submission)}>
  <Eye className="mr-2 h-4 w-4" />
  View Details
</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 0 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

// Mock data generator for demonstration
// function generateMockResponse(query: string, category: string, page: number, limit: number): PDAResponse {
//   const categories: Category[] = [
//     { code: "POL", name: "Politics" },
//     { code: "ENT", name: "Entertainment" },
//     { code: "MIS", name: "Misinformation" },
//     { code: "EDU", name: "Educational" },
//   ]

//   // Generate 50 mock submissions
//   const allSubmissions: PDASubmission[] = Array.from({ length: 50 }).map((_, index) => {
//     const id = index + 1
//     const categoryIndex = id % categories.length
//     const isDeepfake = id % 3 !== 0 // 2/3 of items are deepfakes

//     return {
//       id,
//       title: `${categories[categoryIndex].name} Deepfake Example ${id}`,
//       category: categories[categoryIndex].code,
//       category_display: categories[categoryIndex].name,
//       submission_identifier: `pda-${id}-${Date.now()}`,
//       description: `This is a ${isDeepfake ? "deepfake" : "authentic"} video showing ${
//         categoryIndex === 0
//           ? "a political figure making false statements"
//           : categoryIndex === 1
//             ? "a celebrity in a movie scene they never appeared in"
//             : categoryIndex === 2
//               ? "misleading content about current events"
//               : "educational content about deepfake technology"
//       }. Created for research and educational purposes.`,
//       context: `This ${isDeepfake ? "deepfake" : "authentic media"} was ${
//         isDeepfake ? "created" : "verified"
//       } by our research team to demonstrate the capabilities and limitations of current deepfake technology.`,
//       source_url: "https://example.com/source",
//       file_type: id % 5 === 0 ? "Image" : "Video",
//       submission_date: new Date(Date.now() - id * 86400000).toISOString(), // Spread out over past days
//       file_url:
//         id % 5 === 0
//           ? `/placeholder.svg?height=400&width=600&text=Deepfake+${id}`
//           : `/placeholder.svg?height=400&width=600&text=Deepfake+Video+${id}`,
//       detection_result: {
//         is_deepfake: isDeepfake,
//         confidence_score: isDeepfake ? 0.7 + Math.random() * 0.25 : 0.65 + Math.random() * 0.3,
//         frames_analyzed: id % 5 === 0 ? 1 : 50 + (id % 100),
//         fake_frames: isDeepfake ? (id % 5 === 0 ? 1 : 45 + (id % 50)) : 0,
//       },
//     }
//   })

//   // Filter by search query
//   let filteredSubmissions = allSubmissions
//   if (query) {
//     const lowerQuery = query.toLowerCase()
//     filteredSubmissions = filteredSubmissions.filter(
//       (sub) =>
//         sub.title.toLowerCase().includes(lowerQuery) ||
//         sub.description.toLowerCase().includes(lowerQuery) ||
//         sub.context.toLowerCase().includes(lowerQuery),
//     )
//   }

//   // Filter by category
//   if (category) {
//     filteredSubmissions = filteredSubmissions.filter((sub) => sub.category === category)
//   }

//   // Paginate results
//   const startIndex = (page - 1) * limit
//   const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + limit)

//   return {
//     code: "S01",
//     message: "Success",
//     data: {
//       results: paginatedSubmissions,
//       total: filteredSubmissions.length,
//       page,
//       limit,
//       categories,
//     },
//   }
// }

