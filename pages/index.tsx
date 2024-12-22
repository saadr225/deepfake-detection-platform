import Layout from '../components/Layout'
import Link from 'next/link'
import { ArrowRight, Shield, Search, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <Layout>
      <section className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-primary sm:text-6xl sm:tracking-tight lg:text-7xl mb-6">
              Detect Deepfakes with Confidence
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Our advanced AI-powered platform helps you identify and analyze deepfakes and AI-generated media.
            </p>
            <div className="mt-10">
              <Link
                href="/detect"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background text-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">
              Our Key Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Cutting-edge technology to protect you from digital deception
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "Deepfake and AI Detection", description: "Advanced AI algorithms to identify manipulated media with high accuracy." },
              { icon: Search, title: "Metadata Analysis", description: "Detailed examination of file metadata to uncover hidden manipulation traces." },
              { icon: Users, title: "Community Forum", description: "Detailed Discussions regarding Deepfakes and AI-generated media." },
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-6">
                    <feature.icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}