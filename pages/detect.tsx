import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Layout from '../components/Layout'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [result, setResult] = useState<{ isProbablyDeepfake: boolean; confidence: number } | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.avi', '.mov']
    },
    multiple: false
  })

  const handleAnalyze = () => {
    if (!file) return
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulating analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          // Simulated result - replace with actual API call in production
          setResult({
            isProbablyDeepfake: Math.random() > 0.5,
            confidence: Math.random() * 100
          })
          return 100
        }
        return prevProgress + 10
      })
    }, 500)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Upload & Detect Deepfakes</h1>
        
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            {file ? (
              <p className="mt-2 text-sm text-gray-600">{file.name}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop an image or video file here, or click to select a file
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="mb-8">
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-center mt-2 text-sm text-gray-600">
              Analyzing... {analysisProgress}%
            </p>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${
            result.isProbablyDeepfake ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <div className="flex items-center mb-2">
              {result.isProbablyDeepfake ? (
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
              )}
              <h2 className="text-xl font-semibold">
                {result.isProbablyDeepfake ? 'Potential Deepfake Detected' : 'Likely Authentic'}
              </h2>
            </div>
            <p className="text-sm">
              Confidence: {result.confidence.toFixed(2)}%
            </p>
            <p className="mt-2 text-sm">
              {result.isProbablyDeepfake
                ? 'This media file shows signs of potential manipulation or AI generation.'
                : 'This media file appears to be authentic.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}