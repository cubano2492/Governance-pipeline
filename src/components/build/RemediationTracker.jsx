import { Badge, TextArea } from "../ui.jsx";
import { SCORE_LABELS } from "../../data/scoreLabels.js";
import { DESIGN_CRITERIA } from "../../data/designCriteria.js";

export default function RemediationTracker({ stage1Results, evidenceNotes, onUpdateEvidence }) {
  const remItems = DESIGN_CRITERIA.filter(c => {
    const r = stage1Results[c.id];
    return r && r.score != null && r.score < 3;
  }).map(c => ({
    criterionId: c.id,
    title: c.title,
    score: stage1Results[c.id].score,
    remediation: stage1Results[c.id].remediation || [],
    resolved: evidenceNotes?.[c.id]?.resolved || false,
    notes: evidenceNotes?.[c.id]?.notes || "",
  }));

  const resolvedCount = remItems.filter(i => i.resolved).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Stage 1 Remediation Tracker
        </div>
        {remItems.length > 0 && (
          <span style={{ fontSize: 12, color: resolvedCount === remItems.length ? "#22c55e" : "#6b7280" }}>
            {resolvedCount}/{remItems.length} resolved
          </span>
        )}
      </div>

      {remItems.length === 0 ? (
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          {Object.keys(stage1Results).length === 0
            ? "No Stage 1 assessment completed yet."
            : "No remediation items — all criteria scored 3 or above."}
        </p>
      ) : (
        remItems.map(item => (
          <div key={item.criterionId} style={{
            background: "#0c0a14",
            border: `1px solid ${item.resolved ? "#14532d" : "#1e1b2e"}`,
            borderRadius: 10, padding: 16, marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  {item.criterionId}. {item.title}
                </span>
                <Badge color={SCORE_LABELS[item.score].color} bg={SCORE_LABELS[item.score].bg}>
                  {item.score}/4
                </Badge>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={item.resolved}
                  onChange={e => onUpdateEvidence(item.criterionId, "resolved", e.target.checked)}
                  style={{ accentColor: "#c084fc" }}
                />
                <span style={{ fontSize: 12, color: item.resolved ? "#22c55e" : "#6b7280" }}>
                  {item.resolved ? "Resolved" : "Open"}
                </span>
              </label>
            </div>

            {item.remediation.map((s, i) => (
              <div key={i} style={{
                fontSize: 12, color: "#94a3b8", lineHeight: 1.5,
                marginBottom: 3, paddingLeft: 10, borderLeft: "2px solid #c084fc30",
              }}>
                {s}
              </div>
            ))}

            <TextArea
              value={item.notes}
              onChange={v => onUpdateEvidence(item.criterionId, "notes", v)}
              placeholder="Evidence / resolution notes…"
              rows={2}
              style={{ marginTop: 8 }}
            />
          </div>
        ))
      )}
    </div>
  );
}
