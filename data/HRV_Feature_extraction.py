"""
HRV Feature Extraction Module
Extracts HRV features from heart rate data for OSA prediction
This module provides a template for future HRV-based OSA detection model
"""

import numpy as np
from typing import Dict, Tuple, Optional
from scipy import signal
from scipy.fft import fft


class HRVFeatureExtractor:
    """
    Extract time-domain and frequency-domain HRV features from heart rate data
    """
    
    def __init__(self, sampling_rate: float = 1.0):
        """
        Initialize HRV feature extractor
        
        Args:
            sampling_rate (float): Sampling rate of heart rate data (Hz)
        """
        self.sampling_rate = sampling_rate
    
    # ====================================================================
    # Time-Domain Features
    # ====================================================================
    
    @staticmethod
    def sdnn(rr_intervals: np.ndarray) -> float:
        """
        Standard Deviation of NN intervals (SDNN)
        Measure of overall HRV
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            float: SDNN value in milliseconds
        """
        return float(np.std(rr_intervals))
    
    @staticmethod
    def rmssd(rr_intervals: np.ndarray) -> float:
        """
        Root Mean Square of Successive Differences (RMSSD)
        Measure of short-term variability (vagal activity)
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            float: RMSSD value in milliseconds
        """
        diff = np.diff(rr_intervals)
        return float(np.sqrt(np.mean(diff**2)))
    
    @staticmethod
    def nn50(rr_intervals: np.ndarray) -> int:
        """
        Number of pairs of successive NN intervals that differ by more than 50 ms
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            int: Count of NN50
        """
        diff = np.abs(np.diff(rr_intervals))
        return int(np.sum(diff > 50))
    
    @staticmethod
    def pnn50(rr_intervals: np.ndarray) -> float:
        """
        Percentage of NN50 divided by total number of NN intervals
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            float: pNN50 percentage
        """
        nn50_count = HRVFeatureExtractor.nn50(rr_intervals)
        return float((nn50_count / len(rr_intervals)) * 100) if len(rr_intervals) > 0 else 0.0
    
    @staticmethod
    def mean_hr(rr_intervals: np.ndarray) -> float:
        """
        Mean Heart Rate
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            float: Mean heart rate in BPM
        """
        mean_rr = np.mean(rr_intervals)
        return float(60000 / mean_rr) if mean_rr > 0 else 0.0
    
    @staticmethod
    def hr_std(rr_intervals: np.ndarray) -> float:
        """
        Standard Deviation of Heart Rate
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            
        Returns:
            float: HR std deviation in BPM
        """
        hr_values = 60000 / rr_intervals
        return float(np.std(hr_values))
    
    # ====================================================================
    # Frequency-Domain Features (requires FFT)
    # ====================================================================
    
    @staticmethod
    def compute_power_spectrum(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute power spectral density using FFT
        
        Args:
            rr_intervals (np.ndarray): RR intervals
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            Tuple: (frequencies, power_spectrum)
        """
        # Detrend and window
        detrended = signal.detrend(rr_intervals)
        windowed = detrended * signal.windows.hann(len(detrended))
        
        # Compute FFT
        fft_result = fft(windowed)
        power = np.abs(fft_result)**2
        freqs = np.fft.fftfreq(len(windowed), 1/sampling_rate)
        
        # Return positive frequencies only
        positive_idx = freqs > 0
        return freqs[positive_idx], power[positive_idx]
    
    @staticmethod
    def vlf_power(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> float:
        """
        Very Low Frequency power (0.0033 - 0.04 Hz)
        Associated with thermoregulation and endothelial function
        
        Args:
            rr_intervals (np.ndarray): RR intervals
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            float: VLF power
        """
        freqs, power = HRVFeatureExtractor.compute_power_spectrum(rr_intervals, sampling_rate)
        vlf_idx = (freqs >= 0.0033) & (freqs < 0.04)
        return float(np.sum(power[vlf_idx]))
    
    @staticmethod
    def lf_power(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> float:
        """
        Low Frequency power (0.04 - 0.15 Hz)
        Associated with sympathetic and parasympathetic activity
        
        Args:
            rr_intervals (np.ndarray): RR intervals
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            float: LF power
        """
        freqs, power = HRVFeatureExtractor.compute_power_spectrum(rr_intervals, sampling_rate)
        lf_idx = (freqs >= 0.04) & (freqs < 0.15)
        return float(np.sum(power[lf_idx]))
    
    @staticmethod
    def hf_power(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> float:
        """
        High Frequency power (0.15 - 0.4 Hz)
        Associated with parasympathetic (vagal) activity
        
        Args:
            rr_intervals (np.ndarray): RR intervals
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            float: HF power
        """
        freqs, power = HRVFeatureExtractor.compute_power_spectrum(rr_intervals, sampling_rate)
        hf_idx = (freqs >= 0.15) & (freqs < 0.4)
        return float(np.sum(power[hf_idx]))
    
    @staticmethod
    def lf_hf_ratio(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> float:
        """
        LF/HF Ratio
        Indicator of sympatho-vagal balance
        Higher values indicate sympathetic dominance
        
        Args:
            rr_intervals (np.ndarray): RR intervals
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            float: LF/HF ratio
        """
        lf = HRVFeatureExtractor.lf_power(rr_intervals, sampling_rate)
        hf = HRVFeatureExtractor.hf_power(rr_intervals, sampling_rate)
        
        if hf == 0:
            return float('inf') if lf > 0 else 0.0
        return float(lf / hf)
    
    # ====================================================================
    # Feature Extraction Pipeline
    # ====================================================================
    
    @staticmethod
    def extract_all_features(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0
    ) -> Dict[str, float]:
        """
        Extract all time-domain and frequency-domain HRV features
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            Dict: Dictionary of all extracted features
        """
        features = {
            # Time-domain
            'SDNN': HRVFeatureExtractor.sdnn(rr_intervals),
            'RMSSD': HRVFeatureExtractor.rmssd(rr_intervals),
            'NN50': float(HRVFeatureExtractor.nn50(rr_intervals)),
            'pNN50': HRVFeatureExtractor.pnn50(rr_intervals),
            'Mean_HR': HRVFeatureExtractor.mean_hr(rr_intervals),
            'HR_Std': HRVFeatureExtractor.hr_std(rr_intervals),
            
            # Frequency-domain
            'VLF_Power': HRVFeatureExtractor.vlf_power(rr_intervals, sampling_rate),
            'LF_Power': HRVFeatureExtractor.lf_power(rr_intervals, sampling_rate),
            'HF_Power': HRVFeatureExtractor.hf_power(rr_intervals, sampling_rate),
            'LF_HF_Ratio': HRVFeatureExtractor.lf_hf_ratio(rr_intervals, sampling_rate),
        }
        
        return features
    
    @staticmethod
    def extract_features_for_model(
        rr_intervals: np.ndarray,
        sampling_rate: float = 1.0,
        normalize: bool = True
    ) -> np.ndarray:
        """
        Extract features and return as normalized array for ML model input
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            sampling_rate (float): Sampling rate in Hz
            normalize (bool): Whether to normalize features (z-score)
            
        Returns:
            np.ndarray: Feature vector ready for model input
        """
        features = HRVFeatureExtractor.extract_all_features(rr_intervals, sampling_rate)
        
        # Convert to array
        feature_array = np.array([
            features['SDNN'],
            features['RMSSD'],
            features['pNN50'],
            features['Mean_HR'],
            features['HR_Std'],
            features['VLF_Power'],
            features['LF_Power'],
            features['HF_Power'],
            features['LF_HF_Ratio']
        ])
        
        # Normalize if requested
        if normalize:
            feature_array = (feature_array - np.mean(feature_array)) / (np.std(feature_array) + 1e-8)
        
        return feature_array


# ====================================================================
# Placeholder for Future Lightweight HRV-to-AHI Model
# ====================================================================

class LightweightHRVModel:
    """
    Placeholder for future lightweight HRV model for OSA prediction
    This will be implemented separately
    
    Expected signature:
    - Input: HRV features (extracted from heart rate data)
    - Output: Predicted AHI score
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize HRV model
        
        Args:
            model_path (Optional[str]): Path to pre-trained model weights
        """
        self.model_path = model_path
        self.model = None
        self.is_loaded = False
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """
        Load pre-trained HRV model
        To be implemented when actual model is ready
        """
        # TODO: Implement model loading
        # self.model = load_trained_hrv_model(model_path)
        # self.is_loaded = True
        pass
    
    def predict(self, rr_intervals: np.ndarray, sampling_rate: float = 1.0) -> float:
        """
        Predict AHI from RR intervals
        
        Args:
            rr_intervals (np.ndarray): RR intervals in milliseconds
            sampling_rate (float): Sampling rate in Hz
            
        Returns:
            float: Predicted AHI score
        """
        if not self.is_loaded:
            raise RuntimeError("HRV model not loaded. Call load_model() first.")
        
        # Extract features
        features = HRVFeatureExtractor.extract_features_for_model(
            rr_intervals,
            sampling_rate,
            normalize=True
        )
        
        # Make prediction
        # TODO: Implement prediction when model is ready
        # predicted_ahi = self.model.predict(features.reshape(1, -1))
        # return float(predicted_ahi[0])
        
        return 0.0  # Placeholder