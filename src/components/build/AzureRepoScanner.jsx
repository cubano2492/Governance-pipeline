import { useState } from "react";
import { Btn, TextInput } from "../ui.jsx";
import { scanRepository } from "../../services/azureDevOps.js";

export default function AzureRepoScanner({ stage2, onScanComplete }) {
  const [org, setOrg] = useState(stage2.repoOrg || "");
  const [project, setProject] = useState(stage2.repoProject || "");
  const [repo, setRepo] = useState(stage2.repoName || "");
  const [pat, setPat] = useState(""); // never persisted — session only
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const sr = stage2.scanResults;

  async function handleScan() {
    if (!org || !project || !repo || !pat) return;
    setScanning(true);
    setError(null);
    try {
      const result = await scanRepository({ org, project, repo, pat });
      onScanComplete({ org, project, repo, result });
    } catch (e) {
      setError(e.message);
    }
    setScanning(false);
  }

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
        Azure Repos Scanner
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Organisation</label>
          <TextInput value={org} onChange={setOrg} placeholder="my-org" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Project</label>
          <TextInput value={project} onChange={setProject} placeholder="my-project" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Repository</label>
          <TextInput value={repo} onChange={setRepo} placeholder="my-repo" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>
          Personal Access Token <span style={{ color: "#4b5563" }}>(session only — never stored)</span>
        </label>
        <TextInput
          value={pat}
          onChange={setPat}
          placeholder="Enter PAT…"
          type="password"
          style={{ fontFamily: "monospace" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Btn
          onClick={handleScan}
          disabled={scanning || !org || !project || !repo || !pat}
        >
          {scanning ? "Scanning…" : sr ? "Re-scan Repository" : "Scan Repository"}
        </Btn>
        {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
        {sr && !error && (
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Last scan: {new Date(sr.scannedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
