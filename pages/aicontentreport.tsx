import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Download, Share2, CheckCircle, AlertTriangle, Info, Brain, BarChart2, Image, Zap, Eye } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { useDetectionHistory } from '../contexts/DetectionHistoryContext'
import Cookies from 'js-cookie'
import axios from 'axios'
import { Progress } from "@/components/ui/progress"

/**
 * Below are the interfaces for the AI content detection result.
 * You can adapt them to match your actual AIContentDetectionResult interface
 * or reuse them if you already have a matching type in detection context.
 */
interface FrameResult {
  frame_id: string
  frame_analysis: {
    prediction: string
    confidence: number
  }
  crop_analyses: Array<{
    face_index: number
    prediction: string
    confidence: number
  }>
  final_verdict: string
  frame_path: string
  crop_paths: string[]
  ela_path: string
  gradcam_path: string
}

interface AnalysisReport {
  media_path: string
  media_type: string
  file_id: string
  frame_results: FrameResult[]
  statistics: {
    confidence: number
    is_deepfake: boolean
    total_frames: number
    fake_frames: number
    fake_frames_percentage: number
    total_crops: number
    fake_crops: number
    fake_crops_percentage: number
  }
}

interface AIContentDetectionResult {
  id: number
  media_upload: number
  is_generated: boolean
  confidence_score: number
  analysis_report: {
    file_id: string
    media_path: string
    gradcam_path: string
    prediction: string
    confidence: number
  }
  metadata: Record<string, any>
}

/**
 * This page mimics deepfakereport.tsx but shows an AI content detection report
 * and stores the result in detectionHistory using addDetectionEntry.
 */
export default function AIContentReportPage() {
  const router = useRouter()
  const { user } = useUser()
  //const { addDetectionEntry } = useDetectionHistory()

  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown')
  const [analysisResult, setAnalysisResult] = useState<AIContentDetectionResult>({
    id: 0,
    media_upload: 0,
    is_generated: false,
    confidence_score: 0,
    analysis_report: {
      file_id: '',
      media_path: '',
      gradcam_path: '',
      prediction: '',
      confidence: 0,
    },
    metadata: {},
  })

  // Carousel state
  const [currentErrorLevelSlide, setCurrentErrorLevelSlide] = useState(0)
  const [currentHeatmapSlide, setCurrentHeatmapSlide] = useState(0)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [currentSliderType, setCurrentSliderType] = useState<'error' | 'heatmap' | 'original' | null>(null)
  const [errorLevelPage, setErrorLevelPage] = useState(0)
  const [heatmapPage, setHeatmapPage] = useState(0)
  const [currentOriginalFrameSlide, setCurrentOriginalFrameSlide] = useState(0)
  const [originalFramePage, setOriginalFramePage] = useState(0)

  // Ensure user is logged in
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  /**
   * Parse the AI content detection result from router.query, then
   * store it to detectionHistory with detectionType: 'ai-content'.
   */
  useEffect(() => {
    const { fromDetection, submission_identifier, fromHistory } = router.query;

    const fetchData = async () => {
      // Case 1: Coming directly from detection
      if (fromDetection === 'true') {
        const storedResult = sessionStorage.getItem('aiContentResult');
        if (storedResult) {
          setAnalysisResult(JSON.parse(storedResult));
          // Clear after using
          sessionStorage.removeItem('aiContentResult');
        } 
        // else {
        //   console.error('No stored AI content detection result found');
        //   router.push('/detect');
        // }
      }
      // Case 2: Coming from history with file_id
      else if (submission_identifier && fromHistory) {
        try {
          // Get the access token from cookies
          let accessToken = Cookies.get('accessToken');
          
          if (!accessToken) {
            alert('Please login first to view detection results.');
            router.push('/login');
            return;
          }
          
          try {
            const response = await axios.get(
              `http://127.0.0.1:8000/api/user/submissions/${submission_identifier}/`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              }
            );
            
            setAnalysisResult({
              id: response.data.data.id,
              media_upload: response.data.data.id,
              is_generated: response.data.data.data.is_generated,
              confidence_score: response.data.data.data.confidence_score,
              analysis_report: response.data.data.data.analysis_report,
              metadata: response.data.data.metadata
            });
          } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
              // Access token is expired, refresh the token
              const refreshToken = Cookies.get('refreshToken');
              
              if (refreshToken) {
                // Get a new access token using the refresh token
                const refreshResponse = await axios.post(
                  'http://127.0.0.1:8000/api/auth/refresh_token/',
                  { refresh: refreshToken }
                );
                
                accessToken = refreshResponse.data.access;
                
                // Store the new access token in cookies
                if (accessToken) {
                  Cookies.set('accessToken', accessToken);
                  
                  // Retry the fetch with the new access token
                  const response = await axios.get(
                    `http://127.0.0.1:8000/api/user/submissions/${submission_identifier}/`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`
                      }
                    }
                  );
                  
                  setAnalysisResult({
                    id: response.data.data.id,
                    media_upload: response.data.data.id,
                    is_generated: response.data.data.data.is_generated,
                    confidence_score: response.data.data.data.confidence_score,
                    analysis_report: response.data.data.data.analysis_report,
                    metadata: response.data.data.metadata
                  });
                } else {
                  alert('Please login first to view detection results.');
                  router.push('/login');
                }
              } else {
                alert('Please login first to view detection results.');
                router.push('/login');
              }
            } else {
              console.error('Failed to fetch AI detection result:', error);
              router.push('/detect');
            }
          }
        } catch (error) {
          console.error('Failed to fetch AI detection result:', error);
          router.push('/detect');
        }
      } 
      // Case 3: No valid source
      else {
        console.error('No valid AI detection result source');
        router.push('/detect');
      }
    };

    fetchData();
  }, [router.query]);

  /**
   * Decide if it's image, video, or unknown by probing media_path content.
   */
  useEffect(() => {
    if (analysisResult.analysis_report.media_path) {
      const determineMediaType = async () => {
        try {
          const response = await fetch(analysisResult.analysis_report.media_path)
          const blob = await response.blob()
          const mimeType = blob.type

          if (mimeType.startsWith('image/')) {
            setMediaType('image')
          } else if (mimeType.startsWith('video/')) {
            setMediaType('video')
          } else {
            setMediaType('unknown')
          }
        } catch (error) {
          console.error('Error determining media type:', error)
          setMediaType('unknown')
        }
      }

      determineMediaType()
    }
  }, [analysisResult.analysis_report.media_path])

  /**
   * Download the JSON report as a file for external reference.
   */
  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai_content_report_${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Attempt to share the JSON report as a file if Web Share is supported.
   * Otherwise, fallback to download.
   */
  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' })
        const file = new File([blob], `ai_content_report_${new Date().toISOString()}.json`, {
          type: 'application/json'
        })

        await navigator.share({
          title: 'AI Content Detection Report',
          text: `AI Content Detection: ${
            analysisResult.is_generated ? 'Likely AI-Generated' : 'Likely Authentic'
          } (${(analysisResult.confidence_score * 100).toFixed(2)}% confidence)`,
          files: [file]
        })
      } catch (error) {
        console.error('Error sharing:', error)
        handleDownloadReport()
      }
    } else {
      handleDownloadReport()
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  /**
   * Handle image click for ELA/Gradcam/original frames to enlarge in a modal.
   */
  const handleImageClick = (
    image: string,
    type: 'error' | 'heatmap' | 'original',
    index: number
  ) => {
    setEnlargedImage(image)
    setCurrentSliderType(type)
    document.body.style.overflow = 'hidden'
    if (type === 'error') setCurrentErrorLevelSlide(index)
    if (type === 'heatmap') setCurrentHeatmapSlide(index)
    if (type === 'original') setCurrentOriginalFrameSlide(index)
  }

  /**
   * Close enlarged image modal.
   */
  const handleCloseModal = () => {
    setEnlargedImage(null)
    setCurrentSliderType(null)
    document.body.style.overflow = 'auto'
  }

  // A smaller carousel to show frames in groups of 3
  const SmallCarousel = ({
    frames,
    onImageClick,
    type,
    currentIndex,
    currentPage,
    onPageChange
  }: {
    frames: string[]
    onImageClick: (image: string, type: 'error' | 'heatmap' | 'original', index: number) => void
    type: 'error' | 'heatmap' | 'original'
    currentIndex: number
    currentPage: number
    onPageChange: (page: number) => void
  }) => {
    const imagesPerPage = 3
    const totalPages = Math.ceil(frames.length / imagesPerPage)

    const handlePrevPage = () => {
      const newPage = Math.max(0, currentPage - 1)
      onPageChange(newPage)
    }

    const handleNextPage = () => {
      const newPage = Math.min(totalPages - 1, currentPage + 1)
      onPageChange(newPage)
    }

    const startIndex = currentPage * imagesPerPage
    const visibleFrames = frames.slice(startIndex, startIndex + imagesPerPage)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {visibleFrames.map((frame, index) => {
            const actualIndex = startIndex + index
            return (
              <div key={actualIndex} className="relative aspect-video">
                <img
                  src={frame}
                  alt={`Frame ${actualIndex + 1}`}
                  className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={() => onImageClick(frame, type, actualIndex)}
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between px-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="carousel-button prev"
          >
            ◀
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="carousel-button next"
          >
            ▶
          </button>
        </div>
      </div>
    )
  }

  // Fullscreen modal for enlarged images
  const ImageModal = ({
    image,
    onClose,
    sliderType,
    frames,
    currentSlide,
    onSlideChange
  }: {
    image: string
    onClose: () => void
    sliderType: 'error' | 'heatmap' | 'original'
    frames: string[]
    currentSlide: number
    onSlideChange: (index: number) => void
  }) => {
    const THUMBNAIL_LIMIT = 10

    const initialThumbnailStart = Math.floor(currentSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT
    const [thumbnailStart, setThumbnailStart] = useState(initialThumbnailStart)

    useEffect(() => {
      const targetPage = Math.floor(currentSlide / THUMBNAIL_LIMIT)
      const targetStart = targetPage * THUMBNAIL_LIMIT
      setThumbnailStart(targetStart)
    }, [currentSlide, THUMBNAIL_LIMIT])

    const handleMainNext = () => {
      const nextSlide = (currentSlide + 1) % frames.length
      const nextPageStart = Math.floor(nextSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT
      if (nextPageStart !== thumbnailStart) {
        setThumbnailStart(nextPageStart)
      }
      onSlideChange(nextSlide)
    }

    const handleMainPrev = () => {
      const prevSlide = (currentSlide - 1 + frames.length) % frames.length
      const prevPageStart = Math.floor(prevSlide / THUMBNAIL_LIMIT) * THUMBNAIL_LIMIT
      if (prevPageStart !== thumbnailStart) {
        setThumbnailStart(prevPageStart)
      }
      onSlideChange(prevSlide)
    }

    const handleThumbnailNext = () => {
      const nextStart = thumbnailStart + THUMBNAIL_LIMIT
      if (nextStart < frames.length) {
        setThumbnailStart(nextStart)
        onSlideChange(nextStart)
      }
    }

    const handleThumbnailPrev = () => {
      const prevStart = thumbnailStart - THUMBNAIL_LIMIT
      if (prevStart >= 0) {
        setThumbnailStart(prevStart)
        onSlideChange(prevStart)
      }
    }

    const totalPages = Math.ceil(frames.length / THUMBNAIL_LIMIT)
    const currentPage = Math.floor(thumbnailStart / THUMBNAIL_LIMIT) + 1

    const visibleThumbnails = frames.slice(thumbnailStart, thumbnailStart + THUMBNAIL_LIMIT)

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-6xl mx-auto carousel-container">
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
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="main-carousel">
            <button onClick={handleMainPrev} className="carousel-button prev"> ◀ </button>
            <img
              src={frames[currentSlide]}
              alt={`View ${currentSlide + 1}`}
              className="main-image"
            />
            <button onClick={handleMainNext} className="carousel-button next"> ▶ </button>
          </div>

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
                const realIndex = thumbnailStart + index
                return (
                  <img
                    key={realIndex}
                    src={frame}
                    alt={`Thumbnail ${realIndex + 1}`}
                    className={`thumbnail ${realIndex === currentSlide ? 'active' : ''}`}
                    onClick={() => onSlideChange(realIndex)}
                  />
                )
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

          <div className="text-center text-white mt-2 space-y-1">
            <div>Image {currentSlide + 1} of {frames.length}</div>
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMetadata = (metadata: Record<string, any>) => {
    const groupedMetadata: Record<string, Record<string, any>> = {};

    // Group metadata by category
    Object.entries(metadata).forEach(([key, value]) => {
      const [category, field] = key.split(':');
      if (!groupedMetadata[category]) {
        groupedMetadata[category] = {};
      }
      groupedMetadata[category][field] = value;
    });

    return (
      <div className="metadata-container space-y-6 glass-card bg-background border rounded-lg p-6 shadow-md">
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
                      ) : typeof value === 'object' ? (
                        JSON.stringify(value)
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

  // If no result is present, return a fallback
  if (!analysisResult || !analysisResult.analysis_report.media_path) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-center text-muted-foreground">No AI Content Detection Result found.</p>
        </div>
      </Layout>
    )
  }

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
                <CheckCircle className="h-4 w-4 mr-2" />
                Analysis Complete
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              AI Content <span className="gradient-text">Detection Results</span>
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Advanced analysis of AI-generated content, using linguistic patterns, 
              stylistic markers, and machine learning to identify artificially created text and images
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Linguistic Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Style Detection</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Pattern Recognition</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Analysis Details</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareReport} disabled>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {/* Left: Media Display */}
            <div className="md:col-span-2 space-y-8">
              {/* Media Card */}
              <motion.div className="glass-card border rounded-xl overflow-hidden shadow-md" variants={itemVariants}>
                {mediaType === 'image' && (
                  <img 
                    src={analysisResult.analysis_report.media_path} 
                    alt="Analyzed Media" 
                    className="w-full h-auto max-h-[595px] object-contain"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {mediaType === 'video' && (
                  <video
                    src={analysisResult.analysis_report.media_path}
                    controls
                    className="w-full max-h-[500px] object-contain"
                  />
                )}
                {mediaType === 'unknown' && (
                  <div className="w-full max-h-[500px] flex items-center justify-center">
                    Unsupported media type
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Detection Result and Stats */}
            <div className="space-y-8">
              {/* Detection Result Card */}
              <motion.div className="glass-card overflow-hidden border rounded-xl shadow-md" variants={itemVariants}>
                <div className="px-6 pt-6 pb-2">
                  <h2 className="text-xl font-semibold">Detection Result</h2>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div
                      className={`p-4 rounded-full mb-2 ${
                        analysisResult.is_generated
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {analysisResult.is_generated ? (
                        <AlertTriangle className="h-8 w-8" />
                      ) : (
                        <CheckCircle className="h-8 w-8" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold">
                      {analysisResult.is_generated ? "AI-Generated Content" : "Human-Created Content"}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {analysisResult.is_generated
                        ? "This content has been identified as likely created by AI."
                        : "This content appears to be created by a human."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Confidence Score</span>
                        <span className="text-sm font-medium">
                          {(analysisResult.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.confidence_score * 100}
                        className={`h-2 ${
                          analysisResult.is_generated ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
                        }`}
                      />
                    </div>

                    {/* Adding Fake Frames progress bar (always 1 frame for images) */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Fake Frames</span>
                        <span className="text-sm font-medium">
                          {analysisResult.is_generated ? "1 / 1" : "0 / 1"}
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.is_generated ? 100 : 0}
                        className="h-2 [&>div]:bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Analysis Statistics */}
              <motion.div className="glass-card border p-6 shadow-md" variants={itemVariants}>
                <h2 className="text-xl font-semibold mb-4">Analysis Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Total Frames</div>
                    <div className="text-xl font-semibold">1</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Generated Frames</div>
                    <div className="text-xl font-semibold">{analysisResult.is_generated ? "1" : "0"}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Analysis Method</div>
                    <div className="text-xl font-semibold">AI Detection</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Processing Time</div>
                    <div className="text-xl font-semibold">~2.4s</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visual Analysis Section */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Visual Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

            {/* Gradcam Heatmap - Updated to match deepfakereport.tsx */}
            <div className="glass-card border rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Gradcam Heatmap</h3>
              {mediaType === "image" ? (
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative aspect-video">
                      <img
                        src={analysisResult.analysis_report.gradcam_path}
                        alt={`Gradcam Heatmap ${index + 1}`}
                        className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                        onClick={() => handleImageClick(
                          analysisResult.analysis_report.gradcam_path,
                          'heatmap',
                          0
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <SmallCarousel
                  frames={[analysisResult.analysis_report.gradcam_path]}
                  onImageClick={handleImageClick}
                  type="heatmap"
                  currentIndex={currentHeatmapSlide}
                  currentPage={heatmapPage}
                  onPageChange={setHeatmapPage}
                />
              )}
            </div>
          </div>
          {analysisResult.metadata && (
        <div className="mt-8">
          {renderMetadata(analysisResult.metadata)}
        </div>
      )}
        </motion.div>
      </div>

      {/* Detection Explanation Section */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Info className="mr-3 h-6 w-6 text-primary" />
              Understanding AI Content Detection
            </h2>
            <p className="text-muted-foreground mb-6">
              Our platform uses advanced machine learning algorithms to detect AI-generated content. 
              Below we explain how to interpret the analysis results and what each visualization represents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Detection Method Card */}
            <div className="glass-card border rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-xl mr-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Detection Methodology</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our AI detection system analyzes patterns, inconsistencies, and statistical anomalies in content that are 
                characteristic of AI generation but often invisible to the human eye.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pattern analysis of linguistic structures and image artifacts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Deep neural networks trained on millions of AI and human-created samples</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Analysis of metadata and content fingerprinting</span>
                </li>
              </ul>
            </div>

            {/* Interpreting Results Card */}
            <div className="glass-card border rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-xl mr-4">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Interpreting Results</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                The confidence score indicates how certain our system is about its verdict. Higher scores mean stronger evidence
                of AI generation or human creation was found.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3 flex-shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">AI-Generated Content (Red)</p>
                    <p className="text-sm text-muted-foreground">Indicates content likely created by AI tools like DALL-E, Midjourney, or similar</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 mr-3 flex-shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Human-Created Content (Green)</p>
                    <p className="text-sm text-muted-foreground">Indicates content likely created by a human without AI assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Analysis Explanation */}
          <div className="glass-card border rounded-xl p-6 shadow-md mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-xl mr-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Visual Analysis Explained</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <Image className="h-5 w-5 text-primary mr-2" />
                  Original Image
                </h4>
                <p className="text-muted-foreground">
                  This is the original content that was submitted for analysis. Our system examines this for patterns and artifacts
                  characteristic of AI generation.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  Gradcam Heatmap
                </h4>
                <p className="text-muted-foreground mb-3">
                  Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes which regions of the image most strongly 
                  influenced the AI's decision. Warmer colors (red, yellow) indicate areas the model found most suspicious or indicative of AI generation.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Interpretation Note:</span> High activation in unnatural areas or across regular patterns
                      often indicates AI generation. However, certain complex natural patterns may also trigger detection signals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Limitations Notice */}
          <div className="bg-muted/30 rounded-xl p-6 border border-border">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 mr-4 flex-shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2">Limitations & Considerations</h4>
                <p className="text-muted-foreground mb-3">
                  While our system achieves high accuracy, AI detection technology is constantly evolving as new generation 
                  methods emerge. Consider these results as strong indicators rather than absolute proof.
                </p>
                <p className="text-muted-foreground">
                  For critical applications, we recommend using these results as part of a broader verification approach 
                  that may include manual review, context analysis, and source verification.
                </p>
              </div>
            </div>
          </div>
          
          
        </motion.div>
      </div>

      {/* Image Modal for enlarged ELA/Gradcam frames */}
      {enlargedImage && currentSliderType && (
        <ImageModal
          image={enlargedImage}
          onClose={handleCloseModal}
          sliderType={currentSliderType}
          frames={[analysisResult.analysis_report.gradcam_path]}
          currentSlide={0}
          onSlideChange={() => {}}
        />
      )}

      
    </Layout>
  )
}