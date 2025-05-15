import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { 
  AlertCircle, 
  Check, 
  ChevronDown, 
  Code, 
  FileText, 
  Image, 
  MessageSquare, 
  ShieldAlert, 
  Video,
  CheckCircle2,
  Server,
  Lock,
  Trash2,
  Plus,
  Key,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { format } from "date-fns";
import { useUser } from "../../contexts/UserContext";

// API Key type definition
interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  expires_at: string | null;
  daily_limit: number;
  is_active: boolean;
  can_use_deepfake_detection: boolean;
  can_use_ai_text_detection: boolean;
  can_use_ai_media_detection: boolean;
  last_used: string | null;
}

// Fix the TypeScript errors by creating an interface for the request body
interface CreateApiKeyRequest {
  name: string;
  daily_limit: number;
  expires_at?: string;
  can_use_deepfake_detection: boolean;
  can_use_ai_text_detection: boolean;
  can_use_ai_media_detection: boolean;
}

export default function APIServices() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("deepfake-detection");

  // User authentication
  const { user } = useUser();

  // API Key management state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [newKeyPermissions, setNewKeyPermissions] = useState({
    can_use_deepfake_detection: true,
    can_use_ai_text_detection: true,
    can_use_ai_media_detection: true
  });
  const [newKeyExpiration, setNewKeyExpiration] = useState("");
  const [newKeyDailyLimit, setNewKeyDailyLimit] = useState(1000);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Load user's API keys on component mount
  useEffect(() => {
    // Ensure apiKeys is always initialized as an array
    setApiKeys([]);
    
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  // Function to fetch API keys
  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }
      
      // Make API request to get user's API keys
      const response = await axios.get("http://127.0.0.1:8000/api/api-keys/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      console.log("API Keys response:", response.data);
      
      // Ensure we're setting an array
      if (Array.isArray(response.data)) {
        setApiKeys(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // API returns data in a 'data' property
        setApiKeys(response.data.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Some APIs return paginated results in a 'results' field
        setApiKeys(response.data.results);
      } else {
        // If the response is not an array or doesn't contain a results array, set empty array
        console.error("Unexpected API response format:", response.data);
        setApiKeys([]);
        setError("Received unexpected data format from the server");
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      // Handle token expiration
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        try {
          // Try to refresh the token
          const refreshToken = Cookies.get("refreshToken");
          if (refreshToken) {
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });
            
            const newAccessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (newAccessToken) {
              Cookies.set("accessToken", newAccessToken);
              // Retry the fetch with new token
              const retryResponse = await axios.get("http://127.0.0.1:8000/api/api-keys/", {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              
              // Ensure we're setting an array
              if (Array.isArray(retryResponse.data)) {
                setApiKeys(retryResponse.data);
              } else if (retryResponse.data && Array.isArray(retryResponse.data.data)) {
                // API returns data in a 'data' property
                setApiKeys(retryResponse.data.data);
              } else if (retryResponse.data && Array.isArray(retryResponse.data.results)) {
                setApiKeys(retryResponse.data.results);
              } else {
                console.error("Unexpected API response format:", retryResponse.data);
                setApiKeys([]);
                setError("Received unexpected data format from the server");
              }
            }
          } else {
            setError("Authentication expired. Please log in again.");
          }
        } catch (refreshError) {
          setError("Failed to authenticate. Please log in again.");
        }
      } else {
        setError("Failed to load API keys. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new API key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError("API key name is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }
      
      // Prepare request body
      const requestBody: CreateApiKeyRequest = {
        name: newKeyName,
        daily_limit: newKeyDailyLimit,
        can_use_deepfake_detection: newKeyPermissions.can_use_deepfake_detection,
        can_use_ai_text_detection: newKeyPermissions.can_use_ai_text_detection,
        can_use_ai_media_detection: newKeyPermissions.can_use_ai_media_detection
      };
      
      // Add expiration if specified
      if (newKeyExpiration) {
        requestBody.expires_at = newKeyExpiration;
      }
      
      // Make API request to create a new API key
      const response = await axios.post(
        "http://127.0.0.1:8000/api/api-keys/",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Create API key response:", response.data);
      
      // Handle different response formats
      let newKey: ApiKey;
      if (response.data && response.data.data) {
        // API returns data in a 'data' property
        newKey = response.data.data;
        setShowNewKey(response.data.data.key);
      } else {
        // Direct response
        newKey = response.data;
        setShowNewKey(response.data.key);
      }
      
      // Add the new key to the list
      setApiKeys([newKey, ...apiKeys]);
      
      // Reset form fields
      setNewKeyName("");
      setNewKeyExpiration("");
      setNewKeyDailyLimit(1000);
      setNewKeyPermissions({
        can_use_deepfake_detection: true,
        can_use_ai_text_detection: true,
        can_use_ai_media_detection: true
      });
      
      setSuccessMessage("API key created successfully");
    } catch (error) {
      // Handle token expiration
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        try {
          // Try to refresh the token
          const refreshToken = Cookies.get("refreshToken");
          if (refreshToken) {
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });
            
            const newAccessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (newAccessToken) {
              Cookies.set("accessToken", newAccessToken);
              // Retry creating the key with new token
              const requestBody: CreateApiKeyRequest = {
                name: newKeyName,
                daily_limit: newKeyDailyLimit,
                can_use_deepfake_detection: newKeyPermissions.can_use_deepfake_detection,
                can_use_ai_text_detection: newKeyPermissions.can_use_ai_text_detection,
                can_use_ai_media_detection: newKeyPermissions.can_use_ai_media_detection
              };
              
              if (newKeyExpiration) {
                requestBody.expires_at = newKeyExpiration;
              }
              
              const retryResponse = await axios.post(
                "http://127.0.0.1:8000/api/api-keys/",
                requestBody,
                {
                  headers: {
                    Authorization: `Bearer ${newAccessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              
              // Handle different response formats
              let newKey: ApiKey;
              if (retryResponse.data && retryResponse.data.data) {
                // API returns data in a 'data' property
                newKey = retryResponse.data.data;
                setShowNewKey(retryResponse.data.data.key);
              } else {
                // Direct response
                newKey = retryResponse.data;
                setShowNewKey(retryResponse.data.key);
              }
              
              setApiKeys([newKey, ...apiKeys]);
              setSuccessMessage("API key created successfully");
              
              // Reset form fields
              setNewKeyName("");
              setNewKeyExpiration("");
              setNewKeyDailyLimit(1000);
              setNewKeyPermissions({
                can_use_deepfake_detection: true,
                can_use_ai_text_detection: true,
                can_use_ai_media_detection: true
              });
            }
          } else {
            setError("Authentication expired. Please log in again.");
          }
        } catch (refreshError) {
          setError("Failed to authenticate. Please log in again.");
        }
      } else {
        setError("Failed to create API key. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to revoke an API key
  const revokeApiKey = async (keyId: string) => {
    if (!window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Get the access token from cookies
      let accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }
      
      // Make API request to revoke the API key
      await axios.delete(`http://127.0.0.1:8000/api/api-keys/${keyId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Show success message
      setSuccessMessage("API key revoked successfully");
      
      // Fetch the updated list of API keys
      await fetchApiKeys();
    } catch (error) {
      // Handle token expiration
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        try {
          // Try to refresh the token
          const refreshToken = Cookies.get("refreshToken");
          if (refreshToken) {
            const refreshResponse = await axios.post("http://127.0.0.1:8000/api/auth/refresh_token/", {
              refresh: refreshToken,
            });
            
            const newAccessToken = refreshResponse.data.access;
            // Store the new access token in cookies
            if (newAccessToken) {
              Cookies.set("accessToken", newAccessToken);
              // Retry revoking the key with new token
              await axios.delete(`http://127.0.0.1:8000/api/api-keys/${keyId}/`, {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              
              // Show success message
              setSuccessMessage("API key revoked successfully");
              
              // Fetch the updated list of API keys
              await fetchApiKeys();
            }
          } else {
            setError("Authentication expired. Please log in again.");
          }
        } catch (refreshError) {
          setError("Failed to authenticate. Please log in again.");
        }
      } else {
        setError("Failed to revoke API key. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const apiServices = [
    {
      id: "deepfake-detection",
      title: "Deepfake Detection API",
      description: "Detect manipulated images and videos with our state-of-the-art deepfake detection algorithm.",
      icon: (isActive: boolean) => <ShieldAlert className={`h-6 w-6 ${isActive ? "text-white" : "text-primary"}`} />,
      status: "Available",
      features: [
        "Face manipulation detection",
        "Confidence scores and analysis",
        "Support for images and videos",
        "Detailed forensic analysis",
        "Fast processing times"
      ],
      useCases: [
        "Media verification",
        "Content moderation",
        "Social media platforms",
        "News organizations",
        "Digital forensics"
      ],
      details: [
        {
          title: "Input",
          content: "Images (JPG, PNG) or videos (MP4, MOV) containing human faces."
        },
        {
          title: "Output",
          content: "Detection results including manipulation probability, confidence scores, frames analyzed, and percentage of fake frames."
        },
        {
          title: "Performance",
          content: "High accuracy with low false positive rates. Processing time depends on media complexity and server load."
        }
      ],
      techSpecs: {
        endpoints: ["api/public-api/deepfake-detection/"],
        methods: ["POST"],
        requestFormat: "multipart/form-data with file parameter",
        authentication: "API key required in X-API-Key header"
      },
      responseExample: `{
  "success": true,
  "code": "SUCCESS",
  "result": {
    "is_deepfake": true,
    "confidence_score": 0.94,
    "frames_analyzed": 25,
    "fake_frames": 21,
    "fake_frames_percentage": 84.0,
    "file_type": "Video"
  },
  "metadata": {
    // File metadata (varies by file type)
  }
}`
    },
    {
      id: "ai-text-detection",
      title: "AI-Generated Text Detection API",
      description: "Identify text content generated by AI models like GPT-4, Claude, and other large language models.",
      icon: (isActive: boolean) => <MessageSquare className={`h-6 w-6 ${isActive ? "text-white" : "text-primary"}`} />,
      status: "Available",
      features: [
        "Detection across multiple AI text models",
        "Probability scoring system",
        "Model identification capabilities",
        "Optional highlighted output",
        "Support for various text lengths"
      ],
      useCases: [
        "Academic integrity",
        "Content authenticity",
        "Publishing verification",
        "Research validation",
        "Misinformation detection"
      ],
      details: [
        {
          title: "Input",
          content: "Plain text (minimum 50 characters)."
        },
        {
          title: "Output",
          content: "Detection results with confidence scores, source prediction, and optional highlighted text."
        },
        {
          title: "Performance",
          content: "High accuracy for longer text samples, with improving performance for short texts."
        }
      ],
      techSpecs: {
        endpoints: ["api/public-api/ai-text-detection/"],
        methods: ["POST"],
        requestFormat: "application/json with text content",
        authentication: "API key required in X-API-Key header"
      },
      responseExample: `{
  "success": true,
  "code": "SUCCESS",
  "result": {
    "is_ai_generated": true,
    "source_prediction": "Human"|"AI",
    "confidence_scores": {
      "Human": 0.12,
      "AI": 0.88
    },
    "highlighted_text": "HTML formatted text with highlights"
  }
}`
    },
    {
      id: "ai-media-detection",
      title: "AI-Generated Media Detection API",
      description: "Identify AI-generated images created by models like DALL-E, Midjourney, and Stable Diffusion.",
      icon: (isActive: boolean) => <Image className={`h-6 w-6 ${isActive ? "text-white" : "text-primary"}`} />,
      status: "Available",
      features: [
        "Detection of multiple AI generation models",
        "Detailed confidence scores",
        "Support for various image formats",
        "Fast and accurate detection",
        "Complete metadata analysis"
      ],
      useCases: [
        "Social media monitoring",
        "Authenticity verification",
        "Content moderation",
        "Academic research",
        "Digital rights management"
      ],
      details: [
        {
          title: "Input",
          content: "Images in common formats (JPG, PNG, WEBP)."
        },
        {
          title: "Output",
          content: "Detection results with confidence scores for AI generation vs. real content."
        },
        {
          title: "Performance",
          content: "High accuracy for known models, with continuous updates to detect new AI generation techniques."
        }
      ],
      techSpecs: {
        endpoints: ["api/public-api/ai-media-detection/"],
        methods: ["POST"],
        requestFormat: "multipart/form-data with file parameter",
        authentication: "API key required in X-API-Key header"
      },
      responseExample: `{
  "success": true,
  "code": "SUCCESS",
  "result": {
    "is_ai_generated": true,
    "prediction": "real"|"fake",
    "confidence_scores": {
      "ai_generated": 0.92,
      "real": 0.08
    }
  },
  "metadata": {
    // File metadata
  }
}`
    }
  ];

  const faqs = [
    {
      question: "How can I get access to the APIs?",
      answer: "You can register for an API key through our developer portal. All our API services are completely free for any use case."
    },
    {
      question: "What are the rate limits for the APIs?",
      answer: "Our API services are completely free with reasonable rate limits to ensure fair usage and system stability. For specific high-volume requirements, please contact our team."
    },
    {
      question: "How accurate are the detection algorithms?",
      answer: "Our detection models achieve high accuracy rates in controlled testing environments. However, accuracy may vary depending on content quality, generation techniques, and as new AI models emerge. We continuously update our detection algorithms to maintain high performance."
    },
    {
      question: "Will you provide SDKs for different programming languages?",
      answer: "Yes, we plan to provide official SDKs for Python, JavaScript/TypeScript, Java, and PHP. For other languages, detailed API documentation will be available to help developers build their own integrations."
    },
    {
      question: "Is my data secure when using the APIs?",
      answer: "Yes, we take data security seriously. All API requests are encrypted using HTTPS, and we don't store submitted content longer than necessary for processing. For specific compliance requirements, please contact our team."
    }
  ];

  return (
    <Layout>
      {/* Enhanced Header Section with Background - similar to detect.tsx */}
      <div className="relative">
        {/* Background with visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute mb-10 bottom-1/4 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-black/80 border border-primary/30 text-white text-sm font-medium">
                <Code className="h-4 w-4 mr-2" />
                Developer Resources
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Powerful <span className="gradient-text">Detection APIs</span> for Developers
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
              Integrate advanced deepfake and AI-generated content detection directly into your 
              applications with our powerful and easy-to-use APIs
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-black/80 dark:text-white/90 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 
                <span>3 Detection Services</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <Server className="h-4 w-4 text-primary" /> 
                <span>Fast & Scalable</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/70">
                <Lock className="h-4 w-4 text-primary" /> 
                <span>Secure Implementation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* API Key Management Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Key className="mr-2 h-6 w-6 text-primary" />
              API Key Management
            </h2>
            <Button 
              onClick={fetchApiKeys} 
              variant="outline" 
              size="sm" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {!user ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-lg">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>Please log in to manage your API keys.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Success/Error Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}
              {showNewKey && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="mb-2 flex items-center text-blue-800 dark:text-blue-300 font-medium">
                    <Key className="h-5 w-5 mr-2" />
                    Your New API Key
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-sm break-all">
                    {showNewKey}
                  </div>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    This key is only shown once. Please copy it now and store it securely.
                  </p>
                  <div className="flex justify-end mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(showNewKey);
                        alert("API key copied to clipboard");
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowNewKey(null)}
                      className="ml-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {/* Create API Key Form */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Create New API Key</CardTitle>
                  <CardDescription>
                    Generate an API key to access the detection services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="key-name" className="mb-2 block">
                          API Key Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="key-name"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="My API Key"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="key-expiration" className="mb-2 block">
                          Expiration Date (Optional)
                        </Label>
                        <Input
                          id="key-expiration"
                          type="date"
                          value={newKeyExpiration}
                          onChange={(e) => setNewKeyExpiration(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="key-limit" className="mb-2 block">
                        Daily Request Limit
                      </Label>
                      <Input
                        id="key-limit"
                        type="number"
                        value={newKeyDailyLimit}
                        onChange={(e) => setNewKeyDailyLimit(parseInt(e.target.value))}
                        min={1}
                        max={10000}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">
                        API Access Permissions
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="deepfake-detection"
                            checked={newKeyPermissions.can_use_deepfake_detection}
                            onCheckedChange={(checked) => 
                              setNewKeyPermissions({
                                ...newKeyPermissions,
                                can_use_deepfake_detection: !!checked
                              })
                            }
                          />
                          <Label htmlFor="deepfake-detection">Deepfake Detection API</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="ai-text-detection"
                            checked={newKeyPermissions.can_use_ai_text_detection}
                            onCheckedChange={(checked) => 
                              setNewKeyPermissions({
                                ...newKeyPermissions,
                                can_use_ai_text_detection: !!checked
                              })
                            }
                          />
                          <Label htmlFor="ai-text-detection">AI-Generated Text Detection API</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="ai-media-detection"
                            checked={newKeyPermissions.can_use_ai_media_detection}
                            onCheckedChange={(checked) => 
                              setNewKeyPermissions({
                                ...newKeyPermissions,
                                can_use_ai_media_detection: !!checked
                              })
                            }
                          />
                          <Label htmlFor="ai-media-detection">AI-Generated Media Detection API</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={createApiKey} 
                    disabled={isLoading || !newKeyName.trim()}
                    className="ml-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate API Key
                  </Button>
                </CardFooter>
              </Card>

              {/* API Keys List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your API Keys</CardTitle>
                  <CardDescription>
                    Manage your existing API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>You don't have any API keys yet.</p>
                      <p className="text-sm mt-2">Create one to start using our APIs.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {apiKeys.map((key: ApiKey) => (
                        <div 
                          key={key.id} 
                          className="border rounded-lg p-4 hover:border-primary/50 transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium text-lg">{key.name}</h3>
                                {!key.is_active && (
                                  <Badge variant="outline" className="ml-2 text-red-500 border-red-200 bg-red-50 dark:bg-red-950/20">
                                    Revoked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(key.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {key.is_active && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => revokeApiKey(key.id)}
                                disabled={isLoading}
                                className="mt-3 md:mt-0"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                          
                          {/* API Key Value */}
                          <div className="mb-4 bg-muted p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-muted-foreground font-medium">API Key:</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(key.key);
                                  alert("API key copied to clipboard");
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                            <div className="font-mono text-sm break-all bg-background p-2 rounded border">
                              {key.key}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                            <div className="bg-muted p-3 rounded">
                              <span className="block text-muted-foreground">Key ID:</span>
                              <span className="font-mono">{key.id}</span>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <span className="block text-muted-foreground">Daily Limit:</span>
                              <span>{key.daily_limit} requests</span>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <span className="block text-muted-foreground">Expires:</span>
                              <span>{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Access Permissions:</h4>
                            <div className="flex flex-wrap gap-2">
                              {key.can_use_deepfake_detection && (
                                <Badge variant="secondary">Deepfake Detection</Badge>
                              )}
                              {key.can_use_ai_text_detection && (
                                <Badge variant="secondary">AI Text Detection</Badge>
                              )}
                              {key.can_use_ai_media_detection && (
                                <Badge variant="secondary">AI Media Detection</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs for API Services */}
        <Tabs 
          defaultValue={apiServices[0].id} 
          className="mb-12 w-full"
          onValueChange={(value) => setActiveTab(value)}
          value={activeTab}
        >
          <TabsList className="w-full flex justify-between mb-8 p-1 gap-2">
            {apiServices.map((service, index) => (
              <TabsTrigger 
                key={service.id} 
                value={service.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4"
              >
                {service.icon(activeTab === service.id)}
                <span>{service.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {apiServices.map((service, index) => (
            <TabsContent 
              key={service.id} 
              value={service.id}
              className="animate-in fade-in-50 duration-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        {service.icon(false)}
                        <Badge variant="success" className="bg-green-500 text-white hover:bg-green-600">{service.status}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <CardDescription className="text-base">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <h3 className="text-lg font-medium">Key Features</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-lg font-medium pt-4">Technical Details</h3>
                      <div className="space-y-4">
                        {service.details.map((detail, i) => (
                          <div key={i} className="border-b pb-3 last:border-0">
                            <h4 className="font-medium text-primary">{detail.title}</h4>
                            <p className="text-muted-foreground">{detail.content}</p>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-lg font-medium pt-4">API Specification</h3>
                      <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <span className="font-medium">Endpoints:</span>
                          <span>{service.techSpecs.endpoints.join(", ")}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <span className="font-medium">Methods:</span>
                          <span>{service.techSpecs.methods.join(", ")}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <span className="font-medium">Format:</span>
                          <span>{service.techSpecs.requestFormat}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <span className="font-medium">Auth:</span>
                          <span>{service.techSpecs.authentication}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-medium pt-4">Response Example</h3>
                      <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap break-all sm:break-normal">
                          {service.responseExample}
                        </pre>
                      </div>
                    </CardContent>
                    {/* <CardFooter>
                      <Button className="w-full md:w-auto">
                        View Documentation
                      </Button>
                    </CardFooter> */}
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Use Cases</CardTitle>
                      <CardDescription>
                        Common applications for the {service.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.useCases.map((useCase, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                              {i + 1}
                            </div>
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Service Information</CardTitle>
                      <CardDescription>
                        Free access for all users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Completely free to use</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Simple API key registration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>Reasonable rate limits</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Integrations Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Integration Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Code Example</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre className="text-xs whitespace-pre-wrap break-all sm:break-normal">
{`// JavaScript/Node.js Example
const detectDeepfake = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch(
    'https://api.deepmediainspection.com/public-api/deepfake-detection/',
    {
      method: 'POST',
      headers: {
        'X-API-Key': 'YOUR_API_KEY'
      },
      body: formData
    }
  );
  
  return await response.json();
};`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Error Handling</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre className="text-xs whitespace-pre-wrap break-all sm:break-normal">
{`// Python Example
import requests

def detect_ai_text(text):
    try:
        response = requests.post(
            'https://api.deepmediainspection.com/public-api/ai-text-detection/',
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': 'YOUR_API_KEY'
            },
            json={
                'text': text,
                'highlight': True
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            return {"error": "Invalid text or too short"}
        elif e.response.status_code == 403:
            return {"error": "Invalid API key"}
        else:
            return {"error": "API error", "code": e.response.status_code}
`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Media Detection Example</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre className="text-xs whitespace-pre-wrap break-all sm:break-normal">
{`// Python Example
import requests

def detect_ai_image(image_path):
    try:
        with open(image_path, 'rb') as img:
            files = {'file': img}
            response = requests.post(
                'https://api.deepmediainspection.com/public-api/ai-media-detection/',
                headers={'X-API-Key': 'YOUR_API_KEY'},
                files=files
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": str(e)}
`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notes Section */}
          <div className="mt-8 p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Important Implementation Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Client-Side Security</h4>
                  <p className="text-sm text-muted-foreground">API keys should never be exposed in client-side code. Always make API calls from your server.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Content Quality</h4>
                  <p className="text-sm text-muted-foreground">Detection accuracy may vary based on content quality. Higher resolution images and videos provide better results.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Face Detection</h4>
                  <p className="text-sm text-muted-foreground">For deepfake detection, ensure faces are clearly visible. The API requires at least one detectable face.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border rounded-lg overflow-hidden"
              >
                <button
                  className="flex items-center justify-between w-full p-4 text-left font-medium"
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Register today to get your API key and start integrating our detection services into your applications. All services are completely free to use for any purpose.
          </p>
          <Button size="lg">
            Register for API Access
          </Button>
        </div> */}
      </motion.div>
    </Layout>
  );
} 