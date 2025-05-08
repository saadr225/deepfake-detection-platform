// Import necessary modules
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUser } from '../contexts/UserContext';
import { DetectionEntry, useDetectionHistory } from '../contexts/DetectionHistoryContext';
import { useRouter } from 'next/router';
import { Eye, Trash2, Trash, ChevronDown, FileText, Upload, User, History, Shield, CheckCircle, AlertCircle, Calendar, BarChart } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { CustomAlertDialog, CustomAlertDialogWithTrigger } from "@/components/ui/custom-alert-dialog";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, updateProfile, changePassword } = useUser();
  const { detectionHistory, deleteDetectionEntry, clearDetectionHistory, fetchDetectionHistory } = useDetectionHistory();

  // State for profile
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    // Only fetch detection history when the component mounts
    // This ensures we fetch data only once when the page initially loads
    if (!historyLoaded && user) {
      fetchDetectionHistory();
      setHistoryLoaded(true);
    }
  }, [fetchDetectionHistory, historyLoaded, user]);

  // Handle view detection details
  const handleViewDetectionDetails = useCallback((entry: DetectionEntry) => {
    if (entry.detailedReport) {
      if (entry.detectionType === 'deepfake') {
        router.push({
          pathname: '/deepfakereport',
          query: {
            submission_identifier: entry.submissionIdentifier,
            fromHistory: true
          }
        });
      } else if (entry.detectionType === 'ai-content') {
        router.push({
          pathname: '/aicontentreport',
          query: {
            submission_identifier: entry.submissionIdentifier,
            fromHistory: true
          }
        });
      }
    } else {
      console.error('detailedReport is undefined for entry:', entry);
    }
  }, [router]);

  // Handle delete single entry
  const handleDeleteEntry = useCallback(async (entryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this detection entry?');
    if (!confirmed) return;
  
    try {
      // Find the entry to get its submission identifier
      const entry = detectionHistory.find(entry => entry.id === entryId);
      if (!entry) {
        console.error('Entry not found');
        return;
      }
  
      const submission_identifier = entry.submissionIdentifier;
      let accessToken = Cookies.get('accessToken');
      
      if (!accessToken) {
        alert('Please login first to delete entries.');
        router.push('/login');
        return;
      }
      
      const deleteEntry = async (token: string) => {
        return await axios.delete(`http://127.0.0.1:8000/api/user/submissions/${submission_identifier}/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      };
      
      try {
        await deleteEntry(accessToken);
        // Update local state after successful deletion
        deleteDetectionEntry(entryId);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          // Access token is expired, refresh the token
          const refreshToken = Cookies.get('refreshToken');
          
          if (refreshToken) {
            try {
              // Get a new access token using the refresh token
              const refreshResponse = await axios.post(
                'http://127.0.0.1:8000/api/auth/refresh_token/',
                { refresh: refreshToken }
              );
              
              accessToken = refreshResponse.data.access;
              
              // Store the new access token in cookies
              if (accessToken) {
                Cookies.set('accessToken', accessToken);
                
                // Retry the delete with the new access token
                await deleteEntry(accessToken);
                // Update local state after successful deletion
                deleteDetectionEntry(entryId);
              } else {
                alert('Authentication error. Please login again.');
                router.push('/login');
              }
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              alert('Authentication error. Please login again.');
              router.push('/login');
            }
          } else {
            alert('Authentication error. Please login again.');
            router.push('/login');
          }
        } else {
          console.error('Failed to delete entry:', error);
          alert('Failed to delete entry. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error during delete operation:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }, [detectionHistory, deleteDetectionEntry, router]);

  // Handle profile update (only email can be updated)
  const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateError(null);
    setIsUpdating(true);
  
    try {
      // Validate inputs
      if (!email.trim()) {
        setProfileUpdateError('Email cannot be empty');
        setIsUpdating(false);
        return;
      }
  
      // Call updateProfile method from context
      const { success, message } = await updateProfile(username, email);
  
      if (success) {
        // Show success message
        alert('Profile updated successfully!');
      } else {
        setProfileUpdateError(message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileUpdateError('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  }, [updateProfile, username, email]);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdateError(null);
    setPasswordUpdateSuccess(null);
    setIsChangingPassword(true);

    try {
      if (newPassword !== confirmNewPassword) {
        setPasswordUpdateError('New passwords do not match');
        setIsChangingPassword(false);
        return;
      }

      if (newPassword.length < 8) {
        setPasswordUpdateError('New password must be at least 8 characters long');
        setIsChangingPassword(false);
        return;
      }

      const { success, message } = await changePassword(currentPassword, newPassword, confirmNewPassword);

      if (success) {
        setPasswordUpdateSuccess(message);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordUpdateError(message);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordUpdateError('An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Statistics for user dashboard
  const detectionStats = {
    totalScans: detectionHistory.length,
    deepfakesDetected: detectionHistory.filter(entry => entry.isDeepfake && entry.detectionType === 'deepfake').length,
    aiContentDetected: detectionHistory.filter(entry => entry.isDeepfake && entry.detectionType === 'ai-content').length,
    lastScanDate: detectionHistory.length > 0 
      ? new Date(Math.max(...detectionHistory.map(entry => new Date(entry.date).getTime()))).toLocaleDateString()
      : 'No scans yet'
  };

  return (
    <Layout>
      {/* Header Section with Background and Gradient */}
      <div className="relative">
        {/* Background with visible gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/60 via-primary/40 to-background"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl transform -translate-y-1/3"></div>
          <div className="absolute mb-10 bottom-1/4 left-0 w-64 h-64 bg-primary/25 rounded-full blur-3xl transform translate-y-1/4"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 pt-16 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <motion.div 
            className="max-w-4xl ml-11"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <span className="relative inline-flex items-center px-4 py-2 rounded-full bg-black/80 border border-primary/30 text-white text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                User Dashboard
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
              Welcome, <span className="gradient-text">{user?.username}</span>
            </h1>
            
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-2xl">
              Manage your account settings and view your detection history
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="stats-card transition-all duration-300 hover:translate-y-[-4px]">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="stats-value">{detectionStats.totalScans}</div>
              <div className="stats-label">Total Scans</div>
            </CardContent>
          </Card>
          
          <Card className="stats-card transition-all duration-300 hover:translate-y-[-4px]">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="stats-value">{detectionStats.deepfakesDetected}</div>
              <div className="stats-label">Deepfakes Detected</div>
            </CardContent>
          </Card>
          
          <Card className="stats-card transition-all duration-300 hover:translate-y-[-4px]">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <div className="stats-value">{detectionStats.aiContentDetected}</div>
              <div className="stats-label">AI Content Detected</div>
            </CardContent>
          </Card>
          
          <Card className="stats-card transition-all duration-300 hover:translate-y-[-4px]">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="stats-value-sm">{detectionStats.lastScanDate}</div>
              <div className="stats-label">Last Detection</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-border">
          <Button
            variant="ghost"
            size="lg"
            className={`rounded-none border-b-2 px-8 py-6 text-base font-medium transition-all duration-300 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-3 h-5 w-5" />
            Profile Settings
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={`rounded-none border-b-2 px-8 py-6 text-base font-medium transition-all duration-300 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent'}`}
            onClick={() => {
              if (activeTab !== "history") {
                fetchDetectionHistory();
              }
              setActiveTab("history");
            }}
          >
            <History className="mr-3 h-5 w-5" />
            Detection History
          </Button>
          
        </div>

        {/* Profile Settings Tab Content */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card-elevated transition-all duration-300 ">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information here.</CardDescription>
              </CardHeader>
              <CardContent>
                {profileUpdateError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center mb-4">
                    <AlertCircle size={16} className="mr-2" />
                    {profileUpdateError}
                  </div>
                )}
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:border-primary"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="mt-4 bg-primary hover:bg-primary-600 text-white shadow-subtle hover:shadow-elevation transition-all duration-300"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Security Settings</h3>
                      <p className="text-sm text-muted-foreground">Manage your account security</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="border-primary/30 hover:bg-primary/5 transition-all duration-300"
                    >
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </Button>
                  </div>

                  {showPasswordForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-card/50 backdrop-blur-sm border border-primary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Change Password</CardTitle>
                          <CardDescription>Update your password for enhanced security</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form id="passwordForm" onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordUpdateError && (
                              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                {passwordUpdateError}
                              </div>
                            )}
                            {passwordUpdateSuccess && (
                              <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm flex items-center">
                                <CheckCircle size={16} className="mr-2" />
                                {passwordUpdateSuccess}
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="current-password">Current Password</Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="focus:border-primary"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="focus:border-primary"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                              <Input
                                id="confirm-new-password"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                className="focus:border-primary"
                              />
                            </div>
                          </form>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-0">
                          <Button
                            variant="outline"
                            onClick={() => setShowPasswordForm(false)}
                            className="transition-all duration-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            form="passwordForm"
                            className="bg-primary hover:bg-primary-600 text-white transition-all duration-300"
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Detection History Tab Content */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card-elevated transition-all duration-300 ">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Detection History</CardTitle>
                    <CardDescription>Your recent deepfake and AI content detection activities</CardDescription>
                  </div>
                  {detectionHistory.length > 0 && (
                    <CustomAlertDialogWithTrigger
                      title="Clear Detection History"
                      description="This action will permanently clear your detection history. This cannot be undone."
                      onConfirm={clearDetectionHistory}
                      confirmText="Clear History"
                      variant="destructive"
                    >
                      <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                        <Trash className="mr-2 h-4 w-4" /> Clear History
                      </Button>
                    </CustomAlertDialogWithTrigger>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {detectionHistory.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <History size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Detection History</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't performed any detections yet. Start by detecting deepfakes or AI-generated content.
                    </p>
                    <Link href="/detect">
                      <Button className="bg-primary hover:bg-primary-600 text-white shadow-subtle hover:shadow-elevation transition-all duration-300">
                        <Upload className="mr-2 h-4 w-4" /> Start Detection
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">                        
                    {detectionHistory
                      .slice() // Create a copy to avoid mutating the original array
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending (newest first)
                      .map((detection) => (
                      <motion.div
                        key={detection.id}
                        className="border border-border/50 rounded-xl p-4 mb-4 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Detected Media Thumbnail */}
                          <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 relative overflow-hidden rounded-lg border border-border/50">
                              {detection.detectionType === 'deepfake' && detection.detailedReport?.analysis_report.media_type === 'Image' && (
                                <img
                                  src={'media_path' in detection.detailedReport.analysis_report 
                                    ? detection.detailedReport.analysis_report.media_path
                                    : detection.detailedReport.analysis_report.image_path}
                                  alt="Detected Image"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {detection.detectionType === 'ai-content' && detection.detailedReport && 'media_path' in detection.detailedReport.analysis_report && (
                                <img
                                  src={detection.detailedReport.analysis_report.media_path}
                                  alt="Detected AI Image"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {detection.detectionType === 'deepfake' && detection.detailedReport?.analysis_report.media_type === 'Video' && 'media_path' in detection.detailedReport.analysis_report && (
                                <video
                                  src={detection.detailedReport?.analysis_report.media_path}
                                  className="w-full h-full object-cover"
                                  style={{ pointerEvents: 'none' }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              )}
                              {detection.detailedReport?.analysis_report.media_type === 'unknown' && (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Detection Details */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">
                                  {detection.detectionType === 'deepfake' ? 'Deepfake Detection' : 'AI Content Detection'}
                                </h3>
                                <Badge
                                  className={`${
                                    detection.isDeepfake
                                      ? 'bg-destructive/20 text-destructive border-destructive/30'
                                      : 'bg-green-500/20 text-green-500 border-green-500/30'
                                  } border`}
                                >
                                  {detection.isDeepfake 
                                    ? (detection.detectionType === 'deepfake' 
                                      ? 'Deepfake' 
                                      : 'AI Generated') 
                                    : (detection.detectionType === 'ai-content' 
                                      ? 'Not AI Generated' 
                                      : 'Not Deepfake')}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {new Date(detection.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <BarChart className="h-3.5 w-3.5 mr-1" />
                                  Confidence: {(detection.confidence * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-none border-primary/30 hover:bg-primary/5 transition-all duration-300"
                              onClick={() => handleViewDetectionDetails(detection)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-none border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-300"
                              onClick={() => handleDeleteEntry(detection.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}