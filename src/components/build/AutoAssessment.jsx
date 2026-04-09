import { useState } from "react";
import { Badge, Btn } from "../ui.jsx";
import { DEPLOY_CRITERIA, CODE_ASSESSABLE_IDS, MANUAL_ONLY_IDS, MANUAL_EVIDENCE_REQUIRED } from "../../data/deployCriteria.js";
import { SCORE_LABELS } from "../../data/scoreLabels.js";
import { gateDecision } from "../../data/gateThresholds.js";
import { autoAssessCriterion } from "../../services/anthropic.js";

// ─── Indicative gate: only sum criteria that were actually scored ─────────────
function indicativeGate(results) {
  const scored = Object.values(results).filter(r => r?.assessable && r.indicativeScore != null);
  if (!scored.length) return null;
  const total = scored.reduce((s, r) => s + r.indicativeScore, 0);
  // Scale to 52 assuming all 13 were scored — make it clearly approximate
  const scaledTotal = Math.round((total / (scored.length * 4)) * 52);
  return { ...gateDecision(scaledTotal, 3), scaledTotal, actualTotal: total, scoredCount: scored.length };
}

// ─── Single criterion result card ────────────────────────────────────────────
function CriterionResult({ criterion, result, loading }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: "#0c0a14", border: "1px solid #1e1b2e", borderRadius: 10,
        padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#1e1b2e", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{criterion.title}</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>Analysing code evidence…</div>
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>scoring…</div>
      </div>
    );
  }

  // Not yet assessed
  if (!result) {
    const isManualOnly = MANUAL_ONLY_IDS.has(criterion.id);
    return (
      <div style={{
        background: "#0c0a14", border: "1px solid #1e1b2e", borderRadius: 10,
        padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10,
        opacity: 0.6,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: "#1e1b2e",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#4b5563", flexShrink: 0,
        }}>
          {criterion.id}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{criterion.title}</div>
        </div>
        <Badge color={isManualOnly ? "#f59e0b" : "#6b7280"}>
          {isManualOnly ? "Manual Only" : "Pending"}
        </Badge>
      </div>
    );
  }

  // Not assessable from code
  if (!result.assessable) {
    return (
      <div style={{
        background: "#0c0a14", border: "1px solid #854d0e40", borderRadius: 10,
        padding: "14px 16px", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: expanded ? 10 : 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: "#422006",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0,
          }}>
            ⚠
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{criterion.title}</div>
            <div style={{ fontSize: 11, color: "#92400e", marginTop: 2 }}>Insufficient code evidence</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge color="#f59e0b" bg="#422006">Requires Manual Assessment</Badge>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 11 }}
            >
              {expanded ? "▲" : "▼"}
            </button>
          </div>
        </div>
        {expanded && (
          <div style={{ paddingLeft: 38, marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Why code evidence is insufficient:</div>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{result.reason}</p>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>What to assess at Stage 3:</div>
            <p style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.6 }}>{result.requiresManualAssessment}</p>
          </div>
        )}
      </div>
    );
  }

  // Assessable — show indicative score
  const scoreLabel = SCORE_LABELS[result.indicativeScore];
  return (
    <div style={{
      background: "#0c0a14",
      border: `1px solid ${result.indicativeScore === 0 ? "#7f1d1d" : "#1e1b2e"}`,
      borderRadius: 10, marginBottom: 8, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: scoreLabel.bg,
          border: `2px solid ${scoreLabel.color}40`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, fontWeight: 700, color: scoreLabel.color,
          fontFamily: "monospace", flexShrink: 0,
        }}>
          {result.indicativeScore}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{criterion.title}</div>
          <div style={{ fontSize: 11, color: scoreLabel.color, marginTop: 2 }}>
            {scoreLabel.label} — Indicative
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 11 }}
        >
          {expanded ? "Hide ▲" : "Details ▼"}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #1e1b2e", padding: "14px 16px", background: "#08060f" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Code Evidence Assessment
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>{result.explanation}</p>
              {result.gaps?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>Observable gaps:</div>
                  {result.gaps.map((g, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#fbbf24", lineHeight: 1.5, paddingLeft: 10, borderLeft: "2px solid #f59e0b40", marginBottom: 3 }}>
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Source Files Referenced
              </div>
              {result.sourceFiles?.length > 0 ? (
                result.sourceFiles.map((f, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: "#a5b4fc", fontFamily: "monospace", lineHeight: 1.6,
                    paddingLeft: 8, borderLeft: "2px solid #818cf840", marginBottom: 3,
                  }}>
                    {f}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "#4b5563" }}>No specific files cited</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main AutoAssessment component ───────────────────────────────────────────
export default function AutoAssessment({ scanResults, autoAssessment, onAssessmentComplete, apiKey }) {
  const [running, setRunning] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const results = autoAssessment?.results || {};
  const ranAt = autoAssessment?.ranAt;

  const assessedCount = Object.keys(results).length;
  const scoredCount = Object.values(results).filter(r => r?.assessable).length;
  const indicativeGateResult = indicativeGate(results);

  async function runFullAssessment() {
    if (!scanResults) return;
    if (!apiKey) { setError("Enter your Anthropic API key in settings to use auto-assessment."); return; }
    setRunning(true);
    setError(null);
    const newResults = {};

    for (const criterion of DEPLOY_CRITERIA) {
      setLoadingId(criterion.id);
      try {
        newResults[criterion.id] = await autoAssessCriterion(criterion, scanResults, apiKey);
      } catch (e) {
        newResults[criterion.id] = {
          assessable: false,
          reason: `Assessment failed: ${e.message}`,
          requiresManualAssessment: "Retry or assess manually at Stage 3.",
        };
      }
    }

    setLoadingId(null);
    setRunning(false);
    onAssessmentComplete({ results: newResults, ranAt: new Date().toISOString() });
  }

  if (!scanResults) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⚒</div>
        <p style={{ fontSize: 14, marginBottom: 4 }}>No repository scan available</p>
        <p style={{ fontSize: 12, color: "#4b5563" }}>
          Complete the Azure Repos scan in the Scan tab before running auto-assessment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header & controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            Automated Rubric Assessment
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#422006", border: "1px solid #854d0e", borderRadius: 6,
            padding: "4px 10px", fontSize: 11, color: "#fbbf24",
          }}>
            ⚠ Indicative — Based on Code Evidence Only
          </div>
          {ranAt && (
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
              Last run: {new Date(ranAt).toLocaleString()}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {error && <span style={{ fontSize: 11, color: "#ef4444", maxWidth: 240 }}>{error}</span>}
          <Btn onClick={runFullAssessment} disabled={running}>
            {running ? `Assessing ${loadingId ? `criterion ${loadingId}` : "…"}` : assessedCount > 0 ? "Re-run Assessment" : "Run Assessment"}
          </Btn>
        </div>
      </div>

      {/* Indicative gate summary */}
      {indicativeGateResult && (
        <div style={{
          background: "#110f1a", border: `1px solid ${indicativeGateResult.color}40`,
          borderRadius: 12, padding: 16, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: `${indicativeGateResult.color}15`,
            border: `2px solid ${indicativeGateResult.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: indicativeGateResult.color, fontFamily: "monospace" }}>
              {indicativeGateResult.actualTotal}
            </div>
            <div style={{ fontSize: 9, color: "#6b7280" }}>
              /{indicativeGateResult.scoredCount * 4}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: indicativeGateResult.color }}>
              {indicativeGateResult.label} — Indicative
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {indicativeGateResult.scoredCount} of 13 criteria assessed from code evidence.{" "}
              {13 - indicativeGateResult.scoredCount} criteria require manual assessment at Stage 3.
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#6b7280" }}>{scoredCount} criteria scored from code</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            {assessedCount - scoredCount} require manual assessment
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#4b5563" }} />
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            {13 - assessedCount} not yet assessed
          </span>
        </div>
      </div>

      {/* Criteria list */}
      {DEPLOY_CRITERIA.map(criterion => (
        <CriterionResult
          key={criterion.id}
          criterion={criterion}
          result={results[criterion.id] || null}
          loading={running && loadingId === criterion.id}
        />
      ))}

      {assessedCount === 0 && !running && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#6b7280", fontSize: 13 }}>
          Click <strong style={{ color: "#a5b4fc" }}>Run Assessment</strong> to analyse repository evidence against all 13 Rubric v2.1 criteria.
        </div>
      )}
    </div>
  );
}
