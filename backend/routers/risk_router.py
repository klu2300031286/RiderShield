from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RiskData
from schemas import RiskAssessment, WeatherOut, DisruptionSimulate
from auth import get_current_user
import random

router = APIRouter(prefix="/api/risk", tags=["Risk & AI"])

# Mock weather data for Indian cities
MOCK_WEATHER = {
    "Mumbai": {"weather_condition": "Heavy Rain", "temperature": 28.5, "humidity": 92.0, "aqi": 120},
    "Delhi": {"weather_condition": "Haze", "temperature": 35.0, "humidity": 45.0, "aqi": 380},
    "Bangalore": {"weather_condition": "Extreme Heat", "temperature": 42.0, "humidity": 30.0, "aqi": 85},
    "Chennai": {"weather_condition": "Thunderstorm", "temperature": 30.0, "humidity": 88.0, "aqi": 95},
    "Hyderabad": {"weather_condition": "Clear", "temperature": 33.0, "humidity": 55.0, "aqi": 70},
    "Pune": {"weather_condition": "Partly Cloudy", "temperature": 31.0, "humidity": 60.0, "aqi": 90},
    "Kolkata": {"weather_condition": "Heavy Rain", "temperature": 29.0, "humidity": 95.0, "aqi": 110},
    "Jaipur": {"weather_condition": "Dust Storm", "temperature": 40.0, "humidity": 20.0, "aqi": 350},
    "Lucknow": {"weather_condition": "Fog", "temperature": 22.0, "humidity": 80.0, "aqi": 200},
    "Ahmedabad": {"weather_condition": "Clear", "temperature": 36.0, "humidity": 40.0, "aqi": 95},
}

DISRUPTION_CONDITIONS = ["Heavy Rain", "Extreme Heat", "Thunderstorm", "Dust Storm", "Flood", "Haze"]

def compute_risk(weather: dict) -> tuple[float, str, bool]:
    """ML-simulated risk scoring engine."""
    score = 0.0

    # Weather condition scoring
    condition = weather.get("weather_condition", "Clear")
    if condition in ["Heavy Rain", "Thunderstorm", "Flood"]:
        score += 35
    elif condition in ["Extreme Heat", "Dust Storm"]:
        score += 30
    elif condition in ["Haze", "Fog"]:
        score += 20

    # AQI scoring
    aqi = weather.get("aqi", 50)
    if aqi > 300:
        score += 30
    elif aqi > 200:
        score += 20
    elif aqi > 100:
        score += 10

    # Temperature scoring
    temp = weather.get("temperature", 30)
    if temp > 42:
        score += 20
    elif temp > 38:
        score += 10

    # Humidity scoring
    hum = weather.get("humidity", 50)
    if hum > 90:
        score += 15
    elif hum > 80:
        score += 10

    score = min(score, 100.0)

    # Determine risk level
    if score >= 70:
        level = "critical"
    elif score >= 50:
        level = "high"
    elif score >= 30:
        level = "medium"
    else:
        level = "low"

    is_disruption = condition in DISRUPTION_CONDITIONS and score >= 40

    return score, level, is_disruption


@router.get("/assess", response_model=RiskAssessment)
def assess_risk(location: str, db: Session = Depends(get_db)):
    """AI-powered risk assessment for a location."""
    weather = MOCK_WEATHER.get(location)
    if not weather:
        # Generate random weather for unknown locations
        weather = {
            "weather_condition": random.choice(["Clear", "Partly Cloudy", "Light Rain"]),
            "temperature": round(random.uniform(25, 40), 1),
            "humidity": round(random.uniform(30, 90), 1),
            "aqi": random.randint(40, 250)
        }

    score, level, is_disruption = compute_risk(weather)

    # Calculate suggested premium for ₹2000 coverage
    base_rate = 0.025
    risk_multiplier = 1 + (score / 100)
    suggested_premium = round(2000 * base_rate * risk_multiplier, 2)

    return RiskAssessment(
        location=location,
        risk_score=score,
        risk_level=level,
        weather_condition=weather["weather_condition"],
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        aqi=weather["aqi"],
        suggested_premium=suggested_premium,
        is_disruption=is_disruption
    )


@router.get("/weather", response_model=WeatherOut)
def get_weather(location: str):
    """Mock Weather API for location."""
    weather = MOCK_WEATHER.get(location)
    if not weather:
        weather = {
            "weather_condition": "Clear",
            "temperature": 30.0,
            "humidity": 55.0,
            "aqi": 75
        }

    score, level, is_disruption = compute_risk(weather)
    return WeatherOut(
        location=location,
        weather_condition=weather["weather_condition"],
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        aqi=weather["aqi"],
        risk_level=level,
        is_disruption=is_disruption
    )


@router.get("/weather/all", response_model=list[WeatherOut])
def get_all_weather():
    """Get weather data for all tracked cities."""
    results = []
    for loc, weather in MOCK_WEATHER.items():
        score, level, is_disruption = compute_risk(weather)
        results.append(WeatherOut(
            location=loc,
            weather_condition=weather["weather_condition"],
            temperature=weather["temperature"],
            humidity=weather["humidity"],
            aqi=weather["aqi"],
            risk_level=level,
            is_disruption=is_disruption
        ))
    return results


@router.post("/simulate-disruption")
def simulate_disruption(
    data: DisruptionSimulate,
    db: Session = Depends(get_db)
):
    """Simulate a disruption event for demo purposes."""
    trigger_map = {
        "heavy_rain": {"weather_condition": "Heavy Rain", "temperature": 27.0, "humidity": 95.0, "aqi": 130},
        "extreme_heat": {"weather_condition": "Extreme Heat", "temperature": 45.0, "humidity": 20.0, "aqi": 100},
        "pollution": {"weather_condition": "Haze", "temperature": 32.0, "humidity": 50.0, "aqi": 400},
        "curfew": {"weather_condition": "Clear", "temperature": 30.0, "humidity": 55.0, "aqi": 80},
        "flood": {"weather_condition": "Flood", "temperature": 26.0, "humidity": 98.0, "aqi": 90},
        "storm": {"weather_condition": "Thunderstorm", "temperature": 25.0, "humidity": 92.0, "aqi": 110},
    }
    weather = trigger_map.get(data.trigger_type.value, trigger_map["heavy_rain"])
    score, level, _ = compute_risk(weather)

    risk_entry = RiskData(
        location=data.location,
        weather_condition=weather["weather_condition"],
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        aqi=weather["aqi"],
        risk_level=level,
        is_disruption=True
    )
    db.add(risk_entry)
    db.commit()

    return {
        "message": f"Disruption simulated: {data.trigger_type.value} in {data.location}",
        "risk_level": level,
        "risk_score": score,
        "weather": weather
    }
