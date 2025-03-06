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
import { Upload, Link, X, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "../contexts/UserContext"
import Cookies from "js-cookie"
import axios from "axios"

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
          className="whitespace-pre-wrap text-left p-4 border rounded-md bg-card"
          dangerouslySetInnerHTML={{ __html: textResults.html_text }}
        />
      )
    }
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4 text-gradient">AI Content Detection</h1>
          <p className="text-center text-muted-foreground mt-8 mb-12 text-lg">
            Detect AI-generated images and text with advanced analysis
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 shadow-md">
              <TabsTrigger value="media">Image Detection</TabsTrigger>
              <TabsTrigger value="text">Text Detection</TabsTrigger>
            </TabsList>

            {/* Image Detection Tab */}
            <TabsContent value="media" className="w-full">
              <motion.div
                className="glass-card rounded-xl p-6 shadow-xl min-h-[500px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 flex flex-col justify-center items-center h-full min-h-[500px] p-6 ${
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary"
                  }`}
                >
                  <input {...getInputProps()} />

                  {file ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {file.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt="Uploaded file"
                          className="max-h-[350px] max-w-full object-contain mb-4 rounded-lg shadow-md"
                        />
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
                        <Upload className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Drag & drop an image file here, or click to select a file
                      </p>
                      <p className="text-lg text-muted-foreground">Formats: (.JPEG, .PNG)</p>
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
                      accept="image/*"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("fileUpload")?.click()}
                    >
                      Upload File
                    </Button>
                  </div>

                  {/* Social Media Import Dialog */}
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Link className="mr-2" /> Import from Social Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>Import from Social Media</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Enter social media post URL"
                          value={socialMediaUrl}
                          onChange={(e) => setSocialMediaUrl(e.target.value)}
                          className="w-full p-2 border rounded bg-background"
                        />
                        <Button
                          onClick={handleSocialMediaImport}
                          className="w-full bg-primary text-white hover:bg-primary/90"
                        >
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
                    Max size allowed is 5MB for images. By clicking "DETECT", you agree to the AI Content Detection
                    terms and conditions.
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className="w-[250px] bg-primary hover:bg-primary/90 text-white"
                  >
                    {isAnalyzing ? "Analyzing..." : "Detect"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Text Detection Tab */}
            <TabsContent value="text" className="w-full">
              <motion.div
                className="glass-card rounded-xl p-6 shadow-xl min-h-[500px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  placeholder="Paste text for AI detection"
                  className="w-full h-[400px] p-4 border rounded-lg mb-4 bg-card"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center ml-1 mt-4 w-full">
                  <div className="flex-grow text-xs text-muted-foreground pr-6">
                    By clicking "DETECT", you agree to the AI Content Detection terms and conditions.
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || isAnalyzing}
                    className="w-[250px] bg-primary hover:bg-primary/90 text-white"
                  >
                    {isAnalyzing ? "Analyzing..." : "Detect"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Analysis progress indicator */}
          {isAnalyzing && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Progress value={analysisProgress} className="w-full h-2" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Analyzing your content... {analysisProgress}%
              </p>
            </motion.div>
          )}

          {/* Text Analysis Results */}
          {textResults && (
            <motion.div
              ref={resultsRef}
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-gradient">AI Text Detection Results</h2>

              {/* Source Prediction */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Primary Source Prediction:</h3>
                  <Badge
                    variant="outline"
                    className={
                      textResults.source_prediction === "Human"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                    }
                  >
                    {textResults.source_prediction}
                  </Badge>
                  {textResults.is_ai_generated ? (
                    <div className="flex items-center text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5 mr-1" />
                      <span>AI-generated content detected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span>Likely human-written content</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Scores */}
              <Card className="mb-8 shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Confidence Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(textResults.confidence_scores || {}).map(([source, score]) => (
                      <Card key={source} className="overflow-hidden shadow-md border-0">
                        <CardHeader
                          className={`py-3 ${source === textResults.source_prediction ? "bg-primary/10" : ""}`}
                        >
                          <CardTitle className="text-lg">{source}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="text-2xl font-bold">{formatPercentage(score as number)}</div>
                          <Progress
                            value={(score as number) * 100}
                            className={`mt-2 ${
                              source === "Human"
                                ? "[&>div]:bg-green-500"
                                : source === "Claude"
                                  ? "[&>div]:bg-primary"
                                  : "[&>div]:bg-amber-500"
                            }`}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analyzed Text with Highlights */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Analyzed Text</CardTitle>
                  <p className="text-sm text-muted-foreground">Highlighted portions indicate AI-generated content</p>
                </CardHeader>
                <CardContent>
                  {renderHighlightedText(textResults.highlighted_text || textResults.html_text)}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {textError && (
            <div className="mt-8 p-4 bg-red-100 dark:bg-red-900 border border-red-400 rounded-md text-red-700 dark:text-red-300">
              <p>{textError}</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

