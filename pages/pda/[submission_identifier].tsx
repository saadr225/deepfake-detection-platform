"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  LinkIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  BarChart2,
  Download,
  Share2,
} from "lucide-react"
import { motion } from "framer-motion"

// Types for PDA submission details
interface DetectionResult {
  is_deepfake: boolean
  confidence_score: number
  frames_analyzed: number
  fake_frames: number
}

interface PDASubmissionDetails {
  id: number
  title: string
  category: string
  category_display: string
  submission_identifier: string
  original_submission_identifier?: string
  description: string
  context: string
  source_url: string
  file_type: string
  submission_date: string
  file_url: string
  detection_result?: DetectionResult
  analysis_report?: {
    media_path: string
    media_type: string
    file_id: string
    frame_results: Array<{
      frame_id: string
      frame_path: string
      ela_path: string
      gradcam_path: string
    }>
  }
}

interface PDADetailsResponse {
  code: string
  message: string
  data: PDASubmissionDetails
}

export default function PDASubmissionDetailsPage() {
  const router = useRouter()
  const { submission_identifier } = router.query

  const [submission, setSubmission] = useState<PDASubmissionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("media")

  // Fetch submission details from API
  useEffect(() => {
    // Replace the fetchSubmissionDetails function with this real API call
const fetchSubmissionDetails = async () => {
    if (!submission_identifier) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      // Make the actual API call to get submission details
      const response = await fetch(`http://127.0.0.1:8000/api/pda/details/${submission_identifier}/`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with response data
      setSubmission(data.data);
    } catch (err) {
      console.error("Error fetching PDA submission details:", err);
      setError("Failed to load submission details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

    fetchSubmissionDetails()
  }, [submission_identifier])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle back button click
  const handleBack = () => {
    router.push("/pda")
  }

  // Handle download report
  const handleDownloadReport = () => {
    if (!submission) return

    const reportData = {
      ...submission,
      download_date: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `pda_report_${submission.submission_identifier}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle share report
  const handleShareReport = async () => {
    if (!submission) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PDA Report: ${submission.title}`,
          text: `Check out this deepfake analysis: ${submission.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Archive
          </Button>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-[150px] w-full rounded-xl" />
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Error Loading Submission</h2>
              <p className="mb-4">{error}</p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.reload()}>
                  Try Again
                </Button>
                <Button onClick={handleBack}>Return to Archive</Button>
              </div>
            </div>
          ) : submission ? (
            <div className="space-y-6">
              {/* Header with title and actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-gradient">{submission.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">{submission.category_display}</Badge>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(submission.submission_date)}
                    </span>
                    <Badge className={submission.detection_result?.is_deepfake ? "bg-red-500" : "bg-green-500"}>
                      {submission.detection_result?.is_deepfake ? (
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Deepfake
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Authentic
                        </div>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={handleShareReport}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Media and tabs */}
                <div className="md:col-span-2 space-y-6">
                  {/* Media display */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {submission.file_type === "Video" ? (
                        <video
                          src={submission.file_url}
                          controls
                          className="w-full h-auto max-h-[500px]"
                          poster="/placeholder.svg?height=500&width=800&text=Video+Thumbnail"
                        />
                      ) : (
                        <img
                          src={submission.file_url || "/placeholder.svg"}
                          alt={submission.title}
                          className="w-full h-auto max-h-[500px] object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=500&width=800"
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Tabs for different content */}
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="context">Context</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="bg-card rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{submission.description}</p>
                    </TabsContent>

                    <TabsContent value="context" className="bg-card rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Context</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{submission.context}</p>

                      {submission.source_url && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Source</h4>
                          <a
                            href={submission.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            {submission.source_url}
                          </a>
                        </div>
                      )}
                    </TabsContent>

                    // Update the Analysis tab content to handle cases where detection_result may not exist
<TabsContent value="analysis" className="bg-card rounded-xl p-6 shadow-sm">
  <h3 className="text-xl font-semibold mb-4">Technical Analysis</h3>

  {submission.detection_result ? (
    <div className="space-y-4">
      <p className="text-muted-foreground mb-4">
        This media was analyzed using our advanced deepfake detection algorithms. Below are the
        technical details of the analysis.
      </p>

      {/* File type information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Media Type</h4>
          <p>{submission.file_type}</p>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">File ID</h4>
          <p className="font-mono text-sm">{submission.submission_identifier}</p>
        </div>
      </div>

      {/* Detection result stats */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Analysis Results</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm mb-1">Frames Analyzed</div>
            <div className="text-2xl font-bold">
              {submission.detection_result.frames_analyzed}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm mb-1">Fake Frames Detected</div>
            <div className="text-2xl font-bold">{submission.detection_result.fake_frames}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
      <Info className="h-5 w-5 mr-2" />
      Detailed analysis data not available for this submission
    </div>
  )}
</TabsContent>
                  </Tabs>
                </div>

                {/* Right column - Detection results and info */}
                <div className="space-y-6">
                  {/* Detection Result Card */}
                  {submission.detection_result ? (
  <Card className="overflow-hidden">
    <CardHeader className="pb-2">
      <CardTitle>Detection Result</CardTitle>
    </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center text-center mb-4">
                          <div
                            className={`p-4 rounded-full mb-2 ${
                              submission.detection_result.is_deepfake
                                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {submission.detection_result.is_deepfake ? (
                              <AlertTriangle className="h-8 w-8" />
                            ) : (
                              <CheckCircle className="h-8 w-8" />
                            )}
                          </div>
                          <h3 className="text-xl font-bold">
                            {submission.detection_result.is_deepfake ? "Deepfake Detected" : "Authentic Media"}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {submission.detection_result.is_deepfake
                              ? "This media has been identified as AI-generated or manipulated content."
                              : "This media appears to be authentic with no signs of manipulation."}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Confidence Score</span>
                              <span className="text-sm font-medium">
                                {(submission.detection_result.confidence_score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={submission.detection_result.confidence_score * 100}
                              className={`h-2 ${
                                submission.detection_result.is_deepfake ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
                              }`}
                            />
                          </div>

                          {submission.detection_result.frames_analyzed > 1 && (
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Fake Frames</span>
                                <span className="text-sm font-medium">
                                  {submission.detection_result.fake_frames} /{" "}
                                  {submission.detection_result.frames_analyzed}
                                </span>
                              </div>
                              <Progress
                                value={
                                  (submission.detection_result.fake_frames /
                                    submission.detection_result.frames_analyzed) *
                                  100
                                }
                                className="h-2 [&>div]:bg-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Submission Info Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Submission Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Submission ID</h4>
                          <p className="font-mono text-sm break-all">{submission.submission_identifier}</p>
                        </div>

                        {submission.original_submission_identifier && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Original ID</h4>
                            <p className="font-mono text-sm break-all">{submission.original_submission_identifier}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                          <p>{submission.category_display}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">File Type</h4>
                          <p>{submission.file_type}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Submission Date</h4>
                          <p>{formatDate(submission.submission_date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Educational Resources Card */}
                  {/* <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Educational Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn more about deepfakes and how to identify them with these resources:
                      </p>
                      <div className="space-y-3">
                        {[
                          {
                            title: "Understanding Deepfake Technology",
                            icon: FileText,
                            href: "#",
                          },
                          {
                            title: "Deepfake Detection Techniques",
                            icon: BarChart2,
                            href: "#",
                          },
                          {
                            title: "Media Literacy Guide",
                            icon: Info,
                            href: "#",
                          },
                        ].map((resource, index) => (
                          <a
                            key={index}
                            href={resource.href}
                            className="flex items-center p-2 rounded-md hover:bg-accent transition-colors"
                          >
                            <resource.icon className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm">{resource.title}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card> */}
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </Layout>
  )
}

// Mock data generator for demonstration
// function generateMockSubmissionDetails(submissionId: string): { data: PDASubmissionDetails } {
//   // Extract ID from submission identifier
//   const idMatch = submissionId.match(/pda-(\d+)-/)
//   const id = idMatch ? Number.parseInt(idMatch[1]) : 1

//   // Determine category based on ID
//   const categories = [
//     { code: "POL", name: "Politics" },
//     { code: "ENT", name: "Entertainment" },
//     { code: "MIS", name: "Misinformation" },
//     { code: "EDU", name: "Educational" },
//   ]
//   const categoryIndex = id % categories.length

//   // Determine if deepfake based on ID
//   const isDeepfake = id % 3 !== 0 // 2/3 of items are deepfakes

//   // Generate mock submission details
//   return {
//     data: {
//       id,
//       title: `${categories[categoryIndex].name} Deepfake Example ${id}`,
//       category: categories[categoryIndex].code,
//       category_display: categories[categoryIndex].name,
//       submission_identifier: submissionId,
//       original_submission_identifier: `orig-${id}-${Date.now()}`,
//       description: `This is a ${isDeepfake ? "deepfake" : "authentic"} video showing ${
//         categoryIndex === 0
//           ? "a political figure making false statements that they never actually made. The video has been manipulated to show the person saying things they never said, with their facial expressions and mouth movements altered to match the fake audio."
//           : categoryIndex === 1
//             ? "a celebrity in a movie scene they never appeared in. Advanced AI technology was used to replace the original actor's face with this celebrity's face, creating a convincing but entirely fabricated performance."
//             : categoryIndex === 2
//               ? "misleading content about current events. This media was created to spread misinformation by showing events that never actually occurred, manipulated to appear authentic to casual viewers."
//               : "educational content about deepfake technology. This example was created specifically to demonstrate how deepfakes work and how they can be detected through careful analysis."
//       }`,
//       context: `This ${isDeepfake ? "deepfake" : "authentic media"} was ${
//         isDeepfake ? "created" : "verified"
//       } by our research team to demonstrate the capabilities and limitations of current deepfake technology. ${
//         isDeepfake
//           ? "It was generated using a combination of GANs (Generative Adversarial Networks) and face-swapping techniques. The creation process involved training AI models on thousands of images of the subject to learn their facial features and expressions."
//           : "It has been thoroughly analyzed using multiple detection techniques and confirmed to be unaltered original content. We include it in our archive as a control sample to help researchers understand the differences between authentic and manipulated media."
//       }
      
//       ${
//         categoryIndex === 0
//           ? "Political deepfakes are particularly concerning as they can be used to manipulate public opinion and interfere with democratic processes. This example demonstrates how political figures can be depicted saying or doing things they never actually did."
//           : categoryIndex === 1
//             ? "Entertainment deepfakes, while often created for humor or artistic purposes, raise important questions about consent, image rights, and the future of digital performance. This example shows how convincingly a person can be inserted into content they were never part of."
//             : categoryIndex === 2
//               ? "Misinformation deepfakes are designed to deceive viewers and spread false information. This example demonstrates techniques commonly used to create convincing but entirely fabricated content that purports to document real events."
//               : "Educational deepfakes serve an important purpose in helping researchers, students, and the public understand this technology. This example was created specifically to highlight both the capabilities and the telltale signs of synthetic media."
//       }`,
//       source_url: "https://example.com/source",
//       file_type: id % 5 === 0 ? "Image" : "Video",
//       submission_date: new Date(Date.now() - id * 86400000).toISOString(),
//       file_url:
//         id % 5 === 0
//           ? `/placeholder.svg?height=400&width=600&text=Deepfake+${id}`
//           : `/placeholder.svg?height=400&width=600&text=Deepfake+Video+${id}`,
//       detection_result: {
//         is_deepfake: isDeepfake,
//         confidence_score: isDeepfake ? 0.7 + Math.random() * 0.25 : 0.65 + Math.random() * 0.3,
//         frames_analyzed: id % 5 === 0 ? 1 : 50 + (id % 100),
//         fake_frames: isDeepfake ? (id % 5 === 0 ? 1 : 45 + (id % 50)) : 0,
//       },
//       analysis_report: {
//         media_path:
//           id % 5 === 0
//             ? `/placeholder.svg?height=400&width=600&text=Deepfake+${id}`
//             : `/placeholder.svg?height=400&width=600&text=Deepfake+Video+${id}`,
//         media_type: id % 5 === 0 ? "Image" : "Video",
//         file_id: `file-${id}-${Date.now()}`,
//         frame_results: [
//           {
//             frame_id: `frame-1-${id}`,
//             frame_path: `/placeholder.svg?height=300&width=400&text=Frame+1`,
//             ela_path: `/placeholder.svg?height=300&width=400&text=ELA+Analysis`,
//             gradcam_path: `/placeholder.svg?height=300&width=400&text=Gradcam+Heatmap`,
//           },
//           {
//             frame_id: `frame-2-${id}`,
//             frame_path: `/placeholder.svg?height=300&width=400&text=Frame+2`,
//             ela_path: `/placeholder.svg?height=300&width=400&text=ELA+Analysis`,
//             gradcam_path: `/placeholder.svg?height=300&width=400&text=Gradcam+Heatmap`,
//           },
//         ],
//       },
//     },
//   }
// }

