from fastapi import FastAPI

from .schemas import RiskRequest, RiskResponse
from .service import decision_engine

app = FastAPI(title="AI Risk Decision Demo", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=RiskResponse)
def predict(payload: RiskRequest):
    result = decision_engine(
        age=payload.age,
        monthly_income=payload.monthly_income,
        vehicle_price=payload.vehicle_price,
        down_payment=payload.down_payment,
        employment_years=payload.employment_years,
    )

    return RiskResponse(
        risk_score=result.score,
        risk_level=result.level,
        decision=result.decision,
        explanation=result.explanation,
    )