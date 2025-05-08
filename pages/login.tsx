"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUser } from "../contexts/UserContext"
import { useRouter } from "next/router"
import { Shield, KeyRound, MailIcon, AlertCircle, LogIn, UserPlus } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, login, loginError } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (!success) {
        // Login failed, error handled in context
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
    }
  }

  // Add this useEffect to handle redirects
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <Layout>
      {/* Header Section with Background and Gradient */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background with visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute mb-10 bottom-1/4 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
        </div>
        
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 relative z-10">
          <motion.div
            className="max-w-md w-full glass-card-elevated p-10 rounded-2xl shadow-elevation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-black/80 border border-primary/30 text-white text-sm font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure Login
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Welcome <span className="gradient-text">Back</span>
              </h2>

              {/* Error Message */}
              {loginError && (
                <div className="mt-4 mb-6 bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center justify-center">
                  <AlertCircle size={16} className="mr-2" />
                  {loginError}
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1.5 ml-0.5">
                    Email address
                  </Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10 focus:border-primary"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password" className="block text-sm font-medium text-foreground ml-0.5">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="pl-10 focus:border-primary"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-5 border border-transparent rounded-xl shadow-subtle hover:shadow-elevation text-white bg-primary hover:bg-primary-600 focus:outline-none transition-all duration-300"
                disabled={isLoading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center pt-3">
                <span className="text-muted-foreground text-sm">Don't have an account? </span>
                <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  <span className="flex items-center justify-center gap-1 mt-2">
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </span>
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

