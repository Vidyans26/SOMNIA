/**
 * SOMNIA Results Screen
 * Sleep Analysis Display
 * Team: Chimpanzini Bananini
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ResultsScreen = ({ route, navigation }) => {
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Generate mock sleep data
      const mockData = {
        date: new Date().toISOString().split('T')[0],
        score: 78,
        duration: 7.2,
        efficiency: 0.86,
        stages: {
          wake: 36,
          light: 224,
          deep: 98,
          rem: 74
        },
        apnea: {
          events: 8,
          longest: 22,
          ahi: 1.1
        },
        snoring: {
          episodes: 15,
          duration: 42
        },
        heartRate: {
          avg: 64,
          min: 52,
          max: 88
        },
        oxygen: {
          avg: 96,
          min: 91,
          events: 4
        },
        recommendations: [
          "Try sleeping on your side to reduce apnea events",
          "Keep room temperature between 18-21°C for optimal sleep",
          "Reduce screen time 1 hour before bed to improve REM sleep"
        ]
      };
      setSleepData(mockData);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [route]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Analyzing your sleep patterns...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Results</Text>
        <Text style={styles.date}>{sleepData.date}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{sleepData.score}</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Sleep Score</Text>
            <Text style={styles.scoreDescription}>
              {sleepData.score >= 80 ? 'Excellent sleep quality' :
               sleepData.score >= 70 ? 'Good sleep quality' :
               sleepData.score >= 60 ? 'Fair sleep quality' : 'Poor sleep quality'}
            </Text>
          </View>
        </View>

        <View style={styles.durationCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Duration & Efficiency</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sleepData.duration}h</Text>
              <Text style={styles.statLabel}>Total Sleep</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(sleepData.efficiency * 100)}%</Text>
              <Text style={styles.statLabel}>Efficiency</Text>
            </View>
          </View>
        </View>

        <View style={styles.stagesCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Sleep Stages (Minutes)</Text>
          </View>
          <View style={styles.stagesContainer}>
            <View style={styles.stageBar}>
              <Text style={styles.stageLabel}>Wake</Text>
              <View style={[styles.stageProgress, { width: '20%', backgroundColor: '#f44336' }]}>
                <Text style={styles.stageValue}>{sleepData.stages.wake}m</Text>
              </View>
            </View>
            <View style={styles.stageBar}>
              <Text style={styles.stageLabel}>Light</Text>
              <View style={[styles.stageProgress, { width: '60%', backgroundColor: '#ffc107' }]}>
                <Text style={styles.stageValue}>{sleepData.stages.light}m</Text>
              </View>
            </View>
            <View style={styles.stageBar}>
              <Text style={styles.stageLabel}>Deep</Text>
              <View style={[styles.stageProgress, { width: '30%', backgroundColor: '#2196f3' }]}>
                <Text style={styles.stageValue}>{sleepData.stages.deep}m</Text>
              </View>
            </View>
            <View style={styles.stageBar}>
              <Text style={styles.stageLabel}>REM</Text>
              <View style={[styles.stageProgress, { width: '25%', backgroundColor: '#9c27b0' }]}>
                <Text style={styles.stageValue}>{sleepData.stages.rem}m</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.apneaCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={24} color={sleepData.apnea.events > 10 ? "#f44336" : "#6200ee"} />
            <Text style={styles.cardTitle}>Breathing Disturbances</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue, 
                {color: sleepData.apnea.events > 15 ? '#f44336' : 
                        sleepData.apnea.events > 5 ? '#ff9800' : '#4caf50'}
              ]}>
                {sleepData.apnea.events}
              </Text>
              <Text style={styles.statLabel}>Apnea Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sleepData.apnea.ahi}</Text>
              <Text style={styles.statLabel}>AHI Index</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sleepData.oxygen.min}%</Text>
              <Text style={styles.statLabel}>Min SpO2</Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Recommendations</Text>
          </View>
          {sleepData.recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="white" />
          <Text style={styles.exportButtonText}>Export Sleep Report</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SOMNIA by Team Chimpanzini Bananini
          </Text>
          <Text style={styles.footerVersion}>v0.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6200ee',
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
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreInfo: {
    marginLeft: 16,
    flex: 1,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scoreDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  durationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  stagesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  stagesContainer: {
    marginTop: 12,
  },
  stageBar: {
    marginBottom: 12,
  },
  stageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  stageProgress: {
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageValue: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  apneaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  exportButton: {
    backgroundColor: '#6200ee',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 16,
    elevation: 3,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerVersion: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default ResultsScreen;