import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Download, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useDetectionHistory } from '../contexts/DetectionHistoryContext';

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
  ela_path: string; // Define ela_path
  gradcam_path: string; // Define gradcam_path
}

interface AnalysisReport {
  media_path: string;
  media_type: string;
  file_id: string;
  frame_results: FrameResult[]; // Use FrameResult[]
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
  media_upload: number;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  fake_frames: number;
  analysis_report: AnalysisReport; // Use AnalysisReport
}

export default function DeepfakeReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const { detectionHistory, addDetectionEntry } = useDetectionHistory();
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [analysisResult, setAnalysisResult] = useState<DetectionResult>({
    id: 0,
    media_upload: 0,
    is_deepfake: false,
    confidence_score: 0,
    frames_analyzed: 0,
    fake_frames: 0,
    analysis_report: {
      media_path: '',
      media_type: '',
      file_id: '',
      frame_results: [], // Initialize as an empty array
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

  // Parse and set detection result from query
  useEffect(() => {
    const { detectionResult } = router.query;

    if (detectionResult) {
      try {
        const parsedResult = JSON.parse(detectionResult as string);
        
        // Prepare detection entry
        const detectionEntry = {
          imageUrl: parsedResult.analysis_report.media_path,
          mediaType: parsedResult.analysis_report.media_type,
          confidence: parsedResult.confidence_score,
          isDeepfake: parsedResult.is_deepfake,
          detailedReport: parsedResult,
          detectionType: 'deepfake' as const
        };

        if (user) {
          addDetectionEntry(detectionEntry);
        }

        setAnalysisResult(parsedResult);
      } catch (error) {
        console.error('Failed to parse detection result:', error);
        router.push('/detect');
      }
    }
  }, [router.query, user, addDetectionEntry]);

  useEffect(() => {
    if (analysisResult.analysis_report.media_path) {
      // Determine media type
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
        await navigator.share({
          title: 'Deepfake Detection Report',
          text: `Deepfake Detection Result: ${analysisResult.is_deepfake ? 'Likely Deepfake' : 'Likely Authentic'} (${(analysisResult.confidence_score * 100).toFixed(2)}% confidence)`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard');
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

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="grid grid-cols-12 gap-8 p-8 w-full max-w-6xl"
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
                  src={analysisResult.analysis_report.media_path} 
                  alt="Analyzed Media" 
                  className="w-full max-h-[500px] object-contain"
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
                    analysisResult.is_deepfake 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {analysisResult.is_deepfake 
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
                  {(analysisResult.confidence_score * 100).toFixed(2)}%
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
                <div>
                  {mediaType === 'image' && analysisResult.analysis_report.frame_results.length > 0 && (
                    <img 
                      src={analysisResult.analysis_report.frame_results[0].ela_path} 
                      alt="Error Level Analysis" 
                      className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                    />
                  )}
                  {mediaType === 'video' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Analyzed Frames</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {analysisResult.analysis_report.frame_results.map((frame, index) => (
                          <img 
                            key={index}
                            src={frame.ela_path} 
                            alt={`Error Level Analysis Frame ${index + 1}`} 
                            className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Gradcam Heatmap */}
              <motion.div 
                className="border rounded-lg p-4 bg-background shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  Gradcam Heatmap
                </h3>
                <div>
                  {mediaType === 'image' && analysisResult.analysis_report.frame_results.length > 0 && (
                    <img 
                      src={analysisResult.analysis_report.frame_results[0].gradcam_path} 
                      alt="Gradcam Heatmap" 
                      className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                    />
                  )}
                  {mediaType === 'video' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Analyzed Frames</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {analysisResult.analysis_report.frame_results.map((frame, index) => (
                          <img 
                            key={index}
                            src={frame.gradcam_path} 
                            alt={`Gradcam Heatmap Frame ${index + 1}`} 
                            className="w-full max-h-[150px] object-contain cursor-pointer hover-enlarge"
                          />
                        ))}
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
  );
}