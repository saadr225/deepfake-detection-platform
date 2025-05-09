"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  LinkIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  BarChart2,
  Download,
  Share2,
  Trash,
} from "lucide-react"
import { motion } from "framer-motion"
import Cookies from 'js-cookie';
import axios from 'axios';

// Types for PDA submission details
interface DetectionResult {
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  fake_frames: number;
  analysis_date: string; // Add this new field
  analysis_report: {
    media_path: string;
    media_type: string;
    statistics: {
      confidence: number;
      fake_crops: number;
      fake_frames: number;
      is_deepfake: boolean;
      total_crops: number;
      total_frames: number;
      fake_crops_percentage: number;
      fake_frames_percentage: number;
    };
    frame_results: Array<{
      ela_path: string;
      frame_id: string;
      crop_paths: string[];
      frame_path: string;
      gradcam_path: string;
      crop_analyses: Array<{
        confidence: number;
        face_index: number;
        prediction: string;
      }>;
      final_verdict: string;
      frame_analysis: {
        confidence: number;
        prediction: string;
      };
    }>;
    file_identifier: string;
  };
}

interface PDASubmissionDetails {
  id: number;
  title: string;
  category: string;
  category_display: string;
  submission_identifier: string;
  pda_submission_identifier: string; // Add this field
  original_submission_identifier?: string;
  description: string;
  context: string;
  source_url: string;
  file_type: string;
  submission_date: string;
  file_url: string;
  user_owned?: boolean;
  detection_result: DetectionResult; // Now required, not optional
  metadata: Record<string, string>; // Now required, not optional
}

export default function PDASubmissionDetailsPage() {
  const router = useRouter()
  const { submission_identifier } = router.query

  const [submission, setSubmission] = useState<PDASubmissionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("media")
  // Add these state variables at the top with your other useState declarations
const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
const [currentSliderType, setCurrentSliderType] = useState<'error' | 'heatmap' | 'original' | null>(null);
const [currentErrorLevelSlide, setCurrentErrorLevelSlide] = useState(0);
const [heatmapPage, setHeatmapPage] = useState(0);
const [currentHeatmapSlide, setCurrentHeatmapSlide] = useState(0);
const [errorLevelPage, setErrorLevelPage] = useState(0);
const [currentOriginalFrameSlide, setCurrentOriginalFrameSlide] = useState(0);
const [originalFramePage, setOriginalFramePage] = useState(0);

  // Fetch submission details from API
  useEffect(() => {
    // Update the fetchSubmissionDetails function to include Authorization header
const fetchSubmissionDetails = async () => {
  if (!submission_identifier) return;
  
  setIsLoading(true);
  setError(null);
  
  try {
    // Get access token
    const accessToken = Cookies.get("accessToken");
    
    // Headers with conditional Authorization
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    
    // Make a single API call to get all details
    const response = await fetch(`http://127.0.0.1:8000/api/pda/details/${submission_identifier}/`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Set submission with all data
    setSubmission(data.data);
  } catch (err) {
    console.error('Error fetching PDA submission details:', err);
    setError('Failed to load submission details. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};
  
    fetchSubmissionDetails();
  }, [submission_identifier]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle back button click
  const handleBack = () => {
    router.push("/pda")
  }

  // Handle download report
  const handleDownloadReport = () => {
    if (!submission) return

    const reportData = {
      ...submission,
      download_date: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pda_report_${submission.submission_identifier}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle share report
  const handleShareReport = async () => {
    if (!submission) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PDA Report: ${submission.title}`,
          text: `Check out this deepfake analysis: ${submission.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  // Add this new function to handle submission deletion
const handleDeleteSubmission = async () => {
  // Confirm before deletion
  if (!window.confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
    return;
  }
  
  try {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      setError("You must be logged in to delete submissions");
      return;
    }
    
    const response = await fetch(`http://127.0.0.1:8000/api/pda/submission/${submission_identifier}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete submission (${response.status})`);
    }
    
    const data = await response.json();
    alert(data.message || "Submission deleted successfully");
    
    // Redirect back to the main PDA page
    router.push("/pda");
    
  } catch (error) {
    console.error("Error deleting submission:", error);
    alert("Failed to delete submission");
  }
};

  // Handle image click to show enlarged view
const handleImageClick = (image: string, type: 'error' | 'heatmap' | 'original', index: number) => {
  setEnlargedImage(image);
  setCurrentSliderType(type);
  document.body.style.overflow = 'hidden';
  if (type === 'error') {
    setCurrentErrorLevelSlide(index);
  } else if (type === 'heatmap') {
    setCurrentHeatmapSlide(index);
  } else {
    setCurrentOriginalFrameSlide(index);
  }
};

// Handle closing the modal
const handleCloseModal = () => {
  setEnlargedImage(null);
  setCurrentSliderType(null);
  document.body.style.overflow = 'auto';
};

// Small carousel component for the frames
const SmallCarousel = ({
  frames,
  onImageClick,
  type,
  currentIndex,
  currentPage,
  onPageChange,
}: {
  frames: string[];
  onImageClick: (image: string, type: 'error' | 'heatmap' | 'original', index: number) => void;
  type: 'error' | 'heatmap' | 'original';
  currentIndex: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const imagesPerPage = 3;
  const totalPages = Math.ceil(frames.length / imagesPerPage);

  const handlePrevPage = () => {
    const newPage = Math.max(0, currentPage - 1);
    onPageChange(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(totalPages - 1, currentPage + 1);
    onPageChange(newPage);
  };

  const startIndex = currentPage * imagesPerPage;
  const visibleFrames = frames.slice(startIndex, startIndex + imagesPerPage);

  return (
    <div className="space-y-4">
      {/* Image Container */}
      <div className="grid grid-cols-3 gap-2">
        {visibleFrames.map((frame, index) => {
          const actualIndex = startIndex + index;
          return (
            <div 
              key={actualIndex} 
              className="relative aspect-video"
            >
              <img
                src={frame}
                alt={`Frame ${actualIndex + 1}`}
                className="w-full h-[100px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                onClick={() => onImageClick(frame, type, actualIndex)}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`carousel-button prev
            ${currentPage === 0 
              ? 'text-gray-900 cursor-not-allowed' 
              : 'text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'}`}
        >
          ◀
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className={`carousel-button next
            ${currentPage === totalPages - 1
              ? 'text-gray-900 cursor-not-allowed'
              : 'text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'}`}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

// Image Modal component for enlarged view
const ImageModal = ({ 
  image, 
  onClose, 
  sliderType,
  frames,
  currentSlide,
  onSlideChange,
}: { 
  image: string;
  onClose: () => void;
  sliderType: 'error' | 'heatmap' | 'original';
  frames: string[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}) => {
  const THUMBNAIL_LIMIT = 10;
  
  const initialThumbnailStart = Math.floor(currentSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT;
  const [thumbnailStart, setThumbnailStart] = useState(initialThumbnailStart);

  useEffect(() => {
    const targetPage = Math.floor(currentSlide / THUMBNAIL_LIMIT);
    const targetStart = targetPage * THUMBNAIL_LIMIT;
    setThumbnailStart(targetStart);
  }, [currentSlide, THUMBNAIL_LIMIT]);

  const handleMainNext = () => {
    const nextSlide = (currentSlide + 1) % frames.length;
    const nextPageStart = Math.floor(nextSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT;
    if (nextPageStart !== thumbnailStart) {
      setThumbnailStart(nextPageStart);
    }
    onSlideChange(nextSlide);
  };

  const handleMainPrev = () => {
    const prevSlide = (currentSlide - 1 + frames.length) % frames.length;
    const prevPageStart = Math.floor(prevSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT;
    if (prevPageStart !== thumbnailStart) {
      setThumbnailStart(prevPageStart);
    }
    onSlideChange(prevSlide);
  };

  const handleThumbnailNext = () => {
    const nextStart = thumbnailStart + THUMBNAIL_LIMIT;
    if (nextStart < frames.length) {
      setThumbnailStart(nextStart);
      onSlideChange(nextStart);
    }
  };

  const handleThumbnailPrev = () => {
    const prevStart = thumbnailStart - THUMBNAIL_LIMIT;
    if (prevStart >= 0) {
      setThumbnailStart(prevStart);
      onSlideChange(prevStart);
    }
  };

  const totalPages = Math.ceil(frames.length / THUMBNAIL_LIMIT);
  const currentPage = Math.floor(thumbnailStart / THUMBNAIL_LIMIT) + 1;
  
  const visibleThumbnails = frames.slice(
    thumbnailStart,
    thumbnailStart + THUMBNAIL_LIMIT
  );

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-6xl mx-auto carousel-container">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 right-0 text-white hover:text-gray-300 z-50 p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Main Carousel */}
        <div className="main-carousel">
          <button 
            onClick={handleMainPrev}
            className="carousel-button prev"
          >
            ◀
          </button>
          <img
            src={frames[currentSlide]}
            alt={`View ${currentSlide + 1}`}
            className="main-image"
          />
          <button 
            onClick={handleMainNext}
            className="carousel-button next"
          >
            ▶
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="thumbnail-carousel">
          <button
            onClick={handleThumbnailPrev}
            className="carousel-button prev"
            disabled={thumbnailStart === 0}
          >
            ◀
          </button>
          <div className="thumbnails">
            {visibleThumbnails.map((frame, index) => {
              const realIndex = thumbnailStart + index;
              return (
                <img
                  key={realIndex}
                  src={frame}
                  alt={`Thumbnail ${realIndex + 1}`}
                  className={`thumbnail ${realIndex === currentSlide ? 'active' : ''}`}
                  onClick={() => onSlideChange(realIndex)}
                />
              );
            })}
          </div>
          <button
            onClick={handleThumbnailNext}
            className="carousel-button next"
            disabled={thumbnailStart + THUMBNAIL_LIMIT >= frames.length}
          >
            ▶
          </button>
        </div>

        {/* Image counter and page information */}
        <div className="text-center text-white mt-2 space-y-1">
          <div>Image {currentSlide + 1} of {frames.length}</div>
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

  // Add a function to render metadata
const renderMetadata = (metadata: Record<string, string>) => {
    const groupedMetadata: Record<string, Record<string, string>> = {};
  
    // Group metadata by category
    Object.entries(metadata).forEach(([key, value]) => {
      const [category, field] = key.split(':');
      if (!groupedMetadata[category]) {
        groupedMetadata[category] = {};
      }
      groupedMetadata[category][field] = value;
    });
  
    return (
      <div className="metadata-container mb-10 mt-8 space-y-6 bg-card glass-card border rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">File Metadata</h2>
        {Object.entries(groupedMetadata).map(([category, fields]) => (
          <div key={category} className="metadata-category mb-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">{category}</h3>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(fields).map(([field, value]) => (
                  <tr key={field} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="pr-4 py-2 font-medium w-1/3">{field}</td>
                    <td className="py-2">
                      {typeof value === 'string' && value.startsWith('base64:') ? (
                        <button
                          onClick={() => navigator.clipboard.writeText(value)}
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          Copy Base64
                        </button>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Archive
          </Button>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-[150px] w-full rounded-xl" />
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Error Loading Submission</h2>
              <p className="mb-4">{error}</p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.reload()}>
                  Try Again
                </Button>
                <Button onClick={handleBack}>Return to Archive</Button>
              </div>
            </div>
          ) : submission ? (
            <div className="space-y-6">
              {/* Header with title and actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-gradient">{submission.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">{submission.category_display}</Badge>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(submission.submission_date)}
                    </span>
                    <Badge className={submission.detection_result?.is_deepfake ? "bg-red-500" : "bg-green-500"}>
                      {submission.detection_result?.is_deepfake ? (
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
                </div>

                {/* Update the buttons section to include Delete button for owned submissions */}
<div className="flex gap-2">
  {submission.user_owned && (
    <Button 
      variant="destructive" 
      onClick={handleDeleteSubmission}
    >
      <Trash className="mr-2 h-4 w-4" />
      Delete Submission
    </Button>
  )}
  <Button variant="outline" onClick={handleDownloadReport}>
    <Download className="mr-2 h-4 w-4" />
    Download Report
  </Button>
  <Button variant="outline" onClick={handleShareReport}>
    <Share2 className="mr-2 h-4 w-4" />
    Share
  </Button>
</div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Media and tabs */}
                <div className="md:col-span-2 space-y-6">
                  {/* Media display */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {submission.file_type === "Video" ? (
                        <video
                          src={submission.file_url}
                          controls
                          className="w-full h-auto max-h-[500px]"
                          poster="/placeholder.svg?height=500&width=800&text=Video+Thumbnail"
                        />
                      ) : (
                        <img
                          src={submission.file_url || "/placeholder.svg"}
                          alt={submission.title}
                          className="w-full h-auto max-h-[500px] object-contain"
                          style={{ width: '100%', height: '100%' }}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=500&width=800"
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Tabs for different content */}
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="context">Context</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="bg-card glass-card rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{submission.description}</p>
                    </TabsContent>

                    <TabsContent value="context" className="bg-card glass-card rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Context</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{submission.context}</p>

                      {submission.source_url && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Source</h4>
                          <a
                            href={submission.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {submission.source_url}
                          </a>
                        </div>
                      )}
                    </TabsContent>

                    
                    <TabsContent value="analysis" className="bg-card glass-card rounded-xl p-6 shadow-sm">
  <h3 className="text-xl font-semibold mb-4">Technical Analysis</h3>
  <div className="space-y-4">
      <p className="text-muted-foreground mb-4">
        This media was analyzed using our advanced deepfake detection algorithms. Below are the
        technical details of the analysis.
      </p>

      {/* File type information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Media Type</h4>
          <p>{submission.file_type}</p>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">File ID</h4>
          <p className="font-mono text-sm">{submission.submission_identifier}</p>
        </div>
      </div>

      {/* Detection result stats */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Analysis Results</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm mb-1">Frames Analyzed</div>
            <div className="text-2xl font-bold">
              {submission.detection_result.frames_analyzed}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm mb-1">Fake Frames Detected</div>
            <div className="text-2xl font-bold">{submission.detection_result.fake_frames}</div>
          </div>
        </div>
      </div>
    </div>
</TabsContent>
                  </Tabs>
                  
                </div>

                {/* Right column - Detection results and info */}
                <div className="space-y-6">
                  {/* Detection Result Card */}
                  {submission.detection_result ? (
  <Card className="overflow-hidden glass-card">
    <CardHeader className="pb-2">
      <CardTitle>Detection Result</CardTitle>
    </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center text-center mb-4">
                          <div
                            className={`p-4 rounded-full mb-2 ${
                              submission.detection_result.is_deepfake
                                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {submission.detection_result.is_deepfake ? (
                              <AlertTriangle className="h-8 w-8" />
                            ) : (
                              <CheckCircle className="h-8 w-8" />
                            )}
                          </div>
                          <h3 className="text-xl font-bold">
                            {submission.detection_result.is_deepfake ? "Deepfake Detected" : "Authentic Media"}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {submission.detection_result.is_deepfake
                              ? "This media has been identified as AI-generated or manipulated content."
                              : "This media appears to be authentic with no signs of manipulation."}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Confidence Score</span>
                              <span className="text-sm font-medium">
                                {(submission.detection_result.confidence_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={submission.detection_result.confidence_score * 100}
                              className={`h-2 ${
                                submission.detection_result.is_deepfake ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
                              }`}
                            />
                          </div>

                          {submission.detection_result.frames_analyzed >= 1 && (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Fake Frames</span>
                                <span className="text-sm font-medium">
                                  {submission.detection_result.fake_frames} /{" "}
                                  {submission.detection_result.frames_analyzed}
                                </span>
                              </div>
                              <Progress
                                value={
                                  (submission.detection_result.fake_frames /
                                    submission.detection_result.frames_analyzed) *
                                  100
                                }
                                className="h-2 [&>div]:bg-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Submission Info Card */}
                  <Card className = "glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle>Submission Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Submission ID</h4>
                          <p className="font-mono text-sm break-all">{submission.submission_identifier}</p>
                        </div>

                        {submission.original_submission_identifier && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Original ID</h4>
                            <p className="font-mono text-sm break-all">{submission.original_submission_identifier}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                          <p>{submission.category_display}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">File Type</h4>
                          <p>{submission.file_type}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Submission Date</h4>
                          <p>{formatDate(submission.submission_date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
        {/* Add this new section for frames analysis containers right after the Tabs component */}
{submission && submission.detection_result.analysis_report.frame_results && submission.detection_result.analysis_report.frame_results.length > 0 && (
  <div className="mt-8 max-w-7xl mx-auto">
    <h2 className="text-2xl font-bold mb-6">Visual Analysis</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {/* Original Frames */}
      <div className="glass-card border rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Original Frames</h3>
        {submission.file_type === "Image" ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-video">
                <img
                  src={submission.detection_result.analysis_report.frame_results[0].frame_path}
                  alt={`Original Frame ${index + 1}`}
                  className="w-full h-[100px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleImageClick(
                    submission.detection_result.analysis_report.frame_results[0].frame_path,
                    'original',
                    0
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <SmallCarousel
            frames={submission.detection_result.analysis_report.frame_results.map(frame => frame.frame_path)}
            onImageClick={handleImageClick}
            type="original"
            currentIndex={currentOriginalFrameSlide}
            currentPage={originalFramePage}
            onPageChange={setOriginalFramePage}
          />
        )}
      </div>

      {/* Error Level Analysis */}
      <div className="glass-card border rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Error Level Analysis</h3>
        {submission.file_type === "Image" ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-video">
                <img
                  src={submission.detection_result.analysis_report.frame_results[0].ela_path}
                  alt={`Error Level Analysis ${index + 1}`}
                  className="w-full h-[100px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleImageClick(
                    submission.detection_result.analysis_report.frame_results[0].ela_path,
                    'error',
                    0
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <SmallCarousel
            frames={submission.detection_result.analysis_report.frame_results.map(frame => frame.ela_path)}
            onImageClick={handleImageClick}
            type="error"
            currentIndex={currentErrorLevelSlide}
            currentPage={errorLevelPage}
            onPageChange={setErrorLevelPage}
          />
        )}
      </div>

      {/* Gradcam Heatmap */}
      <div className="glass-card border rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gradcam Heatmap</h3>
        {submission.file_type === "Image" ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-video">
                <img
                  src={submission.detection_result.analysis_report.frame_results[0].gradcam_path}
                  alt={`Gradcam Heatmap ${index + 1}`}
                  className="w-full h-[100px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleImageClick(
                    submission.detection_result.analysis_report.frame_results[0].gradcam_path,
                    'heatmap',
                    0
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <SmallCarousel
            frames={submission.detection_result.analysis_report.frame_results.map(frame => frame.gradcam_path)}
            onImageClick={handleImageClick}
            type="heatmap"
            currentIndex={currentHeatmapSlide}
            currentPage={heatmapPage}
            onPageChange={setHeatmapPage}
          />
        )}
      </div>
    </div>
  </div>
)}

      {/* Add metadata section if available */}
      {submission && submission.metadata && (
  <div className="mt-8 max-w-7xl mx-auto">
    {renderMetadata(submission.metadata)}
  </div>
)}

      </div>
      {/* Image Modal */}
{enlargedImage && currentSliderType && submission && (
  <ImageModal
    image={enlargedImage}
    onClose={handleCloseModal}
    sliderType={currentSliderType}
    frames={currentSliderType === 'error'
      ? submission.detection_result.analysis_report.frame_results.map(frame => frame.ela_path)
      : currentSliderType === 'heatmap'
        ? submission.detection_result.analysis_report.frame_results.map(frame => frame.gradcam_path)
        : submission.detection_result.analysis_report.frame_results.map(frame => frame.frame_path)
    }
    currentSlide={currentSliderType === 'error' 
      ? currentErrorLevelSlide 
      : currentSliderType === 'heatmap' 
        ? currentHeatmapSlide 
        : currentOriginalFrameSlide}
    onSlideChange={(index) => {
      if (currentSliderType === 'error') {
        setCurrentErrorLevelSlide(index);
      } else if (currentSliderType === 'heatmap') {
        setCurrentHeatmapSlide(index);
      } else {
        setCurrentOriginalFrameSlide(index);
      }
      if (submission) {
        setEnlargedImage(currentSliderType === 'error'
          ? submission.detection_result.analysis_report.frame_results[index].ela_path
          : currentSliderType === 'heatmap'
            ? submission.detection_result.analysis_report.frame_results[index].gradcam_path
            : submission.detection_result.analysis_report.frame_results[index].frame_path
        );
      }
    }}
  />
)}

    </Layout>
  )
}

