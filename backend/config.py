import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3306/gigshield"
)

JWT_SECRET = os.getenv("JWT_SECRET", "gigshield-secret-key-2026-hackathon")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
