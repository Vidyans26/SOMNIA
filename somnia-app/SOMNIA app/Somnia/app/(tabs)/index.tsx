import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Types
interface AnalysisResult {
  id?: string;
  duration: number;
  snoringEvents: number;
  snoringMinutes: string;
  snoringPercentage: string;
  apneaEvents: number;
  ahi: string;
  severity: string;
  longestPause: string;
  timestamp: string;
}

// Mock data generator
const generateMockResults = (duration: number): AnalysisResult => {
  const hours = duration / 3600;
  const snoringEvents = Math.floor(Math.random() * 30) + 20;
  const apneaEvents = Math.floor(Math.random() * 10) + 5;
  const ahi = hours > 0 ? apneaEvents / hours : 0;
  
  let severity = "Normal";
  if (ahi >= 30) severity = "Severe Sleep Apnea";
  else if (ahi >= 15) severity = "Moderate Sleep Apnea";
  else if (ahi >= 5) severity = "Mild Sleep Apnea";

  return {
    duration: hours,
    snoringEvents,
    snoringMinutes: (snoringEvents * 0.5).toFixed(1),
    snoringPercentage: duration > 0 ? ((snoringEvents * 30) / duration * 100).toFixed(1) : "0",
    apneaEvents,
    ahi: ahi.toFixed(1),
    severity,
    longestPause: (Math.random() * 20 + 10).toFixed(1),
    timestamp: new Date().toLocaleString(),
  };
};

export default function TabOneScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Animation values
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Pulse animation effect
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isRecording]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('sleep_history');
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveResult = async (result: AnalysisResult) => {
    try {
      const newResult: AnalysisResult = {
        id: Date.now().toString(),
        ...result,
      };
      
      const updatedHistory = [newResult, ...history].slice(0, 30);
      await AsyncStorage.setItem('sleep_history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to record sleep audio'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
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
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      setTimeout(async () => {
        const results = generateMockResults(recordingDuration);
        setAnalysisResult(results);
        await saveResult(results);
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Could not complete analysis');
      setIsAnalyzing(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getSeverityColors = (severity: string) => {
    if (severity.includes('Normal')) return ['#10b981', '#14b8a6'];
    if (severity.includes('Mild')) return ['#f59e0b', '#f97316'];
    if (severity.includes('Moderate')) return ['#f97316', '#ef4444'];
    return ['#dc2626', '#991b1b'];
  };

  const GradientCard = ({ children, colors }: { children: React.ReactNode, colors: string[] }) => (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCard}
    >
      {children}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <View style={styles.backgroundGradient}>
        <LinearGradient
          colors={['#0f172a', '#1e3a8a', '#0f172a']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Header */}
      <LinearGradient
        colors={['rgba(30, 58, 138, 0.3)', 'rgba(15, 23, 42, 0.3)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.moonIcon}>
              <Text style={styles.moonEmoji}>🌙</Text>
              <View style={styles.pingDot} />
            </View>
            <View>
              <Text style={styles.logo}>SOMNIA</Text>
              <Text style={styles.subtitle}>AI-Powered Sleep Analysis</Text>
            </View>
          </View>
          
          {!showHistory && history.length > 0 && !analysisResult && !isRecording && (
            <TouchableOpacity 
              style={styles.historyHeaderButton}
              onPress={() => {
                setShowHistory(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.historyHeaderText}>📊 {history.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Main Content */}
      {showHistory ? (
        /* History View */
        <ScrollView style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Sleep History</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowHistory(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No previous recordings yet</Text>
          ) : (
            history.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.historyItemCard}
                onPress={() => {
                  setAnalysisResult(item);
                  setShowHistory(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)']}
                  style={styles.historyItemGradient}
                >
                  <Text style={styles.historyDate}>🕐 {item.timestamp}</Text>
                  <View style={styles.historyMetrics}>
                    <View style={styles.historyMetric}>
                      <Text style={styles.historyMetricLabel}>Duration</Text>
                      <Text style={styles.historyMetricValue}>{item.duration.toFixed(1)}h</Text>
                    </View>
                    <View style={styles.historyMetric}>
                      <Text style={styles.historyMetricLabel}>AHI Score</Text>
                      <Text style={styles.historyMetricValue}>{item.ahi}</Text>
                    </View>
                  </View>
                  <View style={[styles.severityBadge, {
                    backgroundColor: item.severity.includes('Normal') ? 'rgba(16, 185, 129, 0.2)' :
                                   item.severity.includes('Mild') ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(239, 68, 68, 0.2)'
                  }]}>
                    <Text style={[styles.severityBadgeText, {
                      color: item.severity.includes('Normal') ? '#10b981' :
                             item.severity.includes('Mild') ? '#f59e0b' : '#ef4444'
                    }]}>{item.severity}</Text>
                  </View>
                  <Text style={styles.arrowRight}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <>
          {/* Status Container */}
          <Animated.View style={[styles.statusContainer, { opacity: fadeAnim }]}>
            {isAnalyzing ? (
              <View style={styles.centerContent}>
                <View style={styles.analyzingIcon}>
                  <Text style={styles.analyzingEmoji}>🧠</Text>
                </View>
                <Text style={styles.analyzingTitle}>Analyzing Sleep Data</Text>
                <Text style={styles.analyzingSubtitle}>Processing audio patterns with AI</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={['#3b82f6', '#06b6d4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${analysisProgress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{analysisProgress}%</Text>
                </View>
              </View>
            ) : isRecording ? (
              <View style={styles.centerContent}>
                <Animated.View style={[styles.recordingPulse, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.recordingDot}
                  >
                    <Text style={styles.recordingIcon}>⏺</Text>
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.recordingTitle}>Recording in Progress</Text>
                <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
                <Text style={styles.recordingHint}>💨 Monitoring breathing patterns</Text>
              </View>
            ) : analysisResult ? (
              <View style={styles.centerContent}>
                <View style={styles.completeIcon}>
                  <Text style={styles.completeEmoji}>⚡</Text>
                </View>
                <Text style={styles.completeTitle}>Analysis Complete</Text>
                <Text style={styles.completeSubtitle}>Scroll down to view results</Text>
              </View>
            ) : (
              <View style={styles.centerContent}>
                <View style={styles.readyIcon}>
                  <Text style={styles.readyEmoji}>🌙</Text>
                </View>
                <Text style={styles.readyTitle}>Ready to Monitor</Text>
                <Text style={styles.readySubtitle}>
                  Place your phone on the nightstand{'\n'}and start monitoring your sleep
                </Text>
                
                <View style={styles.instructionsGrid}>
                  {[
                    { icon: '📱', text: 'On nightstand' },
                    { icon: '🔌', text: 'Keep plugged' },
                    { icon: '🔇', text: 'Enable DND' },
                    { icon: '😴', text: 'Sleep well!' }
                  ].map((item, idx) => (
                    <View key={idx} style={styles.instructionCard}>
                      <Text style={styles.instructionIcon}>{item.icon}</Text>
                      <Text style={styles.instructionText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Action Button */}
          {!isAnalyzing && !analysisResult && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.mainButton}
                onPress={handlePress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isRecording ? ['#ef4444', '#dc2626'] : ['#3b82f6', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.mainButtonGradient}
                >
                  <Text style={styles.mainButtonText}>
                    {isRecording ? '⏹ Stop & Analyze' : '▶️ Start Monitoring'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Results Section */}
          {analysisResult && !isAnalyzing && (
            <ScrollView 
              style={styles.resultsContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.resultsTitle}>📊 Sleep Analysis Results</Text>
              
              {/* Key Metrics */}
              <View style={styles.metricsGrid}>
                <GradientCard colors={['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.1)']}>
                  <Text style={styles.metricIcon}>⏱️</Text>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricValue}>{analysisResult.duration.toFixed(1)}<Text style={styles.metricUnit}>h</Text></Text>
                  <Text style={styles.metricSubtext}>{analysisResult.timestamp}</Text>
                </GradientCard>

                <GradientCard colors={['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.1)']}>
                  <Text style={styles.metricIcon}>🔊</Text>
                  <Text style={styles.metricLabel}>Snoring</Text>
                  <Text style={styles.metricValue}>{analysisResult.snoringEvents}</Text>
                  <Text style={styles.metricSubtext}>{analysisResult.snoringMinutes}min ({analysisResult.snoringPercentage}%)</Text>
                </GradientCard>

                <GradientCard colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)']}>
                  <Text style={styles.metricIcon}>💤</Text>
                  <Text style={styles.metricLabel}>Apnea Events</Text>
                  <Text style={styles.metricValue}>{analysisResult.apneaEvents}</Text>
                  <Text style={styles.metricSubtext}>Longest: {analysisResult.longestPause}s</Text>
                </GradientCard>
              </View>

              {/* AHI Score Card */}
              <LinearGradient
                colors={getSeverityColors(analysisResult.severity).map(c => c + '20')}
                style={styles.ahiCard}
              >
                <View style={styles.ahiHeader}>
                  <View>
                    <Text style={styles.ahiLabel}>📈 AHI Score</Text>
                    <Text style={styles.ahiValue}>{analysisResult.ahi}</Text>
                    <Text style={styles.ahiUnit}>events per hour</Text>
                  </View>
                  <View style={[styles.severityPill, {
                    backgroundColor: getSeverityColors(analysisResult.severity)[0]
                  }]}>
                    <Text style={styles.severityPillText}>{analysisResult.severity}</Text>
                  </View>
                </View>

                <View style={styles.recommendationCard}>
                  {parseFloat(analysisResult.ahi) >= 5 ? (
                    <Text style={styles.recommendationText}>
                      💡 <Text style={styles.recommendationBold}>Recommendation:</Text> Consider consulting a sleep specialist for proper diagnosis and treatment.
                    </Text>
                  ) : (
                    <Text style={[styles.recommendationText, { color: '#10b981' }]}>
                      ✅ <Text style={styles.recommendationBold}>Great News:</Text> Your breathing patterns appear normal. Keep up healthy sleep habits!
                    </Text>
                  )}
                </View>
              </LinearGradient>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>🧠 Understanding Your Results</Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoBold}>AHI (Apnea-Hypopnea Index):</Text> Number of breathing pauses per hour
                </Text>
                <View style={styles.infoGrid}>
                  <View style={[styles.infoItem, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Text style={[styles.infoItemTitle, { color: '#10b981' }]}>Normal</Text>
                    <Text style={styles.infoItemText}>AHI {'<'} 5</Text>
                  </View>
                  <View style={[styles.infoItem, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Text style={[styles.infoItemTitle, { color: '#f59e0b' }]}>Mild</Text>
                    <Text style={styles.infoItemText}>AHI 5-15</Text>
                  </View>
                  <View style={[styles.infoItem, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                    <Text style={[styles.infoItemTitle, { color: '#f97316' }]}>Moderate</Text>
                    <Text style={styles.infoItemText}>AHI 15-30</Text>
                  </View>
                  <View style={[styles.infoItem, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={[styles.infoItemTitle, { color: '#ef4444' }]}>Severe</Text>
                    <Text style={styles.infoItemText}>AHI {'>'} 30</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setAnalysisResult(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <LinearGradient
                  colors={['#3b82f6', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>🔄 New Recording</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  setShowHistory(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.secondaryButtonText}>📊 View All History</Text>
              </TouchableOpacity>

              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  ⚠️ <Text style={styles.disclaimerBold}>Disclaimer:</Text> This is a screening tool, not a medical diagnosis. Always consult a healthcare professional.
                </Text>
              </View>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moonIcon: {
    position: 'relative',
    marginRight: 12,
  },
  moonEmoji: {
    fontSize: 40,
  },
  pingDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: '#06b6d4',
    borderRadius: 6,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  historyHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
  },
  analyzingIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  analyzingEmoji: {
    fontSize: 48,
  },
  analyzingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 16,
  },
  recordingPulse: {
    marginBottom: 24,
  },
  recordingDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  recordingIcon: {
    fontSize: 40,
    color: '#fff',
  },
  recordingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#3b82f6',
    letterSpacing: 4,
    marginBottom: 16,
  },
  recordingHint: {
    fontSize: 15,
    color: '#94a3b8',
  },
  completeIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completeEmoji: {
    fontSize: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  readyIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  readyEmoji: {
    fontSize: 48,
  },
  readyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  readySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  instructionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  instructionCard: {
    width: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  mainButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  mainButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  metricsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  gradientCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 20,
    color: '#94a3b8',
  },
  metricSubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
  ahiCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ahiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ahiLabel: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  ahiValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  ahiUnit: {
    fontSize: 14,
    color: '#94a3b8',
  },
  severityPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  severityPillText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  recommendationCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  recommendationText: {
    fontSize: 14,
    color: '#fbbf24',
    lineHeight: 20,
  },
  recommendationBold: {
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoItemText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  disclaimer: {
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  historyItemCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyItemGradient: {
    padding: 20,
  },
  historyDate: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  historyMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 20,
  },
  historyMetric: {
    flex: 1,
  },
  historyMetricLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  historyMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  arrowRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    fontSize: 24,
    color: '#94a3b8',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 60,
  },
});