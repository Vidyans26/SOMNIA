"""
Comprehensive guide showing all ways to use the sleep apnea inference script.
"""

import numpy as np
import pandas as pd
from sleep_apnea_inference import SleepApneaInference, create_synthetic_data
import json


# =============================================================================
# INITIALIZATION
# =============================================================================

def initialize_inference():
    """Initialize the inference engine."""
    inference = SleepApneaInference(
        ecg_model_path="best_weights_ecg_32layer.hdf5",
        spo2_model_path="best_weights_spo2_model.hdf5",
        ecg_weight=0.5,  # ECG contribution to ensemble
        spo2_weight=0.5   # SpO2 contribution to ensemble
    )
    return inference


# =============================================================================
# METHOD 1: Use NumPy Arrays Directly
# =============================================================================

def method1_numpy_arrays():
    """Run inference with NumPy arrays."""
    print("\n" + "="*70)
    print("METHOD 1: NumPy Arrays")
    print("="*70 + "\n")
    
    inference = initialize_inference()
    
    # Create or load your data
    ecg_data = np.random.randn(6000)  # Your ECG samples
    spo2_data = np.random.randn(60)   # Your SpO2 samples
    
    # Run inference
    result = inference.infer(ecg_data, spo2_data)
    
    print(f"AHI Score: {result['ahi_score']:.2f}")
    print(f"Diagnosis: {result['diagnosis']['severity']}")
    
    return result


# =============================================================================
# METHOD 2: Use Python Lists
# =============================================================================

def method2_python_lists():
    """Run inference with Python lists."""
    print("\n" + "="*70)
    print("METHOD 2: Python Lists")
    print("="*70 + "\n")
    
    inference = initialize_inference()
    
    # Create data as lists
    ecg_data = [float(x) for x in np.random.randn(6000)]
    spo2_data = [float(x) for x in np.random.randn(60)]
    
    # Run inference
    result = inference.infer(ecg_data, spo2_data)
    
    print(f"AHI Score: {result['ahi_score']:.2f}")
    print(f"Diagnosis: {result['diagnosis']['severity']}")
    
    return result


# =============================================================================
# METHOD 3: Load from CSV Files
# =============================================================================

def method3_csv_files():
    """Run inference with CSV files."""
    print("\n" + "="*70)
    print("METHOD 3: CSV Files")
    print("="*70 + "\n")
    
    # Create sample CSV files
    print("Creating sample CSV files...")
    ecg_data = np.random.randn(6000)
    spo2_data = np.random.randn(60)
    
    pd.DataFrame(ecg_data, columns=['ECG']).to_csv('ecg_test.csv', index=False)
    pd.DataFrame(spo2_data, columns=['SpO2']).to_csv('spo2_test.csv', index=False)
    
    # Initialize and run inference
    inference = initialize_inference()
    result = inference.infer('ecg_test.csv', 'spo2_test.csv')
    
    print(f"AHI Score: {result['ahi_score']:.2f}")
    print(f"Diagnosis: {result['diagnosis']['severity']}")
    
    return result


# =============================================================================
# METHOD 4: Load from NPY Files
# =============================================================================

def method4_npy_files():
    """Run inference with NPY files."""
    print("\n" + "="*70)
    print("METHOD 4: NPY Files")
    print("="*70 + "\n")
    
    # Create sample NPY files
    print("Creating sample NPY files...")
    ecg_data = np.random.randn(6000)
    spo2_data = np.random.randn(60)
    
    np.save('ecg_test.npy', ecg_data)
    np.save('spo2_test.npy', spo2_data)
    
    # Initialize and run inference
    inference = initialize_inference()
    result = inference.infer('ecg_test.npy', 'spo2_test.npy')
    
    print(f"AHI Score: {result['ahi_score']:.2f}")
    print(f"Diagnosis: {result['diagnosis']['severity']}")
    
    return result


# =============================================================================
# METHOD 5: Step-by-Step Control
# =============================================================================

def method5_step_by_step():
    """Run inference with full step-by-step control."""
    print("\n" + "="*70)
    print("METHOD 5: Step-by-Step Control")
    print("="*70 + "\n")
    
    inference = initialize_inference()
    
    # Step 1: Load data
    print("Step 1: Loading data...")
    ecg_data = np.random.randn(6000)
    spo2_data = np.random.randn(60)
    
    # Step 2: Preprocess
    print("Step 2: Preprocessing...")
    ecg_processed = inference.preprocess_ecg(ecg_data)
    spo2_processed = inference.preprocess_spo2(spo2_data)
    
    # Step 3: Predict
    print("Step 3: Predicting...")
    ecg_pred = inference.predict_ecg(ecg_processed)
    spo2_pred = inference.predict_spo2(spo2_processed)
    
    # Step 4: Ensemble
    print("Step 4: Ensembling predictions...")
    ensemble_pred, stats = inference.ensemble_predictions(
        ecg_pred, spo2_pred, method='weighted_average'
    )
    
    # Step 5: Calculate AHI
    print("Step 5: Calculating AHI score...")
    ahi_score = inference.calculate_ahi_score(ensemble_pred)
    
    # Step 6: Diagnose
    print("Step 6: Generating diagnosis...")
    diagnosis = inference.diagnose_osa(ahi_score)
    
    print(f"\nFinal AHI Score: {ahi_score:.2f}")
    print(f"Diagnosis: {diagnosis['severity']}")
    
    return {
        'ahi_score': ahi_score,
        'diagnosis': diagnosis,
        'stats': stats
    }


# =============================================================================
# METHOD 6: Different Ensemble Methods
# =============================================================================

def method6_ensemble_methods():
    """Compare different ensemble methods."""
    print("\n" + "="*70)
    print("METHOD 6: Different Ensemble Methods")
    print("="*70 + "\n")
    
    inference = initialize_inference()
    
    # Generate test data
    ecg_data, spo2_data = create_synthetic_data(has_apnea=True)
    
    methods = ['weighted_average', 'max', 'min', 'majority_vote']
    results = {}
    
    for method in methods:
        print(f"\nTesting ensemble method: {method}")
        print("-" * 70)
        result = inference.infer(ecg_data, spo2_data, ensemble_method=method)
        results[method] = {
            'ahi_score': result['ahi_score'],
            'severity': result['diagnosis']['severity']
        }
    
    print("\n" + "="*70)
    print("COMPARISON OF ENSEMBLE METHODS")
    print("="*70)
    for method, result in results.items():
        print(f"\n{method}:")
        print(f"  AHI: {result['ahi_score']:.2f}")
        print(f"  Severity: {result['severity']}")
    
    return results


# =============================================================================
# METHOD 7: Custom Data with Specific Characteristics
# =============================================================================

def method7_custom_data():
    """Run inference with custom data."""
    print("\n" + "="*70)
    print("METHOD 7: Custom Data")
    print("="*70 + "\n")
    
    inference = initialize_inference()
    
    # Example: Patient with moderate apnea
    print("Creating custom data for patient with moderate apnea...")
    
    # ECG: 100 Hz, 10 minutes
    ecg_duration = 10 * 60  # 10 minutes in seconds
    fs_ecg = 100
    t = np.arange(0, ecg_duration, 1/fs_ecg)
    
    # Normal heart rate with apnea episodes
    ecg_data = (
        0.5 * np.sin(2 * np.pi * 1.2 * t) +  # Heart rate
        0.1 * np.random.randn(len(t))  # Noise
    )
    
    # Reduce ECG during apnea episodes (5-7 min, 11-13 min)
    ecg_data[(t > 300) & (t < 420)] *= 0.5
    ecg_data[(t > 660) & (t < 780)] *= 0.5
    
    # SpO2: 1 Hz, 10 minutes
    spo2_duration = 10 * 60
    fs_spo2 = 1
    t_spo2 = np.arange(0, spo2_duration, 1/fs_spo2)
    
    spo2_data = (
        98 - 0.1 * np.sin(2 * np.pi * 0.05 * t_spo2)  # Slow variation
    )
    
    # SpO2 drops during apnea
    spo2_data[(t_spo2 > 300) & (t_spo2 < 420)] -= 3
    spo2_data[(t_spo2 > 660) & (t_spo2 < 780)] -= 2
    
    spo2_data = np.clip(spo2_data, 90, 100)
    
    # Run inference
    result = inference.infer(ecg_data, spo2_data)
    
    print(f"AHI Score: {result['ahi_score']:.2f}")
    print(f"Expected Diagnosis: MODERATE")
    print(f"Actual Diagnosis: {result['diagnosis']['severity']}")
    
    return result


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("SLEEP APNEA INFERENCE - USAGE GUIDE")
    print("="*70)
    
    print("\nThis script demonstrates 7 different methods to use the inference system.")
    print("Uncomment the methods you want to try.\n")
    
    # Try all methods
    try:
        # method1_numpy_arrays()
        # method2_python_lists()
        # method3_csv_files()
        # method4_npy_files()
        # method5_step_by_step()
        # method6_ensemble_methods()
        # method7_custom_data()
        
        print("\nTo use these methods, uncomment them in the __main__ section.")
        print("\nExample usage:")
        print("  from sleep_apnea_inference import SleepApneaInference")
        print("  ")
        print("  inference = SleepApneaInference(")
        print("      ecg_model_path='best_weights_ecg_32layer.hdf5',")
        print("      spo2_model_path='best_weights_spo2_model.hdf5'")
        print("  )")
        print("  ")
        print("  result = inference.infer(ecg_data, spo2_data)")
        print("  print(f\"AHI: {result['ahi_score']:.2f}\")")
        print("  print(f\"Severity: {result['diagnosis']['severity']}\")")
        
    except Exception as e:
        print(f"\nError: {str(e)}")