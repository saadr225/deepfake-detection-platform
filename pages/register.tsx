"use client"

import type React from "react"

import { useState } from "react"
import Layout from "../components/Layout"
import Link from "next/link"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUser } from "../contexts/UserContext"
import { UserPlus, Shield, KeyRound, MailIcon, User as UserIcon, AlertCircle, ArrowLeft } from "lucide-react"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register, registerError } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password match
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const success = await register(username, email, password)

      if (!success) {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      {/* Header Section with Background and Gradient */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background with visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
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
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Join our <span className="gradient-text">Platform</span>
              </h2>

              {/* Error Message */}
              {registerError && (
                <div className="mt-4 mb-6 bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center justify-center">
                  <AlertCircle size={16} className="mr-2" />
                  {registerError}
                </div>
              )}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5 ml-0.5">
                    Username
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="pl-10 focus:border-primary"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
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
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5 ml-0.5">
                    Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="pl-10 focus:border-primary"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 ml-0.5">
                    Password must be at least 8 characters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1.5 ml-0.5">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="pl-10 focus:border-primary"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-5 mt-2 border border-transparent rounded-xl shadow-subtle hover:shadow-elevation text-white bg-primary hover:bg-primary-600 focus:outline-none transition-all duration-300"
                disabled={isLoading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              <div className="text-center pt-3">
                <span className="text-muted-foreground text-sm">Already have an account? </span>
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  <span className="flex items-center justify-center gap-1 mt-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </span>
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

