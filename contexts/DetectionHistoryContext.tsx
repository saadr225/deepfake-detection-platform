// contexts/DetectionHistoryContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';
import { DetectionResult } from '../services/detectionService'; // Deepfake Detection Result
import { AIContentDetectionResult } from '../services/detectionService'; // AI Content Detection Result

export interface DetectionEntry {
  id: string;
  userId: string;
  imageUrl: string;
  confidence: number;
  isDeepfake: boolean;
  date: string;
  detectionType: 'deepfake' | 'ai-content';
  detailedReport?: DetectionResult | AIContentDetectionResult;
  textContent?: string;
  frames?: string[]; // Add this field
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

  // Add Detection Entry
  const addDetectionEntry = (
    entry: Omit<DetectionEntry, 'id' | 'userId' | 'date'>
  ) => {
    if (!user) return;

    const newEntry: DetectionEntry = {
      ...entry,
      id: Date.now().toString(), // Generate unique ID
      userId: user.id,
      date: new Date().toISOString(),
      // Determine detection type based on the detailed report
      detectionType: 'errorLevelAnalysis' in (entry.detailedReport || {}) 
        ? 'deepfake' 
        : 'ai-content'
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