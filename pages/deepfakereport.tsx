import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Download, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useDetectionHistory } from '../contexts/DetectionHistoryContext';
import { DetectionResult } from '../services/detectionService';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function DeepfakeReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const { detectionHistory, addDetectionEntry } = useDetectionHistory();
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const sliderRef = useRef<Slider | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDES_TO_SHOW = 3;
  const SLIDES_TO_SCROLL = 3;
  

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
  const totalSlides = analysisResult.frames?.length || 0;

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
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D', // These should be the actual frame URLs
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D', // These should be the actual frame URLs
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D', // These should be the actual frame URLs
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
        'https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D' 
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

  const goToNextSlide = () => {
    const nextSlide = currentSlide + SLIDES_TO_SHOW;
    if (nextSlide < totalSlides && sliderRef.current) {
      sliderRef.current.slickGoTo(nextSlide);
    }
  };
  
  const goToPrevSlide = () => {
    const prevSlide = currentSlide - SLIDES_TO_SHOW;
    if (prevSlide >= 0 && sliderRef.current) {
      sliderRef.current.slickGoTo(prevSlide);
    }
  };
  
  // Update your settings to include the afterChange callback
  const settings: Settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: SLIDES_TO_SHOW,
    slidesToScroll: SLIDES_TO_SCROLL,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      }
    ],
    beforeChange: (current: number, next: number) => setCurrentSlide(next)
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
                      <div className="slider-container">
                        <Slider ref={sliderRef} {...settings}>
                          {analysisResult.frames?.map((frame, index) => (
                            <div key={index} className="px-2"> {/* Add padding between slides */}
                              <div className="hover-enlarge-container">
                                <img 
                                  src={frame} 
                                  alt={`Frame ${index + 1}`} 
                                  className="w-full h-[150px] object-cover hover-enlarge rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </Slider>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                      <button 
                        onClick={goToPrevSlide}
                        disabled={currentSlide === 0}
                        className={`p-2 rounded-full transition-colors ${
                          currentSlide === 0 
                            ? 'bg-secondary/50 cursor-not-allowed' 
                            : 'bg-secondary hover:bg-primary/20'
                        }`}
                        aria-label="Previous slides"
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
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                        </button>
                        <div className="text-sm text-muted-foreground">
                          Page {Math.floor(currentSlide / SLIDES_TO_SHOW) + 1} of {Math.ceil(totalSlides / SLIDES_TO_SHOW)}
                        </div>
                        <button 
                          onClick={goToNextSlide}
                          disabled={currentSlide >= totalSlides - SLIDES_TO_SHOW}
                          className={`p-2 rounded-full transition-colors ${
                            currentSlide >= totalSlides - SLIDES_TO_SHOW
                              ? 'bg-secondary/50 cursor-not-allowed' 
                              : 'bg-secondary hover:bg-primary/20'
                          }`}
                          aria-label="Next slides"
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
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </button>
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
                      <div className="slider-container">
                        <Slider ref={sliderRef} {...settings}>
                          {analysisResult.frames?.map((frame, index) => (
                            <div key={index} className="px-2"> {/* Add padding between slides */}
                              <div className="hover-enlarge-container">
                                <img 
                                  src={frame} 
                                  alt={`Frame ${index + 1}`} 
                                  className="w-full h-[150px] object-cover hover-enlarge rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </Slider>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <button 
                          onClick={goToPrevSlide}
                          className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                          aria-label="Previous slides"
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
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                        </button>
                        <div className="text-sm text-muted-foreground">
                          Page {Math.floor(currentSlide / 4) + 1} of {Math.ceil(totalSlides / 4)}
                        </div>
                        <button 
                          onClick={goToNextSlide}
                          className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                          aria-label="Next slides"
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
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </button>
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
    </Layout>
  )
}