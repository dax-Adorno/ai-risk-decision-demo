from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EngineResult:
    score: int
    level: str
    decision: str
    explanation: str


def clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))


def decision_engine(
    *,
    age: int,
    monthly_income: float,
    vehicle_price: float,
    down_payment: float,
    employment_years: int,
) -> EngineResult:
    """
    Modelo simulado (rule-based scoring).
    En producción, esto podría reemplazarse por un modelo ML real
    manteniendo el mismo contrato de entrada/salida.
    """
    score = 50

    financed_amount = max(vehicle_price - down_payment, 0)
    ratio = financed_amount / max(monthly_income * 6, 1)  # meses de ingreso aprox.

    # Penalización por ratio alto (financia demasiado vs ingreso)
    if ratio > 1.5:
        score -= 25
    elif ratio > 1.0:
        score -= 15
    elif ratio > 0.7:
        score -= 5
    else:
        score += 5

    # Estabilidad laboral
    if employment_years >= 5:
        score += 20
    elif employment_years >= 2:
        score += 10
    else:
        score -= 10

    # Ajuste por edad
    if age < 21:
        score -= 10
    elif age > 65:
        score -= 5

    score = clamp(score)

    # Clasificación final
    if score >= 70:
        level = "LOW"
        decision = "Approve"
    elif score >= 45:
        level = "MEDIUM"
        decision = "Approve with conditions"
    else:
        level = "HIGH"
        decision = "Review / Reject"

    explanation = (
        f"financed_amount={financed_amount:.0f}, ratio={ratio:.2f}, "
        f"employment_years={employment_years}, age={age}"
    )

    return EngineResult(score=score, level=level, decision=decision, explanation=explanation)