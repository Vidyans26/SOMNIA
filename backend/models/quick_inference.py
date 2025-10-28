"""
Quick-start inference script for sleep apnea detection.
Minimal example showing basic usage.
"""

import numpy as np
from sleep_apnea_inference import SleepApneaInference, create_synthetic_data
import json


def main():
    """Quick inference example."""
    
    print("\n=== SLEEP APNEA QUICK INFERENCE ===\n")
    
    # Initialize with pre-trained models
    inference = SleepApneaInference(
        ecg_model_path="best_weights_ecg_32layer.hdf5",
        spo2_model_path="best_weights_spo2_model.hdf5",
        ecg_weight=0.5,
        spo2_weight=0.5
    )
    
    # Create sample data (or use your own files)
    print("Generating test data with apnea patterns...\n")
    ecg_data, spo2_data = create_synthetic_data(has_apnea=True)
    
    # Run inference
    result = inference.infer(
        ecg_data=ecg_data,
        spo2_data=spo2_data,
        ensemble_method='weighted_average'
    )
    
    # Print results
    print("\n=== RESULTS ===\n")
    print(json.dumps({
        'AHI_Score': round(result['ahi_score'], 2),
        'Severity': result['diagnosis']['severity'],
        'Status': result['diagnosis']['status'],
        'Recommendation': result['diagnosis']['recommendation']
    }, indent=2))


if __name__ == "__main__":
    main()