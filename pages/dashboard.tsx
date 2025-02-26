// Import necessary modules
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '../contexts/UserContext';
import { DetectionEntry, useDetectionHistory } from '../contexts/DetectionHistoryContext';
import { useRouter } from 'next/router';
import { Eye, Trash2, Trash, ChevronDown } from 'lucide-react';
import axios from 'axios';
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    fetchDetectionHistory();
  }, [fetchDetectionHistory]);

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
  const handleDeleteEntry = useCallback((entryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this detection entry?');
    if (confirmed) {
      deleteDetectionEntry(entryId);
    }
  }, [deleteDetectionEntry]);

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

  return (
    <Layout>
      <motion.div
        className="bg-background min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto py-12 sm:px-6 lg:px-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome, {user?.username}
          </motion.h1>

          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 shadow-md">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="history">Detection History</TabsTrigger>
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="mt-8 shadow-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileUpdateError && (
                      <div className="text-red-500 mb-4">{profileUpdateError}</div>
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
                      <Button
                        type="submit"
                        className="mt-4"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </form>
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium">Password Settings</h3>
                          <p className="text-sm text-muted-foreground">Update your password here.</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                          {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </Button>
                      </div>

                      {showPasswordForm && (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          {passwordUpdateError && (
                            <div className="text-red-500 text-sm">{passwordUpdateError}</div>
                          )}
                          {passwordUpdateSuccess && (
                            <div className="text-green-500 text-sm">{passwordUpdateSuccess}</div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
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
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                          </Button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Detection History Tab */}
            <TabsContent value="history" className= "mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Detection History</CardTitle>
                        <CardDescription>Your recent deepfake detection activities.</CardDescription>
                      </div>
                      {detectionHistory.length > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="mr-2 h-4 w-4" /> Clear History
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently clear your detection history. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={clearDetectionHistory}>
                                Yes, clear history
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {detectionHistory.length === 0 ? (
                      <div className="text-center py-4">No detection history found.</div>
                    ) : (
                      <div className="space-y-4">                        
                        {detectionHistory.map((detection) => {
                          return (
                            <motion.div
                              key={detection.id}
                              className="flex flex-col border-b dark:border-gray-700 pb-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-center justify-between">
                                {/* Detected Media Thumbnail */}
                                <div className="flex items-center space-x-4">
                                  <div className="w-20 h-30 relative">
                                    {detection.detectionType === 'deepfake' && detection.detailedReport?.analysis_report.media_type === 'Image' && (
                                      <img
                                        src={'media_path' in detection.detailedReport.analysis_report 
                                          ? detection.detailedReport.analysis_report.media_path
                                          : detection.detailedReport.analysis_report.image_path}
                                        alt="Detected Image"
                                        className="object-cover rounded-md"
                                      />
                                    )}
                                    {detection.detectionType === 'ai-content' && detection.detailedReport && 'media_path' in detection.detailedReport.analysis_report && (
                                      <img
                                        src={detection.detailedReport.analysis_report.media_path}
                                        alt="Detected AI Image"
                                        className="object-cover rounded-md"
                                      />
                                    )}
                                    {detection.detectionType === 'deepfake' && detection.detailedReport?.analysis_report.media_type === 'Video' && 'media_path' in detection.detailedReport.analysis_report && (
                                      <video
                                        src={detection.detailedReport?.analysis_report.media_path}
                                        className="w-full h-20 object-cover rounded-md"
                                        style={{ pointerEvents: 'none' }}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    )}
                                    {detection.detailedReport?.analysis_report.media_type === 'unknown' && (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                                        Unsupported Media
                                      </div>
                                    )}
                                  </div>

                                  {/* Detection Details */}
                                  <div>
                                    <h3 className="text-lg font-semibold">
                                      Detection Result
                                      <span
                                        className={`ml-2 px-2 py-1 rounded text-xs ${
                                          detection.isDeepfake
                                            ? 'bg-red-500 text-white'
                                            : 'bg-green-500 text-white'
                                        }`}
                                      >
                                        {/* {detection.isDeepfake ? (detection.detectionType === 'deepfake' ? 'Deepfake'
                                          : detection.detectionType === 'ai-content' ? 'AI Generated' : 'Not AI Generated') : 'Not Deepfake'} */}
                                          {detection.isDeepfake 
                                          ? (detection.detectionType === 'deepfake' 
                                            ? 'Deepfake' 
                                            : detection.detectionType === 'ai-content' 
                                              ? 'AI Generated' 
                                              : 'Not AI Generated') 
                                          : (detection.detectionType === 'ai-content' 
                                            ? 'Not AI Generated' 
                                            : 'Not Deepfake')}
                                      </span>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Date: {new Date(detection.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Confidence: {(detection.confidence * 100).toFixed(2)}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleViewDetectionDetails(detection)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </Layout>
  );
}