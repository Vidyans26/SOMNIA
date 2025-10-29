import { AnalysisResult, MonitoringSettings } from '../types';
import { getAHISeverity } from '../utils/formatters';

export const apiService = {
  async analyze(
    durationSeconds: number,
    settings: MonitoringSettings,
    baseUrl: string,
    wearableData?: { spo2?: number[]; heartRate?: number[] }
  ): Promise<AnalysisResult> {
    const durationHours = Math.max(0.1, durationSeconds / 3600);
    
    // Generate realistic wearable data if enabled
    let spo2_data = null;
    let heart_rate_data = null;
    
    if (settings.wearableEnabled) {
      if (wearableData?.spo2) {
        spo2_data = wearableData.spo2;
      } else {
        // Generate realistic SpO2 readings (95-99%)
        const numReadings = Math.floor(durationSeconds / 30); // Every 30 seconds
        spo2_data = Array.from({ length: numReadings }, () => 
          95 + Math.floor(Math.random() * 5)
        );
      }
      
      if (wearableData?.heartRate) {
        heart_rate_data = wearableData.heartRate;
      } else {
        // Generate realistic heart rate (60-80 bpm during sleep)
        const numReadings = Math.floor(durationSeconds / 30);
        heart_rate_data = Array.from({ length: numReadings }, () => 
          60 + Math.floor(Math.random() * 21)
        );
      }
    }

    const body = {
      duration_hours: Number(durationHours.toFixed(2)),
      user_id: 'demo_user',
      recording_date: new Date().toISOString(),
      audio_file_id: null,
      video_file_id: null,
      spo2_data: spo2_data,
      heart_rate_data: heart_rate_data,
      wearable_data: null,
      environmental_data: null,
    };

    const res = await fetch(`${baseUrl}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer demo-token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Analyze failed (${res.status}): ${txt}`);
    }

    const data = await res.json();
    console.log('🤖 ML Analysis Result:', data);
    return mapAnalyzeToResult(data, settings, durationSeconds);
  },

  async demoAnalysis(
    settings: MonitoringSettings,
    baseUrl: string
  ): Promise<AnalysisResult> {
    const res = await fetch(`${baseUrl}/api/v1/demo-analysis`);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Demo analysis failed (${res.status}): ${txt}`);
    }
    const data = await res.json();
    return mapAnalyzeToResult(data, settings, 0);
  },
};

function mapAnalyzeToResult(api: any, settings: MonitoringSettings, durationSeconds: number): AnalysisResult {
  // API returns fields like: total_sleep_time (hours), apnea_events, sleep_efficiency, sleep_stages, etc.
  const totalHours = Number(api.total_sleep_time ?? 0) || 0;
  const apneaEvents = Number(api.apnea_events ?? 0) || 0;
  const ahi = totalHours > 0 ? apneaEvents / totalHours : 0;
  const efficiency = Number(api.sleep_efficiency ?? 0.85) || 0.85;
  const riskLevel = api.risk_assessment ?? 'low';

  // Extract sleep stages from API response
  const stages = api.sleep_stages ?? {};
  const wakeMin = Number(stages.wake ?? 0);
  const lightMin = Number(stages.light ?? 0);
  const deepMin = Number(stages.deep ?? 0);
  const remMin = Number(stages.rem ?? 0);

  const result: AnalysisResult = {
    duration: totalHours,
    timestamp: new Date().toLocaleString(),

    // Sleep stages from ML analysis
    sleepEfficiency: Math.round(efficiency * 100),
    wakeMinutes: wakeMin,
    lightSleepMinutes: lightMin,
    deepSleepMinutes: deepMin,
    remSleepMinutes: remMin,

    // Apnea analysis from ML model
    snoringEvents: 0,
    snoringMinutes: '0.0',
    snoringPercentage: '0',
    apneaEvents: apneaEvents,
    ahi: ahi.toFixed(1),
    severity: getAHISeverity(ahi),
    longestPause: '0.0',

    // Risk assessment from ML model
    riskLevel: riskLevel,

    // Disorders detected by ML
    disorders: api.disorders_detected ?? [],

    // Recommendations from ML analysis
    recommendations: api.recommendations ?? [],

    // Flags
    videoEnabled: settings.videoEnabled,
    wearableEnabled: settings.wearableEnabled,
  };

  return result;
}
