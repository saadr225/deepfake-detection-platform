import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'

export default function DeepfakeReportPage() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState({
    imageUrl: '',
    confidence: 0,
    isDeepfake: false,
    errorLevelAnalysis: {
      description: 'Inconsistent pixel compression',
      confidence: Math.round(Math.random() * 100)
    },
    metadataAnalysis: {
      source: 'Potential synthetic generation',
      inconsistencies: Math.round(Math.random() * 5)
    },
    heatmapImage: '/path/to/heatmap.png'
  })

  useEffect(() => {
    // Extract query parameters
    const { imageUrl, confidence, isDeepfake } = router.query

    if (imageUrl) {
      setAnalysisResult(prev => ({
        ...prev,
        imageUrl: imageUrl as string,
        confidence: Number(confidence),
        isDeepfake: isDeepfake === 'true'
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
        {/* Left Side - Deepfake Detection Report Header & Media */}
        <motion.div 
          className="col-span-7 space-y-6"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold text-primary">
            Deepfake Detection Report
          </h1>
          
          {/* Analyzed Media */}
          <motion.div 
            className="border rounded-lg overflow-hidden shadow-md"
            variants={itemVariants}
          >
            <img 
              src={analysisResult.imageUrl} 
              alt="Analyzed Media" 
              className="w-full max-h-[500px] object-contain"
            />
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
    </Layout>
  )
}