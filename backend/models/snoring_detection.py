"""
Snoring Detection Module
Based on https://github.com/adrianagaler/Snoring-Detection
Integrated into SOMNIA Sleep Health Monitoring System

This module provides audio preprocessing and feature extraction for snoring detection
using MFCC (Mel Frequency Cepstral Coefficients) analysis.
"""

import numpy as np
from scipy.fftpack import dct
import scipy.io.wavfile as wav
from typing import Tuple, Optional

try:
    from speechpy import processing
except ImportError:
    # Fallback if speechpy is not available
    processing = None


def hz2mel(hz):
    """
    Convert a value in Hertz to Mels
    
    Args:
        hz: a value in Hz. This can also be a numpy array
        
    Returns:
        a value in Mels
    """
    return 2595 * np.log10(1 + hz / 700.)


def mel2hz(mel):
    """
    Convert a value in Mels to Hertz
    
    Args:
        mel: a value in Mels. This can also be a numpy array
        
    Returns:
        a value in Hertz
    """
    return 700 * (10 ** (mel / 2595.0) - 1)


def mel(n):
    """Alternative mel conversion formula"""
    return 1125 * np.log(1 + float(n) / 700)


def meli(n):
    """Inverse mel conversion"""
    return 700 * (np.exp(float(n) / 1125) - 1)


def createbankpoints(l, h, nfilt):
    """
    Create mel filterbank points
    
    Args:
        l: lower frequency
        h: higher frequency
        nfilt: number of filters
        
    Returns:
        Tuple of mel points and normal frequency points
    """
    n = nfilt - 1
    step = (h - l) / n
    outmel = np.zeros(n + 1)
    outnormal = np.zeros(n + 1)
    done = False
    i = 0
    val = l
    while not done:
        if i > n - 1:
            done = True
        outmel[i] = val
        outnormal[i] = meli(val)
        val += step
        i += 1
    
    return outmel, outnormal


def custom_filterbanks(nfilt=10, nfft=512, samplerate=16000, lowfreq=0, highfreq=None):
    """
    Create custom Mel filterbanks as described in the Khan paper
    
    The first 10 filters are placed linearly around 100, 200, ..., 1000 Hz.
    Above 1 kHz, these bands are placed with logarithmic Mel-scale
    
    Args:
        nfilt: number of filters in the filterbank
        nfft: the FFT size
        samplerate: the sample rate of the signal
        lowfreq: lowest band edge of mel filters
        highfreq: highest band edge of mel filters
        
    Returns:
        A numpy array containing filterbank
    """
    nfft = 512
    remn = 257
    
    bankpointsnormal = np.array([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])
    bankpoints = np.array(list(map(mel, bankpointsnormal)))
    highfreq = highfreq or samplerate / 2
    lowerfreq = mel(lowfreq)
    highfreq = mel(highfreq)
    if lowfreq != 100:
        bankpoints, bankpointsnormal = createbankpoints(lowerfreq, highfreq, nfilt)
    
    bins = np.array([])
    for i in bankpointsnormal:
        bins = np.append(bins, np.floor((nfft + 1) * float(i) / samplerate))
    flbank = np.zeros((remn, len(bins)))
    for i in range(1, len(bins) - 1):
        for j in range(1, remn - 1):
            if j < bins[i - 1]:
                flbank[j][i] = 0
            elif bins[i - 1] <= j <= bins[i]:
                flbank[j][i] = float(j - bins[i - 1]) / (bins[i] - bins[i - 1])
            elif bins[i] <= j <= bins[i + 1]:
                flbank[j][i] = float(bins[i + 1] - j) / (bins[i + 1] - bins[i])
            else:
                flbank[j][i] = 0
    return flbank


def power_spectrum(frames, fft_points=512):
    """
    Compute power spectrum of frames
    
    Args:
        frames: signal frames
        fft_points: number of FFT points
        
    Returns:
        Power spectrum array
    """
    # Compute FFT
    mag_frames = np.absolute(np.fft.rfft(frames, fft_points))
    # Power spectrum
    pow_frames = ((1.0 / fft_points) * (mag_frames ** 2))
    return pow_frames


def stack_frames(signal, sampling_frequency, frame_length=0.030, frame_stride=0.030, zero_padding=False):
    """
    Stack frames from signal
    
    Args:
        signal: audio signal
        sampling_frequency: sample rate
        frame_length: length of each frame in seconds
        frame_stride: stride between frames in seconds
        zero_padding: whether to add zero padding
        
    Returns:
        Stacked frames array
    """
    frame_length_samples = int(round(frame_length * sampling_frequency))
    frame_stride_samples = int(round(frame_stride * sampling_frequency))
    signal_length = len(signal)
    
    # Calculate number of frames
    if signal_length <= frame_length_samples:
        num_frames = 1
    else:
        num_frames = 1 + int(np.ceil((signal_length - frame_length_samples) / frame_stride_samples))
    
    # Pad signal if necessary
    pad_signal_length = (num_frames - 1) * frame_stride_samples + frame_length_samples
    if pad_signal_length > signal_length:
        if zero_padding:
            pad_signal = np.append(signal, np.zeros(pad_signal_length - signal_length))
        else:
            pad_signal = signal
            num_frames = int(np.floor((signal_length - frame_length_samples) / frame_stride_samples)) + 1
    else:
        pad_signal = signal
    
    # Create frames
    indices = np.tile(np.arange(0, frame_length_samples), (num_frames, 1)) + \
              np.tile(np.arange(0, num_frames * frame_stride_samples, frame_stride_samples),
                      (frame_length_samples, 1)).T
    indices = indices.astype(np.int32, copy=False)
    
    # Ensure indices don't exceed signal length
    indices = np.minimum(indices, len(pad_signal) - 1)
    frames = pad_signal[indices]
    
    return frames


def apply_mfcc(fs, signal):
    """
    Apply MFCC feature extraction to audio signal
    
    Following the Khan paper approach:
    - 32 frames of 30ms each
    - 512 FFT points
    - 10 linear filters (100-1000 Hz) + 22 log-scale filters (1100 Hz - Nyquist)
    - 32 cepstral coefficients
    - Results in 32x32 feature matrix
    
    Args:
        fs: sampling frequency (should be 16000 Hz)
        signal: audio signal array
        
    Returns:
        32x32 MFCC feature matrix
    """
    # Pre-emphasis to amplify high frequencies
    if processing is not None:
        signal = processing.preemphasis(signal, cof=0.98)
    else:
        # Simple pre-emphasis filter if speechpy not available
        emphasized_signal = np.append(signal[0], signal[1:] - 0.98 * signal[:-1])
        signal = emphasized_signal
    
    # Stacking frames - 30ms frame size, 30ms stride
    frames = stack_frames(signal, sampling_frequency=fs,
                         frame_length=0.030,
                         frame_stride=0.030,
                         zero_padding=False)
    
    # Extracting power spectrum
    pow_spectrum = power_spectrum(frames, fft_points=512)
    
    # Mel filterbanks Calculation
    # First 10 filters are placed linearly around 100, 200, ..., 1000 Hz
    # Above 1 kHz, these bands are placed with logarithmic Mel-scale
    first_10_filterbanks = custom_filterbanks(nfilt=10, nfft=512, samplerate=fs,
                                             lowfreq=100, highfreq=1000)
    last22_filterbanks = custom_filterbanks(nfilt=22, nfft=512, samplerate=fs,
                                           lowfreq=1100, highfreq=None)
    
    mel_matrix = np.concatenate((first_10_filterbanks, last22_filterbanks), axis=1)
    mel_matrix = np.transpose(mel_matrix)
    
    # Ensure dimensions match
    assert len(mel_matrix) == 32
    assert len(mel_matrix[0]) == len(pow_spectrum[0])
    
    # Compute filterbank energies
    energy = np.sum(pow_spectrum, 1)
    energy = np.where(energy == 0, np.finfo(float).eps, energy)
    
    features = np.dot(pow_spectrum, mel_matrix.T)
    features = np.where(features == 0, np.finfo(float).eps, features)
    log_features = np.log(features)
    
    # DCT to get cepstral coefficients
    numcep = 32
    dct_log_features = dct(log_features, type=2, axis=1)[:, :numcep]
    
    # Ensure we have 32x32 output
    if dct_log_features.shape[0] < 32:
        # Pad with zeros if we have fewer than 32 frames
        padding = np.zeros((32 - dct_log_features.shape[0], 32))
        dct_log_features = np.vstack([dct_log_features, padding])
    elif dct_log_features.shape[0] > 32:
        # Truncate if we have more than 32 frames
        dct_log_features = dct_log_features[:32, :]
    
    assert dct_log_features.shape == (32, 32)
    
    return dct_log_features


def preprocess_audio_file(filepath, target_sample_rate=16000):
    """
    Preprocess an audio file for snoring detection
    
    Args:
        filepath: path to WAV file
        target_sample_rate: target sample rate (default 16000 Hz)
        
    Returns:
        Tuple of (sample_rate, signal_array)
    """
    fs, signal = wav.read(filepath)
    
    # Handle stereo audio - convert to mono
    if signal.ndim != 1:
        signal = signal[:, 0]
    
    # Resample if necessary (simple approach - for production use librosa)
    if fs != target_sample_rate:
        # Note: This is a simplified resampling. For better quality, use librosa.resample
        duration = len(signal) / fs
        new_length = int(duration * target_sample_rate)
        signal = np.interp(
            np.linspace(0, len(signal), new_length),
            np.arange(len(signal)),
            signal
        )
        fs = target_sample_rate
    
    return fs, signal


def extract_snoring_features(audio_path: str) -> Optional[np.ndarray]:
    """
    Extract MFCC features from audio file for snoring detection
    
    Args:
        audio_path: path to audio file
        
    Returns:
        32x32 MFCC feature matrix or None if processing fails
    """
    try:
        fs, signal = preprocess_audio_file(audio_path)
        features = apply_mfcc(fs, signal)
        return features
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None


def detect_snoring_from_features(features: np.ndarray) -> dict:
    """
    Detect snoring from extracted MFCC features
    
    This is a placeholder for the actual model inference.
    In production, this would load a trained TensorFlow/TFLite model
    and perform inference on the features.
    
    Args:
        features: 32x32 MFCC feature matrix
        
    Returns:
        Dictionary with snoring detection results
    """
    # Placeholder implementation
    # In production, this would use the trained model from the Snoring-Detection repo
    
    # Mock detection based on feature statistics
    feature_energy = np.mean(np.abs(features))
    feature_variance = np.var(features)
    
    # Simple heuristic (to be replaced with actual model)
    snoring_probability = min(1.0, max(0.0, (feature_energy - 5) / 10))
    
    return {
        "snoring_detected": snoring_probability > 0.5,
        "snoring_probability": float(snoring_probability),
        "confidence": float(min(1.0, feature_variance / 100)),
        "feature_quality": "good" if not np.isnan(features).any() else "poor"
    }


def analyze_snoring(audio_path: str) -> dict:
    """
    Complete snoring analysis pipeline
    
    Args:
        audio_path: path to audio file
        
    Returns:
        Dictionary with complete snoring analysis results
    """
    # Extract features
    features = extract_snoring_features(audio_path)
    
    if features is None:
        return {
            "success": False,
            "error": "Failed to extract features from audio"
        }
    
    # Detect snoring
    detection_result = detect_snoring_from_features(features)
    
    return {
        "success": True,
        "snoring_detected": detection_result["snoring_detected"],
        "snoring_probability": detection_result["snoring_probability"],
        "confidence": detection_result["confidence"],
        "feature_shape": features.shape,
        "feature_quality": detection_result["feature_quality"]
    }
