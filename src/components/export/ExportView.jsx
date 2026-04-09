import { DESIGN_CRITERIA } from "../../data/designCriteria.js";
import { DEPLOY_CRITERIA } from "../../data/deployCriteria.js";
import { gateDecision } from "../../data/gateThresholds.js";

export default function ExportView({ project, stageNum, onClose }) {
  const isDesign = stageNum === 1;
  const criteria = isDesign ? DESIGN_CRITERIA : DEPLOY_CRITERIA;
  const stageData = isDesign ? project.stage1 : project.stage3;
  const results = stageData.results || {};
  const scored = Object.keys(results).filter(k => results[k]?.score != null).length;
  const total = Object.values(results).reduce((s, r) => s + (r?.score ?? 0), 0);
  const gate = scored > 0 ? gateDecision(total, stageNum) : null;

  return (
    <div style={{ background: "#fff", color: "#1a1a2e", padding: 40, minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <div className="no-print" style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ padding: "8px 16px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          ← Back
        </button>
        <button onClick={() => window.print()} style={{ padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
          Print / Export PDF
        </button>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>AI Deployment Security Assessment</h1>
      <h2 style={{ fontSize: 16, fontWeight: 400, color: "#6b7280", marginBottom: 20 }}>
        {isDesign ? "Design-Phase Security Rubric v1.0" : "Scoring Rubric v2.1"} — Scorecard
      </h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: 600, background: "#f9fafb", width: 180 }}>System / Project</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{project.name}</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: 600, background: "#f9fafb", width: 180 }}>Assessment Date</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: 600, background: "#f9fafb" }}>Assessed By</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd" }}>{project.owner}</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: 600, background: "#f9fafb" }}>Total Score</td>
            <td style={{ padding: "8px 12px", border: "1px solid #ddd", fontWeight: 700 }}>
              {total}/52 — {gate?.label || "Incomplete"}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <th style={{ padding: "10px 8px", textAlign: "left", width: 30 }}>#</th>
            <th style={{ padding: "10px 8px", textAlign: "left" }}>Requirement</th>
            <th style={{ padding: "10px 8px", textAlign: "left", width: 90 }}>Category</th>
            <th style={{ padding: "10px 8px", textAlign: "center", width: 50 }}>Score</th>
            <th style={{ padding: "10px 8px", textAlign: "left" }}>Explanation</th>
            <th style={{ padding: "10px 8px", textAlign: "left" }}>Remediation</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map(c => {
            const r = results[c.id];
            const scoreColor = r?.score != null
              ? (r.score >= 3 ? "#16a34a" : r.score >= 2 ? "#ca8a04" : "#dc2626")
              : "#9ca3af";
            return (
              <tr key={c.id} style={{ background: r?.score === 0 ? "#fef2f2" : c.id % 2 === 0 ? "#f9fafb" : "#fff" }}>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: 600 }}>{c.id}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: 500 }}>{c.title}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontSize: 11 }}>{c.category}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: 700, color: scoreColor }}>
                  {r?.score ?? "—"}/4
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd", lineHeight: 1.5 }}>{r?.explanation || "—"}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", lineHeight: 1.5 }}>{r?.remediation?.join(" • ") || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {Object.values(results).some(r => r?.score === 0) && (
        <div style={{ marginTop: 16, padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>
          <strong style={{ color: "#dc2626" }}>⚠ Governance Board Escalation Required: </strong>
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            {criteria.filter(c => results[c.id]?.score === 0).map(c => `${c.id}. ${c.title}`).join("; ")}
          </span>
        </div>
      )}
    </div>
  );
}
