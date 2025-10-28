import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';

// Types
import { AnalysisResult, MonitoringSettings } from '../../types';

// Services
import { audioService } from '../../services/audioService';
import { videoService } from '../../services/videoService';
import { wearableService, WearableDevice } from '../../services/wearableService';
import { storageService } from '../../services/storageService';

// Utils
import { generateMockResults } from '../../utils/mockData';
import { formatTime, getSeverityColor } from '../../utils/formatters';

// Components
import { MetricCard } from '../../components/MetricCard';
import { PositionChart } from '../../components/PositionChart';
import { HeartRateChart } from '../../components/HeartRateChart';
import { SettingsPanel } from '../../components/SettingsPanel';
import { CameraPreview } from '../../components/CameraPreview';

// Constants
import { COLORS, SIZES, SPACING } from '../../constants/theme';

export default function TabOneScreen() {
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  
  // Recording state
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // UI state
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWearableModal, setShowWearableModal] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<MonitoringSettings>({
    audioEnabled: true,
    videoEnabled: false,
    wearableEnabled: false,
    wearableConnected: false,
  });
  
  // Permissions
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  
  // Wearable
  const [availableDevices, setAvailableDevices] = useState<WearableDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // Refs
  const cameraRef = useRef<CameraView>(null);

  // ===========================================
  // EFFECTS
  // ===========================================

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // ===========================================
  // DATA LOADING
  // ===========================================

  const loadInitialData = async () => {
    const savedHistory = await storageService.getHistory();
    setHistory(savedHistory);
    
    const savedSettings = await storageService.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
    
    const hasCamera = await videoService.requestPermission();
    setCameraPermission(hasCamera);
  };

  // ===========================================
  // RECORDING FUNCTIONS
  // ===========================================

  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Start audio
      const audioRec = await audioService.startRecording();
      if (!audioRec) {
        Alert.alert('Error', 'Failed to start audio recording');
        return;
      }
      setRecording(audioRec);

      // Start video if enabled
      if (settings.videoEnabled) {
        if (!cameraPermission) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in settings'
          );
          return;
        }
        await videoService.startRecording(cameraRef);
      }

      setIsRecording(true);
      setAnalysisResult(null);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (!recording) return;

    try {
      setIsRecording(false);
      
      // Stop audio
      const audioUri = await audioService.stopRecording(recording);
      setRecording(null);
      
      // Stop video if enabled
      let videoUri = null;
      if (settings.videoEnabled) {
        videoUri = await videoService.stopRecording(cameraRef);
      }
      
      console.log('Audio URI:', audioUri);
      if (videoUri) console.log('Video URI:', videoUri);
      
      // Show analyzing state
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      // Animate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 8;
        });
      }, 250);
      
      // Simulate analysis (or call real ML API here)
      const analysisTime = settings.videoEnabled || settings.wearableEnabled ? 3500 : 2000;
      
      setTimeout(async () => {
        // TODO: Replace with real ML API call
        const results = generateMockResults(
          recordingDuration,
          settings.videoEnabled,
          settings.wearableEnabled
        );
        
        setAnalysisResult(results);
        await storageService.saveResult(results);
        
        // Reload history
        const updatedHistory = await storageService.getHistory();
        setHistory(updatedHistory);
        
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, analysisTime);
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Could not complete analysis');
      setIsAnalyzing(false);
    }
  };

  // ===========================================
  // SETTINGS FUNCTIONS
  // ===========================================

  const handleVideoToggle = async (value: boolean) => {
    if (value && !cameraPermission) {
      const granted = await videoService.requestPermission();
      setCameraPermission(granted);
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Camera access is required for video monitoring'
        );
        return;
      }
    }
    
    const newSettings = { ...settings, videoEnabled: value };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleWearableToggle = async (value: boolean) => {
    const newSettings = { ...settings, wearableEnabled: value };
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (value && !settings.wearableConnected) {
      setShowWearableModal(true);
    }
  };

  const handleConnectWearable = () => {
    setShowWearableModal(true);
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    const devices = await wearableService.scanForDevices();
    setAvailableDevices(devices);
    setIsScanning(false);
  };

  const connectToDevice = async (device: WearableDevice) => {
    const connected = await wearableService.connectDevice(device.id);
    if (connected) {
      const newSettings = {
        ...settings,
        wearableConnected: true,
        wearableDeviceName: device.name,
      };
      setSettings(newSettings);
      await storageService.saveSettings(newSettings);
      setShowWearableModal(false);
      
      Alert.alert('Success', `Connected to ${device.name}`);
    } else {
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  // ===========================================
  // RENDER FUNCTIONS
  // ===========================================

  const renderStatusContainer = () => {
    if (isAnalyzing) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.analyzingText}>
            🧠 {getAnalyzingText()}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${analysisProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{analysisProgress}%</Text>
          <Text style={styles.hint}>
            {settings.videoEnabled || settings.wearableEnabled
              ? 'Processing multimodal data...'
              : 'Processing audio patterns...'}
          </Text>
        </View>
      );
    }

    if (isRecording) {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.statusText}>Recording in Progress</Text>
          <Text style={styles.timer}>{formatTime(recordingDuration)}</Text>
          <Text style={styles.hint}>{getRecordingModeText()}</Text>
        </View>
      );
    }

    if (analysisResult) {
      return (
        <View style={styles.analysisCompleteContainer}>
          <Text style={styles.statusText}>✅ Analysis Complete</Text>
          <Text style={styles.hint}>Scroll down to view results</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Ready to Monitor Sleep</Text>
        <Text style={styles.instruction}>
          📱 Place phone on nightstand{'\n'}
          🔌 Keep phone plugged in{'\n'}
          🔇 Enable Do Not Disturb{'\n'}
          {settings.videoEnabled && '📹 Camera will face the bed\n'}
          😴 Sleep well!
        </Text>
      </View>
    );
  };

  const getAnalyzingText = (): string => {
    const modes = [];
    if (settings.audioEnabled) modes.push('Audio');
    if (settings.videoEnabled) modes.push('Video');
    if (settings.wearableEnabled) modes.push('Wearable');
    return `Analyzing ${modes.join(' + ')}...`;
  };

  const getRecordingModeText = (): string => {
    const modes = [];
    if (settings.audioEnabled) modes.push('🎤 Audio');
    if (settings.videoEnabled) modes.push('📹 Video');
    if (settings.wearableEnabled) modes.push('⌚ Wearable');
    return modes.join(' + ');
  };

  const renderMultimodalBadge = () => {
    const activeModes = [
      settings.audioEnabled && 'Audio',
      settings.videoEnabled && 'Video',
      settings.wearableEnabled && 'Wearable',
    ].filter(Boolean);

    if (activeModes.length <= 1) return null;

    return (
      <View style={styles.multimodalBadge}>
        <Text style={styles.multimodalText}>
          🎯 Multimodal Analysis ({activeModes.join(' + ')})
        </Text>
      </View>
    );
  };

  // ===========================================
  // MAIN RENDER
  // ===========================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>🌙 SOMNIA</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {
              setShowSettings(!showSettings);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>AI-Powered Sleep Analysis</Text>
      </View>
    

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onVideoToggle={handleVideoToggle}
          onWearableToggle={handleWearableToggle}
          onConnectWearable={handleConnectWearable}
          onRequestVideoPermission={async () => {
            const granted = await videoService.requestPermission();
            setCameraPermission(granted);
          }}
          cameraPermission={cameraPermission}
        />
      )}

      {/* Camera Preview */}
      {settings.videoEnabled && cameraPermission && (
        <CameraPreview 
          cameraRef={cameraRef} 
          isRecording={isRecording} 
          style={!isRecording ? { width: 0, height: 0, opacity: 0 } : undefined}
        />
      )}

      {/* Main Content */}
      {showHistory ? (
        <HistoryView
          history={history}
          onSelectResult={(result) => {
            setAnalysisResult(result);
            setShowHistory(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onClose={() => {
            setShowHistory(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        />
      ) : (
        <>
          {/* Status Container */}
          {renderStatusContainer()}

          {/* Action Buttons */}
          {!isAnalyzing && !analysisResult && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, isRecording ? styles.stopButton : styles.startButton]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isRecording ? '⏹️ Stop & Analyze' : '▶️ Start Monitoring'}
                </Text>
              </TouchableOpacity>

              {history.length > 0 && !isRecording && (
                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={() => {
                    setShowHistory(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.historyButtonText}>
                    📊 View History ({history.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Results Section */}
          {analysisResult && !isAnalyzing && (
            <ResultsView
              result={analysisResult}
              onNewRecording={() => {
                setAnalysisResult(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onViewHistory={() => {
                setShowHistory(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          )}
        </>
      )}

      {/* Wearable Connection Modal */}
      <WearableModal
        visible={showWearableModal}
        devices={availableDevices}
        isScanning={isScanning}
        onScan={scanForDevices}
        onConnect={connectToDevice}
        onClose={() => setShowWearableModal(false)}
      />
    </View>
  );
}

// ===========================================
// SUB-COMPONENTS
// ===========================================

const HistoryView: React.FC<{
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClose: () => void;
}> = ({ history, onSelectResult, onClose }) => (
  <ScrollView style={styles.historyContainer}>
    <Text style={styles.historyTitle}>Previous Sleep Sessions</Text>

    {history.length === 0 ? (
      <Text style={styles.emptyText}>No previous recordings yet</Text>
    ) : (
      history.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.historyItem}
          onPress={() => onSelectResult(item)}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>{item.timestamp}</Text>
            <View style={styles.historyBadges}>
              {item.videoEnabled && (
                <View style={[styles.modeBadge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.modeBadgeText}>📹</Text>
                </View>
              )}
              {item.wearableEnabled && (
                <View style={[styles.modeBadge, { backgroundColor: COLORS.chartHeartRate }]}>
                  <Text style={styles.modeBadgeText}>⌚</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.historyDetail}>
            Duration: {item.duration.toFixed(1)}h | AHI: {item.ahi}
          </Text>
          <Text style={[styles.historySeverity, { color: getSeverityColor(item.severity) }]}>
            {item.severity}
          </Text>
        </TouchableOpacity>
      ))
    )}

    <TouchableOpacity style={styles.closeHistoryButton} onPress={onClose}>
      <Text style={styles.closeHistoryText}>Close History</Text>
    </TouchableOpacity>
  </ScrollView>
);

const ResultsView: React.FC<{
  result: AnalysisResult;
  onNewRecording: () => void;
  onViewHistory: () => void;
}> = ({ result, onNewRecording, onViewHistory }) => (
<ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
<Text style={styles.resultsTitle}>📊 Sleep Analysis Results</Text>
{/* Multimodal Badge */}
{(result.videoEnabled || result.wearableEnabled) && (
  <View style={styles.multimodalBadge}>
    <Text style={styles.multimodalText}>
      🎯 Multimodal Analysis 
      {result.videoEnabled && result.wearableEnabled ? ' (Audio + Video + Wearable)' :
       result.videoEnabled ? ' (Audio + Video)' :
       ' (Audio + Wearable)'}
    </Text>
  </View>
)}

{/* Duration */}
<MetricCard
  emoji="⏱️"
  label="Recording Duration"
  value={`${result.duration.toFixed(2)} hours`}
  subtext={result.timestamp}
/>

{/* Audio Section */}
<Text style={styles.sectionTitle}>🎤 Audio Analysis</Text>

<MetricCard
  emoji="🔊"
  label="Snoring Events"
  value={result.snoringEvents}
  subtext={`${result.snoringMinutes} minutes (${result.snoringPercentage}%)`}
/>

<View style={styles.metricCard}>
  <Text style={styles.metricLabel}>😴 Apnea Events</Text>
  <Text style={styles.metricValue}>{result.apneaEvents}</Text>
  <Text style={styles.metricSubtext}>AHI Score: {result.ahi} events/hour</Text>
  <Text style={styles.metricSubtext}>Longest pause: {result.longestPause}s</Text>
</View>

{/* Video Section */}
{result.videoEnabled && result.sleepPositions && (
  <>
    <Text style={styles.sectionTitle}>📹 Video Analysis</Text>
    <PositionChart positions={result.sleepPositions} />

    <MetricCard
      emoji="🏃"
      label="Movement Activity"
      value={result.movementCount || 0}
      subtext="movements detected"
    />

    {result.restlessnessScore && (
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Restlessness Score</Text>
        <View style={styles.restlessnessBar}>
          <View
            style={[
              styles.restlessnessBarFill,
              { width: `${result.restlessnessScore}%` },
            ]}
          />
        </View>
        <Text style={styles.restlessnessText}>
          {result.restlessnessScore}/100 
          {result.restlessnessScore > 70 ? ' (High)' : 
           result.restlessnessScore > 40 ? ' (Moderate)' : ' (Low)'}
        </Text>
      </View>
    )}
  </>
)}

{/* Wearable Section */}
{result.wearableEnabled && result.heartRate && (
  <>
    <Text style={styles.sectionTitle}>⌚ Wearable Data</Text>
    <HeartRateChart heartRate={result.heartRate} bloodOxygen={result.bloodOxygen} />

    {result.temperature && (
      <MetricCard
        emoji="🌡️"
        label="Body Temperature"
        value={`${result.temperature.average.toFixed(1)}°C`}
        subtext={`Range: ${result.temperature.min.toFixed(1)}°C - ${result.temperature.max.toFixed(1)}°C`}
      />
    )}
  </>
)}

{/* Clinical Assessment */}
<Text style={styles.sectionTitle}>⚠️ Clinical Assessment</Text>

<View
  style={[
    styles.metricCard,
    styles.severityCard,
    { borderColor: getSeverityColor(result.severity) },
  ]}
>
  <Text style={styles.metricLabel}>Overall Assessment</Text>
  <Text style={[styles.severityText, { color: getSeverityColor(result.severity) }]}>
    {result.severity}
  </Text>

  {parseFloat(result.ahi) >= 5 && (
    <View style={styles.recommendationBox}>
      <Text style={styles.recommendation}>
        💡 <Text style={styles.recommendationBold}>Recommendation:</Text> Consult a sleep
        specialist for proper diagnosis and treatment options.
      </Text>

      {result.sleepPositions && result.sleepPositions.back > 50 && (
        <Text style={[styles.recommendation, { marginTop: SPACING.sm }]}>
          💡 <Text style={styles.recommendationBold}>Positional Therapy:</Text> Your apnea
          events correlate with back sleeping. Try sleeping on your side.
        </Text>
      )}

      {result.bloodOxygen && result.bloodOxygen.desaturations > 5 && (
        <Text style={[styles.recommendation, { marginTop: SPACING.sm }]}>
          💡 <Text style={styles.recommendationBold}>Oxygen Levels:</Text> Multiple oxygen
          desaturations detected. This requires medical attention.
        </Text>
      )}
    </View>
  )}

  {parseFloat(result.ahi) < 5 && (
    <View style={[styles.recommendationBox, { backgroundColor: 'rgba(0, 255, 136, 0.1)' }]}>
      <Text style={[styles.recommendation, { color: COLORS.success }]}>
        ✅ Your breathing patterns during sleep appear normal. Continue healthy sleep habits!
      </Text>
    </View>
  )}
</View>

{/* Understanding Results */}
<View style={styles.infoCard}>
  <Text style={styles.infoTitle}>📖 Understanding Your Results</Text>
  <Text style={styles.infoText}>
    • <Text style={styles.infoBold}>AHI (Apnea-Hypopnea Index)</Text>: Breathing pauses per
    hour{'\n'}
    • <Text style={styles.infoBold}>Normal</Text>: AHI {'<'} 5{'\n'}
    • <Text style={styles.infoBold}>Mild</Text>: AHI 5-15{'\n'}
    • <Text style={styles.infoBold}>Moderate</Text>: AHI 15-30{'\n'}
    • <Text style={styles.infoBold}>Severe</Text>: AHI {'>'} 30
    {result.videoEnabled && (
      <>
        {'\n\n'}• <Text style={styles.infoBold}>Sleep Position</Text>: Back sleeping worsens
        apnea{'\n'}• <Text style={styles.infoBold}>Movement</Text>: Higher restlessness =
        poor sleep quality
      </>
    )}
    {result.wearableEnabled && (
      <>
        {'\n\n'}• <Text style={styles.infoBold}>HRV (Heart Rate Variability)</Text>: Higher
        is better{'\n'}• <Text style={styles.infoBold}>SpO2</Text>: Normal is 95-100%,
        {'<'}90% is concerning
      </>
    )}
  </Text>
</View>

{/* Action Buttons */}
<TouchableOpacity style={styles.newRecordingButton} onPress={onNewRecording} activeOpacity={0.8}>
  <Text style={styles.newRecordingButtonText}>🔄 New Recording</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.historyButtonAlt} onPress={onViewHistory} activeOpacity={0.8}>
  <Text style={styles.historyButtonTextAlt}>📊 View All History</Text>
</TouchableOpacity>

{/* Disclaimer */}
<View style={styles.disclaimer}>
  <Text style={styles.disclaimerText}>
    ⚠️ Disclaimer: This is a screening tool, not a medical diagnosis. Consult a healthcare
    professional for proper evaluation.
  </Text>
</View>
  </ScrollView>
);
const WearableModal: React.FC<{
visible: boolean;
devices: WearableDevice[];
isScanning: boolean;
onScan: () => void;
onConnect: (device: WearableDevice) => void;
onClose: () => void;
}> = ({ visible, devices, isScanning, onScan, onConnect, onClose }) => (
<Modal visible={visible} animationType="slide" transparent={true}>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>⌚ Connect Wearable Device</Text>
<TouchableOpacity onPress={onClose}>
<Text style={styles.modalClose}>✕</Text>
</TouchableOpacity>
</View>
    <Text style={styles.modalDescription}>
      Connect your smartwatch or fitness tracker to monitor heart rate, blood oxygen, and body
      temperature during sleep.
    </Text>

    {devices.length === 0 ? (
      <View style={styles.emptyDevices}>
        <Text style={styles.emptyDevicesText}>
          {isScanning ? '🔍 Scanning for devices...' : 'No devices found'}
        </Text>
      </View>
    ) : (
      <ScrollView style={styles.deviceList}>
        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={styles.deviceItem}
            onPress={() => onConnect(device)}
          >
            <Text style={styles.deviceName}>
              {device.type === 'apple_watch' ? '⌚' :
               device.type === 'samsung_watch' ? '⌚' :
               device.type === 'fitbit' ? '📱' :
               device.type === 'mi_band' ? '⌚' : '📱'}{' '}
              {device.name}
            </Text>
            <Text style={styles.deviceConnect}>Connect →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}

    <TouchableOpacity
      style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
      onPress={onScan}
      disabled={isScanning}
    >
      <Text style={styles.scanButtonText}>
        {isScanning ? '🔍 Scanning...' : '🔄 Scan for Devices'}
      </Text>
    </TouchableOpacity>

    <View style={styles.modalInfo}>
      <Text style={styles.modalInfoText}>
        💡 <Text style={styles.modalInfoBold}>Supported Devices:</Text>
        {'\n'}• Apple Watch (via HealthKit)
        {'\n'}• Samsung Galaxy Watch (via Health Connect)
        {'\n'}• Fitbit (via Fitbit API)
        {'\n'}• Mi Band / Xiaomi (via Mi Fit)
        {'\n'}• Most Bluetooth fitness trackers
      </Text>
    </View>
  </View>
</View>
  </Modal>
);
// ===========================================
// STYLES
// ===========================================
// ===========================================
// STYLES - COZY & RELAXING THEME
// ===========================================
// ===========================================
// STYLES - ULTRA COZY DUAL-MODE DESIGN
// ===========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  
  // ========== HEADER STYLES ==========
  header: {
    paddingVertical: SPACING.xl,
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    color: '#d4c5f9',
    fontWeight: '300',
    letterSpacing: 6,
  },
  settingsButton: {
    padding: 12,
    backgroundColor: 'rgba(212, 197, 249, 0.08)',
    borderRadius: 24,
  },
  settingsIcon: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 11,
    color: '#9b8fc4',
    marginTop: 6,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ========== STATUS CONTAINER (NIGHT MODE) ==========
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  recordingDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff9ec8',
    marginBottom: 40,
    shadowColor: '#ff9ec8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 15,
  },
  statusText: {
    fontSize: 24,
    color: '#d4c5f9',
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 72,
    color: '#d4c5f9',
    fontWeight: '200',
    marginTop: 40,
    letterSpacing: 6,
    textShadowColor: 'rgba(212, 197, 249, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  instruction: {
    fontSize: 16,
    color: '#9b8fc4',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 32,
    fontWeight: '300',
  },
  hint: {
    fontSize: 13,
    color: '#6b5f8a',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '300',
  },

  // ========== ANALYZING STATE ==========
  analyzingText: {
    fontSize: 22,
    color: '#d4c5f9',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(212, 197, 249, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#b8a4f5',
    borderRadius: 10,
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  progressText: {
    fontSize: 36,
    color: '#b8a4f5',
    marginTop: 20,
    fontWeight: '200',
    letterSpacing: 3,
  },

  // ========== BUTTONS (NIGHT MODE) ==========
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 22,
    borderRadius: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: SPACING.md,
  },
  startButton: {
    backgroundColor: '#b8a4f5',
  },
  stopButton: {
    backgroundColor: '#ff9ec8',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '400',
    letterSpacing: 2,
  },
  historyButton: {
    backgroundColor: 'rgba(212, 197, 249, 0.08)',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 197, 249, 0.15)',
  },
  historyButtonText: {
    color: '#b8a4f5',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 1,
  },

  // ========== MULTIMODAL BADGE ==========
  multimodalBadge: {
    backgroundColor: 'rgba(184, 164, 245, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(184, 164, 245, 0.2)',
  },
  multimodalText: {
    color: '#d4c5f9',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
  },

  // ========== RESULTS (MORNING MODE) ==========
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#f8f5ff',
  },
  resultsTitle: {
    fontSize: 26,
    color: '#4a3f6b',
    fontWeight: '300',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#5a4d7d',
    fontWeight: '400',
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 1,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 164, 245, 0.15)',
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  metricLabel: {
    fontSize: 14,
    color: '#8b7fa8',
    marginBottom: 10,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 48,
    color: '#4a3f6b',
    fontWeight: '200',
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 13,
    color: '#9b8fc4',
    marginTop: 6,
    fontWeight: '300',
  },

  // ========== RESTLESSNESS BAR ==========
  restlessnessBar: {
    height: 12,
    backgroundColor: 'rgba(184, 164, 245, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 12,
  },
  restlessnessBarFill: {
    height: '100%',
    backgroundColor: '#ffc4a3',
    borderRadius: 10,
  },
  restlessnessText: {
    fontSize: 13,
    color: '#ffc4a3',
    fontWeight: '500',
    textAlign: 'right',
  },

  // ========== SEVERITY CARD ==========
  severityCard: {
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  severityText: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: 12,
    marginBottom: 16,
  },
  recommendationBox: {
    backgroundColor: 'rgba(255, 196, 163, 0.15)',
    padding: 18,
    borderRadius: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc4a3',
  },
  recommendation: {
    fontSize: 14,
    color: '#8b6f4f',
    lineHeight: 24,
    fontWeight: '300',
  },
  recommendationBold: {
    fontWeight: '500',
  },

  // ========== INFO CARD ==========
  infoCard: {
    backgroundColor: 'rgba(248, 245, 255, 0.5)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 164, 245, 0.2)',
  },
  infoTitle: {
    fontSize: 17,
    color: '#6b5a8e',
    fontWeight: '500',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 13,
    color: '#8b7fa8',
    lineHeight: 26,
    fontWeight: '300',
  },
  infoBold: {
    fontWeight: '500',
    color: '#5a4d7d',
  },

  // ========== ACTION BUTTONS (MORNING MODE) ==========
  newRecordingButton: {
    backgroundColor: '#b8a4f5',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  newRecordingButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 1.5,
  },
  historyButtonAlt: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 50,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(184, 164, 245, 0.3)',
  },
  historyButtonTextAlt: {
    color: '#8b7fa8',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 1,
  },

  // ========== DISCLAIMER ==========
  disclaimer: {
    backgroundColor: 'rgba(248, 245, 255, 0.6)',
    padding: 18,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 50,
    borderLeftWidth: 3,
    borderLeftColor: '#9b8fc4',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8b7fa8',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '300',
  },

  // ========== HISTORY ==========
  historyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: '#f8f5ff',
  },
  historyTitle: {
    fontSize: 24,
    color: '#4a3f6b',
    fontWeight: '300',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    padding: 22,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(184, 164, 245, 0.15)',
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    color: '#9b8fc4',
    fontSize: 12,
    fontWeight: '300',
  },
  historyBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  modeBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  modeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  historyDetail: {
    color: '#5a4d7d',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '300',
  },
  historySeverity: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
  },
  emptyText: {
    color: '#9b8fc4',
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
    fontWeight: '300',
  },
  closeHistoryButton: {
    backgroundColor: '#b8a4f5',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  closeHistoryText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 1.5,
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 39, 0.92)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1f3a',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    color: '#d4c5f9',
    fontWeight: '400',
    letterSpacing: 1,
  },
  modalClose: {
    fontSize: 32,
    color: '#9b8fc4',
    fontWeight: '200',
  },
  modalDescription: {
    fontSize: 14,
    color: '#9b8fc4',
    lineHeight: 26,
    marginBottom: 30,
    fontWeight: '300',
  },
  emptyDevices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyDevicesText: {
    fontSize: 16,
    color: '#8b7fa8',
    fontWeight: '300',
  },
  deviceList: {
    maxHeight: 250,
    marginBottom: 30,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 197, 249, 0.08)',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 197, 249, 0.15)',
  },
  deviceName: {
    fontSize: 15,
    color: '#d4c5f9',
    fontWeight: '400',
  },
  deviceConnect: {
    fontSize: 14,
    color: '#b8a4f5',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  scanButton: {
    backgroundColor: '#b8a4f5',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#b8a4f5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 1,
  },
  modalInfo: {
    backgroundColor: 'rgba(10, 14, 39, 0.4)',
    padding: 18,
    borderRadius: 20,
  },
  modalInfoText: {
    fontSize: 12,
    color: '#9b8fc4',
    lineHeight: 24,
    fontWeight: '300',
  },
  modalInfoBold: {
    fontWeight: '500',
    color: '#d4c5f9',
  },
  // ========== ANALYSIS COMPLETE CONTAINER (EASY FIX) ==========
  analysisCompleteContainer: {
    // This is the same as statusContainer, but WITHOUT 'flex: 1'
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: 60, // Added padding so it has some space
    paddingBottom: 40,
  },
});

