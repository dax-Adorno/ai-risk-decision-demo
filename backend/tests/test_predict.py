from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_predict_returns_valid_shape():
    payload = {
        "age": 35,
        "monthly_income": 800000,
        "vehicle_price": 12000000,
        "down_payment": 6000000,
        "employment_years": 6,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0 <= data["risk_score"] <= 100
    assert isinstance(data["decision"], str)


def test_predict_high_risk_case():
    payload = {
        "age": 19,
        "monthly_income": 200000,
        "vehicle_price": 15000000,
        "down_payment": 0,
        "employment_years": 0,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0 <= data["risk_score"] <= 100