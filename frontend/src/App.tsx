import { useMemo, useState } from "react";
import "./App.css";

type PredictRequest = {
  age: number;
  monthly_income: number;
  vehicle_price: number;
  down_payment: number;
  employment_years: number;
};

type PredictResponse = {
  risk_score: number;
  risk_level: string;
  decision: string;
  explanation: string;
};

const API_URL = import.meta.env.VITE_API_URL as string;

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
const riskLevelMap: Record<string, string> = {
  LOW: "BAJO",
  MEDIUM: "MEDIO",
  HIGH: "ALTO",
};

const decisionMap: Record<string, string> = {
  Approve: "Aprobar",
  "Approve with conditions": "Aprobar con condiciones",
  Reject: "Rechazar",
};

function translateExplanation(s: string): string {
  return s
    .replaceAll("financed_amount", "monto_financiado")
    .replaceAll("employment_years", "antiguedad_laboral")
    .replaceAll("age", "edad");
  // "ratio" lo dejo igual porque se usa así también en español
}
export default function App() {
  const [form, setForm] = useState({
    age: "35",
    monthly_income: "800000",
    vehicle_price: "12000000",
    down_payment: "6000000",
    employment_years: "6",
  });

  const req: PredictRequest = useMemo(
    () => ({
      age: toNumber(form.age),
      monthly_income: toNumber(form.monthly_income),
      vehicle_price: toNumber(form.vehicle_price),
      down_payment: toNumber(form.down_payment),
      employment_years: toNumber(form.employment_years),
    }),
    [form]
  );

  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }

      const data = (await res.json()) as PredictResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }
  const fields: Array<{ key: keyof typeof form; label: string }> = [
    { key: "age", label: "Edad" },
    { key: "monthly_income", label: "Ingreso mensual" },
    { key: "vehicle_price", label: "Precio del vehículo" },
    { key: "down_payment", label: "Entrega inicial" },
    { key: "employment_years", label: "Años de antigüedad laboral" },
  ];
  return (
    <div style={{ maxWidth: 920, margin: "40px auto", padding: 16 }}>
      <h1>Demo de Decisión de Riesgo</h1>
      <p style={{ opacity: 0.85 }}>
        Cliente React para <code>POST /predict</code> (FastAPI). Backend:{" "}
        <code>{API_URL}</code>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <form onSubmit={onSubmit} style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Datos de Entrada</h2>

            {fields.map(({ key, label }) => (
            <label key={key} style={{ display: "block", marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>{label}</div>
              <input
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              inputMode="numeric"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
            />
          </label>
            ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #444",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Evaluando..." : "Evaluar riesgo"}
          </button>

          {error && (
            <div style={{ marginTop: 12, color: "#ff6b6b", whiteSpace: "pre-wrap" }}>
              <b>Error:</b> {error}
            </div>
          )}
        </form>

        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Resultados</h2>

          {!result && !error && (
            <p style={{ opacity: 0.8 }}>Envíe una evaluación para ver la decisión.</p>
          )}

          {result && (
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <b>Puntaje de Riesgo:</b> {result.risk_score}
              </div>
              <div>
                <b>Nivel de Riesgo:</b> {riskLevelMap[result.risk_level] ?? result.risk_level}
              </div>
              <div>
                <b>Decisión:</b> {decisionMap[result.decision] ?? result.decision}
              </div>
              <div>
                <b>Explicación:</b>
                <div style={{ marginTop: 6, opacity: 0.9 }}>{translateExplanation(result.explanation)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ margin: "28px 0", opacity: 0.25 }} />

      <details>
        <summary>Payload enviado (debug)</summary>
        <pre style={{ overflowX: "auto" }}>{JSON.stringify(req, null, 2)}</pre>
      </details>
    </div>
  );
}