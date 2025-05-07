import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import KnowledgeBaseBreadcrumb from "../../components/KnowledgeBaseBreadcrumb";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { ArrowLeft, X, Upload, AlertTriangle, FileText, ImageIcon, Film, Music, Archive, File } from "lucide-react";
import { toast } from "../../components/ui/use-toast";

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Mock topics and categories from the knowledge base
const topics = [
  { id: "1", name: "Deepfake Detection" },
  { id: "2", name: "AI Content Detection" },
  { id: "3", name: "Media Forensics" },
  { id: "4", name: "Ethics in AI" },
  { id: "5", name: "Digital Media Literacy" }
];

const categories = [
  { id: "1", name: "Tutorials" },
  { id: "2", name: "Research" },
  { id: "3", name: "Tools" },
  { id: "4", name: "Best Practices" },
  { id: "5", name: "News" }
];

// Allowed file types and size limits
const allowedFileTypes = [
  "image/jpeg", 
  "image/png", 
  "image/gif",
  "application/pdf",
  "video/mp4",
  "application/zip",
  "application/x-zip-compressed"
];
const maxFileSize = 10 * 1024 * 1024; // 10MB

interface FileWithPreview extends File {
  preview?: string;
  fileType?: string;
}

export default function SubmitPost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  
  // Validation state
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    topic?: string;
    category?: string;
    files?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set editor as loaded after component mounts
  useEffect(() => {
    setEditorLoaded(true);
  }, []);
  
  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle file input
  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const invalidFiles = selectedFiles.filter(
      file => !allowedFileTypes.includes(file.type) || file.size > maxFileSize
    );
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: `Some files have invalid type or exceed the 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`
      }));
      
      toast({
        title: "Invalid files",
        description: "Some files have invalid format or exceed size limits. Please upload different files.",
        variant: "destructive",
      });
      
      return;
    }
    
    // Add previews for images
    const filesWithPreviews = selectedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      
      // Set file type for icon display
      if (file.type.startsWith('image/')) {
        fileWithPreview.fileType = 'image';
        fileWithPreview.preview = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        fileWithPreview.fileType = 'pdf';
      } else if (file.type.startsWith('video/')) {
        fileWithPreview.fileType = 'video';
      } else if (file.type.startsWith('audio/')) {
        fileWithPreview.fileType = 'audio';
      } else if (file.type.includes('zip')) {
        fileWithPreview.fileType = 'zip';
      } else {
        fileWithPreview.fileType = 'file';
      }
      
      return fileWithPreview;
    });
    
    setFiles([...files, ...filesWithPreviews]);
    setErrors(prev => ({ ...prev, files: undefined }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (fileToRemove: FileWithPreview) => {
    // Revoke object URL to prevent memory leaks
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setFiles(files.filter(file => file !== fileToRemove));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      topic?: string;
      category?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!description.trim() || description === '<p><br></p>') {
      newErrors.description = "Description is required";
    }
    
    if (!topic) {
      newErrors.topic = "Topic is required";
    }
    
    if (!category) {
      newErrors.category = "Category is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form has errors",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Post submitted successfully",
        description: "Your knowledge base post has been submitted and is pending review.",
      });
      
      // Navigate back to knowledge base
      router.push("/knowledge-base");
    }, 1500);
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-6 w-6" />;
      case 'pdf':
        return <FileText className="h-6 w-6" />;
      case 'video':
        return <Film className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      case 'zip':
        return <Archive className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  // Quill editor toolbar configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image',
    'blockquote', 'code-block',
    'color', 'background',
  ];

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <KnowledgeBaseBreadcrumb items={[
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: "Submit a Post", href: "/knowledge-base/submit" }
        ]} />
        
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 pl-0 hover:bg-transparent"
            onClick={() => router.push("/knowledge-base")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Knowledge Base
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Submit a Post</h1>
          <p className="text-muted-foreground">
            Share your knowledge, research, or insights about deepfake detection and AI content analysis
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Post Submission Form</CardTitle>
            <CardDescription>
              Fill in the required information to submit your post to the knowledge base.
              All submissions are reviewed before being published.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>
              
              {/* Description with Rich Text Editor */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium">
                  Content <span className="text-red-500">*</span>
                </Label>
                <div className={`${errors.description ? "border border-red-500 rounded-md" : ""}`}>
                  {editorLoaded && (
                    <ReactQuill
                      id="description"
                      value={description}
                      onChange={setDescription}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your article content here..."
                      className="min-h-[300px] bg-background"
                      theme="snow"
                    />
                  )}
                </div>
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
                {editorLoaded && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Use the formatting tools above to style your content. You can add headings, lists, links, images, and more.
                  </p>
                )}
              </div>
              
              {/* Topic and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="font-medium">
                    Topic <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={topic} 
                    onValueChange={setTopic}
                  >
                    <SelectTrigger id="topic" className={errors.topic ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.topic && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.topic}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="font-medium">
                  Tags (up to 5)
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className="py-1 px-3 flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tags (press Enter or comma to add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    disabled={tags.length >= 5}
                  />
                  <Button 
                    type="button" 
                    onClick={addTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {tags.length >= 5 && (
                  <p className="text-sm text-muted-foreground">
                    Maximum of 5 tags reached
                  </p>
                )}
              </div>
              
              {/* File Upload */}
              <div className="space-y-2">
                <Label className="font-medium">
                  Attachments (Optional)
                </Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-secondary/50 ${errors.files ? "border-red-500" : "border-muted"}`}
                  onClick={handleFileClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept={allowedFileTypes.join(',')}
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Click to upload files</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: JPEG, PNG, GIF, PDF, MP4, ZIP (max 10MB)
                  </p>
                </div>
                {errors.files && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.files}
                  </p>
                )}
                
                {/* File Preview */}
                {files.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center bg-secondary/50 rounded-lg p-3"
                      >
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded-md mr-3" 
                          />
                        ) : (
                          <div className="h-12 w-12 flex items-center justify-center bg-secondary rounded-md mr-3">
                            {getFileIcon(file.fileType || 'file')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/knowledge-base")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Layout>
  );
} 