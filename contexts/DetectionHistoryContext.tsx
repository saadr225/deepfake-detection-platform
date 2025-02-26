import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define the types for the detection results
interface FrameResult {
  frame_id: string;
  frame_analysis: {
    prediction: string;
    confidence: number;
  };
  crop_analyses: Array<{
    face_index: number;
    prediction: string;
    confidence: number;
  }>;
  final_verdict: string;
  frame_path: string;
  crop_paths: string[];
  ela_path: string; // Define ela_path
  gradcam_path: string; // Define gradcam_path
}

interface AnalysisReport {
  media_path: string;
  media_type: 'Image' | 'Video' | 'unknown'; // Add media_type field
  file_id: string;
  frame_results: FrameResult[]; // Use FrameResult[]
  statistics: {
    confidence: number;
    is_deepfake: boolean;
    total_frames: number;
    fake_frames: number;
    fake_frames_percentage: number;
    total_crops: number;
    fake_crops: number;
    fake_crops_percentage: number;
  };
}

interface DetectionResult {
  id: number;
  media_upload: number;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  fake_frames: number;
  analysis_report: AnalysisReport;
  metadata: Record<string, string>;
}

interface AIContentDetectionResult {
  id: number;
  media_upload: number;
  is_generated: boolean;
  confidence_score: number;
  analysis_report: {
    file_id: string;
    image_path: string;
    gradcam_path: string;
    prediction: string;
    confidence: number;
    media_type: 'Image' | 'Video' | 'unknown';
  };
  metadata: Record<string, string>;
}

export interface DetectionEntry {
  id: string;
  userId: number;
  imageUrl: string;
  mediaType: 'Image' | 'Video' | 'unknown';
  confidence: number;
  isDeepfake: boolean;
  date: string;
  detectionType: 'deepfake' | 'ai-content';
  detailedReport?: any; // Keep this generic to handle both types
  submissionIdentifier: string; // Add this new field
  originalFilename: string; // Add this new field
  textContent?: string;
  frames?: string[];
  originalFrames?: string[];
}

interface DetectionHistoryContextType {
  detectionHistory: DetectionEntry[];
  fetchDetectionHistory: () => void;
  //addDetectionEntry: (entry: Partial<DetectionEntry>) => void;
  deleteDetectionEntry: (id: string) => void;
  clearDetectionHistory: () => void;
}

const DetectionHistoryContext = createContext<DetectionHistoryContextType | undefined>(undefined);

// Add these interfaces above the map functions
interface DeepfakeAnalysisEntry {
  id: number;
  file_type: 'Image' | 'Video' | 'unknown';
  upload_date: string;
  deepfake_detection: DetectionResult;
}

interface AIGeneratedAnalysisEntry {
  id: number;
  file_type: 'Image' | 'Video' | 'unknown';
  upload_date: string;
  ai_generated_media: AIContentDetectionResult;
}

export const DetectionHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [detectionHistory, setDetectionHistory] = useState<DetectionEntry[]>([]);
  const { user } = useUser();

  const fetchDetectionHistory = async () => {
    if (!user) return;
  
    let accessToken = Cookies.get('accessToken');
  
    const fetchHistory = async (token: string) => {
      const response = await axios.get('http://127.0.0.1:8000/api/user/submissions/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    };
  
    try {
      if (!accessToken) {
        console.error('Access token is missing');
        return;
      }
  
      const response = await fetchHistory(accessToken);
      const { data } = response.data;
  
      const deepfakeEntries = data.deepfake_analysis.map((entry: any) => ({
        id: entry.id.toString(),
        userId: user.id,
        imageUrl: entry.file,
        mediaType: entry.file_type,
        confidence: entry.deepfake_detection.confidence_score,
        isDeepfake: entry.deepfake_detection.is_deepfake,
        detectionType: 'deepfake',
        detailedReport: entry.deepfake_detection,
        date: entry.upload_date,
        submissionIdentifier: entry.submission_identifier,
        originalFilename: entry.original_filename,
        metadata: entry.metadata,
      }));
  
      const aiContentEntries = data.ai_generated_analysis.map((entry: any) => ({
        id: entry.id.toString(),
        userId: user.id,
        imageUrl: entry.file,
        mediaType: entry.file_type,
        confidence: entry.ai_generated_media_detection.confidence_score,
        isDeepfake: entry.ai_generated_media_detection.is_generated,
        detectionType: 'ai-content',
        detailedReport: entry.ai_generated_media_detection,
        date: entry.upload_date,
        submissionIdentifier: entry.submission_identifier,
        originalFilename: entry.original_filename,
        metadata: entry.metadata,
      }));
  
      setDetectionHistory([...deepfakeEntries, ...aiContentEntries]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/refresh_token/', {
              refresh: refreshToken,
            });
            accessToken = refreshResponse.data.access;
            if (accessToken) {
              Cookies.set('accessToken', accessToken);
              const response = await fetchHistory(accessToken);
              const { data } = response.data;

              const deepfakeEntries = data.deepfake_analysis.map((entry: any) => ({
                id: entry.id.toString(),
                userId: user.id,
                imageUrl: entry.file,
                mediaType: entry.file_type,
                confidence: entry.deepfake_detection.confidence_score,
                isDeepfake: entry.deepfake_detection.is_deepfake,
                detectionType: 'deepfake',
                detailedReport: entry.deepfake_detection,
                date: entry.upload_date,
                submissionIdentifier: entry.submission_identifier,
                originalFilename: entry.original_filename,
                metadata: entry.metadata,
              }));
          
              const aiContentEntries = data.ai_generated_analysis.map((entry: any) => ({
                id: entry.id.toString(),
                userId: user.id,
                imageUrl: entry.file,
                mediaType: entry.file_type,
                confidence: entry.ai_generated_media_detection.confidence_score,
                isDeepfake: entry.ai_generated_media_detection.is_generated,
                detectionType: 'ai-content',
                detailedReport: entry.ai_generated_media_detection,
                date: entry.upload_date,
                submissionIdentifier: entry.submission_identifier,
                originalFilename: entry.original_filename,
                metadata: entry.metadata,
              }));

              setDetectionHistory([...deepfakeEntries, ...aiContentEntries]);
            } else {
              console.error('Failed to refresh access token');
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        } else {
          console.error('Refresh token is missing');
        }
      } else {
        console.error('Error fetching detection history:', error);
      }
    }
  };

  useEffect(() => {
    fetchDetectionHistory();
  }, [user]);

  // const addDetectionEntry = (entry: Partial<DetectionEntry>) => {
  //   setDetectionHistory(prev => [...prev, { ...entry, id: Date.now().toString() } as DetectionEntry]);
  // };

  const deleteDetectionEntry = (id: string) => {
    setDetectionHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const clearDetectionHistory = async () => {
    if (!user) return;

    let accessToken = Cookies.get('accessToken');

    const clearHistory = async (token: string) => {
      const response = await axios.delete('http://127.0.0.1:8000/api/user/submissions/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    };

    try {
      if (!accessToken) {
        console.error('Access token is missing');
        return;
      }

      await clearHistory(accessToken);
      setDetectionHistory([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/refresh_token/', {
              refresh: refreshToken,
            });
            accessToken = refreshResponse.data.access;
            if (accessToken) {
              Cookies.set('accessToken', accessToken);
              await clearHistory(accessToken);
              setDetectionHistory([]);
            } else {
              console.error('Failed to refresh access token');
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        } else {
          console.error('Refresh token is missing');
        }
      } else {
        console.error('Error clearing detection history:', error);
      }
    }
  };

  const contextValue = {
    detectionHistory,
    fetchDetectionHistory,
    //addDetectionEntry,
    deleteDetectionEntry,
    clearDetectionHistory
  };

  return (
    <DetectionHistoryContext.Provider value={contextValue}>
      {children}
    </DetectionHistoryContext.Provider>
  );
};

// Custom Hook
export const useDetectionHistory = () => {
  const context = useContext(DetectionHistoryContext);
  if (context === undefined) {
    throw new Error('useDetectionHistory must be used within a DetectionHistoryProvider');
  }
  return context;
};