/**
 * SOMNIA Home Screen
 * Team: Chimpanzini Bananini
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.title}>Ready to monitor your sleep?</Text>
        </View>
        <Ionicons name="person-circle" size={36} color="#6200ee" />
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.startCard}
          onPress={() => navigation.navigate('Record')}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Start Sleep Monitoring</Text>
            <Text style={styles.cardDescription}>
              Place your phone nearby and start tracking your sleep health
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6200ee" />
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Sleep Health</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="analytics-outline" size={24} color="#6200ee" />
              <Text style={styles.infoTitle}>Weekly Sleep Score</Text>
            </View>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreText}>76</Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreLabel}>Good</Text>
                <Text style={styles.scoreDescription}>
                  Your sleep is good, but has room for improvement
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigation.navigate('Results')}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.disordersSection}>
          <Text style={styles.sectionTitle}>Sleep Disorders We Detect</Text>
          <View style={styles.disorderItem}>
            <Ionicons name="alert-circle" size={20} color="#6200ee" />
            <View style={styles.disorderText}>
              <Text style={styles.disorderTitle}>Sleep Apnea</Text>
              <Text style={styles.disorderDesc}>The silent killer affecting 30-40M Indians</Text>
            </View>
          </View>
          <View style={styles.disorderItem}>
            <Ionicons name="alert-circle" size={20} color="#6200ee" />
            <View style={styles.disorderText}>
              <Text style={styles.disorderTitle}>Insomnia</Text>
              <Text style={styles.disorderDesc}>Chronic difficulty sleeping - affects 150M</Text>
            </View>
          </View>
          <View style={styles.disorderItem}>
            <Ionicons name="alert-circle" size={20} color="#6200ee" />
            <View style={styles.disorderText}>
              <Text style={styles.disorderTitle}>REM Behavior Disorder</Text>
              <Text style={styles.disorderDesc}>Early warning for Parkinson's - 80% develop it</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Sleep Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={24} color="#6200ee" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Maintain consistent sleep schedule</Text>
              <Text style={styles.tipDescription}>
                Going to bed at the same time helps regulate your body's clock
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="thermometer-outline" size={24} color="#6200ee" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Keep bedroom cool</Text>
              <Text style={styles.tipDescription}>
                Ideal temperature for sleep is 18-21°C
              </Text>
            </View>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  startCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreDetails: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  disordersSection: {
    marginBottom: 24,
  },
  disorderItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  disorderText: {
    flex: 1,
    marginLeft: 12,
  },
  disorderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  disorderDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;