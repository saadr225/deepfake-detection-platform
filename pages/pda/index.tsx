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
import { Search, Filter, Calendar, Eye, AlertTriangle, CheckCircle, FileText, UserCircle, XCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import Cookies from "js-cookie"
import axios from "axios"
// Add this to your imports at the top of the file
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
// Add this import for the Switch component
import { Switch } from "@/components/ui/switch"
// Import the CustomModal component
import { CustomModal } from "@/components/ui/custom-modal"
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
    user_owned?: boolean;
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

  // Add after other state declarations
const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
const [isFaceRegistered, setIsFaceRegistered] = useState(false)
const [faceRegStatus, setFaceRegStatus] = useState("")
const [isRegistering, setIsRegistering] = useState(false)
const [isRemoving, setIsRemoving] = useState(false)
const [statusLoading, setStatusLoading] = useState(true)
const [faceUploadModalOpen, setFaceUploadModalOpen] = useState(false)
const [selectedFaceImage, setSelectedFaceImage] = useState<File | null>(null)
const [registrationError, setRegistrationError] = useState<string | null>(null)

// Add these state variables after your other state declarations
const [isFaceMatchEnabled, setIsFaceMatchEnabled] = useState(false)
const [isFetchingFaceMatches, setIsFetchingFaceMatches] = useState(false)
const [faceMatchSubmissions, setFaceMatchSubmissions] = useState<PDASubmission[]>([])
const [faceMatchError, setFaceMatchError] = useState<string | null>(null)

// Add these state variables after the other state declarations
const [isFaceSearchModalOpen, setIsFaceSearchModalOpen] = useState(false);
const [faceSearchImage, setFaceSearchImage] = useState<File | null>(null);
const [isFaceSearching, setIsFaceSearching] = useState(false);
const [faceSearchError, setFaceSearchError] = useState<string | null>(null);

// Add flag to track when face search is active
const [isFaceSearchActive, setIsFaceSearchActive] = useState(false)

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Fetch submissions from API
  // Replace the fetchSubmissions function with this real API call
// Update the fetchSubmissions function to include Authorization header
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

    // Get access token
    const accessToken = Cookies.get("accessToken");
    
    // Headers with conditional Authorization
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Make the actual API call
    const response = await fetch(`http://127.0.0.1:8000/api/pda/search/?${params.toString()}`, {
      headers
    });
    
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

  // Add a useEffect hook to check user login status and face registration status
// Place this with other useEffect hooks
useEffect(() => {
  // Check if user is logged in
  const accessToken = Cookies.get("accessToken")
  setIsUserLoggedIn(!!accessToken)
  
  // If logged in, check face registration status
  if (accessToken) {
    checkFaceRegistrationStatus(accessToken)
  } else {
    setStatusLoading(false)
  }
}, [])

// Add this useEffect to fetch face match history when toggle is enabled
useEffect(() => {
  if (isFaceMatchEnabled) {
    fetchFaceMatchHistory()
  }
}, [isFaceMatchEnabled])

// Add these functions to handle face registration functionality
// Place these with other functions in the component

// Function to check face registration status
const checkFaceRegistrationStatus = async (token: string) => {
  setStatusLoading(true)
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/facial-watch/status/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data.data) {
      setIsFaceRegistered(response.data.data.is_registered)
      setFaceRegStatus(response.data.data.is_registered ? 
        "Your face is registered in the system" : 
        "Your face is not registered in the system")
    }
  } catch (error) {
    console.error("Error checking face registration status:", error)
    setFaceRegStatus("Unable to check registration status")
    setIsFaceRegistered(false)
  } finally {
    setStatusLoading(false)
  }
}

// Function to register face
const registerFace = async () => {
  if (!selectedFaceImage) {
    setRegistrationError("Please select an image first")
    return
  }
  
  setIsRegistering(true)
  setRegistrationError(null)
  
  try {
    // Get the access token from cookies
    let accessToken = Cookies.get("accessToken")
    
    if (!accessToken) {
      setRegistrationError("Please login first to register your face")
      setIsRegistering(false)
      return
    }
    
    // Create form data
    const formData = new FormData()
    formData.append("file", selectedFaceImage)
    
    // Make API call
    const response = await axios.post("http://127.0.0.1:8000/api/facial-watch/register/", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      }
    })
    
    // Update state upon successful registration
    setIsFaceRegistered(true)
    setFaceRegStatus("Your face is registered in the system")
    setFaceUploadModalOpen(false)
    setSelectedFaceImage(null)
    
  } catch (error) {
    console.error("Error registering face:", error)
    if (axios.isAxiosError(error) && error.response) {
      setRegistrationError(error.response.data.message || "Failed to register face")
    } else {
      setRegistrationError("An error occurred during face registration")
    }
  } finally {
    setIsRegistering(false)
  }
}

// Function to remove face registration
const removeFaceRegistration = async () => {
  setIsRemoving(true)
  
  try {
    // Get the access token from cookies
    let accessToken = Cookies.get("accessToken")
    
    if (!accessToken) {
      alert("Please login first to remove your face registration")
      setIsRemoving(false)
      return
    }
    
    // Make API call to remove face registration
    const response = await axios.delete("http://127.0.0.1:8000/api/facial-watch/remove/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    // Update state upon successful removal
    setIsFaceRegistered(false)
    setFaceRegStatus("Your face is not registered in the system")
    
  } catch (error) {
    console.error("Error removing face registration:", error)
    alert("Failed to remove face registration")
  } finally {
    setIsRemoving(false)
  }
}

// Handle face image selection
const handleFaceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0]
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setRegistrationError("Please select an image file")
      return
    }
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setRegistrationError("Image size should not exceed 5MB")
      return
    }
    
    setSelectedFaceImage(file)
    setRegistrationError(null)
  }
}

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "All Categories" ? "" : value)
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

  // Add this function to fetch face match history
// Update this function to preserve the user_owned flag
const fetchFaceMatchHistory = async () => {
  setIsFetchingFaceMatches(true)
  setFaceMatchError(null)
  
  try {
    // Get the access token from cookies
    const accessToken = Cookies.get("accessToken")
    
    if (!accessToken) {
      setFaceMatchError("Please login to view face matches")
      setIsFetchingFaceMatches(false)
      return
    }
    
    // Fetch face match history
    const response = await axios.get("http://127.0.0.1:8000/api/facial-watch/history/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    // Extract submission identifiers from the response
    const matchedSubmissionIds = response.data.data.map(
      (match: any) => match.media_upload.submission_identifier
    )
    
    if (matchedSubmissionIds.length === 0) {
      setFaceMatchSubmissions([])
      setIsFetchingFaceMatches(false)
      return
    }
    
    // Fetch the actual submissions using the identifiers
    const matchedSubmissions: PDASubmission[] = []
    
    // For each match, fetch the full submission details
    for (const submissionId of matchedSubmissionIds) {
      try {
        // Make sure to include authorization header here too
        const submissionResponse = await fetch(`http://127.0.0.1:8000/api/pda/details/${submissionId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        if (submissionResponse.ok) {
          const data = await submissionResponse.json()
          // The data includes user_owned from the API, so we don't need to modify it
          matchedSubmissions.push(data.data)
        }
      } catch (error) {
        console.error(`Error fetching details for submission ${submissionId}:`, error)
      }
    }
    
    setFaceMatchSubmissions(matchedSubmissions)
  } catch (error) {
    console.error("Error fetching face match history:", error)
    setFaceMatchError("Failed to fetch face match history")
  } finally {
    setIsFetchingFaceMatches(false)
  }
}

// Add this handler function for the toggle
const handleFaceMatchToggle = (checked: boolean) => {
  setIsFaceMatchEnabled(checked)
  
  // Reset the current page when toggling
  setCurrentPage(1)
  
  // If turning off face match filter, refresh normal submissions
  if (!checked) {
    fetchSubmissions()
  }
}

// Add this function to handle face image selection for search
const handleFaceSearchImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setFaceSearchError("Please select an image file");
      return;
    }
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFaceSearchError("Image size should not exceed 5MB");
      return;
    }
    
    setFaceSearchImage(file);
    setFaceSearchError(null);
  }
};

// Update the performFaceSearch function
const performFaceSearch = async () => {
  if (!faceSearchImage) {
    setFaceSearchError("Please select an image first");
    return;
  }
  
  setIsFaceSearching(true);
  setFaceSearchError(null);
  
  try {
    // Get the access token from cookies
    const accessToken = Cookies.get("accessToken");
    
    if (!accessToken) {
      setFaceSearchError("Please login to use face search");
      setIsFaceSearching(false);
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("file", faceSearchImage);
    
    // Make API call to search for faces
    const response = await axios.post("http://127.0.0.1:8000/api/facial-watch/search", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      }
    });
    
    // Extract submission identifiers from the response
    const matchedSubmissionIds = response.data.data.matches.map(
      (match: any) => match.submission_identifier
    );
    
    if (matchedSubmissionIds.length === 0) {
      setSubmissions([]);
      setTotalItems(0);
      setIsFaceSearchModalOpen(false);
      setIsFaceSearching(false);
      setIsFaceSearchActive(true); // Set the flag to true even for empty results
      return;
    }
    
    // Fetch the actual submissions using the identifiers
    const matchedSubmissions: PDASubmission[] = [];
    
    // For each match, fetch the full submission details
    for (const submissionId of matchedSubmissionIds) {
      try {
        // Make sure to include authorization header
        const submissionResponse = await fetch(`http://127.0.0.1:8000/api/pda/details/${submissionId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (submissionResponse.ok) {
          const data = await submissionResponse.json();
          matchedSubmissions.push(data.data);
        }
      } catch (error) {
        console.error(`Error fetching details for submission ${submissionId}:`, error);
      }
    }
    
    // Update the state with matched submissions
    setSubmissions(matchedSubmissions);
    setTotalItems(matchedSubmissions.length);
    setIsFaceSearchModalOpen(false);
    setIsFaceSearchActive(true); // Set the flag to true
    
  } catch (error) {
    console.error("Error performing face search:", error);
    if (axios.isAxiosError(error) && error.response) {
      setFaceSearchError(error.response.data.message || "Failed to perform face search");
    } else {
      setFaceSearchError("An error occurred during face search");
    }
  } finally {
    setIsFaceSearching(false);
  }
};

// Update the resetPage function
const resetPage = () => {
  // Reset all state variables related to face search
  setFaceSearchImage(null);
  setFaceSearchError(null);
  setSearchQuery("");
  setSelectedCategory("");
  setCurrentPage(1);
  setIsFaceSearchActive(false); // Reset the flag
  
  // Fetch all submissions again
  fetchSubmissions();
};

  return (
    <Layout>
      {/* Enhanced Header Section with Background */}
      <div className="relative">
        {/* Background with gradient */}
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
                Comprehensive Deepfake Repository
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Public <span className="gradient-text">Deepfake</span> Archive
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Browse our curated collection of verified deepfake media for education, research, and 
              awareness about the capabilities and limitations of synthetic media
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Verified Content</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Face Matching Technology</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Educational Resources</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          

          {/* Search and Filter Section */}
          <div className="bg-card glass-card rounded-2xl p-6 shadow-md mb-8">
            {/* Modify the search form to be disabled when face match filter is active */}
<form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <Input
      type="text"
      placeholder={isFaceMatchEnabled ? "Face match filter is active" : "Search by title, description or context..."}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
      disabled={isFaceMatchEnabled}
    />
  </div>

  <div className="w-full md:w-64">
    <Select 
      value={selectedCategory} 
      onValueChange={handleCategoryChange}
      disabled={isFaceMatchEnabled}
    >
      <SelectTrigger className="h-12 rounded-xl">
        <div className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="All Categories" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All Categories">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.code} value={category.code}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Replace the original Search button with this */}
  <div className="flex gap-2">
    
    <Button 
      type="button" 
      onClick={() => setIsFaceSearchModalOpen(true)} 
      className="md:w-auto"
      disabled={isFaceMatchEnabled}
      // variant="secondary"
    >
      <UserCircle className="mr-2 h-4 w-4" />
      Face Search
    </Button>
  </div>
</form>

            {/* Results count */}
            {/* Update the results count display */}
<div className="text-sm text-muted-foreground">
  {isFaceMatchEnabled ? (
    <>
      Showing {faceMatchSubmissions.length} submissions matching your face
      {faceMatchError && (
        <span className="text-destructive ml-2">({faceMatchError})</span>
      )}
    </>
  ) : isFaceSearchActive ? (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div>
        Showing {submissions.length} submissions matching the face in your search
        {faceSearchError && (
          <span className="text-destructive ml-2">({faceSearchError})</span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 sm:mt-0"
        onClick={resetPage}
      >
        Show All Submissions
      </Button>
    </div>
  ) : (
    <>
      Showing {submissions.length} of {totalItems} results
      {selectedCategory &&
        categories.find((c) => c.code === selectedCategory) &&
        ` in ${categories.find((c) => c.code === selectedCategory)?.name}`}
      {searchQuery && ` matching "${searchQuery}"`}
    </>
  )}
</div>

            {/* Add this right after the search and filter form */}
{/* This should be placed inside the "bg-card glass-card rounded-2xl p-6 shadow-md mb-8" div */}
{/* Add after the results count div */}

{isUserLoggedIn && (
  <div className="mt-4 pt-4 border-t border-border">
    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Face Registration:</span>
        {statusLoading ? (
          <Badge variant="outline" className="animate-pulse">
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Checking...
            </span>
          </Badge>
        ) : isFaceRegistered ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <span className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Registered
            </span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <span className="flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              Not Registered
            </span>
          </Badge>
        )}
        <span className="text-xs text-muted-foreground ml-2">{faceRegStatus}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => setFaceUploadModalOpen(true)}
          disabled={isRegistering || isFaceRegistered}
        >
          <UserCircle className="mr-1 h-4 w-4" />
          Register Face
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center text-destructive border-destructive/20 hover:bg-destructive/10"
          onClick={removeFaceRegistration}
          disabled={isRemoving || !isFaceRegistered}
        >
          <XCircle className="mr-1 h-4 w-4" />
          Remove Registration
        </Button>
      </div>
    </div>
    {/* Add this toggle switch below the existing face registration UI */}
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Switch 
          checked={isFaceMatchEnabled} 
          onCheckedChange={handleFaceMatchToggle}
          disabled={!isFaceRegistered || isFetchingFaceMatches} 
        />
        <span className="text-sm font-medium">
          {isFaceMatchEnabled ? "Showing only matches with your face" : "Show matches with my face"}
        </span>
      </div>
      
      {isFetchingFaceMatches && (
        <div className="text-xs text-muted-foreground animate-pulse">
          Fetching matches...
        </div>
      )}
    </div>
  </div>
)}
          </div>

          {/* Results Grid */}
{isLoading || isFetchingFaceMatches ? (
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
) : error || (isFaceMatchEnabled && faceMatchError) ? (
  <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
    <p>{isFaceMatchEnabled ? faceMatchError : error}</p>
    <Button 
      variant="outline" 
      onClick={isFaceMatchEnabled ? fetchFaceMatchHistory : fetchSubmissions} 
      className="mt-2"
    >
      Try Again
    </Button>
  </div>
) : (isFaceMatchEnabled && faceMatchSubmissions.length === 0) ? (
  <div className="text-center py-12">
    <p className="text-xl font-semibold mb-2">No face matches found</p>
    <p className="text-muted-foreground mb-4">No submissions were found that match your registered face</p>
    <Button
      variant="outline"
      onClick={() => setIsFaceMatchEnabled(false)}
    >
      Show All Submissions
    </Button>
  </div>
) : (!isFaceMatchEnabled && submissions.length === 0) ? (
  <div className="text-center py-12">
    <p className="text-xl font-semibold mb-2">No results found</p>
    <p className="text-muted-foreground mb-4">
      {isFaceSearchActive 
        ? "No submissions match the face in your search image" 
        : "Try adjusting your search or filter criteria"}
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-3">
      {!isFaceSearchActive && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("")
            setSelectedCategory("")
          }}
        >
          Clear Filters
        </Button>
      )}
      {(faceSearchImage || isFaceSearchActive) && (
        <Button
          variant="default"
          onClick={resetPage}
        >
          Show All Submissions
        </Button>
      )}
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Use either face match submissions or regular submissions depending on toggle state */}
    {(isFaceMatchEnabled ? faceMatchSubmissions : submissions).map((submission) => (
      <motion.div
        key={submission.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Card className="overflow-hidden glass-card h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-muted overflow-hidden">
            {submission.file_type && submission.file_type.toLowerCase().includes('image') ? (
              <img
                src={submission.file_url || "/placeholder.svg"}
                alt={submission.title}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
                onError={(e) => {
                  // Fallback for broken images
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384"
                }}
              />
            ) : submission.file_type && submission.file_type.toLowerCase().includes('video') ? (
              <video
                src={submission.file_url}
                className="w-full h-full object-cover"
                style={{ pointerEvents: 'none' }}
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {/* Add this right after the deepfake/authentic badge in the top-right corner */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
  {/* Deepfake/Authentic Badge */}
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
  
  {/* Owned Badge - now will appear below */}
  {submission.user_owned && (
    <Badge className="bg-green-500">
      <div className="flex items-center">
        <UserCircle className="h-3 w-3 mr-1" />
        Owned
      </div>
    </Badge>
  )}
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

{/* Pagination - only show for regular search, not for face matches */}
{!isLoading && !error && !isFaceMatchEnabled && totalPages > 0 && (
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
      {/* Add this at the bottom of the component, right before the closing Layout tag */}

{/* Face Upload Modal */}
<CustomModal
  open={faceUploadModalOpen && isUserLoggedIn}
  onOpenChange={setFaceUploadModalOpen}
  title="Register Your Face"
  description="Please upload a clear photo of your face. This will be used to alert you if deepfakes of your face are detected."
  content={
    <div className="border-2 border-dashed rounded-xl p-6 text-center">
      {selectedFaceImage ? (
        <div className="flex flex-col items-center">
          <img 
            src={URL.createObjectURL(selectedFaceImage)} 
            alt="Selected face" 
            className="max-h-[200px] max-w-full object-contain mb-3 rounded-lg" 
          />
          <p className="text-sm">{selectedFaceImage.name}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setSelectedFaceImage(null)}
          >
            Change Image
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <UserCircle className="h-16 w-16 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to select or drag and drop an image
          </p>
          <input
            type="file"
            id="faceUpload"
            className="hidden"
            accept="image/*"
            onChange={handleFaceImageSelect}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById("faceUpload")?.click()}
          >
            Select Image
          </Button>
        </div>
      )}
    </div>
  }
  footer={
    <div className="flex flex-col space-y-4">
      {registrationError && (
        <p className="text-sm text-destructive">{registrationError}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setFaceUploadModalOpen(false)
            setSelectedFaceImage(null)
            setRegistrationError(null)
          }}
          disabled={isRegistering}
        >
          Cancel
        </Button>
        <Button 
          onClick={registerFace}
          disabled={!selectedFaceImage || isRegistering}
        >
          {isRegistering ? "Registering..." : "Register Face"}
        </Button>
      </div>
    </div>
  }
/>
{/* Add this at the bottom of the component, right before the closing Layout tag */}
{/* Face Search Modal */}
<CustomModal
  open={isFaceSearchModalOpen}
  onOpenChange={setIsFaceSearchModalOpen}
  title="Search by Face"
  description="Upload a photo containing a face to search for similar faces in our deepfake database."
  content={
    <div className="border-2 border-dashed rounded-xl p-6 text-center">
      {faceSearchImage ? (
        <div className="flex flex-col items-center">
          <img 
            src={URL.createObjectURL(faceSearchImage)} 
            alt="Selected face" 
            className="max-h-[200px] max-w-full object-contain mb-3 rounded-lg" 
          />
          <p className="text-sm">{faceSearchImage.name}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setFaceSearchImage(null)}
          >
            Change Image
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <UserCircle className="h-16 w-16 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to select or drag and drop an image containing a face
          </p>
          <input
            type="file"
            id="faceSearchUpload"
            className="hidden"
            accept="image/*"
            onChange={handleFaceSearchImageSelect}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById("faceSearchUpload")?.click()}
          >
            Select Image
          </Button>
        </div>
      )}
    </div>
  }
  footer={
    <div className="flex flex-col space-y-4">
      {faceSearchError && (
        <p className="text-sm text-destructive">{faceSearchError}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsFaceSearchModalOpen(false);
            setFaceSearchImage(null);
            setFaceSearchError(null);
          }}
          disabled={isFaceSearching}
        >
          Cancel
        </Button>
        <Button 
          onClick={performFaceSearch}
          disabled={!faceSearchImage || isFaceSearching}
        >
          {isFaceSearching ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </div>
  }
/>
    </Layout>
  )
}