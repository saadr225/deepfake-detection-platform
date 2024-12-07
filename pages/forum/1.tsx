import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Clock } from 'lucide-react'

// Mock data for a single discussion
const mockDiscussion = {
  id: 1,
  title: "Latest advancements in deepfake detection",
  author: "TechExpert",
  createdAt: "2023-06-10T09:00:00Z",
  content: "In recent months, there have been significant advancements in deepfake detection technology. Researchers are now using a combination of visual and audio analysis to identify manipulated media with higher accuracy. What are your thoughts on these developments?",
  replies: [
    { id: 1, author: "AIEnthusiast", content: "I've been following these developments closely. The use of neural networks to detect inconsistencies in facial movements and voice patterns is particularly promising.", createdAt: "2023-06-10T10:15:00Z" },
    { id: 2, author: "PrivacyAdvocate", content: "While these advancements are impressive, I'm concerned about the potential for false positives. We need to ensure that legitimate content isn't incorrectly flagged as deepfakes.", createdAt: "2023-06-11T14:30:00Z" },
  ]
}

export default function SingleDiscussion() {
  const router = useRouter()
  const { id } = router.query
  const [replyContent, setReplyContent] = useState('')

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle reply submission logic here
    console.log('Reply submitted:', replyContent)
    setReplyContent('')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{mockDiscussion.title}</h1>
        
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${mockDiscussion.author}`} />
                <AvatarFallback>{mockDiscussion.author.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{mockDiscussion.author}</p>
                <p className="text-sm text-gray-500">
                  <time dateTime={mockDiscussion.createdAt}>
                    {new Date(mockDiscussion.createdAt).toLocaleString()}
                  </time>
                </p>
              </div>
            </div>
            <p className="text-gray-700">{mockDiscussion.content}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Replies</h2>
        
        {mockDiscussion.replies.map((reply) => (
          <div key={reply.id} className="bg-white shadow sm:rounded-lg mb-4">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${reply.author}`} />
                  <AvatarFallback>{reply.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{reply.author}</p>
                  <p className="text-sm text-gray-500">
                    <time dateTime={reply.createdAt}>
                      {new Date(reply.createdAt).toLocaleString()}
                    </time>
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{reply.content}</p>
            </div>
          </div>
        ))}

        <form onSubmit={handleSubmitReply} className="mt-6">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            className="mb-4"
          />
          <Button type="submit">Post Reply</Button>
        </form>
      </div>
    </Layout>
  )
}