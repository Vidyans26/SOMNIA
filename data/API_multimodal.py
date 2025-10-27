"""
OxiNet Multi-Modal Ensemble API
Enhanced version supporting SpO2 (OxiNet) + HRV models for OSA detection
Provides AHI score and OSA severity diagnosis
"""

import os
import numpy as np
import pandas as pd
from joblib import load
from typing import Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

from architecture import get_duplo
from utils import split_window, preprocess_oximetry


# ============================================================================
# OSA Severity Classification (AHI-based AASM Guidelines)
# ============================================================================

class OSASeverityClassifier:
    """
    Classify OSA severity based on Apnea-Hypopnea Index (AHI)
    Based on AASM (American Academy of Sleep Medicine) guidelines
    
    AHI Thresholds:
    - Normal: 0-5 events/hour (AHI < 5)
    - Mild OSA: 5-15 events/hour
    - Moderate OSA: 15-30 events/hour
    - Severe OSA: ≥ 30 events/hour
    """
    
    THRESHOLDS = {
        'normal': (0, 5),
        'mild': (5, 15),
        'moderate': (15, 30),
        'severe': (30, float('inf'))
    }
    
    SEVERITY_ORDER = ['normal', 'mild', 'moderate', 'severe']
    
    @staticmethod
    def classify(ahi: float) -> Dict:
        """
        Classify OSA severity based on AHI score
        
        Args:
            ahi (float): Apnea-Hypopnea Index (events per hour)
            
        Returns:
            Dict: Comprehensive diagnosis including:
                - ahi_score: rounded AHI value
                - severity: OSA severity level
                - has_osa: boolean indicating presence of OSA
                - description: clinical description
                - clinical_action: recommended clinical action
                - confidence: prediction confidence
        """
        ahi = float(ahi)
        
        for severity, (lower, upper) in OSASeverityClassifier.THRESHOLDS.items():
            if lower <= ahi < upper:
                has_osa = severity != 'normal'
                
                # Calculate confidence based on distance from thresholds
                confidence = OSASeverityClassifier._calculate_confidence(
                    ahi, lower, upper
                )
                
                return {
                    'ahi_score': round(ahi, 2),
                    'severity': severity,
                    'has_osa': has_osa,
                    'description': OSASeverityClassifier._get_description(severity),
                    'clinical_action': OSASeverityClassifier._get_action(severity),
                    'confidence': confidence,
                    'threshold_range': f'{lower}-{upper}' if upper != float('inf') else f'≥{lower}'
                }
        
        # Default to severe if above all thresholds
        return {
            'ahi_score': round(ahi, 2),
            'severity': 'severe',
            'has_osa': True,
            'description': 'Severe Obstructive Sleep Apnea',
            'clinical_action': 'Immediate treatment strongly recommended',
            'confidence': 'High',
            'threshold_range': '≥30'
        }
    
    @staticmethod
    def _calculate_confidence(ahi: float, lower: float, upper: float) -> str:
        """Calculate confidence level based on distance from thresholds"""
        if upper == float('inf'):
            return 'High'
        
        range_width = upper - lower
        distance_from_center = abs(ahi - (lower + upper) / 2)
        
        if distance_from_center > range_width * 0.3:
            return 'High'
        elif distance_from_center > range_width * 0.15:
            return 'Medium'
        else:
            return 'Low'
    
    @staticmethod
    def _get_description(severity: str) -> str:
        """Get clinical description for severity level"""
        descriptions = {
            'normal': 'No obstructive sleep apnea detected (AHI < 5)',
            'mild': 'Mild obstructive sleep apnea (AHI 5-15)',
            'moderate': 'Moderate obstructive sleep apnea (AHI 15-30)',
            'severe': 'Severe obstructive sleep apnea (AHI ≥ 30)'
        }
        return descriptions.get(severity, 'Unknown classification')
    
    @staticmethod
    def _get_action(severity: str) -> str:
        """Get recommended clinical action for severity level"""
        actions = {
            'normal': 'No treatment needed; routine monitoring recommended',
            'mild': 'Lifestyle modifications advised; CPAP if symptomatic',
            'moderate': 'CPAP or oral appliance therapy recommended',
            'severe': 'CPAP therapy strongly recommended; specialist referral advised'
        }
        return actions.get(severity, 'Consult sleep specialist')


# ============================================================================
# OxiNet Model Loading
# ============================================================================

def get_nb_window(overlap, signal_size, window_size, padding_size=-1):
    """Calculate number of windows for signal processing"""
    signal_size = max(signal_size, padding_size)
    if overlap == 0:
        nb_windows = int(round(signal_size / window_size))
    else:
        nb_windows = (int(round(signal_size / window_size)) * 2) - 1
    return nb_windows


def load_oxinet_models(model_dir: str = 'saved_model') -> Tuple:
    """
    Load OxiNet model components (scaler, params, model)
    
    Args:
        model_dir (str): Directory containing model files
        
    Returns:
        Tuple: (oximetry_scaler, params, model)
        
    Raises:
        FileNotFoundError: If required model files not found
    """
    params_path = os.path.join(model_dir, 'oxinet_config.csv')
    model_path = os.path.join(model_dir, 'duplo_1.h5')
    scaler_path = os.path.join(model_dir, 'oximetry_scaler.joblib')
    
    required_files = {
        'Config': params_path,
        'Model weights': model_path,
        'Scaler': scaler_path
    }
    
    missing_files = [name for name, path in required_files.items() if not os.path.exists(path)]
    if missing_files:
        raise FileNotFoundError(
            f"Missing files in {model_dir}: {', '.join(missing_files)}"
        )
    
    # Load scaler
    oximetry_scaler = load(scaler_path)
    
    # Load and parse configuration
    params = pd.read_csv(params_path).iloc[0].to_dict()
    
    # Convert parameter types
    int_params = ['padding_size', 'n_filters_lstm', 'nb_conv_lstm', 'num_features',
                  'dilations_num', 'residual_convolution_n_convs', 'num_residual_convolution',
                  'first_conv_n_filters', 'window_size']
    for key in int_params:
        params[key] = int(params[key])
    
    tuple_params = ['first_conv_kernel_size', 'residual_convolution_kernel_size',
                    'dilated_block_kernel_size', 'dilation', 'kernel_size_lstm']
    for key in tuple_params:
        params[key] = (int(params[key]),)
    
    # Calculate shape
    nb_windows = get_nb_window(params['overlap'], params['signal_size'],
                               params['window_size'], params['padding_size'])
    params['shape'] = (int(nb_windows), int(params['window_size']))
    params['regularizer'] = 0.1
    
    # Load model
    model = get_duplo(params)
    model.load_weights(model_path)
    
    return oximetry_scaler, params, model


# ============================================================================
# OxiNet SpO2 Prediction (Original Functionality)
# ============================================================================

def predict_ahi_from_spo2(
    oximetry_signal: np.ndarray,
    model_dir: str = 'saved_model',
    return_components: bool = False
) -> Dict:
    """
    Predict AHI from SpO2 signal using OxiNet
    
    Args:
        oximetry_signal (np.ndarray): SpO2 time series (shape: len_signal or len_signal x 1)
        model_dir (str): Path to OxiNet model directory
        return_components (bool): If True, return CNN and LSTM predictions separately
        
    Returns:
        Dict: Prediction results including:
            - 'ahi_spo2': Main AHI prediction from SpO2
            - 'ahi_cnn': CNN branch prediction (if return_components=True)
            - 'ahi_lstm': LSTM branch prediction (if return_components=True)
    """
    try:
        oximetry_scaler, params, model = load_oxinet_models(model_dir)
    except FileNotFoundError as e:
        raise RuntimeError(f"Failed to load OxiNet model: {str(e)}")
    
    # Ensure correct shape
    if oximetry_signal.ndim == 1:
        oximetry_signal = oximetry_signal.reshape(-1, 1)
    
    if oximetry_signal.shape[1] != 1:
        raise ValueError(f"Expected oximetry_signal shape (N, 1), got {oximetry_signal.shape}")
    
    # Preprocess
    oximetry_signal = preprocess_oximetry(oximetry_signal, params)
    
    # Window and normalize
    windowed_signal = split_window(oximetry_signal, params)
    original_shape = windowed_signal.shape
    windowed_signal = windowed_signal.reshape(-1, original_shape[-1])
    windowed_signal = oximetry_scaler.transform(windowed_signal)
    windowed_signal = windowed_signal.reshape(original_shape)
    
    # Predict (model returns [cnn_output, lstm_output, final_output])
    predictions = model.predict(
        [windowed_signal, np.zeros(shape=(1, 176))],
        verbose=0
    )
    
    ahi_cnn = float(predictions[0][0][0])
    ahi_lstm = float(predictions[1][0][0])
    ahi_final = float(predictions[2][0][0])
    
    result = {'ahi_spo2': ahi_final}
    
    if return_components:
        result['ahi_cnn'] = ahi_cnn
        result['ahi_lstm'] = ahi_lstm
    
    return result


# ============================================================================
# Ensemble Prediction (OxiNet + HRV Model)
# ============================================================================

class OSAEnsemblePredictor:
    """
    Ensemble predictor combining OxiNet (SpO2) and HRV model for improved OSA detection
    
    This class manages predictions from multiple modalities and combines them
    using configurable weights for robust OSA detection.
    """
    
    def __init__(
        self,
        oxinet_model_dir: str = 'saved_model',
        spo2_weight: float = 0.6,
        hrv_weight: float = 0.4
    ):
        """
        Initialize ensemble predictor
        
        Args:
            oxinet_model_dir (str): Path to OxiNet model directory
            spo2_weight (float): Weight for SpO2 predictions (default: 0.6)
            hrv_weight (float): Weight for HRV predictions (default: 0.4)
            
        Raises:
            ValueError: If weights don't sum to 1.0
        """
        self.oxinet_model_dir = oxinet_model_dir
        
        # Validate and normalize weights
        total_weight = spo2_weight + hrv_weight
        if total_weight <= 0:
            raise ValueError("Total weight must be positive")
        
        self.spo2_weight = spo2_weight / total_weight
        self.hrv_weight = hrv_weight / total_weight
        
        # Try to load OxiNet model at initialization
        try:
            self.oxinet_loaded = True
            load_oxinet_models(oxinet_model_dir)
        except FileNotFoundError as e:
            print(f"Warning: Could not load OxiNet model: {str(e)}")
            self.oxinet_loaded = False
    
    def predict(
        self,
        oximetry_signal: np.ndarray,
        hrv_ahi: Optional[float] = None,
        hrv_model=None
    ) -> Dict:
        """
        Make ensemble prediction for OSA
        
        Args:
            oximetry_signal (np.ndarray): SpO2 time series
            hrv_ahi (Optional[float]): Pre-computed HRV AHI score
            hrv_model (Optional): Callable HRV model for on-the-fly prediction
            
        Returns:
            Dict: Comprehensive prediction including:
                - 'ahi_spo2': SpO2-based AHI
                - 'ahi_hrv': HRV-based AHI (if available)
                - 'ahi_ensemble': Weighted ensemble AHI
                - 'diagnosis': OSA severity classification
                - 'has_osa': Boolean indicating OSA presence
                - 'confidence': Prediction confidence
                - 'modalities_used': List of modalities used
        """
        if not self.oxinet_loaded:
            raise RuntimeError("OxiNet model not loaded. Cannot make predictions.")
        
        result = {}
        modalities_used = []
        
        # Get SpO2 prediction
        try:
            spo2_pred = predict_ahi_from_spo2(oximetry_signal, self.oxinet_model_dir)
            ahi_spo2 = spo2_pred['ahi_spo2']
            result['ahi_spo2'] = ahi_spo2
            modalities_used.append('SpO2')
        except Exception as e:
            raise RuntimeError(f"SpO2 prediction failed: {str(e)}")
        
        # Get HRV prediction
        ahi_hrv = None
        if hrv_ahi is not None:
            ahi_hrv = float(hrv_ahi)
            result['ahi_hrv'] = ahi_hrv
            modalities_used.append('HRV')
        elif hrv_model is not None:
            try:
                ahi_hrv = float(hrv_model(oximetry_signal))
                result['ahi_hrv'] = ahi_hrv
                modalities_used.append('HRV')
            except Exception as e:
                print(f"Warning: HRV prediction failed: {str(e)}")
                ahi_hrv = None
        
        # Calculate ensemble AHI
        if ahi_hrv is not None:
            ahi_ensemble = (self.spo2_weight * ahi_spo2 + 
                           self.hrv_weight * ahi_hrv)
        else:
            ahi_ensemble = ahi_spo2
        
        result['ahi_ensemble'] = ahi_ensemble
        result['modalities_used'] = modalities_used
        
        # Get diagnosis
        diagnosis = OSASeverityClassifier.classify(ahi_ensemble)
        result['diagnosis'] = diagnosis
        result['has_osa'] = diagnosis['has_osa']
        result['confidence'] = diagnosis['confidence']
        
        return result
    
    def predict_batch(
        self,
        oximetry_signals: list,
        hrv_ahi_scores: Optional[list] = None
    ) -> list:
        """
        Make ensemble predictions for multiple patients
        
        Args:
            oximetry_signals (list): List of SpO2 signals
            hrv_ahi_scores (Optional[list]): List of pre-computed HRV AHI scores
            
        Returns:
            list: List of prediction dictionaries
        """
        results = []
        
        for idx, spo2_signal in enumerate(oximetry_signals):
            hrv_ahi = None
            if hrv_ahi_scores is not None and idx < len(hrv_ahi_scores):
                hrv_ahi = hrv_ahi_scores[idx]
            
            pred = self.predict(spo2_signal, hrv_ahi=hrv_ahi)
            results.append(pred)
        
        return results
    
    def update_weights(self, spo2_weight: float, hrv_weight: float):
        """
        Update ensemble weights
        
        Args:
            spo2_weight (float): New SpO2 weight
            hrv_weight (float): New HRV weight
        """
        total = spo2_weight + hrv_weight
        if total <= 0:
            raise ValueError("Total weight must be positive")
        
        self.spo2_weight = spo2_weight / total
        self.hrv_weight = hrv_weight / total
        print(f"Weights updated: SpO2={self.spo2_weight:.2%}, HRV={self.hrv_weight:.2%}")


# ============================================================================
# Convenience Functions
# ============================================================================

def diagnose_osa_from_spo2(
    oximetry_signal: np.ndarray,
    model_dir: str = 'saved_model'
) -> Dict:
    """
    Simple function to diagnose OSA from SpO2 signal only
    
    Args:
        oximetry_signal (np.ndarray): SpO2 time series
        model_dir (str): Path to OxiNet model
        
    Returns:
        Dict: Diagnosis results
    """
    ahi_pred = predict_ahi_from_spo2(oximetry_signal, model_dir)
    ahi = ahi_pred['ahi_spo2']
    diagnosis = OSASeverityClassifier.classify(ahi)
    
    return diagnosis


def diagnose_osa_ensemble(
    oximetry_signal: np.ndarray,
    hrv_ahi: Optional[float] = None,
    oxinet_model_dir: str = 'saved_model',
    spo2_weight: float = 0.6,
    hrv_weight: float = 0.4
) -> Dict:
    """
    Diagnose OSA using ensemble of SpO2 and HRV
    
    Args:
        oximetry_signal (np.ndarray): SpO2 time series
        hrv_ahi (Optional[float]): Pre-computed HRV AHI
        oxinet_model_dir (str): Path to OxiNet model
        spo2_weight (float): SpO2 weight
        hrv_weight (float): HRV weight
        
    Returns:
        Dict: Comprehensive diagnosis
    """
    predictor = OSAEnsemblePredictor(
        oxinet_model_dir=oxinet_model_dir,
        spo2_weight=spo2_weight,
        hrv_weight=hrv_weight
    )
    
    return predictor.predict(oximetry_signal, hrv_ahi=hrv_ahi)