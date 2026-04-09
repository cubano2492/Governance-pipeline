import { useState, useEffect, useRef } from "react";
import Header from "./components/layout/Header.jsx";
import PipelineIndicator from "./components/layout/PipelineIndicator.jsx";
import AdvisoryBanner from "./components/layout/AdvisoryBanner.jsx";
import ProjectRegistry from "./components/registry/ProjectRegistry.jsx";
import ScoringStage from "./components/scoring/ScoringStage.jsx";
import BuildStage from "./components/build/BuildStage.jsx";
import MonitorStage from "./components/monitor/MonitorStage.jsx";
import ExportView from "./components/export/ExportView.jsx";
import { Btn, TextInput } from "./components/ui.jsx";
import { loadRegistry, saveRegistry, loadProject, saveProject, newProject } from "./services/storage.js";
import { addAuditEntry } from "./services/auditLog.js";
import { gateDecision } from "./data/gateThresholds.js";
import { STAGE_META } from "./data/stageMeta.js";
import { DESIGN_CRITERIA } from "./data/designCriteria.js";
import { DEPLOY_CRITERIA } from "./data/deployCriteria.js";
import { SYSTEM_PROMPT_DESIGN, SYSTEM_PROMPT_DEPLOY } from "./data/systemPrompts.js";

const STAGE_DESCRIPTIONS = {
  1: "Design-Phase Security Rubric v1.0 — 13 criteria, 52 points",
  2: "Remediation tracking, Azure Repos scanning, automated evidence assessment",
  3: "AI Deployment Security Rubric v2.1 — 13 criteria, 52 points",
  4: "Re-assessment scheduling, change logging, lifecycle monitoring",
};

function getAdvisory(project, activeStage) {
  if (activeStage === 2 && Object.keys(project.stage1.results).length === 0)
    return "Stage 1 (Design Gate) has not been completed. Remediation items will populate once the design-phase assessment is scored.";
  if (activeStage === 3 && !project.stage2.scanResults && Object.keys(project.stage1.results).length > 0)
    return "No repository scan has been performed in Stage 2 (Build Phase). Consider scanning your Azure Repo before completing pre-deployment assessment.";
  return null;
}

// ─── API Key settings panel ───────────────────────────────────────────────────
function ApiKeyPanel({ apiKey, onSave, onClose }) {
  const [val, setVal] = useState(apiKey || "");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000a0", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ background: "#110f1a", border: "1px solid #c084fc40", borderRadius: 16, padding: 28, width: 460 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Anthropic API Key</div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>
          Required for AI scoring (Stages 1, 3) and automated assessment (Stage 2).<br />
          Stored in <code style={{ color: "#a5b4fc" }}>localStorage</code> — only sent to the Anthropic API.
        </p>
        <TextInput
          value={val}
          onChange={setVal}
          placeholder="sk-ant-…"
          type="password"
          style={{ fontFamily: "monospace", marginBottom: 14 }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => { onSave(val.trim()); onClose(); }} disabled={!val.trim()}>Save Key</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [registry, setRegistry] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [activeStage, setActiveStage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exportStage, setExportStage] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("pipeline:apiKey") || "");
  const saveTimeout = useRef(null);

  useEffect(() => {
    setRegistry(loadRegistry());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    const p = loadProject(activeProjectId);
    if (p) { setProject(p); setActiveStage(p.currentStage || 1); }
  }, [activeProjectId]);

  useEffect(() => {
    if (!project) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveProject(project), 800);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [project]);

  function handleSaveApiKey(key) {
    localStorage.setItem("pipeline:apiKey", key);
    setApiKey(key);
  }

  function handleCreateProject(name, owner) {
    let p = newProject(name, owner);
    p = addAuditEntry(p, "created", "Project created");
    saveProject(p);
    const entry = { id: p.id, name: p.name, owner: p.owner, createdAt: p.createdAt };
    const newReg = [...registry, entry];
    setRegistry(newReg);
    saveRegistry(newReg);
    setActiveProjectId(p.id);
  }

  function handleNavigateHome() {
    setProject(null);
    setActiveProjectId(null);
  }

  function updateStageData(stageKey, data) {
    setProject(prev => {
      const updated = { ...prev, [stageKey]: data };
      if (stageKey === "stage1" || stageKey === "stage3") {
        const results = data.results || {};
        const scored = Object.keys(results).filter(k => results[k]?.score != null).length;
        if (scored === 13) {
          const total = Object.values(results).reduce((s, r) => s + (r?.score ?? 0), 0);
          const stageNum = stageKey === "stage1" ? 1 : 3;
          updated[stageKey] = {
            ...data,
            completedAt: data.completedAt || new Date().toISOString(),
            gateDecision: gateDecision(total, stageNum).label,
          };
        }
      }
      return updated;
    });
  }

  if (exportStage && project) {
    return <ExportView project={project} stageNum={exportStage} onClose={() => setExportStage(null)} />;
  }

  const advisory = project ? getAdvisory(project, activeStage) : null;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#08060f", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0c0a14; }
        ::-webkit-scrollbar-thumb { background: #1e1b2e; border-radius: 3px; }
        textarea { resize: vertical; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>

      <Header project={project} onNavigateHome={handleNavigateHome} />

      {/* API key toggle — fixed bottom-right */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 40 }}>
        <button
          onClick={() => setShowApiKey(true)}
          style={{
            background: apiKey ? "#052e16" : "#450a0a",
            border: `1px solid ${apiKey ? "#22c55e40" : "#7f1d1d"}`,
            color: apiKey ? "#22c55e" : "#ef4444",
            borderRadius: 8, padding: "7px 14px", fontSize: 11,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {apiKey ? "API Key ✓" : "Set API Key"}
        </button>
      </div>

      {showApiKey && (
        <ApiKeyPanel apiKey={apiKey} onSave={handleSaveApiKey} onClose={() => setShowApiKey(false)} />
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px" }}>

        {!project && (
          <ProjectRegistry
            registry={registry}
            loading={loading}
            onSelectProject={setActiveProjectId}
            onCreateProject={handleCreateProject}
          />
        )}

        {project && (
          <div>
            <PipelineIndicator
              project={project}
              activeStage={activeStage}
              onStageSelect={setActiveStage}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{STAGE_META[activeStage - 1].label}</h2>
                <p style={{ fontSize: 12, color: "#6b7280" }}>{STAGE_DESCRIPTIONS[activeStage]}</p>
              </div>
              {(activeStage === 1 || activeStage === 3) && (
                <Btn variant="secondary" onClick={() => setExportStage(activeStage)} style={{ fontSize: 12 }}>
                  Export Scorecard
                </Btn>
              )}
            </div>

            <AdvisoryBanner message={advisory} />

            {activeStage === 1 && (
              <ScoringStage
                stageNum={1}
                criteria={DESIGN_CRITERIA}
                systemPrompt={SYSTEM_PROMPT_DESIGN}
                stageData={project.stage1}
                onUpdate={data => updateStageData("stage1", data)}
                apiKey={apiKey}
              />
            )}
            {activeStage === 2 && (
              <BuildStage
                project={project}
                onUpdate={data => updateStageData("stage2", data)}
                apiKey={apiKey}
              />
            )}
            {activeStage === 3 && (
              <ScoringStage
                stageNum={3}
                criteria={DEPLOY_CRITERIA}
                systemPrompt={SYSTEM_PROMPT_DEPLOY}
                stageData={project.stage3}
                onUpdate={data => updateStageData("stage3", data)}
                apiKey={apiKey}
              />
            )}
            {activeStage === 4 && (
              <MonitorStage
                project={project}
                onUpdate={data => updateStageData("stage4", data)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
