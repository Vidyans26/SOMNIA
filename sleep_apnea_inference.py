"""
Multimodal Sleep Apnea Detection - Standalone Inference Script
Loads pre-trained ECG and SpO2 models, combines predictions, and generates AHI score diagnosis.
No API, no server - just pure inference.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Union, Optional
import tensorflow as tf
from tensorflow.keras.models import load_model
import json
import warnings

warnings.filterwarnings('ignore')


class SleepApneaInference:
    """
    Standalone inference class for multimodal sleep apnea detection.
    Combines ECG and SpO2 model predictions to estimate AHI score.
    """
    
    def __init__(
        self,
        ecg_model_path: str,
        spo2_model_path: str,
        ecg_weight: float = 0.5,
        spo2_weight: float = 0.5
    ):
        """
        Initialize the inference engine with pre-trained models.
        
        Args:
            ecg_model_path: Path to ECG model HDF5 file
            spo2_model_path: Path to SpO2 model HDF5 file
            ecg_weight: Weight for ECG model in ensemble (default 0.5)
            spo2_weight: Weight for SpO2 model in ensemble (default 0.5)
        """
        self.ecg_model_path = ecg_model_path
        self.spo2_model_path = spo2_model_path
        
        # Normalize ensemble weights
        total = ecg_weight + spo2_weight
        self.ecg_weight = ecg_weight / total
        self.spo2_weight = spo2_weight / total
        
        # Load models
        print("Loading pre-trained models...")
        self.ecg_model = self._load_model(ecg_model_path, "ECG")
        self.spo2_model = self._load_model(spo2_model_path, "SpO2")
        print("✓ Models loaded successfully\n")
        
        # AHI severity thresholds
        self.ahi_thresholds = {
            'normal': 5,
            'mild': 15,
            'moderate': 30
        }

    def _load_model(self, model_path: str, model_type: str):
        """Load pre-trained model from HDF5 file."""
        try:
            if not Path(model_path).exists():
                raise FileNotFoundError(f"{model_type} model not found at {model_path}")
            
            model = load_model(model_path, compile=False)
            print(f"  ✓ {model_type} model loaded: {model_path}")
            print(f"    - Input shape: {model.input_shape}")
            print(f"    - Output shape: {model.output_shape}")
            print(f"    - Parameters: {model.count_params():,}")
            
            return model
        except Exception as e:
            print(f"✗ Error loading {model_type} model: {str(e)}")
            raise

    def load_ecg_data(self, data_path: str) -> np.ndarray:
        """
        Load ECG data from file (CSV, NPY, or MAT format).
        
        Args:
            data_path: Path to ECG data file
            
        Returns:
            ECG data as numpy array
        """
        data_path = Path(data_path)
        
        try:
            if data_path.suffix == '.csv':
                data = pd.read_csv(data_path).values.flatten()
            elif data_path.suffix == '.npy':
                data = np.load(data_path).flatten()
            elif data_path.suffix == '.mat':
                from scipy.io import loadmat
                mat_data = loadmat(data_path)
                key = [k for k in mat_data.keys() if not k.startswith('__')][0]
                data = mat_data[key].flatten()
            elif isinstance(data_path, (list, np.ndarray)):
                data = np.array(data_path).flatten()
            else:
                raise ValueError(f"Unsupported format: {data_path.suffix}")
            
            print(f"ECG data loaded: {data.shape[0]} samples")
            return data
        except Exception as e:
            print(f"✗ Error loading ECG data: {str(e)}")
            raise

    def load_spo2_data(self, data_path: str) -> np.ndarray:
        """
        Load SpO2 data from file (CSV, NPY, or MAT format).
        
        Args:
            data_path: Path to SpO2 data file
            
        Returns:
            SpO2 data as numpy array
        """
        data_path = Path(data_path)
        
        try:
            if data_path.suffix == '.csv':
                data = pd.read_csv(data_path).values.flatten()
            elif data_path.suffix == '.npy':
                data = np.load(data_path).flatten()
            elif data_path.suffix == '.mat':
                from scipy.io import loadmat
                mat_data = loadmat(data_path)
                key = [k for k in mat_data.keys() if not k.startswith('__')][0]
                data = mat_data[key].flatten()
            elif isinstance(data_path, (list, np.ndarray)):
                data = np.array(data_path).flatten()
            else:
                raise ValueError(f"Unsupported format: {data_path.suffix}")
            
            print(f"SpO2 data loaded: {data.shape[0]} samples")
            return data
        except Exception as e:
            print(f"✗ Error loading SpO2 data: {str(e)}")
            raise

    def preprocess_ecg(self, ecg_data: np.ndarray) -> np.ndarray:
        """
        Preprocess ECG signal for model inference.
        - Standardization (zero mean, unit variance)
        - Windowing to match model input size
        
        Args:
            ecg_data: Raw ECG signal
            
        Returns:
            Preprocessed ECG data ready for model
        """
        try:
            # Ensure 1D array
            ecg_data = np.array(ecg_data).flatten()
            
            # Standardization
            mean = np.mean(ecg_data)
            std = np.std(ecg_data)
            if std > 0:
                ecg_normalized = (ecg_data - mean) / std
            else:
                ecg_normalized = ecg_data - mean
            
            # Expected window size from model
            expected_size = self.ecg_model.input_shape[-1]
            
            # Create windows with sliding approach
            if len(ecg_normalized) >= expected_size:
                # Multiple windows
                windows = []
                step = int(expected_size * 0.5)  # 50% overlap
                
                for start in range(0, len(ecg_normalized) - expected_size + 1, step):
                    window = ecg_normalized[start:start + expected_size]
                    windows.append(window)
                
                ecg_processed = np.array(windows)
            else:
                # Pad if too short
                padded = np.pad(
                    ecg_normalized,
                    (0, expected_size - len(ecg_normalized)),
                    mode='constant',
                    constant_values=0
                )
                ecg_processed = padded.reshape(1, -1)
            
            print(f"ECG preprocessed: {ecg_processed.shape}")
            return ecg_processed
        except Exception as e:
            print(f"✗ Error preprocessing ECG: {str(e)}")
            raise

    def preprocess_spo2(self, spo2_data: np.ndarray) -> np.ndarray:
        """
        Preprocess SpO2 signal for model inference.
        - Standardization (zero mean, unit variance)
        - Windowing to match model input size
        
        Args:
            spo2_data: Raw SpO2 signal
            
        Returns:
            Preprocessed SpO2 data ready for model
        """
        try:
            # Ensure 1D array
            spo2_data = np.array(spo2_data).flatten()
            
            # Standardization
            mean = np.mean(spo2_data)
            std = np.std(spo2_data)
            if std > 0:
                spo2_normalized = (spo2_data - mean) / std
            else:
                spo2_normalized = spo2_data - mean
            
            # Expected window size from model
            expected_size = self.spo2_model.input_shape[-1]
            
            # Create windows
            if len(spo2_normalized) >= expected_size:
                windows = []
                step = int(expected_size * 0.5)  # 50% overlap
                
                for start in range(0, len(spo2_normalized) - expected_size + 1, step):
                    window = spo2_normalized[start:start + expected_size]
                    windows.append(window)
                
                spo2_processed = np.array(windows)
            else:
                # Pad if too short
                padded = np.pad(
                    spo2_normalized,
                    (0, expected_size - len(spo2_normalized)),
                    mode='constant',
                    constant_values=0
                )
                spo2_processed = padded.reshape(1, -1)
            
            print(f"SpO2 preprocessed: {spo2_processed.shape}")
            return spo2_processed
        except Exception as e:
            print(f"✗ Error preprocessing SpO2: {str(e)}")
            raise

    def predict_ecg(self, ecg_preprocessed: np.ndarray) -> np.ndarray:
        """
        Generate ECG model predictions.
        
        Args:
            ecg_preprocessed: Preprocessed ECG data
            
        Returns:
            Model predictions (probabilities or scores)
        """
        try:
            ecg_pred = self.ecg_model.predict(ecg_preprocessed, verbose=0)
            print(f"ECG predictions: {ecg_pred.shape}")
            return ecg_pred
        except Exception as e:
            print(f"✗ Error generating ECG predictions: {str(e)}")
            raise

    def predict_spo2(self, spo2_preprocessed: np.ndarray) -> np.ndarray:
        """
        Generate SpO2 model predictions.
        
        Args:
            spo2_preprocessed: Preprocessed SpO2 data
            
        Returns:
            Model predictions (probabilities or scores)
        """
        try:
            spo2_pred = self.spo2_model.predict(spo2_preprocessed, verbose=0)
            print(f"SpO2 predictions: {spo2_pred.shape}")
            return spo2_pred
        except Exception as e:
            print(f"✗ Error generating SpO2 predictions: {str(e)}")
            raise

    def ensemble_predictions(
        self,
        ecg_pred: np.ndarray,
        spo2_pred: np.ndarray,
        method: str = 'weighted_average'
    ) -> Tuple[np.ndarray, Dict]:
        """
        Combine ECG and SpO2 predictions using ensemble methods.
        
        Args:
            ecg_pred: ECG model predictions
            spo2_pred: SpO2 model predictions
            method: Ensemble method ('weighted_average', 'max', 'min', 'majority_vote')
            
        Returns:
            Tuple of (ensemble predictions, statistics dictionary)
        """
        try:
            # Ensure same number of predictions
            min_samples = min(len(ecg_pred), len(spo2_pred))
            ecg_pred = ecg_pred[:min_samples]
            spo2_pred = spo2_pred[:min_samples]
            
            if method == 'weighted_average':
                # Weighted averaging
                ensemble_pred = (
                    ecg_pred * self.ecg_weight +
                    spo2_pred * self.spo2_weight
                )
            
            elif method == 'max':
                # Maximum ensemble
                ensemble_pred = np.maximum(ecg_pred, spo2_pred)
            
            elif method == 'min':
                # Minimum ensemble
                ensemble_pred = np.minimum(ecg_pred, spo2_pred)
            
            elif method == 'majority_vote':
                # Majority voting (for binary classification)
                ecg_class = (ecg_pred > 0.5).astype(int)
                spo2_class = (spo2_pred > 0.5).astype(int)
                ensemble_pred = ((ecg_class + spo2_class) / 2).reshape(-1, 1)
            
            else:
                raise ValueError(f"Unknown ensemble method: {method}")
            
            # Calculate statistics
            stats = {
                'method': method,
                'ecg_mean': float(np.mean(ecg_pred)),
                'ecg_std': float(np.std(ecg_pred)),
                'spo2_mean': float(np.mean(spo2_pred)),
                'spo2_std': float(np.std(spo2_pred)),
                'ensemble_mean': float(np.mean(ensemble_pred)),
                'ensemble_std': float(np.std(ensemble_pred)),
                'ecg_weight': self.ecg_weight,
                'spo2_weight': self.spo2_weight
            }
            
            print(f"Ensemble method: {method}")
            print(f"  ECG  - Mean: {stats['ecg_mean']:.4f}, Std: {stats['ecg_std']:.4f}")
            print(f"  SpO2 - Mean: {stats['spo2_mean']:.4f}, Std: {stats['spo2_std']:.4f}")
            print(f"  Ensemble - Mean: {stats['ensemble_mean']:.4f}, Std: {stats['ensemble_std']:.4f}")
            
            return ensemble_pred, stats
        except Exception as e:
            print(f"✗ Error in ensemble prediction: {str(e)}")
            raise

    def calculate_ahi_score(self, ensemble_pred: np.ndarray) -> float:
        """
        Calculate AHI (Apnea-Hypopnea Index) score from ensemble predictions.
        
        AHI = number of apnea/hypopnea events per hour
        
        Args:
            ensemble_pred: Combined model predictions
            
        Returns:
            Estimated AHI score (0-100)
        """
        try:
            # Get average prediction (apnea probability)
            apnea_probability = np.mean(ensemble_pred)
            
            # Scale probability to AHI range
            # Assuming: prob 0 = AHI 0, prob 1 = AHI 100
            ahi_score = apnea_probability * 100
            
            print(f"Apnea probability: {apnea_probability:.4f}")
            print(f"AHI Score: {ahi_score:.2f} events/hour")
            
            return float(ahi_score)
        except Exception as e:
            print(f"✗ Error calculating AHI score: {str(e)}")
            raise

    def diagnose_osa(self, ahi_score: float) -> Dict:
        """
        Generate OSA (Obstructive Sleep Apnea) diagnosis based on AHI score.
        
        AHI Classification:
        - Normal: AHI < 5
        - Mild: 5 ≤ AHI < 15
        - Moderate: 15 ≤ AHI < 30
        - Severe: AHI ≥ 30
        
        Args:
            ahi_score: Calculated AHI index
            
        Returns:
            Diagnosis dictionary with severity and recommendations
        """
        if ahi_score < self.ahi_thresholds['normal']:
            severity = 'NORMAL'
            status = 'No OSA Detected'
            recommendation = 'Continue regular monitoring. Maintain healthy sleep habits.'
        
        elif ahi_score < self.ahi_thresholds['mild']:
            severity = 'MILD'
            status = 'Mild Obstructive Sleep Apnea'
            recommendation = 'Lifestyle modifications recommended (weight loss, positional therapy, nasal dilators). Schedule follow-up evaluation.'
        
        elif ahi_score < self.ahi_thresholds['moderate']:
            severity = 'MODERATE'
            status = 'Moderate Obstructive Sleep Apnea'
            recommendation = 'CPAP/BiPAP therapy strongly recommended. Consult with sleep specialist for treatment options.'
        
        else:
            severity = 'SEVERE'
            status = 'Severe Obstructive Sleep Apnea'
            recommendation = 'URGENT: Immediate treatment required. CPAP/BiPAP therapy essential. Consult sleep specialist immediately.'
        
        diagnosis = {
            'severity': severity,
            'ahi_range': f"{ahi_score:.1f}",
            'status': status,
            'recommendation': recommendation
        }
        
        return diagnosis

    def infer(
        self,
        ecg_data: Union[str, np.ndarray, list],
        spo2_data: Union[str, np.ndarray, list],
        ensemble_method: str = 'weighted_average'
    ) -> Dict:
        """
        Complete inference pipeline: load, preprocess, predict, ensemble, and diagnose.
        
        Args:
            ecg_data: ECG data (file path, array, or list)
            spo2_data: SpO2 data (file path, array, or list)
            ensemble_method: Method to combine predictions
            
        Returns:
            Complete inference result with AHI score and diagnosis
        """
        print("\n" + "="*70)
        print("MULTIMODAL SLEEP APNEA DETECTION - INFERENCE")
        print("="*70 + "\n")
        
        try:
            # Step 1: Load data
            print("[STEP 1/6] Loading signals...")
            print("-" * 70)
            if isinstance(ecg_data, str):
                ecg_signal = self.load_ecg_data(ecg_data)
            else:
                ecg_signal = np.array(ecg_data).flatten()
            
            if isinstance(spo2_data, str):
                spo2_signal = self.load_spo2_data(spo2_data)
            else:
                spo2_signal = np.array(spo2_data).flatten()
            
            # Step 2: Preprocess signals
            print("\n[STEP 2/6] Preprocessing ECG signal...")
            print("-" * 70)
            ecg_processed = self.preprocess_ecg(ecg_signal)
            
            print("\n[STEP 3/6] Preprocessing SpO2 signal...")
            print("-" * 70)
            spo2_processed = self.preprocess_spo2(spo2_signal)
            
            # Step 4: Generate predictions
            print("\n[STEP 4/6] ECG model inference...")
            print("-" * 70)
            ecg_predictions = self.predict_ecg(ecg_processed)
            
            print("\n[STEP 5/6] SpO2 model inference...")
            print("-" * 70)
            spo2_predictions = self.predict_spo2(spo2_processed)
            
            # Step 5: Ensemble predictions
            print("\n[STEP 5.5/6] Ensemble predictions...")
            print("-" * 70)
            ensemble_pred, ensemble_stats = self.ensemble_predictions(
                ecg_predictions,
                spo2_predictions,
                method=ensemble_method
            )
            
            # Step 6: Calculate AHI and diagnose
            print("\n[STEP 6/6] Calculating AHI score and diagnosis...")
            print("-" * 70)
            ahi_score = self.calculate_ahi_score(ensemble_pred)
            diagnosis = self.diagnose_osa(ahi_score)
            
            # Compile results
            result = {
                'ahi_score': ahi_score,
                'diagnosis': diagnosis,
                'ensemble_stats': ensemble_stats,
                'raw_predictions': {
                    'ecg_mean': float(np.mean(ecg_predictions)),
                    'spo2_mean': float(np.mean(spo2_predictions)),
                    'ensemble_mean': float(np.mean(ensemble_pred))
                }
            }
            
            self._print_diagnosis(result)
            return result
            
        except Exception as e:
            print(f"\n✗ Inference failed: {str(e)}")
            return {'status': 'error', 'message': str(e)}

    def _print_diagnosis(self, result: Dict):
        """Print formatted diagnosis report."""
        diagnosis = result['diagnosis']
        
        print("\n" + "="*70)
        print("FINAL DIAGNOSIS REPORT")
        print("="*70)
        print(f"\n  AHI Score:         {result['ahi_score']:.2f} events/hour")
        print(f"  Severity:          {diagnosis['severity']}")
        print(f"  Status:            {diagnosis['status']}")
        print(f"\n  Recommendation:")
        for line in diagnosis['recommendation'].split('. '):
            if line.strip():
                print(f"    • {line.strip()}")
        print("\n" + "="*70 + "\n")


def create_synthetic_data(
    ecg_duration: int = 60,
    ecg_fs: int = 100,
    spo2_duration: int = 60,
    spo2_fs: int = 1,
    has_apnea: bool = True
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic ECG and SpO2 data for testing.
    
    Args:
        ecg_duration: ECG duration in seconds
        ecg_fs: ECG sampling frequency (Hz)
        spo2_duration: SpO2 duration in seconds
        spo2_fs: SpO2 sampling frequency (Hz)
        has_apnea: Whether to include apnea-like patterns
        
    Returns:
        Tuple of (ECG data, SpO2 data)
    """
    # ECG signal
    t_ecg = np.linspace(0, ecg_duration, ecg_fs * ecg_duration)
    
    # Normal heart rate: 1 Hz, with variations
    hr_signal = 70 + 10 * np.sin(2 * np.pi * 0.1 * t_ecg)
    ecg_signal = (
        0.5 * np.sin(2 * np.pi * (hr_signal / 60) * t_ecg) +  # Heart rate
        0.2 * np.sin(2 * np.pi * 2.5 * t_ecg) +  # High frequency
        np.random.normal(0, 0.05, len(t_ecg))  # Noise
    )
    
    if has_apnea:
        # Add apnea-like pattern: heart rate drops periodically
        apnea_indices = np.where((t_ecg > 10) & (t_ecg < 30))[0]
        ecg_signal[apnea_indices] *= 0.6
    
    # SpO2 signal
    t_spo2 = np.linspace(0, spo2_duration, spo2_fs * spo2_duration)
    
    if has_apnea:
        # Normal SpO2 with periodic drops (dips) during apnea
        spo2_signal = (
            98 - 0.5 * np.sin(2 * np.pi * 0.05 * t_spo2) +
            3 * np.sin(2 * np.pi * 0.01 * t_spo2) * np.sin(2 * np.pi * 0.05 * t_spo2)
        )
    else:
        # Normal SpO2 without significant dips
        spo2_signal = (
            98 - 0.3 * np.sin(2 * np.pi * 0.05 * t_spo2) +
            np.random.normal(0, 0.3, len(t_spo2))
        )
    
    spo2_signal = np.clip(spo2_signal, 90, 100)
    
    return ecg_signal, spo2_signal


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    """
    Example usage of the sleep apnea inference system.
    This demonstrates how to use the standalone inference script.
    """
    
    print("\n" + "="*70)
    print("SLEEP APNEA MULTIMODAL INFERENCE - STANDALONE SCRIPT")
    print("="*70 + "\n")
    
    # ========================================================================
    # CONFIGURATION
    # ========================================================================
    
    # Path to pre-trained model weights
    ECG_MODEL_PATH = "best_weights_ecg_32layer.hdf5"
    SPO2_MODEL_PATH = "best_weights_spo2_model.hdf5"
    
    # Ensemble configuration
    ECG_WEIGHT = 0.5
    SPO2_WEIGHT = 0.5
    ENSEMBLE_METHOD = 'weighted_average'  # Options: 'weighted_average', 'max', 'min', 'majority_vote'
    
    # ========================================================================
    # INITIALIZATION
    # ========================================================================
    
    try:
        # Initialize inference engine
        inference = SleepApneaInference(
            ecg_model_path=ECG_MODEL_PATH,
            spo2_model_path=SPO2_MODEL_PATH,
            ecg_weight=ECG_WEIGHT,
            spo2_weight=SPO2_WEIGHT
        )
        
        # ====================================================================
        # OPTION 1: TEST WITH SYNTHETIC DATA
        # ====================================================================
        
        print("\n[EXAMPLE 1] Testing with SYNTHETIC data...")
        print("-" * 70)
        
        # Generate synthetic data with apnea
        print("\nGenerating synthetic ECG and SpO2 data with apnea patterns...")
        ecg_synthetic, spo2_synthetic = create_synthetic_data(has_apnea=True)
        
        print(f"  ECG shape: {ecg_synthetic.shape}")
        print(f"  SpO2 shape: {spo2_synthetic.shape}")
        
        # Save synthetic data for testing
        np.save('synthetic_ecg.npy', ecg_synthetic)
        np.save('synthetic_spo2.npy', spo2_synthetic)
        pd.DataFrame(ecg_synthetic, columns=['ECG']).to_csv('synthetic_ecg.csv', index=False)
        pd.DataFrame(spo2_synthetic, columns=['SpO2']).to_csv('synthetic_spo2.csv', index=False)
        
        print("  ✓ Synthetic data saved:")
        print("    - synthetic_ecg.npy")
        print("    - synthetic_spo2.npy")
        print("    - synthetic_ecg.csv")
        print("    - synthetic_spo2.csv")
        
        # Run inference with synthetic data
        print("\nRunning inference on synthetic data...")
        result_synthetic = inference.infer(
            ecg_data=ecg_synthetic,
            spo2_data=spo2_synthetic,
            ensemble_method=ENSEMBLE_METHOD
        )
        
        print("\nResult (Synthetic):")
        print(json.dumps({
            'ahi_score': result_synthetic['ahi_score'],
            'severity': result_synthetic['diagnosis']['severity'],
            'status': result_synthetic['diagnosis']['status']
        }, indent=2))
        
        # ====================================================================
        # OPTION 2: TEST WITH SYNTHETIC DATA WITHOUT APNEA
        # ====================================================================
        
        print("\n" + "="*70)
        print("[EXAMPLE 2] Testing with SYNTHETIC data (NO APNEA)...")
        print("-" * 70)
        
        # Generate synthetic data without apnea
        ecg_normal, spo2_normal = create_synthetic_data(has_apnea=False)
        
        # Run inference
        result_normal = inference.infer(
            ecg_data=ecg_normal,
            spo2_data=spo2_normal,
            ensemble_method=ENSEMBLE_METHOD
        )
        
        print("\nResult (Normal):")
        print(json.dumps({
            'ahi_score': result_normal['ahi_score'],
            'severity': result_normal['diagnosis']['severity'],
            'status': result_normal['diagnosis']['status']
        }, indent=2))
        
        # ====================================================================
        # OPTION 3: LOAD FROM FILES (if they exist)
        # ====================================================================
        
        print("\n" + "="*70)
        print("[EXAMPLE 3] Loading from files (if available)...")
        print("-" * 70)
        
        # You can uncomment these to test with your own data files
        # result_file = inference.infer(
        #     ecg_data="path/to/ecg_data.csv",
        #     spo2_data="path/to/spo2_data.csv",
        #     ensemble_method=ENSEMBLE_METHOD
        # )
        
        print("\nTo use with your own data files, call:")
        print("  result = inference.infer(")
        print("      ecg_data='your_ecg_file.csv',")
        print("      spo2_data='your_spo2_file.csv',")
        print("      ensemble_method='weighted_average'")
        print("  )")
        
        # ====================================================================
        # COMPARISON & SUMMARY
        # ====================================================================
        
        print("\n" + "="*70)
        print("SUMMARY & COMPARISON")
        print("="*70)
        
        print("\nWith Apnea:")
        print(f"  AHI: {result_synthetic['ahi_score']:.2f}")
        print(f"  Severity: {result_synthetic['diagnosis']['severity']}")
        
        print("\nWithout Apnea:")
        print(f"  AHI: {result_normal['ahi_score']:.2f}")
        print(f"  Severity: {result_normal['diagnosis']['severity']}")
        
        print("\nEnsemble Configuration:")
        print(f"  ECG weight: {inference.ecg_weight:.2f}")
        print(f"  SpO2 weight: {inference.spo2_weight:.2f}")
        print(f"  Ensemble method: {ENSEMBLE_METHOD}")
        
        print("\n" + "="*70)
        print("✓ Inference completed successfully!")
        print("="*70 + "\n")
    
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        print("\nMake sure the model files exist:")
        print(f"  - {ECG_MODEL_PATH}")
        print(f"  - {SPO2_MODEL_PATH}")