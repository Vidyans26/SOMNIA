/**
 * SOMNIA Recording Screen
 * Sleep Monitoring Interface
 * Team: Chimpanzini Bananini
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecordingScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Timer for recording duration
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(recordingDuration => recordingDuration + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    Alert.alert(
      "Sleep Monitoring Active",
      "SOMNIA is now monitoring your sleep. This is a simulation for the hackathon demo.",
      [{ text: "OK" }]
    );
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    // Navigate to results after a short delay to simulate processing
    setTimeout(() => {
      navigation.navigate('Results', { fromRecording: true });
    }, 1500);
  };

  // Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Monitor</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {isRecording 
            ? "SOMNIA is monitoring your sleep..."
            : "Place your phone on your bedside table within 1 meter of your pillow"}
        </Text>
      </View>

      <View style={styles.recordingContainer}>
        <View style={styles.recordingCircle}>
          <Ionicons 
            name={isRecording ? "pause-circle" : "play-circle"} 
            size={80} 
            color={isRecording ? "#f44336" : "#4caf50"}
          />
        </View>
        
        {isRecording && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>Recording: {formatTime(recordingDuration)}</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[
            styles.recordButton, 
            isRecording ? styles.recordingActive : styles.recordingInactive
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={40} 
            color="white" 
          />
        </TouchableOpacity>
        <Text style={styles.buttonLabel}>
          {isRecording ? "Stop Monitoring" : "Start Sleep Monitoring"}
        </Text>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Best Practices</Text>
        <View style={styles.tipItem}>
          <Ionicons name="battery-charging" size={20} color="#6200ee" />
          <Text style={styles.tipText}>Keep your device charging overnight</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="volume-high" size={20} color="#6200ee" />
          <Text style={styles.tipText}>Turn on Do Not Disturb mode</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="phone-portrait" size={20} color="#6200ee" />
          <Text style={styles.tipText}>Place screen facing down</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#E8EAF6',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#3F51B5',
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: 20,
  },
  recordingCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  controlsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  recordingInactive: {
    backgroundColor: '#6200ee',
  },
  recordingActive: {
    backgroundColor: '#f44336',
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#555',
  },
});

export default RecordingScreen;