"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/router"
import VideoComponent from "../components/ui/VideoComponent"
import Layout from "../components/Layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, LinkIcon, X, Cloud, BarChart2, FileText } from 'lucide-react'
import { motion } from "framer-motion"
import { useUser } from "../contexts/UserContext"
import Cookies from "js-cookie"
import axios from "axios"

export default function DetectPage() {
  const router = useRouter()
  const { user } = useUser()

  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>("")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

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

      // Extract detection results from the response
      const detectionResult = response.data.data

      // Store in sessionStorage
      sessionStorage.setItem("deepfakeResult", JSON.stringify(detectionResult))

      // Navigate to results page with only a flag
      router.push({
        pathname: "/deepfakereport",
        query: { fromDetection: "true" },
      })
    } catch (error) {
      console.error("Detection analysis error:", error)
      setIsAnalyzing(false)
      alert("An error occurred during analysis. Please try again.")
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

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-center mb-14 text-gradient">Detect Deepfakes with Exceptional Precision</h1>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button 
              className="h-14 text-base font-medium"
              onClick={() => document.getElementById("fileUpload")?.click()}
            >
              <Upload className="mr-2 h-5 w-5" /> Upload File
            </Button>
            <Button 
              variant="outline" 
              className="h-14 text-base font-medium"
              onClick={() => setIsImportModalOpen(true)}
            >
              <LinkIcon className="mr-2 h-5 w-5" /> Import URL
            </Button>
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*"
            />
          </div>

          

          {/* Detection Area */}
          <div className="bg-card rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Upload Media</h2>
            <p className="text-muted-foreground mb-4">JPEG, PNG, MP4 Supported (Max: 10MB)</p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors mb-6 flex flex-col justify-center items-center h-full min-h-[300px] p-6 ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary"
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
                      className="max-h-[250px] max-w-full object-contain mb-4 rounded-xl shadow-md"
                    />
                  ) : (
                    <VideoComponent file={file} />
                  )}
                  <p className="text-lg text-primary mb-4">{file.name}</p>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Drag & drop an image or video file here, or click to select a file
                  </p>
                </div>
              )}
            </div>

            {/* Terms and Detect Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-sm text-muted-foreground md:flex-1 md:mb-0 mb-4">
                Max size allowed for image is 5mb and max size allowed for video is 10mb. By clicking "DETECT", you
                agree to terms and conditions of Deep Media Inspection.
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="py-4 text-base md:w-auto w-full md:min-w-[230px]"
              >
                {isAnalyzing ? "Analyzing..." : "Detect"}
              </Button>
            </div>
          </div>

          {/* Three Steps Section */}
          <div className="bg-card rounded-2xl p-6 mb-8 shadow-md">
            <h2 className="text-xl font-bold mb-6">Three Steps to Detect Deepfakes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-accent rounded-2xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
                  <Cloud className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl mb-2">Upload media</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-accent rounded-2xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
                  <BarChart2 className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl mb-2">Deepfake analysis</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-accent rounded-2xl p-4 mb-4 w-16 h-16 flex items-center justify-center">
                  <FileText className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl mb-2">Detailed results</h3>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-6">Features of Deepfake Detection Module</h2>
            <div className="space-y-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 15.01L21.999 3.00101C21.999 2.4487 21.552 2.00101 21 2.00101L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 16H3C2.44772 16 2 16.4477 2 17V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 8L18 6M10 14L16 8L10 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 17V17.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Error Level Analysis</h3>
                  <p className="text-muted-foreground text-sm">Detect image manipulation by analyzing compression error levels.</p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.2426 7.75736C18.5858 10.1005 18.5858 13.8995 16.2426 16.2426C13.8995 18.5858 10.1005 18.5858 7.75736 16.2426C5.41421 13.8995 5.41421 10.1005 7.75736 7.75736C10.1005 5.41421 13.8995 5.41421 16.2426 7.75736" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.1213 9.87868C15.2929 11.0503 15.2929 12.9497 14.1213 14.1213C12.9497 15.2929 11.0503 15.2929 9.87868 14.1213C8.70711 12.9497 8.70711 11.0503 9.87868 9.87868C11.0503 8.70711 12.9497 8.70711 14.1213 9.87868" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gradcam Heatmaps</h3>
                  <p className="text-muted-foreground text-sm">Visualize areas of interest in images using gradient-weighted class activation mapping.</p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.0784 4.92163L17.6642 6.33584" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.33584 17.6642L4.92163 19.0784" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.0784 19.0784L17.6642 17.6642" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.33584 6.33584L4.92163 4.92163" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Metadata analysis</h3>
                  <p className="text-muted-foreground text-sm">Detailed examination of file metadata to uncover hidden manipulation traces.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicator during analysis */}
          {isAnalyzing && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Progress value={analysisProgress} className="w-full h-2" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Analyzing your media... {analysisProgress}%
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Social Media Import Dialog */}
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
