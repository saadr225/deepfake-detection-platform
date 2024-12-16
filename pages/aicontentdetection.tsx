import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, Link, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUser } from '../contexts/UserContext'
import { useDetectionHistory } from '../contexts/DetectionHistoryContext'
import { AIContentDetectionStub } from '../services/detectionService'

export default function AIContentDetectionPage() {
  const router = useRouter()
  const { user } = useUser()
  const { addDetectionEntry } = useDetectionHistory()
  
  const [activeTab, setActiveTab] = useState('media')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file size (5MB for images, 10MB for videos)
    const file = acceptedFiles[0]
    const maxImageSize = 5 * 1024 * 1024 // 5MB
    const maxVideoSize = 10 * 1024 * 1024 // 10MB

    if (file) {
      if (file.type.startsWith('image/') && file.size > maxImageSize) {
        alert('Image size exceeds 5MB limit')
        return
      }
      if (file.type.startsWith('video/') && file.size > maxVideoSize) {
        alert('Video size exceeds 10MB limit')
        return
      }
      setFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.avi', '.mov']
    },
    multiple: false
  })

  // Analysis handler
  const handleAnalyze = async () => {
    if (!file && !text.trim()) return
    
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prevProgress + 10
        })
      }, 500)

      // Use detection stub to analyze the content
      const detectionResult = file 
        ? await AIContentDetectionStub.detectAIContent(file)
        : await AIContentDetectionStub.detectTextContent(text)

      // Clear progress interval
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setIsAnalyzing(false);

      // Prepare detection entry
      const detectionEntry = {
        imageUrl: detectionResult.imageUrl || '',
        confidence: detectionResult.confidence,
        isDeepfake: detectionResult.isAIGenerated,
        detailedReport: detectionResult,
        detectionType: 'ai-content' as const,
        ...(text && { textContent: text })
      }

      // If user is logged in, save to detection history
      if (user) {
        addDetectionEntry(detectionEntry);
      }
      
      // Navigate to results page with full detection result
      router.push({
        pathname: '/aicontentreport',
        query: {
          detectionResult: JSON.stringify(detectionResult)
        }
      })
    } catch (error) {
      console.error('Detection analysis error:', error)
      setIsAnalyzing(false)
      alert('An error occurred during analysis. Please try again.')
    }
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      onDrop([selectedFile])
    }
  }

  // Remove file handler
  const handleRemoveFile = () => {
    setFile(null)
    // Reset file input
    if (document.getElementById('fileUpload')) {
      (document.getElementById('fileUpload') as HTMLInputElement).value = ''
    }
  }

  // Social media import handler
  const handleSocialMediaImport = async () => {
    setImportError(null)

    try {
      // Basic URL validation
      if (!socialMediaUrl.trim()) {
        setImportError('Please enter a valid social media URL')
        return
      }

      // URL format validation (basic example)
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (!urlPattern.test(socialMediaUrl)) {
        setImportError('Invalid URL format')
        return
      }

      // Simulate social media import
      const response = await fetch('/api/import-social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: socialMediaUrl })
      })

      if (response.ok) {
        const mediaFile = await response.blob()
        const importedFile = new File([mediaFile], 'social-media-import', { 
          type: mediaFile.type 
        })
        
        // Use onDrop to handle file validation and setting
        onDrop([importedFile])
        setIsImportModalOpen(false)
      } else {
        const errorData = await response.json()
        setImportError(errorData.message || 'Failed to import media')
      }
    } catch (error) {
      console.error('Social media import error:', error)
      setImportError('An error occurred while importing media')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4 text-primary">
            AI Content Detection
          </h1>
          <p className="text-center text- muted-foreground mt-12 mb-12 text-lg">
            Detect AI-generated media and text with advanced analysis
          </p>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 shadow-md">
              <TabsTrigger value="media">Media Detection</TabsTrigger>
              <TabsTrigger value="text">Text Detection</TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="w-full">
              <div className="bg-background border rounded-lg p-6 shadow-xl min-h-[500px]">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 flex flex-col justify-center items-center h-full min-h-[500px] p-6 ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {file ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Uploaded file" 
                          className="max-h-[350px] max-w-full object-contain mb-4"
                        />
                      ) : (
                        <video 
                          src={URL.createObjectURL(file)} 
                          controls 
                          className="max-h-[350px] max-w-full object-contain mb-4"
                        />
                      )}
                      <p className="text-lg text-primary mb-4">{file.name}</p>
                      
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="flex items-center"
                        >
                          <X className="mr-2 h-4 w-4" /> Remove
                        </Button>
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Drag & drop an image or video file here, or click to select a file
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative w-full">
                    <input 
                      type="file" 
                      id="fileUpload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => document.getElementById('fileUpload')?.click()}
                    >
                      Upload File
                    </Button>
                  </div>

                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Link className="mr-2" /> Import from Social Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import from Social Media</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="Enter social media post URL"
                          value={socialMediaUrl}
                          onChange={(e) => setSocialMediaUrl(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        <Button onClick={handleSocialMediaImport} className="w-full">
                          Import Media
                        </Button>
                        {importError && <p className="text-red-500">{importError}</p>}
                        <p className="text-sm text-muted-foreground">
                          Supported platforms: Instagram, Twitter, Facebook, TikTok
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center ml-1 mt-4 w-full">
                  <div className="flex-grow text-xs text-muted-foreground pr-6">
                    Max size allowed for image is 5mb and max size allowed for video is 10mb. 
                    By clicking "DETECT", you agree to terms and conditions of AI Content Detection.
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!file || isAnalyzing}
                    className="w-[250px]"
                    variant="default"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Detect'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="w-full">
              <div className="bg-background border rounded-lg p-6 shadow-sm min-h-[500px]">
                <textarea 
                  placeholder="Paste text for AI detection"
                  className="w-full h-[400px] p-4 border rounded mb-4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center ml-1 mt-4 w-full">
                  <div className="flex-grow text-xs text-muted-foreground pr-6"> 
                    By clicking "DETECT", you agree to terms and conditions of AI Content Detection.
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!text.trim() || isAnalyzing}
                    className="w-[250px]"
                    variant="default"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Detect'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress indicator during analysis */}
          {isAnalyzing && (
            <div className="mt-6">
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}