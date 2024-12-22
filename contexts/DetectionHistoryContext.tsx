import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';

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
  analysis_report: AnalysisReport; // Use AnalysisReport
}

interface AIContentDetectionResult {
  // Define the structure for AI content detection results if needed
  id: number;
  media_upload: number;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  fake_frames: number;
  analysis_report: AnalysisReport; // Use AnalysisReport
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
  detailedReport?: DetectionResult | AIContentDetectionResult;
  textContent?: string;
  frames?: string[];
  originalFrames?: string[]; // Add this field
}

interface DetectionHistoryContextType {
  detectionHistory: DetectionEntry[];
  addDetectionEntry: (entry: Omit<DetectionEntry, 'id' | 'userId' | 'date'>) => void;
  deleteDetectionEntry: (entryId: string) => void;
  clearDetectionHistory: () => void;
  getDetectionHistoryByType: (type: 'deepfake' | 'ai-content') => DetectionEntry[];
}

const DetectionHistoryContext = createContext<DetectionHistoryContextType | undefined>(undefined);

export const DetectionHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [detectionHistory, setDetectionHistory] = useState<DetectionEntry[]>([]);
  const { user } = useUser();

  // Load detection history from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem(`detectionHistory_${user.id}`);
      if (storedHistory) {
        try {
          setDetectionHistory(JSON.parse(storedHistory));
        } catch (error) {
          console.error('Error parsing detection history:', error);
        }
      }
    }
  }, [user]);

  // Save detection history to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `detectionHistory_${user.id}`, 
        JSON.stringify(detectionHistory)
      );
    }
  }, [detectionHistory, user]);

  // Function to check for duplicate entries
  const isDuplicateEntry = (entry: Omit<DetectionEntry, 'id' | 'userId' | 'date'>): boolean => {
    return detectionHistory.some(existingEntry => 
      existingEntry.imageUrl === entry.imageUrl &&
      existingEntry.confidence === entry.confidence &&
      existingEntry.isDeepfake === entry.isDeepfake
    );
  };

  // Add Detection Entry
  const addDetectionEntry = (
    entry: Omit<DetectionEntry, 'id' | 'userId' | 'date'>
  ) => {
    if (!user) return;
  
    if (isDuplicateEntry(entry)) {
      console.log('Duplicate entry detected, not adding to history.');
      return;
    }
  
    const newEntry: DetectionEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString(),
      detectionType: 'analysis_report' in (entry.detailedReport || {}) 
        ? 'deepfake' 
        : 'ai-content',
      originalFrames: entry.detailedReport?.analysis_report.frame_results.map(frame => frame.frame_path) // Add this line
    };
  
    setDetectionHistory(prev => [newEntry, ...prev]);
  };

  // Delete Detection Entry
  const deleteDetectionEntry = (entryId: string) => {
    setDetectionHistory(prev => 
      prev.filter(entry => entry.id !== entryId)
    );
  };

  // Clear Entire Detection History
  const clearDetectionHistory = () => {
    setDetectionHistory([]);
  };

  // Get Detection History by Type
  const getDetectionHistoryByType = (type: 'deepfake' | 'ai-content') => {
    return detectionHistory.filter(entry => entry.detectionType === type);
  };

  const contextValue = {
    detectionHistory,
    addDetectionEntry,
    deleteDetectionEntry,
    clearDetectionHistory,
    getDetectionHistoryByType
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