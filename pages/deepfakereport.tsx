import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Download, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useDetectionHistory } from '../contexts/DetectionHistoryContext';
import { DetectionResult } from '../services/detectionService';
import Carousel from 'react-multi-carousel';
import type { ResponsiveType, CarouselInternalState } from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

export default function DeepfakeReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const { detectionHistory, addDetectionEntry } = useDetectionHistory();
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  // const errorLevelSliderRef = useRef<Slider | null>(null);
  // const heatmapSliderRef = useRef<Slider | null>(null);
  const [currentErrorLevelSlide, setCurrentErrorLevelSlide] = useState(0);
  const [currentHeatmapSlide, setCurrentHeatmapSlide] = useState(0);
  // Add these new state variables
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [currentSliderType, setCurrentSliderType] = useState<'error' | 'heatmap' | null>(null);

  const [analysisResult, setAnalysisResult] = useState<DetectionResult>({
    id: '',
    imageUrl: '',
    confidence: 0,
    isDeepfake: false,
    errorLevelAnalysis: {
      description: 'No analysis available',
      confidence: 0
    },
    metadataAnalysis: {
      source: 'No source information',
      inconsistencies: 0
    },
    heatmapImage: '',
    frames: [] // Add this field to store frames
  });

  // Update isAlreadyInHistory method
  const isAlreadyInHistory = useCallback((result: DetectionResult) => {
    return detectionHistory.some(entry => 
      entry.imageUrl === result.imageUrl && 
      entry.confidence === result.confidence && 
      entry.isDeepfake === result.isDeepfake
    )
  }, [detectionHistory])

  useEffect(() => {
    if (analysisResult.imageUrl) {
      // Function to determine media type
      const determineMediaType = async () => {
        try {
          // Fetch the file to get its MIME type
          const response = await fetch(analysisResult.imageUrl)
          const blob = await response.blob()
          const mimeType = blob.type

          if (mimeType.startsWith('image/')) {
            setMediaType('image')
          } else if (mimeType.startsWith('video/')) {
            setMediaType('video')
            // Extract frames if the media is a video
            extractFramesFromVideo(analysisResult.imageUrl)
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
  }, [analysisResult.imageUrl])

  const extractFramesFromVideo = async (videoUrl: string) => {
    try {
      // Use a library like videojs or ffmpeg.js to extract frames
      // Here is a placeholder for frame extraction
      const frames = [
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg',
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', // These should be the actual frame URLs
        'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75',
        'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
        'https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg', // These should be the actual frame URLs
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg',
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', // These should be the actual frame URLs
        'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75',
        'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
        'https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg',
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg',
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', // These should be the actual frame URLs
        'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75',
        'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
        'https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg', // These should be the actual frame URLs
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg',
        'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', // These should be the actual frame URLs
        'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75',
        'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
        'https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg',
        'https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg'
      ]

      setAnalysisResult(prev => ({ ...prev, frames }))
    } catch (error) {
      console.error('Error extracting frames:', error)
    }
  }

  // Add this effect to track current slide
  // useEffect(() => {
  //   const handleSlideChange = (current: number) => {
  //     setCurrentSlide(current);
  //   };
  
  //   // The slider instance is available via sliderRef.current
  //   const slider = sliderRef.current;
    
  //   if (slider) {
  //     // Use the correct event handling method
  //     slider.slickGoTo(currentSlide);
  //   }
  // }, [currentSlide]);

  // Parse and set detection result from query
  useEffect(() => {
    const { detectionResult, fromHistory } = router.query

    if (detectionResult) {
      try {
        const parsedResult = JSON.parse(detectionResult as string)
        
        // Prepare detection entry
        const detectionEntry = {
          imageUrl: parsedResult.imageUrl,
          confidence: parsedResult.confidence,
          isDeepfake: parsedResult.isDeepfake,
          detailedReport: parsedResult,
          detectionType: 'deepfake' as const
        }

        // Only add to history if it's a new detection (not from history view)
        if (user && !fromHistory && !isAlreadyInHistory(parsedResult)) {
          addDetectionEntry(detectionEntry);
        }

        setAnalysisResult(parsedResult)
      } catch (error) {
        console.error('Failed to parse detection result:', error)
        router.push('/detect')
      }
    }
  }, [
    router.query, 
    user, 
    addDetectionEntry, 
    isAlreadyInHistory
  ])

  // Handle downloading the report
  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepfake_report_${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle sharing the report
  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Deepfake Detection Report',
          text: `Deepfake Detection Result: ${analysisResult.isDeepfake ? 'Likely Deepfake' : 'Likely Authentic'} (${analysisResult.confidence}% confidence)`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard')
    }
  }

  // Animation variants
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
  
  const handleImageClick = (image: string, type: 'error' | 'heatmap', index: number) => {
    setEnlargedImage(image);
    setCurrentSliderType(type);
    document.body.style.overflow = 'hidden';
    if (type === 'error') {
      setCurrentErrorLevelSlide(index);
    } else {
      setCurrentHeatmapSlide(index);
    }
  };
  
  const handleCloseModal = () => {
    setEnlargedImage(null);
    setCurrentSliderType(null);
    document.body.style.overflow = 'auto';
  };

  const responsive: ResponsiveType = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 3,
      slidesToSlide: 3
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 2,
      slidesToSlide: 2
    }
  };
  
  const modalResponsive: ResponsiveType = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1
    }
  };
  
  const thumbnailResponsive: ResponsiveType = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 10
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 8
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 6
    }
  };
  
// Add this component at the bottom of your file, before the export
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
  sliderType: 'error' | 'heatmap';
  frames: string[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}) => {
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const THUMBNAIL_LIMIT = 10;

  const handleMainNext = () => {
    onSlideChange((currentSlide + 1) % frames.length);
  };

  const handleMainPrev = () => {
    onSlideChange((currentSlide - 1 + frames.length) % frames.length);
  };

  const handleThumbnailNext = () => {
    setThumbnailStart((prev) =>
      prev + THUMBNAIL_LIMIT < frames.length
        ? prev + THUMBNAIL_LIMIT
        : prev
    );
  };

  const handleThumbnailPrev = () => {
    setThumbnailStart((prev) =>
      prev - THUMBNAIL_LIMIT >= 0 ? prev - THUMBNAIL_LIMIT : 0
    );
  };

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
            className="main-arrow left-arrow"
          >
            ←
          </button>
          <img
            src={frames[currentSlide]}
            alt={`View ${currentSlide + 1}`}
            className="main-image"
          />
          <button 
            onClick={handleMainNext}
            className="main-arrow right-arrow"
          >
            →
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="thumbnail-carousel">
          <button
            onClick={handleThumbnailPrev}
            className="thumbnail-arrow left-arrow"
            disabled={thumbnailStart === 0}
          >
            ←
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
            className="thumbnail-arrow right-arrow"
            disabled={thumbnailStart + THUMBNAIL_LIMIT >= frames.length}
          >
            →
          </button>
        </div>

        {/* Image counter */}
        <div className="text-center text-white mt-2">
          {currentSlide + 1} of {frames.length}
        </div>
      </div>
    </div>
  );
};

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="grid
          grid-cols-12 gap-8 p-8 w-full max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Left Side - Deepfake Detection Report Header & Media */}
          <motion.div 
            className="col-span-12 md:col-span-7 space-y-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">
                Deepfake Detection Report
              </h1>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadReport}
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareReport}
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </div>
            
            {/* Analyzed Media */}
            <motion.div 
              className="border rounded-lg overflow-hidden shadow-md"
              variants={itemVariants}
            >
              {mediaType === 'image' && (
                <img 
                  src={analysisResult.imageUrl} 
                  alt="Analyzed Media" 
                  className="w-full max-h-[500px] object-contain"
                />
              )}
              
              {mediaType === 'video' && (
                <video
                  src={analysisResult.imageUrl}
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
          </motion.div>

          {/* Right Side - Analysis Results */}
          <motion.div 
            className="col-span-12 md:col-span-5 space-y-6"
            variants={itemVariants}
          >
            {/* Confidence Result */}
            <motion.div 
              className="bg-background border rounded-lg p-6 shadow-md"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Detection Result</h2>
                <motion.div 
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    analysisResult.isDeepfake 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {analysisResult.isDeepfake 
                    ? 'Likely Deepfake' 
                    : 'Likely Authentic'}
                </motion.div>
              </div>
              <div className="mt-4 text-center">
                <motion.p 
                  className="text-4xl font-bold text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {analysisResult.confidence}%
                </motion.p>
                <p className="text-muted-foreground">
                  Confidence of Deepfake Detection
                </p>
              </div>
            </motion.div>

            {/* Analysis Boxes */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              {/* Error Level Analysis */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Error Level Analysis
                </h3>
                <p>{analysisResult.errorLevelAnalysis.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>Confidence:</span>
                  <div className="px-2 py-1 border rounded text-sm">
                    {analysisResult.errorLevelAnalysis.confidence}%
                  </div>
                </div>
                <div>
                  {mediaType === 'image' && (
                    <img 
                      src={analysisResult.errorLevelAnalysis.image} 
                      alt="Error Level Analysis" 
                      className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                    />
                  )}
                  {mediaType === 'video' && (
                    // Update the slider section in your JSX where the video frames are shown:
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analysed Frames</h3>
                    <div className="relative">
                      {/* Error Level Analysis Slider */}
                      <div className="slider-container">
  <Carousel
    responsive={responsive}
    infinite={false}
    arrows
    beforeChange={(nextSlide, { currentSlide }) => setCurrentErrorLevelSlide(nextSlide)}
    additionalTransfrom={0}
    customLeftArrow={<button>Left</button>}
    customRightArrow={<button>Right</button>}
  >
    {analysisResult.frames?.map((frame, index) => (
    <div key={index} className="px-2">
      <div className="image-container" onClick={() => handleImageClick(frame, 'error', index)}>
        <img 
          src={frame} 
          alt={`Frame ${index + 1}`} 
          className="w-full h-[150px] object-cover rounded-lg cursor-pointer"
          loading="lazy"
        />
      </div>
    </div>
  ))}
  </Carousel>
</div>

                      
                      
                        
                      </div>
                    </div>
                  
                  )}
                </div>
              </motion.div>

              {/* Metadata Analysis */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Metadata Analysis
                </h3>
                <p>{analysisResult.metadataAnalysis.source}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>Inconsistencies:</span>
                  <div className="px-2 py-1 border rounded text-sm">
                    {analysisResult.metadataAnalysis.inconsistencies}
                  </div>
                </div>
              </motion.div>

              {/* Gradmap Heatmap */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants} whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Gradmap Heatmap
                </h3>
                <div>
                  {mediaType === 'image' && (
                    <img 
                      src={analysisResult.heatmapImage} 
                      alt="Gradmap Heatmap" 
                      className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                    />
                  )}
                  {mediaType === 'video' && (
                    // Update the slider section in your JSX where the video frames are shown:
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analysed Frames</h3>
                    <div className="relative">
                      {/* Heatmap Slider */}
                      <div className="slider-container">
  <Carousel
    responsive={responsive}
    infinite={false}
    arrows
    beforeChange={(nextSlide, { currentSlide }) => setCurrentHeatmapSlide(nextSlide)}
    additionalTransfrom={0}
    customLeftArrow={<button>Left</button>}
    customRightArrow={<button>Right</button>}
  >
    {analysisResult.frames?.map((frame, index) => (
    <div key={index} className="px-2">
      <div className="image-container" onClick={() => handleImageClick(frame, 'heatmap', index)}>
        <img 
          src={frame} 
          alt={`Frame ${index + 1}`} 
          className="w-full h-[150px] object-cover rounded-lg cursor-pointer"
          loading="lazy"
        />
      </div>
    </div>
  ))}
  </Carousel>
</div>
                    </div>
                  </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      {/* Modal */}
      {enlargedImage && currentSliderType && (
  <ImageModal
    image={enlargedImage}
    onClose={handleCloseModal}
    sliderType={currentSliderType}
    frames={analysisResult.frames || []}
    currentSlide={currentSliderType === 'error' ? currentErrorLevelSlide : currentHeatmapSlide}
    onSlideChange={(index) => {
      if (currentSliderType === 'error') {
        setCurrentErrorLevelSlide(index);
        // Remove the slickGoTo reference since we're no longer using Slick Slider
        // Instead, the Carousel component will handle the slide change internally
      } else {
        setCurrentHeatmapSlide(index);
        // Remove the slickGoTo reference since we're no longer using Slick Slider
        // Instead, the Carousel component will handle the slide change internally
      }
      setEnlargedImage(analysisResult.frames?.[index] || null);
    }}
  />
)}
    </Layout>
  )
}