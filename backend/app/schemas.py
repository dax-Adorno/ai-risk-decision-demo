from pydantic import BaseModel, Field


class RiskRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Edad del solicitante")
    monthly_income: float = Field(..., gt=0, description="Ingreso mensual")
    vehicle_price: float = Field(..., gt=0, description="Precio del vehículo")
    down_payment: float = Field(..., ge=0, description="Anticipo")
    employment_years: int = Field(..., ge=0, le=60, description="Años de antigüedad laboral")


class RiskResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str  # LOW | MEDIUM | HIGH
    decision: str
    explanation: str
