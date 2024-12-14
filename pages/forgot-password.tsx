// pages/forgot-password.tsx
import { useState } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useUser } from '../contexts/UserContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })
  
  const { forgotPassword } = useUser()

  // In pages/forgot-password.tsx, modify the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: '' })
  
    try {
      const { success, message } = await forgotPassword(email)
      
      setStatus({
        type: success ? 'success' : 'error',
        message: message
      })
  
      if (success) {
        setEmail('') // Clear the form on success
        console.log('Check the console for the reset link!');
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div 
          className="max-w-md w-full space-y-8 bg-card p-10 rounded-xl shadow-lg dark:bg-white dark:bg-opacity-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            {status.message && (
              <div className={`mt-4 text-center ${
                status.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {status.message}
              </div>
            )}
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Button
                variant="default"
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send reset instructions'}
              </Button>
            </div>

            <div className="text-center">
              <Link href="/login" className="font-medium text-black hover:text-primary/80 transition-colors dark:text-white dark:hover:text-gray-300">
                Back to login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  )
}