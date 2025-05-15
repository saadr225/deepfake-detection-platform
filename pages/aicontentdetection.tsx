"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Link, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Cloud, 
  BarChart2,
  Zap,
  Info,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "../contexts/UserContext"
import Cookies from "js-cookie"
import axios from "axios"

// Add custom CSS for text wrapping in the highlighted text
const highlightedTextStyles = `
  .highlighted-text-container span {
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
    display: inline !important;
  }
`;

export default function AIContentDetectionPage() {
  const router = useRouter()
  const { user } = useUser()

  const [activeTab, setActiveTab] = useState("media")
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>("")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [textResults, setTextResults] = useState<any>(null)
  const [textError, setTextError] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Dropzone configuration (images only, no videos)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0]
    const maxImageSize = 5 * 1024 * 1024 // 5MB

    if (newFile) {
      if (newFile.type.startsWith("image/") && newFile.size > maxImageSize) {
        alert("Image size exceeds 5MB limit")
        return
      }
      if (!newFile.type.startsWith("image/")) {
        alert("Only images are allowed for AI content detection.")
        return
      }
      setFile(newFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  })

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
    if (document.getElementById("fileUpload")) {
      ;(document.getElementById("fileUpload") as HTMLInputElement).value = ""
    }
  }

  // Social media import handler
  const handleSocialMediaImport = async () => {
    setImportError(null)
    try {
      if (!socialMediaUrl.trim()) {
        setImportError("Please enter a valid social media URL")
        return
      }

      // Simple URL format validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      if (!urlPattern.test(socialMediaUrl)) {
        setImportError("Invalid URL format")
        return
      }

      // Simulate fetch from /api/import-social-media
      const response = await fetch("/api/import-social-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: socialMediaUrl }),
      })

      if (response.ok) {
        const mediaFile = await response.blob()
        const importedFile = new File([mediaFile], "social-media-import", {
          type: mediaFile.type,
        })
        onDrop([importedFile])
        setIsImportModalOpen(false)
      } else {
        const errorData = await response.json()
        setImportError(errorData.message || "Failed to import media")
      }
    } catch (error) {
      console.error("Social media import error:", error)
      setImportError("An error occurred while importing media")
    }
  }

  // Analysis handler for images and text
  const handleAnalyze = async () => {
    if (!file && !text.trim()) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setTextResults(null)
    setTextError(null)

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      let detectionResult: any

      if (file) {
        const uploadFile = async (token: string) => {
          const formData = new FormData()
          formData.append("file", file as File)

          const response = await axios.post("http://127.0.0.1:8000/api/process/ai/", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
          return response
        }

        let accessToken = Cookies.get("accessToken")
        let response

        if (!accessToken) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setAnalysisProgress(0)
          alert("Please login first to perform detection.")
          return
        }

        try {
          response = await uploadFile(accessToken)
        } catch (error) {
          if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            const refreshToken = Cookies.get("refreshToken")
            if (refreshToken) {
              const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
                refresh: refreshToken,
              })
              accessToken = refreshResponse.data.access
              if (accessToken) {
                Cookies.set("accessToken", accessToken)
              } else {
                clearInterval(progressInterval)
                setIsAnalyzing(false)
                setAnalysisProgress(0)
                alert("Please login first to perform detection.")
                return
              }
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

        clearInterval(progressInterval)
        setAnalysisProgress(100)
        setIsAnalyzing(false)

        detectionResult = response?.data?.data

        const detectionEntry = {
          imageUrl: detectionResult.analysis_report.media_path,
          mediaType: "Image" as const,
          confidence: detectionResult.confidence_score,
          isDeepfake: detectionResult.is_generated,
          detailedReport: detectionResult,
          detectionType: "ai-content" as const,
          ...(text && { textContent: text }),
        }

        // Store in sessionStorage
        sessionStorage.setItem("aiContentResult", JSON.stringify(detectionResult))

        // Navigate to results page with only a flag
        router.push({
          pathname: "/aicontentreport",
          query: { fromDetection: "true" },
        })
      }

      // For text detection (new code)
      else if (text.trim()) {
        let accessToken = Cookies.get("accessToken")

        const processText = async (token: string) => {
          const highlight = "true"
          const response = await axios.post(
            "http://127.0.0.1:8000/api/process/text/",
            { text, highlight },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          return response
        }

        let response

        if (!accessToken) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setAnalysisProgress(0)
          alert("Please login first to perform detection.")
          return
        }

        try {
          response = await processText(accessToken)
        } catch (error) {
          if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            const refreshToken = Cookies.get("refreshToken")
            if (refreshToken) {
              const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
                refresh: refreshToken,
              })
              accessToken = refreshResponse.data.access
              if (accessToken) {
                Cookies.set("accessToken", accessToken)
              } else {
                clearInterval(progressInterval)
                setIsAnalyzing(false)
                setAnalysisProgress(0)
                alert("Please login first to perform detection.")
                return
              }
              response = await processText(accessToken)
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

        clearInterval(progressInterval)
        setAnalysisProgress(100)
        setIsAnalyzing(false)

        // Set text results to display in the UI
        setTextResults(response?.data?.data)

        // Scroll to results section after a short delay
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (error) {
      console.error("Detection analysis error:", error)
      clearInterval(progressInterval)
      setAnalysisProgress(0)
      setIsAnalyzing(false)
      setTextError("An error occurred during analysis. Please try again.")
      alert("An error occurred during analysis. Please try again.")
    }
  }

  // Formatting helper function to add to the component
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + "%"
  }

  // Add this new function to render highlighted text
  const renderHighlightedText = (text: string) => {
    if (!text) return null

    // If using the html_text format (with spans)
    if (textResults?.html_text) {
      return (
        <div
          className="whitespace-pre-wrap text-left p-4 border rounded-xl bg-card overflow-hidden break-words highlighted-text-container"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
            wordBreak: 'break-word'
          }}
          dangerouslySetInnerHTML={{ __html: textResults.html_text }}
        />
      )
    }
    return null
  }

  return (
    <Layout>
      {/* Add the custom styles */}
      <style jsx global>{highlightedTextStyles}</style>
      
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
                Advanced AI Content Detection
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Detect <span className="gradient-text">AI-Generated</span> Content with Precision
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Our platform identifies AI-generated images and text using advanced detection models
              to help you verify content authenticity
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>98.7% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Text & Image Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>Multi-Source Detection</span>
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
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {/* Main Content Section in Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-24">
            {/* Left Panel: Upload Options with Tabs Above */}
            <motion.div 
              className="lg:col-span-3"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5 }
                }
              }}
            >
              {/* Tabs Navigation - Positioned Above Upload Container */}
              <div className="tab-container mb-4">
                <button 
                  className={`tab-button ${activeTab === "media" ? "tab-button-active" : "tab-button-inactive"}`}
                  onClick={() => setActiveTab("media")}
                >
                  <div className="flex items-center justify-center">
                    <Upload className="mr-2 h-5 w-5" />
                    <span>Upload File</span>
                  </div>
                </button>
                <button 
                  className={`tab-button ${activeTab === "text" ? "tab-button-active" : "tab-button-inactive"}`}
                  onClick={() => setActiveTab("text")}
                >
                  <div className="flex items-center justify-center">
                    <FileText className="mr-2 h-5 w-5" />
                    <span>Detect Text</span>
                  </div>
                </button>
              </div>
              
              <div className="glass-card-elevated p-8 rounded-2xl h-full flex flex-col">
                {activeTab === "media" && (
                  <>
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <Upload className="mr-2 h-5 w-5 text-primary" /> 
                      Upload Image for Analysis
                    </h2>
                    
                    {/* Action Buttons */}
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
                        accept="image/*"
                      />
                    </div>

                    {/* Dropzone Area */}
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
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt="Uploaded file"
                            className="max-h-[220px] max-w-full object-contain mb-4 rounded-xl shadow-subtle"
                          />
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
                            Drag & drop an image file here, or click to select a file
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            <Info className="h-3 w-3 mr-1" /> JPEG, PNG supported (Max: 5MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "text" && (
                  <>
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" /> 
                      Analyze Text Content
                    </h2>
                    
                    <textarea
                      placeholder="Enter text to analyze for AI generation..."
                      className="w-full p-4 border border-muted-foreground/30 rounded-xl mb-6 bg-background/50 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all flex-grow min-h-[280px]"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </>
                )}

                {/* Analysis Controls */}
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
                      disabled={(activeTab === "media" && !file) || (activeTab === "text" && !text.trim()) || isAnalyzing}
                      className="py-5 px-8 text-base font-medium h-auto shadow-subtle hover:shadow-elevation transition-all"
                    >
                      {isAnalyzing ? "Analyzing..." : "Detect Now"}
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
                          Analyzing your {activeTab === "media" ? "image" : "text"}...
                        </span>
                        <span className="font-medium text-primary">{analysisProgress}%</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Panel: How It Works */}
            <motion.div 
              className="lg:col-span-2"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5 }
                }
              }}
            >
              {/* Enhanced How It Works Section */}
              <div className="glass-card-elevated mt-16 p-8 rounded-2xl relative overflow-hidden h-full flex flex-col">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
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
                      <div className="mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-primary/10 flex-1">
                        <h3 className="font-semibold mb-2 flex items-center text-base">
                          <Upload className="h-4 w-4 mr-2 text-primary" />
                          Upload Content
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Upload any image or paste text you want to analyze for AI generation markers
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 flex-shrink-0 shadow-subtle">
                        02
                      </div>
                      <div className="mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-primary/10 flex-1">
                        <h3 className="font-semibold mb-2 flex items-center text-base">
                          <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                          AI Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Our models examine content patterns, structures, and unique artifacts that indicate AI generation
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
                          Get comprehensive detection results with confidence scores, source predictions, and explanations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Text Results Section */}
          {textResults && (
            <motion.div
              ref={resultsRef}
              className="glass-card-elevated p-8 rounded-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5 }
                }
              }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" /> 
                AI Text Detection Results
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Source Prediction */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                    Primary Source Prediction
                  </h3>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center">
                      {textResults.is_ai_generated ? (
                        <div className="flex items-center text-amber-600 dark:text-amber-400 space-x-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">AI-Generated Content Detected</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600 dark:text-green-400 space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Likely Human-Written Content</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-lg inline-flex">
                      Predicted Source: {textResults.source_prediction}
                    </div>
                  </div>
                </div>

                {/* Confidence Scores Summary */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                    Confidence Scores
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(textResults.confidence_scores || {}).map(([source, score]) => (
                      <div key={source} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{source}</span>
                          <span className="text-sm font-bold">{formatPercentage(score as number)}</span>
                        </div>
                        <Progress
                          value={(score as number) * 100}
                          className={`h-2 ${
                            source === "Human"
                              ? "[&>div]:bg-green-500"
                              : source === "Claude"
                                ? "[&>div]:bg-primary"
                                : "[&>div]:bg-amber-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analyzed Text with Highlights */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border overflow-hidden">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Analyzed Text
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Highlighted portions indicate potential AI-generated content</p>
                <div className="overflow-x-auto max-w-full">
                  {renderHighlightedText(textResults.highlighted_text || textResults.html_text)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Features Section */}
          <motion.div 
            className="mb-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              }
            }}
          >
            <div className="glass-card-elevated p-10 rounded-2xl relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10 z-0"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Info className="mr-3 h-6 w-6 text-primary" />
                    Key Features
                  </h2>
                  <a href="/knowledge-base" className="text-primary text-sm font-medium flex items-center hover:underline">
                    Learn more about our technology
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                    <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                      <BarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">Multi-Model Detection</h3>
                    <p className="text-muted-foreground">Our system uses multiple specialized models to detect content from various AI generators like DALL-E, Midjourney, and GPT</p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                    <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">Highlighted Text Analysis</h3>
                    <p className="text-muted-foreground">Visualize potentially AI-generated parts of text with intelligent highlighting that identifies AI writing patterns</p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-border flex flex-col">
                    <div className="bg-primary/10 rounded-lg p-3 mb-3 w-fit">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">Detailed Source Analysis</h3>
                    <p className="text-muted-foreground">Identify not just if content is AI-generated, but which specific AI model likely created it with source attribution</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom modal for import URL - will be created if needed */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="bg-card rounded-2xl">
          <DialogHeader>
            <DialogTitle>Import from Social Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter social media post URL"
              value={socialMediaUrl}
              onChange={(e) => setSocialMediaUrl(e.target.value)}
              className="w-full p-4 border rounded-xl bg-background"
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
    </Layout>
  )
}
