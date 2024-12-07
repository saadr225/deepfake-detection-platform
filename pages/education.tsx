import { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Book, Video, FileText, ExternalLink } from 'lucide-react'

// Mock data for educational resources
const resources = [
  { id: 1, title: "Introduction to Deepfakes", type: "article", category: "Deepfake Detection", link: "#", description: "Learn the basics of deepfake technology and its implications." },
  { id: 2, title: "Advanced AI-Generated Media Analysis", type: "video", category: "AI-Generated Media", link: "#", description: "A comprehensive video course on analyzing AI-generated media." },
  { id: 3, title: "Understanding Metadata in Digital Media", type: "tutorial", category: "Metadata Analysis", link: "#", description: "Step-by-step tutorial on extracting and interpreting metadata from digital media." },
  { id: 4, title: "Ethics of Digital Manipulation", type: "article", category: "Media Manipulation", link: "#", description: "Explore the ethical considerations surrounding digital media manipulation." },
  { id: 5, title: "Deepfake Detection Techniques", type: "video", category: "Deepfake Detection", link: "#", description: "Video series on cutting-edge deepfake detection methodologies." },
  { id: 6, title: "AI in Content Creation", type: "article", category: "AI-Generated Media", link: "#", description: "An in-depth look at how AI is transforming content creation." },
]

const categories = ["All", "Deepfake Detection", "AI-Generated Media", "Metadata Analysis", "Media Manipulation"]

export default function EducationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredResources = resources.filter(resource => 
    (activeCategory === 'All' || resource.category === activeCategory) &&
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-6 w-6" />
      case 'video':
        return <Video className="h-6 w-6" />
      case 'tutorial':
        return <Book className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Educational Resources</h1>
        
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Tabs defaultValue="All" className="mb-6">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getIcon(resource.type)}
                  <span className="ml-2">{resource.title}</span>
                </CardTitle>
                <CardDescription>{resource.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                <Button variant="outline" asChild>
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    View Resource
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}