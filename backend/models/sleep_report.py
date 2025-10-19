"""
Sleep Report Generation
Clinical-Grade Sleep Health Reports
Team: Chimpanzini Bananini
"""

from datetime import datetime

def generate_sleep_report(analysis_result, disorders_detected=None):
    """
    Generate comprehensive sleep report with recommendations
    
    Args:
        analysis_result: Dictionary containing sleep analysis data
        disorders_detected: List of detected disorders
        
    Returns:
        dict: Sleep report with recommendations
    """
    if disorders_detected is None:
        disorders_detected = []
    
    recommendations = []
    
    # Generate recommendations based on analysis
    if analysis_result["sleep_efficiency"] < 0.80:
        recommendations.append("Your sleep efficiency is below optimal. Establish a consistent sleep schedule.")
    
    if analysis_result["apnea_events"] > 5:
        recommendations.append("Multiple breathing pauses detected. Consider sleeping on your side.")
        if analysis_result["apnea_events"] > 15:
            recommendations.append("Frequent breathing interruptions detected. Consult a sleep specialist.")
    
    if analysis_result["sleep_stages"]["deep"] < 60:
        recommendations.append("Deep sleep duration is lower than recommended. Avoid alcohol before bed.")
    
    if analysis_result["sleep_stages"]["rem"] < 60:
        recommendations.append("REM sleep is below optimal. Reduce screen time 1-2 hours before bed.")
    
    # Add general recommendations
    recommendations.append("Maintain room temperature between 18-21°C for optimal sleep.")
    recommendations.append("Limit caffeine intake 6 hours before bedtime.")
    
    # Calculate clinical metrics
    ahi = analysis_result["apnea_events"] / max(analysis_result["total_sleep_time"], 1)
    sleep_score = calculate_sleep_score(analysis_result)
    
    return {
        "user_id": "demo_user",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "summary": f"Sleep Quality: {get_sleep_quality_text(analysis_result)}",
        "recommendations": recommendations,
        "disorders_detected": disorders_detected,
        "clinical_metrics": {
            "sleep_efficiency_percent": round(analysis_result["sleep_efficiency"] * 100, 1),
            "total_sleep_time_hours": analysis_result["total_sleep_time"],
            "ahi_index": round(ahi, 1),
            "sleep_score": sleep_score
        }
    }

def get_sleep_quality_text(analysis):
    """Convert analysis to textual sleep quality rating"""
    if analysis["sleep_efficiency"] > 0.90 and analysis["apnea_events"] < 5:
        return "Excellent"
    elif analysis["sleep_efficiency"] > 0.85 and analysis["apnea_events"] < 10:
        return "Good"
    elif analysis["sleep_efficiency"] > 0.75:
        return "Fair"
    else:
        return "Poor"

def calculate_sleep_score(analysis):
    """Calculate overall sleep score from 0-100"""
    # Efficiency score (0-70 points)
    efficiency_score = min(70, int(analysis["sleep_efficiency"] * 75))
    
    # Apnea deduction (0-15 points deduction)
    apnea_deduction = min(15, analysis["apnea_events"] * 1.5)
    
    # Duration score (0-15 points)
    duration_score = 0
    if 6.5 <= analysis["total_sleep_time"] <= 9:
        duration_score = 15
    elif 6 <= analysis["total_sleep_time"] < 6.5 or 9 < analysis["total_sleep_time"] <= 10:
        duration_score = 10
    elif 5 <= analysis["total_sleep_time"] < 6:
        duration_score = 5
    
    # Stage score (0-15 points)
    stage_score = 0
    ideal_rem = analysis["total_sleep_time"] * 60 * 0.25
    if analysis["sleep_stages"]["rem"] >= ideal_rem * 0.8:
        stage_score += 10
    
    ideal_deep = analysis["total_sleep_time"] * 60 * 0.2
    if analysis["sleep_stages"]["deep"] >= ideal_deep * 0.8:
        stage_score += 5
    
    total_score = efficiency_score + duration_score + stage_score - apnea_deduction
    return max(0, min(100, int(total_score)))