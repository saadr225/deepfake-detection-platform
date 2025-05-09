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
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  Zap,
  AlertCircle,
} from "lucide-react"
import Layout from "@/components/Layout"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

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

  return (
    <Layout>
      {/* Full-width hero section with background image */}
      <div className="relative w-full h-[650px] mb-16">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image 
            src="/images/deepfake-hero4.png" 
            alt="Deepfake detection background" 
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            priority
          />
          {/* Gradient overlay - different for light and dark mode */}
          <div className="absolute inset-0 z-10">
            {/* Dark mode gradient - starts higher */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background"></div>
            {/* Light mode gradient - starts lower */}
            {/* <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-black/60 from-40% via-black/50 to-background"></div> */}
            <div className="block dark:hidden absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background"></div>
          </div>
        </div>

        {/* Content positioned over the image */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/30 backdrop-blur-sm border border-primary/30 text-white text-sm font-medium shadow-md">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Advanced AI Detection Platform
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-white drop-shadow-sm">
                Deep Media <span className="gradient-text">Inspection</span>
              </h1>
              
              <p className="text-xl text-white mb-8 max-w-4xl mx-auto font-light drop-shadow-sm bg-primary/15 backdrop-blur-sm py-3 px-4 rounded-lg">
                Our advanced AI-powered platform helps you identify deepfakes and 
                AI-generated media with exceptional precision and reliability.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/detect">
                  <Button size="lg" className="bg-primary hover:bg-primary-600 text-white shadow-subtle hover:shadow-elevation transition-all px-6 py-6 text-lg h-auto">
                    Start Detecting
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/knowledge-base">
                  <Button variant="outline" size="lg" className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all px-6 py-6 text-lg h-auto">
                    Learn More
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Features/Services Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              Comprehensive Detection <span className="gradient-text">Services</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our platform offers advanced tools to detect manipulated media using the latest in AI technology
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                <Card className="h-full border-0 bg-card shadow-subtle hover:shadow-elevation transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="bg-primary/10 h-12 w-12 flex items-center justify-center rounded-xl mb-6">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Link href="/knowledge-base" className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform duration-200">
                      <span>Learn more</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="glass-card-elevated p-12 rounded-3xl">
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                How It <span className="gradient-text">Works</span>
            </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Our streamlined process makes it easy to analyze any media for authenticity
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/10 -translate-y-1/2 hidden md:block z-0"></div>

              {[
                {
                  step: "01",
                  title: "Upload Media",
                  description: "Upload any image, video, or text content you want to analyze",
                  icon: FileText,
                },
                {
                  step: "02",
                  title: "Advanced Analysis",
                  description: "Our AI performs multiple detection techniques simultaneously",
                  icon: BarChart3,
                },
                {
                  step: "03",
                  title: "Detailed Results",
                  description: "Get comprehensive results with confidence scores and visual explanations",
                  icon: CheckCircle2,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative z-10"
                  variants={itemVariants}
                >
                  <div className="bg-card rounded-2xl p-8 border border-border/40 shadow-subtle hover:shadow-elevation transition-all duration-300 flex flex-col items-center text-center relative">
                    <div className="bg-primary text-white flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold mb-6">
                      {item.step}
                    </div>
                    <item.icon className="h-10 w-10 text-primary mb-6" />
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div className="stats-card" variants={itemVariants}>
              <div className="stats-value">1M+</div>
              <div className="stats-label">Media Files Analyzed</div>
            </motion.div>
            <motion.div className="stats-card" variants={itemVariants}>
              <div className="stats-value">99.8%</div>
              <div className="stats-label">Detection Accuracy</div>
            </motion.div>
            <motion.div className="stats-card" variants={itemVariants}>
              <div className="stats-value">50K+</div>
              <div className="stats-label">Active Users</div>
          </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="mb-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div
            className="gradient-bg rounded-3xl p-12 text-center shadow-elevation overflow-hidden relative"
            variants={itemVariants}
          >
            {/* Background abstract shapes */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl transform -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl transform translate-y-1/2"></div>
            </div>

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-white relative z-10">
              Start Detecting AI-Generated Content Today
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of users who trust our platform for reliable AI content detection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/aicontentdetection">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 transition-all px-8 h-14 text-lg border-white/20 shadow-elevation">
                Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/knowledge-base">
                <Button  size="lg" className="bg-white border-white/30 text-primary hover:bg-white/90 transition-all px-8 h-14 text-lg">
                  Learn More
                  <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </Layout>
  )
}