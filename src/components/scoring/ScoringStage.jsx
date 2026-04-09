import { useState } from "react";
import { Badge, Btn, TextArea } from "../ui.jsx";
import { SCORE_LABELS, CAT_COLORS } from "../../data/scoreLabels.js";
import { gateDecision } from "../../data/gateThresholds.js";
import { scoreCriterion } from "../../services/anthropic.js";
import EscalationBanner from "./EscalationBanner.jsx";

export default function ScoringStage({ stageNum, criteria, systemPrompt, stageData, onUpdate, apiKey }) {
  const [expandedId, setExpandedId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [scoringAll, setScoringAll] = useState(false);
  const { findings = {}, results = {} } = stageData;

  const scored = Object.keys(results).filter(k => results[k]?.score != null).length;
  const total = Object.values(results).reduce((s, r) => s + (r?.score ?? 0), 0);
  const gate = scored === 13 ? gateDecision(total, stageNum) : null;
  const unscoredWithFindings = criteria.filter(c => findings[c.id]?.trim() && !results[c.id]);

  async function handleScore(c) {
    const f = findings[c.id]?.trim();
    if (!f) return;
    setLoadingId(c.id);
    try {
      const userMessage = `Criterion: ${c.id}. ${c.title} (${c.category})\n\nFindings:\n${f}`;
      const parsed = await scoreCriterion(systemPrompt, userMessage, apiKey);
      onUpdate({ ...stageData, results: { ...results, [c.id]: parsed } });
      setExpandedId(c.id);
    } catch {
      onUpdate({ ...stageData, results: { ...results, [c.id]: { score: null, explanation: "Scoring error. Please retry.", remediation: [] } } });
    }
    setLoadingId(null);
  }

  async function scoreAll() {
    setScoringAll(true);
    for (const c of unscoredWithFindings) {
      await handleScore(c);
    }
    setScoringAll(false);
  }

  function setFinding(id, val) {
    onUpdate({ ...stageData, findings: { ...findings, [id]: val } });
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ background: "#110f1a", border: "1px solid #1e1b2e", borderRadius: 12, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{scored}/13 criteria scored</span>
          {gate && <Badge color={gate.color}>{total}/52 — {gate.label}</Badge>}
        </div>
        <div style={{ height: 5, background: "#1e1b2e", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(scored / 13) * 100}%`,
            background: "linear-gradient(90deg, #c084fc, #818cf8)", borderRadius: 3, transition: "width 0.5s",
          }} />
        </div>
      </div>

      <EscalationBanner criteria={criteria} results={results} />

      {unscoredWithFindings.length > 1 && (
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Btn onClick={scoreAll} disabled={scoringAll}>
            {scoringAll ? "Scoring…" : `Score All ${unscoredWithFindings.length} Remaining`}
          </Btn>
        </div>
      )}

      {criteria.map(c => {
        const r = results[c.id];
        const isExp = expandedId === c.id;
        const catCol = CAT_COLORS[c.category] || "#94a3b8";
        return (
          <div key={c.id} style={{
            background: "#110f1a",
            border: `1px solid ${r?.score === 0 ? "#7f1d1d" : "#1e1b2e"}`,
            borderRadius: 12, marginBottom: 10, overflow: "hidden",
          }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                  background: `${catCol}15`, border: `1px solid ${catCol}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: catCol, fontFamily: "monospace",
                }}>
                  {c.id}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{c.title}</span>
                    <Badge color={catCol}>{c.category}</Badge>
                    {r?.score != null && (
                      <Badge color={SCORE_LABELS[r.score].color} bg={SCORE_LABELS[r.score].bg}>
                        {r.score}/4 — {SCORE_LABELS[r.score].label}
                      </Badge>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{c.guidance}</p>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <TextArea
                  value={findings[c.id] || ""}
                  onChange={v => setFinding(c.id, v)}
                  placeholder="Enter findings…"
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                  {r && (
                    <Btn variant="ghost" onClick={() => setExpandedId(isExp ? null : c.id)}>
                      {isExp ? "Hide ▲" : "Show ▼"}
                    </Btn>
                  )}
                  <Btn
                    onClick={() => handleScore(c)}
                    disabled={!findings[c.id]?.trim() || loadingId === c.id || scoringAll}
                    variant={r ? "secondary" : "primary"}
                  >
                    {loadingId === c.id ? "Scoring…" : r ? "Re-score" : "Score"}
                  </Btn>
                </div>
              </div>
            </div>

            {r && isExp && (
              <div style={{ borderTop: "1px solid #1e1b2e", padding: "18px 20px", background: "#0c0a14" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Assessment</div>
                    {r.score != null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: SCORE_LABELS[r.score].bg,
                          border: `2px solid ${SCORE_LABELS[r.score].color}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, fontWeight: 700, color: SCORE_LABELS[r.score].color, fontFamily: "monospace",
                        }}>
                          {r.score}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: SCORE_LABELS[r.score].color }}>
                            {SCORE_LABELS[r.score].label}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>out of 4</div>
                        </div>
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{r.explanation}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Remediation</div>
                    {r.remediation?.length > 0 && r.remediation[0] !== "No remediation required." ? (
                      r.remediation.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{
                            flexShrink: 0, width: 18, height: 18, borderRadius: 4,
                            background: "#c084fc18", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: "#c084fc", fontFamily: "monospace",
                          }}>
                            {i + 1}
                          </span>
                          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{s}</p>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: 13, color: "#22c55e" }}>✓ No remediation required</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
