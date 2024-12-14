import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Download, Share2 } from 'lucide-react'
import { FileText, Image as ImageIcon } from 'lucide-react'
import { useUser  } from '../contexts/UserContext'
import { useDetectionHistory } from '../contexts/DetectionHistoryContext'
import { AIContentDetectionResult } from '../services/detectionService'

export default function AIContentReportPage() {
  const router = useRouter()
  const { user } = useUser ()
  const { detectionHistory, addDetectionEntry } = useDetectionHistory()
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown' | 'text'>('unknown')

  const [analysisResult, setAnalysisResult] = useState<AIContentDetectionResult>({
    id: '', // Initialize id
    confidence: 0,
    isAIGenerated: false,
    pixelAnalysis: {
      description: '',
      confidence: 0
    },
    styleAnalysis: {
      description: '',
      markers: 0
    },
    generationSource: {
      mostLikelyModel: '',
      confidence: 0
    },
    heatmapImage: '',
    textContent: ''
  })

  // Check if the detection result is already in history
  const isAlreadyInHistory = useCallback((result: AIContentDetectionResult) => {
    return detectionHistory.some(entry => 
      (entry.imageUrl === result.imageUrl || entry.textContent === result.textContent) && 
      entry.confidence === result.confidence && 
      entry.isDeepfake === result.isAIGenerated
    )
  }, [detectionHistory])

  useEffect(() => {
    // Determine media type based on content
    if (analysisResult.imageUrl) {
      const determineMediaType = async () => {
        try {
          if (analysisResult.imageUrl) {
            const response = await fetch(analysisResult.imageUrl)
          const blob = await response.blob()
          const mimeType = blob.type

          if (mimeType.startsWith('image/')) {
            setMediaType('image')
          } else if (mimeType.startsWith('video/')) {
            setMediaType('video')
          } else {
            setMediaType('unknown')
          }
        } 
        } catch (error) {
          console.error('Error determining media type:', error)
          setMediaType('unknown')
        }
      }

      determineMediaType()
    } else if (analysisResult.textContent) {
      setMediaType('text')
    }
  }, [analysisResult.imageUrl, analysisResult.textContent])

  // Parse and set detection result from query
  useEffect(() => {
    const { detectionResult, fromHistory } = router.query

    if (detectionResult) {
      try {
        const parsedResult = JSON.parse(detectionResult as string)
        
        // Prepare detection entry
        const detectionEntry = {
          imageUrl: parsedResult.imageUrl || '',
          confidence: parsedResult.confidence,
          isDeepfake: parsedResult.isAIGenerated,
          detailedReport: parsedResult,
          detectionType: 'ai-content' as const,
          ...(parsedResult.textContent && { textContent: parsedResult.textContent }),
          id: parsedResult.id || '' // Ensure id is included
        }

        // Only add to history if it's a new detection (not from history view)
        if (user && !fromHistory && !isAlreadyInHistory(parsedResult)) {
          addDetectionEntry(detectionEntry);
        }

        setAnalysisResult(parsedResult)
      } catch (error) {
        console.error('Failed to parse detection result:', error)
        router.push('/aicontentdetection')
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
    link.download = `ai_content_report_${analysisResult.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle sharing the report
  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Content Detection Report',
          text: `AI Content Detection Result: ${analysisResult.isAIGenerated ? 'Likely AI Generated' : 'Likely Human Created'} (${analysisResult.confidence}% confidence)`,
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

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="grid grid-cols-12 gap-8 p-8 w-full max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Left Side - AI Content Detection Report Header & Media/Text */}
          <motion.div 
            className="col-span-12 md:col-span-7 space-y-6"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary flex items-center">
                AI Detection Report
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
            
            {/* Analyzed Content */}
            <motion.div 
              className="border rounded-lg overflow-hidden shadow-md"
              variants={itemVariants}
            >
              {analysisResult.imageUrl ? (
                mediaType === 'image' ? (
                  <img 
                    src={analysisResult.imageUrl} 
                    alt="Analyzed Media" 
                    className="w-full max-h-[500px] object-contain"
                  />
                ) : mediaType === 'video' ? (
                  <video
                    src={analysisResult.imageUrl}
                    controls
                    className="w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="w-full max-h-[500px] flex items-center justify-center">
                    Unsupported media type
                  </div>
                )
              ) : analysisResult.textContent ? (
                
                <div className="p-6 bg-background">
                  <p className="text-muted-foreground">{analysisResult.textContent}</p>
                </div>
              ) : null}
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
                    analysisResult.isAIGenerated 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {analysisResult.isAIGenerated 
                    ? 'Likely AI Generated' 
                    : 'Likely Human Created'}
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
                  Confidence of AI Generation Detection
                </p>
              </div>
            </motion.div>

            {/* Analysis Boxes */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              {/* Pixel Analysis */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Pixel Analysis
                </h3>
                <p>{analysisResult.pixelAnalysis.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>Confidence:</span>
                  <div className="px-2 py-1 border rounded text-sm">
                    {analysisResult.pixelAnalysis.confidence}%
                  </div>
                </div>
              </motion.div>

              {/* Style Analysis */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Style Analysis
                </h3>
                <p>{analysisResult.styleAnalysis.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>AI Markers:</span>
                  <div className="px-2 py-1 border rounded text-sm">
                    {analysisResult.styleAnalysis.markers}
                  </div>
                </div>
              </motion.div>

              {/* Generation Source Analysis */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Generation Source
                </h3>
                <p>Most Likely Model: {analysisResult.generationSource.mostLikelyModel}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>Model Confidence:</span>
                  <div className="px-2 py-1 border rounded text-sm">
                    {analysisResult.generationSource.confidence}%
                  </div>
                </div>
              </motion.div>

              {/* Gradmap Heatmap */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants} 
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Gradmap Heatmap
                </h3>
                <motion.img 
                  src={analysisResult.heatmapImage} 
                  alt="Gradmap Heatmap" 
                  className="w-full rounded-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}