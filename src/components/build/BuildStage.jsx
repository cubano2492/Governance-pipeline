import { useState } from "react";
import { Card } from "../ui.jsx";
import RemediationTracker from "./RemediationTracker.jsx";
import AzureRepoScanner from "./AzureRepoScanner.jsx";
import ScanResults from "./ScanResults.jsx";
import AutoAssessment from "./AutoAssessment.jsx";

const TABS = [
  { id: "remediation", label: "Remediation" },
  { id: "scan",        label: "Repo Scan" },
  { id: "assessment",  label: "Auto-Assessment" },
];

export default function BuildStage({ project, onUpdate, apiKey }) {
  const [activeTab, setActiveTab] = useState("remediation");
  const s2 = project.stage2;

  function updateEvidenceNote(criterionId, field, val) {
    const evidenceNotes = {
      ...s2.evidenceNotes,
      [criterionId]: { ...s2.evidenceNotes?.[criterionId], [field]: val },
    };
    onUpdate({ ...s2, evidenceNotes });
  }

  function handleScanComplete({ org, project: proj, repo, result }) {
    onUpdate({
      ...s2,
      repoOrg: org,
      repoProject: proj,
      repoName: repo,
      scanResults: result,
      scanDate: result.scannedAt,
      // Clear prior auto-assessment when a new scan runs
      autoAssessment: null,
    });
    setActiveTab("scan");
  }

  function handleAssessmentComplete(assessment) {
    onUpdate({ ...s2, autoAssessment: assessment });
  }

  return (
    <div>
      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#0c0a14", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const hasBadge = tab.id === "assessment" && s2.scanResults && !s2.autoAssessment;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? "#1e1b2e" : "transparent",
                color: isActive ? "#e2e8f0" : "#6b7280",
                border: "none", borderRadius: 8, padding: "8px 18px",
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s", position: "relative",
              }}
            >
              {tab.label}
              {hasBadge && (
                <span style={{
                  position: "absolute", top: 6, right: 8,
                  width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "remediation" && (
        <Card>
          <RemediationTracker
            stage1Results={project.stage1.results}
            evidenceNotes={s2.evidenceNotes}
            onUpdateEvidence={updateEvidenceNote}
          />
        </Card>
      )}

      {activeTab === "scan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <AzureRepoScanner
              stage2={s2}
              onScanComplete={handleScanComplete}
            />
          </Card>
          {s2.scanResults && (
            <Card>
              <ScanResults scanResults={s2.scanResults} />
            </Card>
          )}
        </div>
      )}

      {activeTab === "assessment" && (
        <Card>
          <AutoAssessment
            scanResults={s2.scanResults}
            autoAssessment={s2.autoAssessment}
            onAssessmentComplete={handleAssessmentComplete}
            apiKey={apiKey}
          />
        </Card>
      )}
    </div>
  );
}
