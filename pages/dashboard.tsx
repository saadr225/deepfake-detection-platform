import { useState } from 'react'
import Layout from '../components/Layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from '../contexts/UserContext'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [username, setUsername] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  if (!user) {
    typeof window !== 'undefined' && router.push('/login')
    return null
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle profile update logic here
    console.log('Profile update with:', { username, email })
  }

  return (
    <Layout>
      <div className="bg-background">
      <div className="max-w-3xl mx-auto py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome, {user.name}</h1>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="history">Detection History</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4">Update Profile</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Detection History</CardTitle>
                <CardDescription>Your recent deepfake detection activities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                      <div>
                        <h3 className="text-lg font-semibold">Detection #{item}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline">View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </Layout>
  )
}