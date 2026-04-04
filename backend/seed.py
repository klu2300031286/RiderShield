"""Seed script to populate database with demo data."""
from database import SessionLocal, engine, Base
from models import User, Policy, Claim, Payment, RiskData
from auth import hash_password
from datetime import date, datetime, timedelta

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def seed():
    # Check if data exists
    if db.query(User).count() > 0:
        print("Database already has data. Skipping seed.")
        return

    # Create admin
    admin = User(
        name="Admin User",
        email="admin@gigshield.in",
        password=hash_password("admin123"),
        role="admin",
        location="Mumbai",
        phone="9999900000",
        platform="Admin"
    )
    db.add(admin)

    # Create workers
    workers_data = [
        ("Raj Kumar", "raj@example.com", "Mumbai", "9876543210", "Zomato"),
        ("Priya Sharma", "priya@example.com", "Delhi", "9876543211", "Swiggy"),
        ("Amit Patel", "amit@example.com", "Bangalore", "9876543212", "Amazon"),
        ("Sunita Devi", "sunita@example.com", "Chennai", "9876543213", "Zomato"),
        ("Vikram Singh", "vikram@example.com", "Hyderabad", "9876543214", "Swiggy"),
    ]
    workers = []
    for name, email, loc, phone, plat in workers_data:
        w = User(name=name, email=email, password=hash_password("worker123"),
                 role="worker", location=loc, phone=phone, platform=plat)
        db.add(w)
        workers.append(w)

    db.commit()

    # Create policies
    policies_data = [
        (workers[0].id, 49.00, 2000.00, 35.5),
        (workers[1].id, 65.00, 3000.00, 55.0),
        (workers[2].id, 42.00, 1800.00, 28.0),
        (workers[3].id, 58.00, 2500.00, 45.0),
        (workers[4].id, 72.00, 3500.00, 62.0),
    ]
    policies = []
    for uid, prem, cov, risk in policies_data:
        p = Policy(user_id=uid, premium_weekly=prem, coverage_amount=cov,
                   risk_score=risk, status="active",
                   start_date=date.today() - timedelta(days=3),
                   end_date=date.today() + timedelta(weeks=12))
        db.add(p)
        policies.append(p)

    db.commit()

    # Risk data
    risk_entries = [
        ("Mumbai", "Heavy Rain", 28.5, 92.0, 120, "high", True),
        ("Delhi", "Haze", 35.0, 45.0, 380, "critical", True),
        ("Bangalore", "Extreme Heat", 42.0, 30.0, 85, "medium", True),
        ("Chennai", "Thunderstorm", 30.0, 88.0, 95, "high", True),
        ("Hyderabad", "Clear", 33.0, 55.0, 70, "low", False),
        ("Pune", "Partly Cloudy", 31.0, 60.0, 90, "low", False),
        ("Kolkata", "Heavy Rain", 29.0, 95.0, 110, "high", True),
        ("Jaipur", "Dust Storm", 40.0, 20.0, 350, "critical", True),
    ]
    for loc, wc, temp, hum, aqi, rl, dis in risk_entries:
        r = RiskData(location=loc, weather_condition=wc, temperature=temp,
                     humidity=hum, aqi=aqi, risk_level=rl, is_disruption=dis)
        db.add(r)

    db.commit()
    print("Database seeded successfully!")
    db.close()


if __name__ == "__main__":
    seed()
