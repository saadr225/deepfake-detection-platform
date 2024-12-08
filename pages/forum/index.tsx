import { useState } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Clock, User } from 'lucide-react'
import { motion } from 'framer-motion'

// Mock data for forum topics
const mockTopics = [
  { id: 1, title: "Latest advancements in deepfake detection", replies: 23, lastReply: "2023-06-15T10:30:00Z", author: "TechExpert" },
  { id: 2, title: "How to spot a deepfake video?", replies: 45, lastReply: "2023-06-14T16:45:00Z", author: "CuriousLearner" },
  { id: 3, title: "The ethics of AI-generated media", replies: 67, lastReply: "2023-06-13T09:15:00Z", author: "EthicsProf" },
  { id: 4, title: "Deepfake legislation around the world", replies: 34, lastReply: "2023-06-12T14:20:00Z", author: "LegalEagle" },
  { id: 5, title: "Open-source tools for media authenticity", replies: 12, lastReply: "2023-06-11T11:05:00Z", author: "OpenSourceAdvocate" },
]

export default function ForumOverview() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTopics = mockTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="bg-background">
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Community Forum</h1>
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button>Create New Topic</Button>
        </div>

        <motion.div 
          className="bg-card shadow overflow-hidden sm:rounded-md dark:bg-white dark:bg-opacity-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ul className="divide-y divide-border">
            {filteredTopics.map((topic, index) => (
              <motion.li 
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/forum/${topic.id}`} className="block hover:bg-muted transition-colors duration-200">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary truncate">{topic.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                          {topic.replies} replies
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-muted-foreground">
                          <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                          {topic.author}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-muted-foreground sm:mt-0">
                        <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-muted-foreground" />
                        <p>
                          Last reply on <time dateTime={topic.lastReply}>{new Date(topic.lastReply).toLocaleDateString()}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
      </div>
    </Layout>
  )
}