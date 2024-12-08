import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { FileText, Image as ImageIcon } from 'lucide-react'

export default function AIContentReportPage() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState({
    type: 'media', // or 'text'
    content: '',
    imageUrl: '',
    confidence: 0,
    isAIGenerated: false,
    detailedAnalysis: {
      pixelAnalysis: {
        description: 'Synthetic pattern detection',
        confidence: Math.round(Math.random() * 100)
      },
      styleAnalysis: {
        description: 'Potential AI generation markers',
        markers: Math.round(Math.random() * 5)
      },
      generationSource: {
        mostLikelyModel: ['DALL-E', 'Midjourney', 'Stable Diffusion'][Math.floor(Math.random() * 3)],
        confidence: Math.round(Math.random() * 100)
      }
    },
    heatmapImage: '/path/to/ai-heatmap.png'
  })

  useEffect(() => {
    // Extract query parameters
    const { type, imageUrl, content, confidence, isAIGenerated } = router.query

    if (type) {
      setAnalysisResult(prev => ({
        ...prev,
        type: type as string,
        imageUrl: imageUrl as string,
        content: content as string,
        confidence: Number(confidence),
        isAIGenerated: isAIGenerated === 'true'
      }))
    }
  }, [router.query])

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
      <motion.div 
        className="grid grid-cols-12 gap-8 p-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side - AI Content Detection Report Header & Media/Text */}
        <motion.div 
          className="col-span-7 space-y-6"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-primary">
              AI Content Detection Report
            </h1>
            {analysisResult.type === 'media' ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <FileText className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          {/* Analyzed Content */}
          <motion.div 
            className="border rounded-lg overflow-hidden shadow-md"
            variants={itemVariants}
          >
            {analysisResult.type === 'media' ? (
              <img 
                src={analysisResult.imageUrl} 
                alt="Analyzed Media" 
                className="w-full max-h-[500px] object-contain"
              />
            ) : (
              <div className="p-6 bg-background">
                <p className="text-muted-foreground">{analysisResult.content}</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Right Side - Analysis Results */}
        <motion.div 
          className="col-span-5 space-y-6"
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
            {/* Pixel/Style Analysis */}
            <motion.div 
              className="border rounded-lg p-4 bg-background shadow-md"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-lg font-semibold mb-2">
                {analysisResult.type === 'media' 
                  ? 'Pixel Analysis' 
                  : 'Linguistic Pattern Analysis'}
              </h3>
              <p>{analysisResult.detailedAnalysis.pixelAnalysis.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span>Confidence:</span>
                <div className="px-2 py-1 border rounded text-sm">
                  {analysisResult.detailedAnalysis.pixelAnalysis.confidence}%
                </div>
              </div>
            </motion.div>

            {/* Style/Generation Source Analysis */}
            <motion.div 
              className="border rounded-lg p-4 bg-background shadow-md"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-lg font-semibold mb-2">
                {analysisResult.type === 'media' 
                  ? 'Style Analysis' 
                  : 'Generation Source'}
              </h3>
              <p>
                {analysisResult.type === 'media' 
                  ? analysisResult.detailedAnalysis.styleAnalysis.description
                  : `Potential AI Model: ${analysisResult.detailedAnalysis.generationSource.mostLikelyModel}`}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span>
                  {analysisResult.type === 'media' 
                    ? 'AI Markers' 
                    : 'Model Confidence'}:
                </span>
                <div className="px-2 py-1 border rounded text-sm">
                  {analysisResult.type === 'media' 
                    ? analysisResult.detailedAnalysis.styleAnalysis.markers
                    : `${ analysisResult.detailedAnalysis.generationSource.confidence}%`}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  )
}