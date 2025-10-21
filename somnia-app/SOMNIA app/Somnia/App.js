  import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Mock data generator
const generateMockResults = (duration) => {
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

export default function App() {
  // State management
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
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

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load history from storage
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

  // Save result to history
  const saveResult = async (result) => {
    try {
      const newResult = {
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

  // Start recording
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

  // Stop recording
  const stopRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (!recording) return;

    try {
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      
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
          return prev + 10;
        });
      }, 200);
      
      // Simulate analysis
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

  // Handle button press
  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌙 SOMNIA</Text>
        <Text style={styles.subtitle}>Sleep Health Monitor</Text>
      </View>

      {/* Main Content */}
      {showHistory ? (
        /* History View */
        <ScrollView style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Previous Sleep Sessions</Text>
          
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No previous recordings yet</Text>
          ) : (
            history.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  setAnalysisResult(item);
                  setShowHistory(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.historyDate}>{item.timestamp}</Text>
                <Text style={styles.historyDetail}>
                  Duration: {item.duration.toFixed(1)}h | AHI: {item.ahi}
                </Text>
                <Text style={[
                  styles.historySeverity,
                  item.severity.includes('Normal') ? styles.severityNormal :
                  item.severity.includes('Mild') ? styles.severityWarning :
                  styles.severityDanger
                ]}>
                  {item.severity}
                </Text>
              </TouchableOpacity>
            ))
          )}
          
          <TouchableOpacity 
            style={styles.closeHistoryButton}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.closeHistoryText}>Close History</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          {/* Status Container */}
          <View style={styles.statusContainer}>
            {isAnalyzing ? (
              <>
                <Text style={styles.analyzingText}>🧠 Analyzing Audio...</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${analysisProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{analysisProgress}%</Text>
              </>
            ) : isRecording ? (
              <>
                <View style={styles.recordingDot} />
                <Text style={styles.statusText}>Recording in Progress</Text>
                <Text style={styles.timer}>{formatTime(recordingDuration)}</Text>
                <Text style={styles.hint}>Phone will stay awake during recording</Text>
              </>
            ) : analysisResult ? (
              <>
                <Text style={styles.statusText}>✅ Analysis Complete</Text>
                <Text style={styles.hint}>Scroll down to view results</Text>
              </>
            ) : (
              <>
                <Text style={styles.statusText}>Ready to Monitor Sleep</Text>
                <Text style={styles.instruction}>
                  📱 Place phone on nightstand{'\n'}
                  🔌 Keep phone plugged in{'\n'}
                  🔇 Enable Do Not Disturb
                </Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          {!isAnalyzing && !analysisResult && (
            <>
              <TouchableOpacity 
                style={[
                  styles.button, 
                  isRecording ? styles.stopButton : styles.startButton
                ]}
                onPress={handlePress}
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
                >
                  <Text style={styles.historyButtonText}>
                    📊 View History ({history.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Results Section */}
          {analysisResult && !isAnalyzing && (
            <ScrollView style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>📊 Sleep Analysis Results</Text>
              
              {/* Duration Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Recording Duration</Text>
                <Text style={styles.metricValue}>
                  {analysisResult.duration.toFixed(2)} hours
                </Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.timestamp}
                </Text>
              </View>

              {/* Snoring Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>🔊 Snoring Events</Text>
                <Text style={styles.metricValue}>
                  {analysisResult.snoringEvents}
                </Text>
                <Text style={styles.metricSubtext}>
                  {analysisResult.snoringMinutes} minutes ({analysisResult.snoringPercentage}%)
                </Text>
              </View>

              {/* Apnea Card */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>😴 Apnea Events</Text>
                <Text style={styles.metricValue}>
                  {analysisResult.apneaEvents}
                </Text>
                <Text style={styles.metricSubtext}>
                  AHI Score: {analysisResult.ahi} events/hour
                </Text>
                <Text style={styles.metricSubtext}>
                  Longest pause: {analysisResult.longestPause}s
                </Text>
              </View>

              {/* Severity Assessment */}
              <View style={[styles.metricCard, styles.severityCard]}>
                <Text style={styles.metricLabel}>⚠️ Assessment</Text>
                <Text style={[
                  styles.severityText,
                  analysisResult.severity.includes('Severe') && styles.severityDanger,
                  analysisResult.severity.includes('Moderate') && styles.severityWarning,
                ]}>
                  {analysisResult.severity}
                </Text>
                
                {parseFloat(analysisResult.ahi) >= 5 && (
                  <Text style={styles.recommendation}>
                    💡 Recommendation: Consult a sleep specialist
                  </Text>
                )}
              </View>

              {/* New Recording Button */}
              <TouchableOpacity 
                style={styles.newRecordingButton}
                onPress={() => {
                  setAnalysisResult(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={styles.newRecordingButtonText}>
                  🔄 New Recording
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 10,
  },
  logo: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4444',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    color: '#4a9eff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  analyzingText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#1a1f3a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 24,
    color: '#4a9eff',
    marginTop: 15,
    fontWeight: 'bold',
  },
  button: {
    marginHorizontal: 30,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4a9eff',
  },
  stopButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#1a1f3a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricCard: {
    backgroundColor: '#1a1f3a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  metricLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  metricSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  
  severityCard: {
    borderWidth: 2,
    borderColor: '#4a9eff',
  },
  severityText: {
    fontSize: 24,
    color: '#4a9eff',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 10,
  },
  severityDanger: {
    color: '#ff4444',
  },
  severityWarning: {
    color: '#ffaa00',
  },
  severityNormal: {
    color: '#00ff88',
  },
  recommendation: {
    fontSize: 14,
    color: '#ffaa00',
    marginTop: 10,
    fontStyle: 'italic',
  },
  newRecordingButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  newRecordingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#1a1f3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyDate: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  historyDetail: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  historySeverity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  closeHistoryButton: {
    backgroundColor: '#4a9eff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  closeHistoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});