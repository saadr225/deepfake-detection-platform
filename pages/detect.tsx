import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, Link, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DetectPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

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
          
          // Navigate to results page with analysis data
          router.push({
            pathname: '/deepfakereport',
            query: {
              imageUrl: URL.createObjectURL(file),
              confidence: Math.round(Math.random() * 100),
              isDeepfake: Math.random() > 0.5
            }
          })
          
          return 100
        }
        return prevProgress + 10
      })
    }, 500)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    // If you're using a file input, reset it
    if (document.getElementById('fileUpload')) {
      (document.getElementById('fileUpload') as HTMLInputElement).value = ''
    }
  }

  const handleSocialMediaImport = async () => {
    try {
      // Implement social media URL validation
      if (!socialMediaUrl) {
        alert('Please enter a valid social media URL')
        return
      }

      // TODO: Implement actual social media import logic
      // This might involve:
      // 1. Validating the URL
      // 2. Fetching the media from the platform
      // 3. Converting the media to a file
      const response = await fetch('/api/import-social-media', {
        method: 'POST',
        body: JSON.stringify({ url: socialMediaUrl })
      })

      if (response.ok) {
        const mediaFile = await response.blob()
        setFile(new File([mediaFile], 'social-media-import', { type: mediaFile.type }))
        setIsImportModalOpen(false)
      } else {
        alert('Failed to import media')
      }
    } catch (error) {
      console.error('Social media import error:', error)
      alert('An error occurred while importing media')
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
          Detect Deepfakes with Exceptional Precision
        </h1>
        <p className="text-center text-muted-foreground mt-12 mb-12 text-lg">
          Upload any image or video and get detailed deepfake detection analysis
        </p>
        
        <div className="bg-background border rounded-lg p-6 shadow-sm min-h-[500px]">
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
                  e.stopPropagation(); // Prevent dropzone from triggering
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
            <p className="text-lg text-muted-foreground">
              Format Supported: (.JPEG, .PNG, .MP4)
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
              By clicking "DETECT", you agree to terms and conditions of Deep Media Inspection.
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