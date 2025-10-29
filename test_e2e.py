"""
SOMNIA E2E Testing Script
Tests complete integration: Mobile App → Backend API → ML Models → UI

This script simulates the mobile app sending data to the backend
and verifies that ML models process it correctly.
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_RESULTS = []

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_result(test_name: str, passed: bool, details: str = ""):
    """Print and record test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = {
        "test": test_name,
        "passed": passed,
        "details": details,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    TEST_RESULTS.append(result)
    print(f"{status} - {test_name}")
    if details:
        print(f"      {details}")

def test_backend_health() -> bool:
    """Test 1: Backend Health Check"""
    print_section("TEST 1: Backend Health Check")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/health", timeout=5)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get("status") == "operational" and
            "SOMNIA" in data.get("service", "")
        )
        
        print_result(
            "Backend Health Endpoint",
            passed,
            f"Status: {data.get('status')}, Version: {data.get('version')}"
        )
        
        print(f"\n📊 Response:")
        print(json.dumps(data, indent=2))
        
        return passed
    except Exception as e:
        print_result("Backend Health Endpoint", False, f"Error: {str(e)}")
        return False

def test_demo_analysis() -> bool:
    """Test 2: Demo Analysis Endpoint (no ML required)"""
    print_section("TEST 2: Demo Analysis Endpoint")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/demo-analysis", timeout=10)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            "total_sleep_minutes" in data and
            "sleep_efficiency" in data
        )
        
        print_result(
            "Demo Analysis Endpoint",
            passed,
            f"Sleep Efficiency: {data.get('sleep_efficiency')}%"
        )
        
        print(f"\n📊 Key Results:")
        print(f"  Sleep Efficiency: {data.get('sleep_efficiency')}%")
        print(f"  Total Sleep: {data.get('total_sleep_minutes')} minutes")
        print(f"  Apnea Events: {data.get('apnea_events', 'N/A')}")
        
        return passed
    except Exception as e:
        print_result("Demo Analysis Endpoint", False, f"Error: {str(e)}")
        return False

def test_ml_analysis_with_wearable_data() -> bool:
    """Test 3: ML Analysis with Wearable Data (Real ML Models)"""
    print_section("TEST 3: ML Analysis with Wearable Data")
    
    # Generate realistic wearable data (simulating mobile app)
    print("\n📱 Generating wearable data (simulating mobile app)...")
    
    import random
    
    # 6.5 hours of sleep = 390 minutes
    duration = 390
    
    # SpO2 data: 95-99% (normal range, occasional dips for apnea)
    spo2_data = []
    for i in range(duration):
        if random.random() < 0.05:  # 5% chance of dip (apnea event)
            spo2_data.append(round(92 + random.random() * 3, 1))
        else:
            spo2_data.append(round(95 + random.random() * 4, 1))
    
    # Heart rate data: 60-80 bpm (sleeping range)
    heart_rate_data = []
    for i in range(duration):
        heart_rate_data.append(round(60 + random.random() * 20))
    
    print(f"  ✅ Generated {len(spo2_data)} SpO2 readings")
    print(f"  ✅ Generated {len(heart_rate_data)} heart rate readings")
    print(f"  📊 SpO2 range: {min(spo2_data):.1f}% - {max(spo2_data):.1f}%")
    print(f"  💓 HR range: {min(heart_rate_data)} - {max(heart_rate_data)} bpm")
    
    # Prepare request payload
    payload = {
        "duration_hours": 6.5,
        "user_id": "test_user",
        "recording_date": "2025-10-29T00:00:00",
        "audio_path": "test_sleep_recording.wav",
        "wearable_data": {
            "spo2_data": spo2_data,
            "heart_rate_data": heart_rate_data
        }
    }
    
    try:
        print("\n🚀 Sending request to backend...")
        response = requests.post(
            f"{API_BASE_URL}/api/v1/analyze",
            json=payload,
            timeout=30
        )
        
        data = response.json()
        
        # Check for ML-enhanced fields
        has_ml_fields = (
            "sleep_efficiency" in data and
            "sleep_stages" in data and
            "risk_assessment" in data
        )
        
        passed = response.status_code == 200 and has_ml_fields
        
        print_result(
            "ML Analysis with Wearable Data",
            passed,
            f"ML Fields Present: {has_ml_fields}"
        )
        
        if passed:
            print(f"\n📊 ML-Enhanced Analysis Results:")
            print(f"  Sleep Efficiency: {data.get('sleep_efficiency')}%")
            
            if "sleep_stages" in data:
                stages = data["sleep_stages"]
                print(f"  Sleep Stages:")
                print(f"    - Wake: {stages.get('wake_minutes', 'N/A')} min")
                print(f"    - Light: {stages.get('light_sleep_minutes', 'N/A')} min")
                print(f"    - Deep: {stages.get('deep_sleep_minutes', 'N/A')} min")
                print(f"    - REM: {stages.get('rem_sleep_minutes', 'N/A')} min")
            
            if "risk_assessment" in data:
                risk = data["risk_assessment"]
                print(f"  Risk Assessment:")
                print(f"    - Level: {risk.get('level', 'N/A').upper()}")
                print(f"    - Score: {risk.get('score', 'N/A')}")
            
            if "disorders_detected" in data and data["disorders_detected"]:
                print(f"  Disorders Detected:")
                for disorder in data["disorders_detected"]:
                    print(f"    - {disorder}")
            
            if "recommendations" in data and data["recommendations"]:
                print(f"  ML Recommendations:")
                for i, rec in enumerate(data["recommendations"][:3], 1):
                    print(f"    {i}. {rec}")
        
        return passed
        
    except Exception as e:
        print_result(
            "ML Analysis with Wearable Data",
            False,
            f"Error: {str(e)}"
        )
        return False

def test_disorder_endpoint() -> bool:
    """Test 4: Disorders Information Endpoint"""
    print_section("TEST 4: Disorders Information Endpoint")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/disorders", timeout=5)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            isinstance(data, list) and
            len(data) > 0
        )
        
        print_result(
            "Disorders Endpoint",
            passed,
            f"Found {len(data)} disorder definitions"
        )
        
        if passed and len(data) > 0:
            print(f"\n📋 Available Disorders:")
            for disorder in data[:3]:  # Show first 3
                print(f"  - {disorder.get('name', 'Unknown')}")
        
        return passed
    except Exception as e:
        print_result("Disorders Endpoint", False, f"Error: {str(e)}")
        return False

def test_api_documentation() -> bool:
    """Test 5: API Documentation Available"""
    print_section("TEST 5: API Documentation (Swagger UI)")
    try:
        response = requests.get(f"{API_BASE_URL}/docs", timeout=5)
        
        passed = response.status_code == 200
        
        print_result(
            "Swagger API Documentation",
            passed,
            f"Available at: {API_BASE_URL}/docs"
        )
        
        return passed
    except Exception as e:
        print_result("Swagger API Documentation", False, f"Error: {str(e)}")
        return False

def generate_summary_report():
    """Generate final test summary"""
    print_section("TEST SUMMARY REPORT")
    
    total_tests = len(TEST_RESULTS)
    passed_tests = sum(1 for r in TEST_RESULTS if r["passed"])
    failed_tests = total_tests - passed_tests
    
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n📊 Results:")
    print(f"  Total Tests: {total_tests}")
    print(f"  Passed: ✅ {passed_tests}")
    print(f"  Failed: ❌ {failed_tests}")
    print(f"  Success Rate: {success_rate:.1f}%")
    
    print(f"\n📋 Detailed Results:")
    for i, result in enumerate(TEST_RESULTS, 1):
        status = "✅" if result["passed"] else "❌"
        print(f"  {i}. {status} {result['test']}")
        if result["details"]:
            print(f"      {result['details']}")
    
    # Overall status
    print(f"\n{'=' * 70}")
    if success_rate == 100:
        print("  🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL!")
    elif success_rate >= 80:
        print("  ✅ MOST TESTS PASSED - SYSTEM OPERATIONAL WITH MINOR ISSUES")
    elif success_rate >= 50:
        print("  ⚠️  SOME TESTS FAILED - SYSTEM PARTIALLY OPERATIONAL")
    else:
        print("  ❌ MANY TESTS FAILED - SYSTEM NEEDS ATTENTION")
    print("=" * 70)
    
    # Save results to file
    try:
        with open("e2e_test_results.json", "w") as f:
            json.dump({
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": success_rate,
                "results": TEST_RESULTS
            }, f, indent=2)
        print(f"\n💾 Results saved to: e2e_test_results.json")
    except Exception as e:
        print(f"\n⚠️  Could not save results: {e}")

def main():
    """Run all E2E tests"""
    print("\n" + "=" * 70)
    print("  🧪 SOMNIA E2E INTEGRATION TESTING")
    print("  Testing: Mobile App → Backend API → ML Models → Results")
    print("=" * 70)
    
    print(f"\n🎯 Target: {API_BASE_URL}")
    print(f"⏰ Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    tests = [
        test_backend_health,
        test_demo_analysis,
        test_ml_analysis_with_wearable_data,
        test_disorder_endpoint,
        test_api_documentation,
    ]
    
    for test_func in tests:
        try:
            test_func()
            time.sleep(1)  # Brief pause between tests
        except Exception as e:
            print(f"\n❌ Unexpected error in {test_func.__name__}: {e}")
    
    # Generate summary
    generate_summary_report()
    
    print(f"\n⏰ Completed: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == "__main__":
    main()
