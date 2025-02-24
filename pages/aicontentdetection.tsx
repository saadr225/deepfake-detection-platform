import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Upload, Link, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useDetectionHistory } from '../contexts/DetectionHistoryContext';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function AIContentDetectionPage() {
  const router = useRouter();
  const { user } = useUser();
  //const { addDetectionEntry } = useDetectionHistory();

  const [activeTab, setActiveTab] = useState('media');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [socialMediaUrl, setSocialMediaUrl] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Dropzone configuration (images only, no videos)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0];
    const maxImageSize = 5 * 1024 * 1024; // 5MB

    if (newFile) {
      if (newFile.type.startsWith('image/') && newFile.size > maxImageSize) {
        alert('Image size exceeds 5MB limit');
        return;
      }
      if (!newFile.type.startsWith('image/')) {
        alert('Only images are allowed for AI content detection.');
        return;
      }
      setFile(newFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onDrop([selectedFile]);
    }
  };

  // Remove file handler
  const handleRemoveFile = () => {
    setFile(null);
    if (document.getElementById('fileUpload')) {
      (document.getElementById('fileUpload') as HTMLInputElement).value = '';
    }
  };

  // Social media import handler
  const handleSocialMediaImport = async () => {
    setImportError(null);
    try {
      if (!socialMediaUrl.trim()) {
        setImportError('Please enter a valid social media URL');
        return;
      }

      // Simple URL format validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(socialMediaUrl)) {
        setImportError('Invalid URL format');
        return;
      }

      // Simulate fetch from /api/import-social-media
      const response = await fetch('/api/import-social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: socialMediaUrl })
      });

      if (response.ok) {
        const mediaFile = await response.blob();
        const importedFile = new File([mediaFile], 'social-media-import', {
          type: mediaFile.type
        });
        onDrop([importedFile]);
        setIsImportModalOpen(false);
      } else {
        const errorData = await response.json();
        setImportError(errorData.message || 'Failed to import media');
      }
    } catch (error) {
      console.error('Social media import error:', error);
      setImportError('An error occurred while importing media');
    }
  };

  // Analysis handler for images and text
  const handleAnalyze = async () => {
    if (!file && !text.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      let detectionResult: any;

      if (file) {
        const uploadFile = async (token: string) => {
          const formData = new FormData();
          formData.append('file', file as File);

          const response = await axios.post(
            'http://127.0.0.1:8000/api/process/ai/',
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          return response;
        };

        let accessToken = Cookies.get('accessToken');
        let response;

        if (!accessToken) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          alert('Please login first to perform detection.');
          return;
        }

        try {
          response = await uploadFile(accessToken);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const refreshResponse = await axios.post(
                'http://127.0.0.1:8000/api/auth/refresh_token/',
                { refresh: refreshToken }
              );
              accessToken = refreshResponse.data.access;
              if (accessToken) {
                Cookies.set('accessToken', accessToken);
              } else {
                clearInterval(progressInterval);
                setIsAnalyzing(false);
                setAnalysisProgress(0);
                alert('Please login first to perform detection.');
                return;
              }
              response = await uploadFile(accessToken);
            } else {
              clearInterval(progressInterval);
              setIsAnalyzing(false);
              setAnalysisProgress(0);
              alert('Please login first to perform detection.');
              return;
            }
          } else {
            throw error;
          }
        }

        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setIsAnalyzing(false);

        detectionResult = response?.data?.data;
      } else {
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setIsAnalyzing(false);

        detectionResult = {
          id: 1,
          media_upload: 1,
          is_generated: true,
          confidence_score: 0.95,
          analysis_report: {
            file_id: 'dummy_text',
            media_path: '',
            gradcam_path: '',
            prediction: 'fake',
            confidence: 0.95
          }
        };
      }

      const detectionEntry = {
        imageUrl: detectionResult.analysis_report.media_path,
        mediaType: 'Image' as const,
        confidence: detectionResult.confidence_score,
        isDeepfake: detectionResult.is_generated,
        detailedReport: detectionResult,
        detectionType: 'ai-content' as const,
        ...(text && { textContent: text })
      };

      // if (user) {
      //   addDetectionEntry(detectionEntry);
      // }

      // Store in sessionStorage
      sessionStorage.setItem('aiContentResult', JSON.stringify(detectionResult));
      
      // Navigate to results page with only a flag
      router.push({
        pathname: '/aicontentreport',
        query: { fromDetection: 'true' }
      });
    } catch (error) {
      console.error('Detection analysis error:', error);
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setIsAnalyzing(false);
      alert('An error occurred during analysis. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div
          className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4 text-primary">
            AI Content Detection
          </h1>
          <p className="text-center text-muted-foreground mt-12 mb-12 text-lg">
            Detect AI-generated images and text with advanced analysis
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 shadow-md">
              <TabsTrigger value="media">Image Detection</TabsTrigger>
              <TabsTrigger value="text">Text Detection</TabsTrigger>
            </TabsList>

            {/* Image Detection Tab */}
            <TabsContent value="media" className="w-full">
              <div className="bg-background border rounded-lg p-6 shadow-xl min-h-[500px]">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 flex flex-col justify-center items-center h-full min-h-[500px] p-6 ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />

                  {file ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {file.type.startsWith('image/') && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Uploaded file"
                          className="max-h-[350px] max-w-full object-contain mb-4"
                        />
                      )}
                      <p className="text-lg text-primary mb-4">{file.name}</p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="flex items-center"
                        >
                          <X className="mr-2 h-4 w-4" /> Remove
                        </Button>
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg text-muted-foreground">
                        Drag & drop an image file here, or click to select a file
                      </p>
                      <p className="text-lg text-muted-foreground">Formats: (.JPEG, .PNG)</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative w-full">
                    <input
                      type="file"
                      id="fileUpload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('fileUpload')?.click()}
                    >
                      Upload File
                    </Button>
                  </div>

                  {/* Social Media Import Dialog */}
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Link className="mr-2" /> Import from Social Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import from Social Media</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Enter social media post URL"
                          value={socialMediaUrl}
                          onChange={(e) => setSocialMediaUrl(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        <Button onClick={handleSocialMediaImport} className="w-full">
                          Import Media
                        </Button>
                        {importError && <p className="text-red-500">{importError}</p>}
                        <p className="text-sm text-muted-foreground">
                          Supported platforms: Instagram, Twitter, Facebook, TikTok
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center ml-1 mt-4 w-full">
                  <div className="flex-grow text-xs text-muted-foreground pr-6">
                    Max size allowed is 5MB for images. By clicking "DETECT", you agree to the AI 
                    Content Detection terms and conditions.
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className="w-[250px]"
                    variant="default"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Detect'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Text Detection Tab */}
            <TabsContent value="text" className="w-full">
              <div className="bg-background border rounded-lg p-6 shadow-sm min-h-[500px]">
                <textarea
                  placeholder="Paste text for AI detection"
                  className="w-full h-[400px] p-4 border rounded mb-4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center ml-1 mt-4 w-full">
                  <div className="flex-grow text-xs text-muted-foreground pr-6">
                    By clicking "DETECT", you agree to the AI Content Detection terms 
                    and conditions.
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || isAnalyzing}
                    className="w-[250px]"
                    variant="default"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Detect'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Analysis progress indicator */}
          {isAnalyzing && (
            <div className="mt-6">
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}