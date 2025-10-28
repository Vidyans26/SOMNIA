// services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult, MonitoringSettings } from '../types';

const HISTORY_KEY = 'somnia_sleep_history';
const SETTINGS_KEY = 'somnia_monitoring_settings';
const MAX_HISTORY = 30;

export const storageService = {
  // History management
  async saveResult(result: AnalysisResult): Promise<void> {
    try {
      const history = await this.getHistory();
      const newResult = {
        ...result,
        id: Date.now().toString(),
      };
      
      const updatedHistory = [newResult, ...history].slice(0, MAX_HISTORY);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save result:', error);
      throw error;
    }
  },

  async getHistory(): Promise<AnalysisResult[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  },

  // Settings management
  async saveSettings(settings: MonitoringSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  async getSettings(): Promise<MonitoringSettings | null> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  },
};