import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { useDetectionHistory } from '../contexts/DetectionHistoryContext'
import Cookies from 'js-cookie'
import axios from 'axios'

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
  metadata: Record<string, string>
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
              `http://127.0.0.1:8000/api/user/submissions/${submission_identifier}`,
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
                    `http://127.0.0.1:8000/api/user/submissions/${submission_identifier}`,
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
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="carousel-button next"
          >
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
            <button onClick={handleMainPrev} className="carousel-button prev"></button>
            <img
              src={frames[currentSlide]}
              alt={`View ${currentSlide + 1}`}
              className="main-image"
            />
            <button onClick={handleMainNext} className="carousel-button next"></button>
          </div>

          <div className="thumbnail-carousel">
            <button
              onClick={handleThumbnailPrev}
              className="carousel-button prev"
              disabled={thumbnailStart === 0}
            >
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
            ></button>
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
      <div className="metadata-container mt-8 space-y-6 bg-background border rounded-lg p-6 shadow-md">
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
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div
          className="grid grid-cols-12 gap-8 p-8 w-full max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Left Section: Title, Download, and main media */}
          <motion.div className="col-span-12 md:col-span-7 space-y-6" variants={itemVariants}>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">
                AI Content Detection Report
              </h1>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareReport} disabled>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>

            <motion.div className="border rounded-lg overflow-hidden shadow-md" variants={itemVariants}>
              <img
                src={analysisResult.analysis_report.media_path}
                alt="Analyzed Media"
                className="w-full max-h-[500px] object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Right Section: Detection result, confidence, ELA, GradCam */}
          <motion.div className="col-span-12 md:col-span-5 space-y-6" variants={itemVariants}>
            {/* Detection Result Summary */}
            <motion.div className="bg-background border rounded-lg p-6 shadow-md" variants={itemVariants}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Detection Result</h2>
                <motion.div
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    analysisResult.is_generated ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {analysisResult.is_generated ? 'Likely AI-Generated' : 'Likely Authentic'}
                </motion.div>
              </div>
              <div className="mt-4 text-center">
                <motion.p
                  className="text-4xl font-bold text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {(analysisResult.confidence_score * 100).toFixed(2)}%
                </motion.p>
                <p className="text-muted-foreground">Confidence of AI Content Detection</p>
              </div>
            </motion.div>

            <motion.div className="border rounded-lg p-4 bg-background shadow-md" variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-2">Gradcam Heatmap</h3>
              <img
                src={analysisResult.analysis_report.gradcam_path}
                alt="Gradcam Heatmap"
                className="w-full max-h-[150px] object-contain cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleImageClick(analysisResult.analysis_report.gradcam_path, 'heatmap', 0)}
              />
            </motion.div>
          </motion.div>
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

      {analysisResult.metadata && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          {renderMetadata(analysisResult.metadata)}
        </div>
      )}
    </Layout>
  )
}