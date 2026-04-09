import { useState } from "react";
import { Btn, TextInput, Card } from "../ui.jsx";
import { Badge } from "../ui.jsx";
import { SCORE_LABELS } from "../../data/scoreLabels.js";
import { DEPLOY_CRITERIA } from "../../data/deployCriteria.js";

export default function MonitorStage({ project, onUpdate }) {
  const s4 = project.stage4;
  const [newChange, setNewChange] = useState("");
  const [changeCategory, setChangeCategory] = useState("other");

  const remItems = DEPLOY_CRITERIA.filter(c => {
    const r = project.stage3.results[c.id];
    return r && r.score != null && r.score < 3;
  }).map(c => ({
    criterionId: c.id,
    title: c.title,
    score: project.stage3.results[c.id].score,
    remediation: project.stage3.results[c.id].remediation || [],
  }));

  const nextDate = s4.nextReassessment || (() => {
    if (project.stage3.completedAt) {
      const d = new Date(project.stage3.completedAt);
      d.setMonth(d.getMonth() + 6);
      return d.toISOString().slice(0, 10);
    }
    return null;
  })();

  const categories = [
    { value: "model_update",      label: "Model Version Update" },
    { value: "data_source",       label: "Data Source Change" },
    { value: "permission_change", label: "Permission Change" },
    { value: "other",             label: "Other" },
  ];

  function addChange() {
    if (!newChange.trim()) return;
    const cl = [
      ...(s4.changeLog || []),
      { date: new Date().toISOString(), description: newChange.trim(), category: changeCategory },
    ];
    onUpdate({ ...s4, changeLog: cl });
    setNewChange("");
    setChangeCategory("other");
  }

  const categoryColors = {
    model_update: "#a855f7", data_source: "#3b82f6",
    permission_change: "#ef4444", other: "#6b7280",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Re-assessment schedule */}
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          Re-assessment Schedule
        </div>
        {nextDate ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>{nextDate}</div>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Next scheduled re-assessment (6 months from Stage 3 completion)</span>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            No Stage 3 assessment completed yet. Re-assessment schedule will be set automatically.
          </p>
        )}
      </Card>

      {/* Stage 3 Remediation */}
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          Stage 3 Remediation Items (30-day window)
        </div>
        {remItems.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            {Object.keys(project.stage3.results).length === 0
              ? "No Stage 3 assessment completed yet."
              : "No remediation items outstanding."}
          </p>
        ) : (
          remItems.map(item => (
            <div key={item.criterionId} style={{
              background: "#0c0a14", border: "1px solid #1e1b2e",
              borderRadius: 10, padding: 14, marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  {item.criterionId}. {item.title}
                </span>
                <Badge color={SCORE_LABELS[item.score].color} bg={SCORE_LABELS[item.score].bg}>
                  {item.score}/4
                </Badge>
              </div>
              {item.remediation.map((s, i) => (
                <div key={i} style={{
                  fontSize: 12, color: "#94a3b8", lineHeight: 1.5,
                  paddingLeft: 10, borderLeft: "2px solid #c084fc30", marginBottom: 3,
                }}>
                  {s}
                </div>
              ))}
            </div>
          ))
        )}
      </Card>

      {/* Change Log */}
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          Significant Change Log
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          Record changes that may warrant early re-assessment (model version updates, new data sources, permission changes, etc.)
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 14, alignItems: "end" }}>
          <TextInput value={newChange} onChange={setNewChange} placeholder="Describe the change…" />
          <select
            value={changeCategory}
            onChange={e => setChangeCategory(e.target.value)}
            style={{
              background: "#0c0a14", border: "1px solid #1e1b2e", color: "#e2e8f0",
              borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <Btn onClick={addChange} disabled={!newChange.trim()} variant="secondary" style={{ whiteSpace: "nowrap" }}>
            Log Change
          </Btn>
        </div>

        {(s4.changeLog || []).length > 0 ? (
          [...(s4.changeLog || [])].reverse().map((entry, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, paddingLeft: 10, borderLeft: "2px solid #1e1b2e" }}>
              <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                {new Date(entry.date).toLocaleDateString()}
              </span>
              {entry.category && entry.category !== "other" && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: categoryColors[entry.category],
                  background: `${categoryColors[entry.category]}15`,
                  borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap",
                }}>
                  {categories.find(c => c.value === entry.category)?.label}
                </span>
              )}
              <span style={{ fontSize: 12, color: "#d1d5db" }}>{entry.description}</span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 12, color: "#374151" }}>No changes logged yet.</p>
        )}
      </Card>
    </div>
  );
}
