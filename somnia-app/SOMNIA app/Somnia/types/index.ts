export interface SleepPositions {
  back: number;
  side: number;
  stomach: number;
}

export interface HeartRateData {
  average: number;
  min: number;
  max: number;
  variability: number; // HRV
  irregularBeats: number;
}

export interface AnalysisResult {
  id?: string;
  duration: number;
  timestamp: string;
  
  // Audio metrics
  snoringEvents: number;
  snoringMinutes: string;
  snoringPercentage: string;
  apneaEvents: number;
  ahi: string;
  severity: string;
  longestPause: string;
  
  // Sleep quality metrics from ML models
  sleepEfficiency?: number; // 0-100%
  wakeMinutes?: number;
  lightSleepMinutes?: number;
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  
  // ML Risk assessment
  riskLevel?: string; // 'low' | 'moderate' | 'high'
  disorders?: string[]; // List of detected disorders
  recommendations?: string[]; // ML-generated recommendations
  
  // Video metrics
  videoEnabled: boolean;
  sleepPositions?: SleepPositions;
  movementCount?: number;
  restlessnessScore?: number;
  
  // Wearable metrics
  wearableEnabled: boolean;
  heartRate?: HeartRateData;
  bloodOxygen?: {
    average: number;
    min: number;
    desaturations: number; // Times SpO2 dropped below 90%
  };
  temperature?: {
    average: number;
    min: number;
    max: number;
  };
}

export interface MonitoringSettings {
  audioEnabled: boolean;
  videoEnabled: boolean;
  wearableEnabled: boolean;
  wearableConnected: boolean;
  wearableDeviceName?: string;
}

export enum SleepSeverity {
  Normal = "Normal",
  MildApnea = "Mild Sleep Apnea",
  ModerateApnea = "Moderate Sleep Apnea",
  SevereApnea = "Severe Sleep Apnea"
}