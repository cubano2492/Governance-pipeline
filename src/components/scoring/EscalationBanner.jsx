import { Badge } from "../ui.jsx";

export default function EscalationBanner({ criteria, results }) {
  const zeros = criteria.filter(c => results[c.id]?.score === 0);
  if (!zeros.length) return null;

  return (
    <div style={{
      background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: 18, marginBottom: 20,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "#ef4444",
        letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8,
      }}>
        ⚠ Governance Board Escalation Required
      </div>
      <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, marginBottom: 10 }}>
        One or more criteria scored 0. Per rubric policy, this is a mandatory escalation regardless of total score.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {zeros.map(c => (
          <Badge key={c.id} color="#ef4444" bg="#450a0a">{c.id}. {c.title}</Badge>
        ))}
      </div>
    </div>
  );
}
