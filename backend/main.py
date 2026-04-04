from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_router, policy_router, claims_router, risk_router, payment_router, admin_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GigShield API",
    description="AI-Powered Parametric Insurance Platform for Gig Workers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(policy_router.router)
app.include_router(claims_router.router)
app.include_router(risk_router.router)
app.include_router(payment_router.router)
app.include_router(admin_router.router)


@app.get("/")
def root():
    return {
        "name": "GigShield API",
        "version": "1.0.0",
        "description": "AI-Powered Parametric Insurance for Gig Workers",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
