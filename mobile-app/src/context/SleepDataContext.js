/**
 * SOMNIA Sleep Data Context
 * Sleep Analysis State Management
 * Team: Chimpanzini Bananini
 */

import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SleepDataContext = createContext();

export const SleepDataProvider = ({ children }) => {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add new sleep record
  const addSleepRecord = async (recordData) => {
    try {
      setLoading(true);
      const newRecord = {
        id: 'record_' + Date.now(),
        ...recordData,
        timestamp: new Date().toISOString(),
      };
      const updated = [newRecord, ...sleepRecords];
      setSleepRecords(updated);
      setCurrentAnalysis(newRecord);
      
      // Save to local storage
      await AsyncStorage.setItem('somnia_records', JSON.stringify(updated));
      return newRecord;
    } catch (error) {
      console.error('Error adding sleep record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get all sleep records
  const getSleepRecords = async () => {
    try {
      const saved = await AsyncStorage.getItem('somnia_records');
      if (saved) {
        setSleepRecords(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  // Get sleep statistics
  const getSleepStats = () => {
    if (sleepRecords.length === 0) {
      return {
        avgSleep: 0,
        avgScore: 0,
        totalNights: 0,
      };
    }

    const avgSleep = sleepRecords.reduce((sum, record) => sum + (record.duration || 0), 0) / sleepRecords.length;
    const avgScore = sleepRecords.reduce((sum, record) => sum + (record.score || 0), 0) / sleepRecords.length;

    return {
      avgSleep: avgSleep.toFixed(1),
      avgScore: avgScore.toFixed(0),
      totalNights: sleepRecords.length,
    };
  };

  const value = {
    sleepRecords,
    currentAnalysis,
    loading,
    addSleepRecord,
    getSleepRecords,
    getSleepStats,
  };

  return (
    <SleepDataContext.Provider value={value}>
      {children}
    </SleepDataContext.Provider>
  );
};