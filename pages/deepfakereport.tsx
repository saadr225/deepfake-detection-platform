import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, Info, Shield, BarChart2, Image, Scan, Zap, FilmIcon, User, Eye } from "lucide-react";
import { Download, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useDetectionHistory } from '../contexts/DetectionHistoryContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Progress } from "@/components/ui/progress";

interface FrameResult {
  frame_id: string;
  frame_analysis: {
    prediction: string;
    confidence: number;
  };
  crop_analyses: Array<{
    face_index: number;
    prediction: string;
    confidence: number;
  }>;
  final_verdict: string;
  frame_path: string;
  crop_paths: string[];
  ela_path: string; 
  gradcam_path: string; 
}

interface AnalysisReport {
  media_path: string;
  media_type: string;
  file_id: string;
  frame_results: FrameResult[]; 
  statistics: {
    confidence: number;
    is_deepfake: boolean;
    total_frames: number;
    fake_frames: number;
    fake_frames_percentage: number;
    total_crops: number;
    fake_crops: number;
    fake_crops_percentage: number;
  };
}

interface DetectionResult {
  id: number;
  submission_identifier: string;
  media_upload: number;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  fake_frames: number;
  analysis_report: AnalysisReport; 
  metadata?: Record<string, string>;
}

export default function DeepfakeReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const { detectionHistory } = useDetectionHistory(); //addDetectionEntry } = useDetectionHistory();
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [analysisResult, setAnalysisResult] = useState<DetectionResult>({
    id: 0,
    submission_identifier: '',
    media_upload: 0,
    is_deepfake: false,
    confidence_score: 0,
    frames_analyzed: 0,
    fake_frames: 0,
    analysis_report: {
      media_path: '',
      media_type: '',
      file_id: '',
      frame_results: [], 
      statistics: {
        confidence: 0,
        is_deepfake: false,
        total_frames: 0,
        fake_frames: 0,
        fake_frames_percentage: 0,
        total_crops: 0,
        fake_crops: 0,
        fake_crops_percentage: 0,
      },
    },
  });

  const [currentErrorLevelSlide, setCurrentErrorLevelSlide] = useState(0);
  const [currentHeatmapSlide, setCurrentHeatmapSlide] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [currentSliderType, setCurrentSliderType] = useState<'error' | 'heatmap' | 'original' | null>(null);
  const [errorLevelPage, setErrorLevelPage] = useState(0);
  const [heatmapPage, setHeatmapPage] = useState(0);
  const [currentOriginalFrameSlide, setCurrentOriginalFrameSlide] = useState(0);
  const [originalFramePage, setOriginalFramePage] = useState(0);
  // Add these state variables at the top with the other useState declarations
const [showSubmitForm, setShowSubmitForm] = useState(false);
const [submitSuccess, setSubmitSuccess] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);

// Form state
const [pdaTitle, setPdaTitle] = useState('');
const [pdaCategory, setPdaCategory] = useState('');
const [pdaDescription, setPdaDescription] = useState('');
const [pdaContext, setPdaContext] = useState('');
const [pdaSourceUrl, setPdaSourceUrl] = useState('');

// Add this constant for categories
const pdaCategories = [
  { code: 'POL', name: 'Politician' },
  { code: 'CEL', name: 'Celebrity' },
  { code: 'INF', name: 'Influencer' },
  { code: 'PUB', name: 'Public Figure' },
  { code: 'OTH', name: 'Other' }
];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const { fromDetection, submission_identifier, fromHistory } = router.query;

    const fetchData = async () => {
      // Case 1: Coming directly from detection
      if (fromDetection === 'true') {
        const storedIdentifier = sessionStorage.getItem('submissionIdentifier');
        if (storedIdentifier) {
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
                `http://127.0.0.1:8000/api/user/submissions/${storedIdentifier}/`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );
              
              setAnalysisResult({
                id: response.data.data.id,
                submission_identifier: response.data.data.submission_identifier,
                media_upload: response.data.data.id,
                is_deepfake: response.data.data.data.is_deepfake,
                confidence_score: response.data.data.data.confidence_score,
                analysis_report: response.data.data.data.analysis_report,
                metadata: response.data.data.metadata,
                frames_analyzed: response.data.data.data.frames_analyzed,
                fake_frames: response.data.data.data.fake_frames,
              });
              
              // Clear after using
              sessionStorage.removeItem('submissionIdentifier');
              
            } catch (error) {
              if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                // Handle token refresh (same as in the existing code for Case 2)
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
                      `http://127.0.0.1:8000/api/user/submissions/${storedIdentifier}/`,
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`
                        }
                      }
                    );
                    
                    setAnalysisResult({
                      id: response.data.data.id,
                      submission_identifier: response.data.data.submission_identifier,
                      media_upload: response.data.data.id,
                      is_deepfake: response.data.data.data.is_deepfake,
                      confidence_score: response.data.data.data.confidence_score,
                      analysis_report: response.data.data.data.analysis_report,
                      metadata: response.data.data.metadata,
                      frames_analyzed: response.data.data.data.frames_analyzed,
                      fake_frames: response.data.data.data.fake_frames,
                    });
                    
                    // Clear after using
                    sessionStorage.removeItem('submissionIdentifier');
                  } else {
                    alert('Please login first to view detection results.');
                    router.push('/login');
                  }
                } else {
                  alert('Please login first to view detection results.');
                  router.push('/login');
                }
              } else {
                console.error('Failed to fetch detection result:', error);
                router.push('/detect');
              }
            }
          } catch (error) {
            console.error('Failed to fetch detection result:', error);
            router.push('/detect');
          }
        } else {
          console.error('No stored submission identifier found');
          router.push('/detect');
        }
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
            
            // For deepfakereport.tsx
            //setAnalysisResult(response.data.data.data);

            setAnalysisResult({
              id: response.data.data.id,
              submission_identifier: response.data.data.submission_identifier,
              media_upload: response.data.data.id,
              is_deepfake: response.data.data.data.is_deepfake,
              confidence_score: response.data.data.data.confidence_score,
              analysis_report: response.data.data.data.analysis_report,
              metadata: response.data.data.metadata,
              frames_analyzed: response.data.data.data.frames_analyzed,
              fake_frames: response.data.data.data.fake_frames,
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
                  
                  //setAnalysisResult(response.data.data.data);

                  setAnalysisResult({
                    id: response.data.data.id,
                    submission_identifier: response.data.data.submission_identifier,
                    media_upload: response.data.data.id,
                    is_deepfake: response.data.data.data.is_deepfake,
                    confidence_score: response.data.data.data.confidence_score,
                    analysis_report: response.data.data.data.analysis_report,
                    metadata: response.data.data.metadata,
                    frames_analyzed: response.data.data.data.frames_analyzed,
                    fake_frames: response.data.data.data.fake_frames,
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
              console.error('Failed to fetch detection result:', error);
              router.push('/detect');
            }
          }
        } catch (error) {
          console.error('Failed to fetch detection result:', error);
          router.push('/detect');
        }
      } 
      // Case 3: No valid source
      else {
        console.error('No valid detection result source');
        router.push('/detect');
      }
    };

    fetchData();
  }, [router.query]);

  useEffect(() => {
    if (analysisResult.analysis_report.media_path) {
      const determineMediaType = async () => {
        try {
          const response = await fetch(analysisResult.analysis_report.media_path);
          const blob = await response.blob();
          const mimeType = blob.type;

          if (mimeType.startsWith('image/')) {
            setMediaType('image');
          } else if (mimeType.startsWith('video/')) {
            setMediaType('video');
          } else {
            setMediaType('unknown');
          }
        } catch (error) {
          console.error('Error determining media type:', error);
          setMediaType('unknown');
        }
      };

      determineMediaType();
    }
  }, [analysisResult.analysis_report.media_path]);

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deepfake_report_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        // Create the JSON file blob, same as in handleDownloadReport
        const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
        const file = new File([blob], `deepfake_report_${new Date().toISOString()}.json`, {
          type: 'application/json'
        });
  
        // Share the file instead of the URL
        await navigator.share({
          title: 'Deepfake Detection Report',
          text: `Deepfake Detection Result: ${analysisResult.is_deepfake ? 'Likely Deepfake' : 'Likely Authentic'} (${(analysisResult.confidence_score * 100).toFixed(2)}% confidence)`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to downloading if sharing fails
        handleDownloadReport();
      }
    } else {
      // Fallback to downloading if Web Share API is not supported
      handleDownloadReport();
    }
  };
  
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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

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
  
  
  const handleCloseModal = () => {
    setEnlargedImage(null);
    setCurrentSliderType(null);
    document.body.style.overflow = 'auto';
  };

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
                  className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
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
                : 'text-white hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'}`}
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
                : 'text-white hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            ▶
          </button>
        </div>
      </div>
    );
  };

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
      <div className="metadata-container mt-8 space-y-6 glass-card border rounded-lg p-6 shadow-md">
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
                      ) : typeof value === 'object' && value !== null ? (
                        JSON.stringify(value)
                      ) : (
                        String(value)
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

  // Add this function to handle the form submission
// Add this function to handle the form submission
const handleSubmitToPDA = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!pdaTitle || !pdaCategory) {
    setSubmitError('Title and Category are required fields');
    return;
  }
  
  setSubmitting(true);
  setSubmitError(null);
  
  try {
    // Get the access token from cookies
    let accessToken = Cookies.get('accessToken');
    
    if (!accessToken) {
      setSubmitError('Please login to submit to the Public Deepfake Archive');
      setSubmitting(false);
      return;
    }
    
    // Use the correct submission identifier directly from the analysisResult
    const submitData = {
      submission_identifier: analysisResult.submission_identifier,
      title: pdaTitle,
      category: pdaCategory,
      description: pdaDescription,
      context: pdaContext,
      source_url: pdaSourceUrl
    };
    
    console.log("Submitting with identifier:", submitData.submission_identifier);
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/pda/submit/',
        submitData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      // Rest of the function remains the same...
      
      setSubmitSuccess(true);
      // Reset form
      setPdaTitle('');
      setPdaCategory('');
      setPdaDescription('');
      setPdaContext('');
      setPdaSourceUrl('');
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        // Access token is expired, refresh the token
        const refreshToken = Cookies.get('refreshToken');
        
        if (refreshToken) {
          // Get a new access token using the refresh token
          try {
            const refreshResponse = await axios.post(
              'http://127.0.0.1:8000/api/auth/refresh_token/',
              { refresh: refreshToken }
            );
            
            accessToken = refreshResponse.data.access;
            
            // Store the new access token in cookies
            if (accessToken) {
              Cookies.set('accessToken', accessToken);
              
              // Retry the submission with the new access token
              const submitResponse = await axios.post(
                'http://127.0.0.1:8000/api/pda/submit/',
                submitData,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );
              
              setSubmitSuccess(true);
              // Reset form
              setPdaTitle('');
              setPdaCategory('');
              setPdaDescription('');
              setPdaContext('');
              setPdaSourceUrl('');
              
            } else {
              setSubmitError('Authentication failed. Please log in again.');
            }
          } catch (refreshError) {
            setSubmitError('Failed to refresh authentication. Please log in again.');
          }
        } else {
          setSubmitError('Please log in to submit to the Public Deepfake Archive.');
        }
      } else {
        // Display the specific error from the server response instead of a generic message
        if (axios.isAxiosError(error) && error.response && error.response.data) {
          const errorData = error.response.data;
          // Check if we have a message in the response
          if (errorData.error) {
            setSubmitError(errorData.error);
          } else if (errorData.message) {
            setSubmitError(errorData.message);
          } else {
            // Fallback to default message
            setSubmitError('Failed to submit to PDA. Please try again later.');
          }
        } else {
          setSubmitError('Failed to submit to PDA. Please try again later.');
        }
        console.error('PDA submission error:', error);
      }
    }
  } catch (error) {
    setSubmitError('An unexpected error occurred. Please try again.');
    console.error('Error in PDA submission process:', error);
  } finally {
    setSubmitting(false);
  }
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
                <CheckCircle className="h-4 w-4 mr-2" />
                Analysis Complete
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Detailed <span className="gradient-text">Deepfake Analysis</span> Results
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Comprehensive breakdown of our AI analysis, showing detection confidence, 
              visual evidence, and technical metrics to verify content authenticity
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Error Level Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Facial Recognition</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle className="h-4 w-4 text-primary" /> 
                <span>Metadata Verification</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Left: Media and Submit to PDA */}
            <div className="md:col-span-2 space-y-8">
              {/* Media Card */}
              <motion.div className="glass-card border rounded-xl overflow-hidden shadow-md" variants={itemVariants}>
    {mediaType === 'image' && (
      <img 
        src={analysisResult.analysis_report.media_path} 
        alt="Analyzed Media" 
                    className="w-full h-auto max-h-[610px] object-contain"
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

              {/* Submit to PDA Section */}
  {analysisResult.is_deepfake && (
                <motion.div className="glass-card border rounded-xl p-6 shadow-md" variants={itemVariants}>
      {!submitSuccess ? (
        <>
          <Button 
            onClick={() => setShowSubmitForm(!showSubmitForm)} 
                        className="w-full mb-4"
            variant="default"
          >
            {showSubmitForm ? "Cancel Submission" : "Submit to Public Deepfake Archive"}
          </Button>
          {showSubmitForm && (
            <motion.div
                          className="mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4">Submit to Public Deepfake Archive</h3>
              <p className="text-muted-foreground mb-4">
                Your submission will be reviewed before being added to the public archive.
                Please provide accurate information.
              </p>
              {submitError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md mb-4">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmitToPDA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                  <Input
                    value={pdaTitle}
                    onChange={(e) => setPdaTitle(e.target.value)}
                    placeholder="E.g., Political Figure Deepfake"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                  <Select value={pdaCategory} onValueChange={setPdaCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {pdaCategories.map((category) => (
                        <SelectItem key={category.code} value={category.code}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={pdaDescription}
                    onChange={(e) => setPdaDescription(e.target.value)}
                    placeholder="Describe the deepfake content"
                    className="w-full min-h-[100px] p-2 border rounded-md bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Context</label>
                  <textarea
                    value={pdaContext}
                    onChange={(e) => setPdaContext(e.target.value)}
                    placeholder="Provide additional context about the deepfake"
                    className="w-full min-h-[100px] p-2 border rounded-md bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source URL</label>
                  <Input
                    value={pdaSourceUrl}
                    onChange={(e) => setPdaSourceUrl(e.target.value)}
                    placeholder="https://example.com/source"
                    type="url"
                  />
                </div>
                <div className="flex justify-end">
                              <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Submission Successful</h3>
          </div>
          <p className="mt-2">
            Thank you for your submission to the Public Deepfake Archive. 
            Your submission is now under review. If approved, it will be listed in the PDA.
          </p>
        </motion.div>
      )}
    </motion.div>
  )}
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
                    analysisResult.is_deepfake 
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                  }`}
                >
                      {analysisResult.is_deepfake ? (
                        <AlertTriangle className="h-8 w-8" />
                      ) : (
                        <CheckCircle className="h-8 w-8" />
                      )}
              </div>
                    <h3 className="text-xl font-bold">
                      {analysisResult.is_deepfake ? "Deepfake Detected" : "Authentic Media"}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {analysisResult.is_deepfake
                        ? "This media has been identified as AI-generated or manipulated content."
                        : "This media appears to be authentic with no signs of manipulation."}
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
                          analysisResult.is_deepfake ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
                        }`}
                      />
                    </div>

                    {analysisResult.frames_analyzed >= 1 && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Fake Frames</span>
                          <span className="text-sm font-medium">
                            {analysisResult.fake_frames} /{" "}
                            {analysisResult.frames_analyzed}
                          </span>
                        </div>
                        <Progress
                          value={
                            (analysisResult.fake_frames /
                              analysisResult.frames_analyzed) *
                            100
                          }
                          className="h-2 [&>div]:bg-amber-500"
                        />
                      </div>
                    )}
                  </div>
              </div>
            </motion.div>
              {/* Analysis Statistics */}
              <motion.div className="glass-card border p-6 shadow-md" variants={itemVariants}>
  <h2 className="text-xl font-semibold mb-4">Analysis Statistics</h2>
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-muted/30 p-3 rounded-md">
      <div className="text-sm text-muted-foreground">Total Frames</div>
      <div className="text-xl font-semibold">
        {analysisResult.analysis_report.statistics.total_frames}
      </div>
    </div>
    <div className="bg-muted/30 p-3 rounded-md">
      <div className="text-sm text-muted-foreground">Fake Frames</div>
      <div className="text-xl font-semibold">
        {analysisResult.analysis_report.statistics.fake_frames}
      </div>
    </div>
    <div className="bg-muted/30 p-3 rounded-md">
      <div className="text-sm text-muted-foreground">Total Crops</div>
      <div className="text-xl font-semibold">
        {analysisResult.analysis_report.statistics.total_crops}
      </div>
    </div>
    <div className="bg-muted/30 p-3 rounded-md">
      <div className="text-sm text-muted-foreground">Fake Crops</div>
      <div className="text-xl font-semibold">
        {analysisResult.analysis_report.statistics.fake_crops}
      </div>
    </div>
  </div>
</motion.div>
            </div>
          </div>

          {/* Visual Analysis Section */}
          {analysisResult.analysis_report.frame_results && analysisResult.analysis_report.frame_results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Visual Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {/* Original Frames */}
                <div className="glass-card border rounded-lg p-4 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Original Frames</h3>
                  {mediaType === "image" ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="relative aspect-video">
                          <img
                            src={analysisResult.analysis_report.frame_results[0].frame_path}
                            alt={`Original Frame ${index + 1}`}
                            className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                            onClick={() => handleImageClick(
                              analysisResult.analysis_report.frame_results[0].frame_path,
                              'original',
                              0
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
      <SmallCarousel
        frames={analysisResult.analysis_report.frame_results.map(frame => frame.frame_path)}
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
                  {mediaType === "image" ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="relative aspect-video">
                    <img 
                      src={analysisResult.analysis_report.frame_results[0].ela_path} 
                            alt={`Error Level Analysis ${index + 1}`} 
                            className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleImageClick(
                        analysisResult.analysis_report.frame_results[0].ela_path,
                        'error',
                        0
                      )}
                    />
                        </div>
                      ))}
                    </div>
                  ) : (
                      <SmallCarousel
                        frames={analysisResult.analysis_report.frame_results.map(frame => frame.ela_path)}
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
                  {mediaType === "image" ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="relative aspect-video">
                    <img 
                      src={analysisResult.analysis_report.frame_results[0].gradcam_path} 
                            alt={`Gradcam Heatmap ${index + 1}`} 
                            className="w-full h-[150px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleImageClick(
                        analysisResult.analysis_report.frame_results[0].gradcam_path,
                        'heatmap',
                        0
                      )}
                    />
                        </div>
                      ))}
                    </div>
                  ) : (
                      <SmallCarousel
                        frames={analysisResult.analysis_report.frame_results.map(frame => frame.gradcam_path)}
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
                      
          {/* Metadata Section */}
          {analysisResult.metadata && (
            <div className="mt-8">
              {renderMetadata(analysisResult.metadata)}
                    </div>
                  )}
                  
          {/* Detection Explanation Section */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Info className="mr-3 h-6 w-6 text-primary" />
              Understanding Deepfake Detection
            </h2>
            <p className="text-muted-foreground mb-6">
              Our platform combines multiple advanced technologies to detect deepfakes and manipulated media.
              Below we explain how to interpret the analysis results and what each visualization represents.
            </p>
                </div>
                
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Detection Method Card */}
            <div className="glass-card border rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-primary" />
      </div>
                <h3 className="text-xl font-semibold">Detection Methodology</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our deepfake detection system analyzes both visual and statistical patterns across multiple dimensions that are
                characteristic of AI manipulation, revealing artifacts invisible to the human eye.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Face analysis detects inconsistencies in facial features, lighting, and movement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Error level analysis reveals manipulation artifacts from image compression</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Neural networks trained on millions of authentic and manipulated images/videos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Metadata examination to detect inconsistencies in file properties</span>
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
                of manipulation or authenticity was detected.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3 flex-shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Deepfake Detected (Red)</p>
                    <p className="text-sm text-muted-foreground">Indicates the media has likely been manipulated using AI techniques such as face swapping, voice cloning, or synthetic generation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 mr-3 flex-shrink-0">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Authentic Media (Green)</p>
                    <p className="text-sm text-muted-foreground">Indicates the media appears to be authentic with no significant signs of AI manipulation</p>
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
                  Original Frames
                </h4>
                <p className="text-muted-foreground">
                  These are the original frames extracted from your uploaded media. For videos, we analyze multiple frames
                  to detect inconsistencies that might appear across time. For images, we examine the full resolution version.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <Scan className="h-5 w-5 text-primary mr-2" />
                  Error Level Analysis (ELA)
                </h4>
                <p className="text-muted-foreground mb-3">
                  ELA highlights differences in compression quality across an image. In authentic images, most areas have
                  similar error levels. In manipulated images, edited regions often show different error levels (appearing as different colors or brightness).
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Interpretation Note:</span> Areas with distinctly different colors or brightness in the ELA image (especially around faces or objects)
                      often indicate manipulation. However, sharp edges and high-contrast areas naturally show higher error levels.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  Gradcam Heatmap
                </h4>
                <p className="text-muted-foreground mb-3">
                  Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes which regions of the image most strongly
                  influenced the AI's decision. Warmer colors (red, yellow) highlight areas the model identified as most suspicious.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Interpretation Note:</span> Strong activations around faces, especially eyes, mouths, or hair edges
                      are common in deepfakes. Unnatural lighting inconsistencies, boundary artifacts, and blending issues 
                      also trigger strong activation in the heatmap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Frame and Crop Analysis (For Videos) */}
          {mediaType === "video" && (
            <div className="glass-card border rounded-xl p-6 shadow-md mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-xl mr-4">
                  <FilmIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Video Frame Analysis</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our system analyzes videos frame-by-frame and tracks statistics across the entire timeline. This approach
                can detect manipulations that only appear in portions of the video.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-2 flex items-center">
                    <BarChart2 className="h-4 w-4 text-primary mr-2" />
                    Fake Frames Percentage
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Shows what portion of all analyzed frames were detected as manipulated. Even authentic videos
                    might have some frames flagged as suspicious due to motion blur, compression artifacts, or other factors.
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 text-primary mr-2" />
                    Face Crop Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each detected face is analyzed separately to identify face-specific manipulations. This helps detect
                    "face swap" deepfakes where only a specific person's face has been replaced.
                  </p>
                </div>
              </div>
        </div>
      )}

          {/* Limitations Notice */}
          <div className="bg-muted/30 rounded-xl p-6 border border-border mb-8">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 mr-4 flex-shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2">Limitations & Considerations</h4>
                <p className="text-muted-foreground mb-3">
                  While our system achieves high accuracy, deepfake technology is rapidly evolving. New generation
                  methods may occasionally evade detection. Consider these results as strong indicators rather than absolute proof.
                </p>
                <p className="text-muted-foreground">
                  For critical verification needs, we recommend combining these results with additional methods
                  such as source verification, context analysis, and cross-referencing with known authentic media.
                </p>
              </div>
            </div>
          </div>

          
        </motion.div>

      {/* Modal */}
      {enlargedImage && currentSliderType && (
  <ImageModal
    image={enlargedImage}
    onClose={handleCloseModal}
    sliderType={currentSliderType}
    frames={currentSliderType === 'error'
      ? analysisResult.analysis_report.frame_results.map(frame => frame.ela_path)
      : currentSliderType === 'heatmap'
      ? analysisResult.analysis_report.frame_results.map(frame => frame.gradcam_path)
      : analysisResult.analysis_report.frame_results.map(frame => frame.frame_path)
    }
    currentSlide={currentSliderType === 'error' ? currentErrorLevelSlide : currentSliderType === 'heatmap' ? currentHeatmapSlide : currentOriginalFrameSlide}
    onSlideChange={(index) => {
      if (currentSliderType === 'error') {
        setCurrentErrorLevelSlide(index);
      } else if (currentSliderType === 'heatmap') {
        setCurrentHeatmapSlide(index);
      } else {
        setCurrentOriginalFrameSlide(index);
      }
      setEnlargedImage(currentSliderType === 'error'
        ? analysisResult.analysis_report.frame_results[index].ela_path
        : currentSliderType === 'heatmap'
        ? analysisResult.analysis_report.frame_results[index].gradcam_path
        : analysisResult.analysis_report.frame_results[index].frame_path
      );
    }}
  />
)}
      </div>
    </Layout>
  );
}