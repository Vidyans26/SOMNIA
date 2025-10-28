import { AnalysisResult, HeartRateData } from '../types';
import { getAHISeverity } from './formatters';

export const generateMockResults = (
  duration: number, 
  videoEnabled: boolean,
  wearableEnabled: boolean
): AnalysisResult => {
  const hours = duration / 3600;
  const snoringEvents = Math.floor(Math.random() * 30) + 20;
  const apneaEvents = Math.floor(Math.random() * 10) + 5;
  const ahi = hours > 0 ? apneaEvents / hours : 0;
  
  const severity = getAHISeverity(ahi);

  // Video metrics
  const videoMetrics = videoEnabled ? {
    sleepPositions: {
      back: Math.floor(Math.random() * 30) + 30,
      side: Math.floor(Math.random() * 40) + 30,
      stomach: Math.floor(Math.random() * 20) + 5,
    },
    movementCount: Math.floor(Math.random() * 50) + 20,
    restlessnessScore: Math.floor(Math.random() * 40) + 30,
  } : undefined;

  // Normalize position percentages
  if (videoMetrics?.sleepPositions) {
    const total = videoMetrics.sleepPositions.back + 
                  videoMetrics.sleepPositions.side + 
                  videoMetrics.sleepPositions.stomach;
    
    videoMetrics.sleepPositions.back = Math.round((videoMetrics.sleepPositions.back / total) * 100);
    videoMetrics.sleepPositions.side = Math.round((videoMetrics.sleepPositions.side / total) * 100);
    videoMetrics.sleepPositions.stomach = 100 - videoMetrics.sleepPositions.back - videoMetrics.sleepPositions.side;
  }

  // Wearable metrics
  const wearableMetrics = wearableEnabled ? {
    heartRate: {
      average: Math.floor(Math.random() * 15) + 60, // 60-75 bpm
      min: Math.floor(Math.random() * 10) + 50,     // 50-60 bpm
      max: Math.floor(Math.random() * 20) + 75,     // 75-95 bpm
      variability: Math.floor(Math.random() * 30) + 40, // 40-70 ms (HRV)
      irregularBeats: Math.floor(Math.random() * 5),
    } as HeartRateData,
    bloodOxygen: {
      average: Math.floor(Math.random() * 3) + 95,  // 95-98%
      min: Math.floor(Math.random() * 5) + 88,      // 88-93%
      desaturations: apneaEvents, // Correlate with apnea
    },
    temperature: {
      average: 36.5 + Math.random() * 0.5,           // 36.5-37°C
      min: 36.2 + Math.random() * 0.3,
      max: 36.8 + Math.random() * 0.5,
    },
  } : undefined;

  return {
    duration: hours,
    snoringEvents,
    snoringMinutes: (snoringEvents * 0.5).toFixed(1),
    snoringPercentage: duration > 0 ? ((snoringEvents * 30) / duration * 100).toFixed(1) : "0",
    apneaEvents,
    ahi: ahi.toFixed(1),
    severity,
    longestPause: (Math.random() * 20 + 10).toFixed(1),
    videoEnabled,
    wearableEnabled,
    ...videoMetrics,
    ...wearableMetrics,
    timestamp: new Date().toLocaleString(),
  };
};