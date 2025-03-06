"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Search, Users, ChevronRight, ChevronLeft, FileText, Thermometer, Archive, ArrowRight } from "lucide-react"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"

const services = [
  {
    icon: Shield,
    title: "Deepfake Detection",
    description: "Advanced AI algorithms to identify manipulated media with high accuracy.",
  },
  {
    icon: Search,
    title: "Metadata Analysis",
    description: "Detailed examination of file metadata to uncover hidden manipulation traces.",
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Join discussions about deepfakes and AI-generated media detection.",
  },
  {
    icon: FileText,
    title: "AI Generated Content Detection",
    description: "Identify AI-generated content with state-of-the-art image and language detection models.",
  },
  {
    icon: Thermometer,
    title: "Gradcam Heatmaps",
    description: "Visualize areas of interest in images using gradient-weighted class activation mapping.",
  },
  {
    icon: Search,
    title: "Error Level Analysis",
    description: "Detect image manipulation by analyzing compression error levels.",
  },
  {
    icon: Archive,
    title: "Public Deepfake Archive",
    description: "Access a curated collection of known deepfakes for research and education.",
  },
]

export default function Home() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <Layout>
      <main className="p-6">
        <section className="mb-12 animate-fadeInUp">
          <div className="rounded-2xl bg-gradient-to-l from-blue-200 to-purple-200 dark:from-blue-300 dark:to-purple-300 p-8 md:p-12 shadow-lg hover-elevate">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-gray-900 ">
                  Detect Deepfakes with
                  <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Unmatched Precision
                  </span>
                </h1>
                <p className="text-xl text-gray-600  mb-8 max-w-3xl mx-auto">
                  Our advanced AI-powered platform helps you identify and analyze deepfakes and AI-generated media with
                  industry-leading accuracy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Try it now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="mb-12 animate-fadeInUp ">
        <div className="flex items-center justify-between mb-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollLeft}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 dark:text-gray-100 text-center">
              Our Services
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollRight}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
            <div className="relative">
              <div
                ref={sliderRef}
                className="flex overflow-x-auto gap-8 pb-4 pl-2 pt-2 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {services.map((service, index) => (
                  <div key={index} className="flex-shrink-0 w-[280px] sm:w-[340px] snap-center">
                    <div className="rounded-xl bg-gray-200 dark:bg-gray-800 p-6 shadow-md hover-elevate  h-full">
                      <service.icon className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{service.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                      <Button
                        variant="link"
                        className="p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Learn more
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        <section className="mb-12 animate-fadeInUp ">
          <div className="rounded-2xl bg-gray-200 dark:bg-gray-800 p-8 md:p-12 shadow-lg hover-elevate ">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-center text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Upload Media",
                  description: "Upload any image, video, or text content you want to analyze",
                },
                {
                  step: "02",
                  title: "Advanced Analysis",
                  description: "Our AI performs multiple detection techniques simultaneously",
                },
                {
                  step: "03",
                  title: "Detailed Results",
                  description: "Get comprehensive results with confidence scores and visual explanations",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative z-20 rounded-xl bg-gray-50 dark:bg-gray-700 p-6 pl-16">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 animate-fadeInUp">
          <div className="rounded-2xl bg-gray-200 dark:bg-gray-800 p-8 shadow-lg hover-elevate ">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  1M+
                </div>
                <div className="text-gray-600 dark:text-gray-300">Media Files Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  99.8%
                </div>
                <div className="text-gray-600 dark:text-gray-300">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-red-600 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-gray-600 dark:text-gray-300">Active Users</div>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fadeInUp">
          <div className="rounded-2xl bg-gray-200 dark:bg-gray-800 p-8 md:p-12 text-center shadow-lg hover-elevate ">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4 text-gray-900 dark:text-gray-100">
              Start Detecting AI-Generated Content Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our platform for reliable AI content detection
            </p>
            <Button
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Get Started Free
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </Layout>
  )
}

