"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  Search,
  Users,
  ChevronRight,
  ChevronLeft,
  FileText,
  Thermometer,
  Archive,
  ArrowRight,
} from "lucide-react"
import Layout from "../components/Layout"
import { motion } from "framer-motion"

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
      <main className="p-6 max-w-7xl mx-auto">
        <section className="mb-12 animate-fadeInUp">
          <motion.div
            className="rounded-2xl glass-card p-8 md:p-12 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-5xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground">
                  Detect Deepfakes with
                  <span className="text-gradient ml-2">Unmatched Precision</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Our advanced AI-powered platform helps you identify and analyze deepfakes and AI-generated media with
                  industry-leading accuracy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                    Try it now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="mb-12 animate-fadeInUp">
          <div className="flex items-center justify-between mb-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollLeft}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground text-center">
              Our Services
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollRight}
              className="text-muted-foreground hover:text-foreground"
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
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-[280px] sm:w-[340px] snap-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                    <CardContent className="p-6">
                      <service.icon className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <Button variant="link" className="p-0 text-primary hover:text-primary/80">
                        Learn more
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 animate-fadeInUp">
          <motion.div
            className="rounded-2xl glass-card p-8 md:p-12 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-center text-foreground">
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
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="relative z-20 rounded-xl bg-card p-6 pl-16 shadow-md">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mb-12 animate-fadeInUp">
          <motion.div
            className="rounded-2xl glass-card p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-gradient">1M+</div>
                <div className="text-muted-foreground">Media Files Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-gradient">99.8%</div>
                <div className="text-muted-foreground">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-gradient">50K+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="animate-fadeInUp">
          <motion.div
            className="rounded-2xl glass-card p-8 md:p-12 text-center shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4 text-foreground">
              Start Detecting AI-Generated Content Today
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our platform for reliable AI content detection
            </p>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Get Started Free
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </section>
      </main>
    </Layout>
  )
}

