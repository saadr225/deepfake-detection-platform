"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/router"
import VideoComponent from "../components/ui/VideoComponent"
import Layout from "../components/Layout"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  LinkIcon, 
  X, 
  Cloud, 
  BarChart2, 
  FileText, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Shield,
  Search,
  ArrowUpRight
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "../contexts/UserContext"
import Cookies from "js-cookie"
import axios from "axios"
import Image from "next/image"

export default function DetectPage() {
  const router = useRouter()
  const { user } = useUser()

  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  // Social media import functionality - temporarily disabled
  /*
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>("")
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Modal animations
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsCustomModalOpen(false);
      }
    };

    if (isCustomModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomModalOpen]);

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCustomModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Social media import handler
  const handleSocialMediaImport = async () => {
    setImportError(null)

    try {
      // Basic URL validation
      if (!socialMediaUrl.trim()) {
        setImportError("Please enter a valid social media URL")
        return
      }

      // URL format validation (basic example)
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      if (!urlPattern.test(socialMediaUrl)) {
        setImportError("Invalid URL format")
        return
      }

      // Simulate social media import
      const response = await fetch("/api/import-social-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: socialMediaUrl }),
      })

      if (response.ok) {
        const mediaFile = await response.blob()
        const importedFile = new File([mediaFile], "social-media-import", {
          type: mediaFile.type,
        })

        // Use onDrop to handle file validation and setting
        onDrop([importedFile])
        setIsCustomModalOpen(false)
      } else {
        const errorData = await response.json()
        setImportError(errorData.message || "Failed to import media")
      }
    } catch (error) {
      console.error("Social media import error:", error)
      setImportError("An error occurred while importing media")
    }
  }

  // Open modal and reset state
  const openImportModal = () => {
    setSocialMediaUrl("")
    setImportError(null)
    setIsCustomModalOpen(true)
  }

  // Handle modal close
  const closeImportModal = () => {
    setIsCustomModalOpen(false)
  }
  */
  
  const [importError, setImportError] = useState<string | null>(null)

  // Animations variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const maxImageSize = 5 * 1024 * 1024 // 5MB
    const maxVideoSize = 10 * 1024 * 1024 // 10MB

    if (file) {
      if (file.type.startsWith("image/") && file.size > maxImageSize) {
        alert("Image size exceeds 5MB limit")
        return
      }
      if (file.type.startsWith("video/") && file.size > maxVideoSize) {
        alert("Video size exceeds 10MB limit")
        return
      }
      setFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "video/*": [".mp4", ".avi", ".mov"],
    },
    multiple: false,
  })

  // Analysis handler
  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setImportError(null) // Reset any previous error messages

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

      // Function to upload the media file
      const uploadFile = async (token: string) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await axios.post("http://127.0.0.1:8000/api/process/df/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })

        return response
      }

      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken")
      let response

      try {
        // Try to upload the file with the current access token
        if (!accessToken) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setAnalysisProgress(0)
          alert("Please login first to perform detection.")
          return
        }
        response = await uploadFile(accessToken)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Access token is expired, refresh the token
          const refreshToken = Cookies.get("refreshToken")

          if (refreshToken) {
            // Get a new access token using the refresh token
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            })

            accessToken = refreshResponse.data.access
            // Store the new access token in cookies
            if (accessToken) {
              Cookies.set("accessToken", accessToken)
            }
            if (!accessToken) {
              clearInterval(progressInterval)
              setIsAnalyzing(false)
              setAnalysisProgress(0)
              alert("Please login first to perform detection.")
              return
            }
            // Retry the file upload with the new access token
            response = await uploadFile(accessToken)
          } else {
            clearInterval(progressInterval)
            setIsAnalyzing(false)
            setAnalysisProgress(0)
            alert("Please login first to perform detection.")
            return
          }
        } else {
          throw error
        }
      }

      // Clear progress interval
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      setIsAnalyzing(false)

      // Check if the response indicates no faces were detected
      if (response.data.message === "Media file contains no faces." || 
          (response.data.data.analysis_report && response.data.data.analysis_report.final_verdict === "MEDIA_CONTAINS_NO_FACES")) {
        setImportError("The uploaded media doesn't contain any human faces. Please upload a different file with faces to analyze.")
        return
      }

      // Extract detection results from the response
      const detectionResult = response.data.data

      // Instead of storing the full result, just store the submission identifier
      sessionStorage.setItem("submissionIdentifier", detectionResult.submission_identifier)

      // Navigate to results page with query parameters
      router.push({
        pathname: "/deepfakereport",
        query: { fromDetection: "true" },
      })
    } catch (error) {
      console.error("Detection analysis error:", error)
      setIsAnalyzing(false)
      setImportError("An error occurred during analysis. Please try again.")
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
    if (document.getElementById("fileUpload")) {
      ;(document.getElementById("fileUpload") as HTMLInputElement).value = ""
    }
  }

  return (
    <Layout>
      {/* Enhanced Header Section with Background */}
      <div className="relative">
        {/* Background with more visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute mb-10 bottom-1/4 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
        </div>
        
        {/* Header Content - more compact */}
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
                <Zap className="h-4 w-4 mr-2" />
                Advanced AI Deepfake Detection
              </span>
            </div>
            
            {/* Smaller header text on a single line */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Detect <span className="gradient-text">Deepfakes</span> with Exceptional Precision
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Our advanced AI system analyzes media with multiple detection techniques 
              to identify manipulated content with industry-leading accuracy
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>99.8% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Multiple Detection Models</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Comprehensive Reports</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Upload Section and How It Works in Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Left Panel: Upload Options - Wider */}
            <motion.div className="lg:col-span-3" variants={itemVariants}>
              <div className="glass-card-elevated p-8 rounded-2xl h-full flex flex-col">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-primary" /> 
                  Upload Media for Analysis
                </h2>
                
                {/* Action Buttons - Import URL temporarily disabled */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Button 
                    className="h-14 text-base font-medium bg-primary hover:bg-primary-600 transition-all shadow-subtle hover:shadow-elevation"
                    onClick={() => document.getElementById("fileUpload")?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5" /> Upload File
                  </Button>
                  
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                  />
                </div>

                {/* Upload/Dropzone Area - Flex grow to take available space */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl transition-all mb-6 flex flex-col justify-center items-center flex-grow min-h-[280px] p-6 ${
                    isDragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <input {...getInputProps()} />

                  {/* File Preview */}
                  {file ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt="Uploaded file"
                          className="max-h-[220px] max-w-full object-contain mb-4 rounded-xl shadow-subtle"
                        />
                      ) : (
                        <VideoComponent file={file} />
                      )}
                      <div className="flex items-center py-2 px-4 bg-primary/10 rounded-full mb-6">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        <p className="text-sm font-medium text-primary">{file.name}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile()
                        }}
                        className="flex items-center border-primary/20 hover:bg-primary/5"
                      >
                        <X className="mr-2 h-4 w-4" /> Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                      <p className="text-muted-foreground max-w-md mb-6">
                        Drag & drop an image or video file here, or click to select a file
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Info className="h-3 w-3 mr-1" /> JPEG, PNG, MP4 supported (Max: 10MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* Display error message if there is one */}
                {importError && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>{importError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Analysis Controls - Moved inside the Upload Media section */}
                <div className="border-t border-border/40 pt-6 mt-auto">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start md:items-center">
                      <AlertTriangle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
                      <p className="text-sm text-muted-foreground md:flex-1">
                        By clicking "Detect Now", you agree to the terms and conditions of Deep Media Inspection.
                      </p>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!file || isAnalyzing}
                      className="py-5 px-8 text-base font-medium h-auto shadow-subtle hover:shadow-elevation transition-all"
                    >
                      {isAnalyzing ? "Analyzing..." : "Detect Now"}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  {/* Progress indicator during analysis */}
                  {isAnalyzing && (
                    <motion.div
                      className="mt-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <Progress value={analysisProgress} className="w-full h-2 mb-3" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Analyzing your media...
                        </span>
                        <span className="font-medium text-primary">{analysisProgress}%</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Panel: How It Works - Match height */}
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
            >
              {/* Enhanced How It Works Section */}
              <div className="glass-card-elevated p-8 rounded-2xl relative overflow-hidden h-full flex flex-col">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold flex items-center">
                      <Info className="mr-2 h-5 w-5 text-primary" />
                      How It Works
                    </h2>
                    <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                      3 Simple Steps
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative flex-grow">
                    {/* Vertical line connecting the steps */}
                    <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-primary/10 z-0"></div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 flex-shrink-0 shadow-subtle">
                        01
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-primary/10 flex-1">
                        <h3 className="font-semibold mb-2 flex items-center text-base">
                          <Upload className="h-4 w-4 mr-2 text-primary" />
                          Upload Media
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Upload any image or video file, or import directly from social media platforms
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 flex-shrink-0 shadow-subtle">
                        02
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-primary/10 flex-1">
                        <h3 className="font-semibold mb-2 flex items-center text-base">
                          <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                          Advanced Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Our AI performs multiple detection techniques including ELA, facial analysis, and metadata examination
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 flex-shrink-0 shadow-subtle">
                        03
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-primary/10 flex-1">
                        <h3 className="font-semibold mb-2 flex items-center text-base">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Detailed Results
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get comprehensive analysis with confidence scores, visual heatmaps, and detailed metrics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full Width Key Features Section as a separate row with reduced gap */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            {/* Enhanced Key Features Section */}
            <div className="glass-card-elevated p-10 rounded-2xl relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10 z-0"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Shield className="mr-3 h-6 w-6 text-primary" />
                    Key Features
                  </h2>
                  <a href="/knowledge-base" className="text-primary text-sm font-medium flex items-center hover:underline">
                    Learn more about our technology
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm p-6 rounded-xl border border-primary/10 flex items-start">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mr-4 shadow-subtle">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">AI-Powered Detection System</h3>
                        <p className="text-muted-foreground">Our platform uses state-of-the-art deep learning models trained on millions of images to identify manipulation patterns with exceptional accuracy. The system continuously learns and improves from new data.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                      <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">Error Level Analysis</h3>
                      <p className="text-muted-foreground">Sophisticated algorithm that detects manipulation through careful analysis of compression artifacts and inconsistencies in the image</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                      <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                        <BarChart2 className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">Gradcam Heatmaps</h3>
                      <p className="text-muted-foreground">Visual representation of detected manipulation areas using gradient-weighted class activation mapping technology</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                      <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">Metadata Analysis</h3>
                      <p className="text-muted-foreground">In-depth examination of file metadata to uncover hidden manipulation traces and editing history that might not be visible to the naked eye</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                      <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base mb-2">Confidence Scoring</h3>
                      <p className="text-muted-foreground">Precise probability assessment of content authenticity with detailed breakdowns of detection confidence across multiple metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom modal implementation for URL import - temporarily disabled */}
    </Layout>
  )
}
