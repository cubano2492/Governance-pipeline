import { useState } from "react";
import { Btn, TextInput } from "../ui.jsx";

export default function ProjectRegistry({ registry, loading, onSelectProject, onCreateProject }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    onCreateProject(name.trim(), owner.trim());
    setName("");
    setOwner("");
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Project Registry</h1>
          <p style={{ fontSize: 13, color: "#6b7280" }}>All AI projects under security governance</p>
        </div>
        <Btn onClick={() => setShowForm(v => !v)}>{showForm ? "Cancel" : "+ New Project"}</Btn>
      </div>

      {showForm && (
        <div style={{
          background: "#110f1a", border: "1px solid #c084fc40",
          borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Project Name</label>
              <TextInput value={name} onChange={setName} placeholder="e.g. Customer Support AI Agent" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 4 }}>Owner / Assessor</label>
              <TextInput value={owner} onChange={setOwner} placeholder="e.g. Jane Smith" />
            </div>
            <Btn onClick={handleCreate} disabled={!name.trim()}>Create</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading…</div>
      ) : registry.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 4 }}>No projects yet</p>
          <p style={{ fontSize: 13, color: "#4b5563" }}>Create your first project to begin the security governance pipeline</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {registry.map(entry => (
            <div
              key={entry.id}
              onClick={() => onSelectProject(entry.id)}
              style={{
                background: "#110f1a", border: "1px solid #1e1b2e", borderRadius: 12,
                padding: "18px 22px", cursor: "pointer", transition: "border-color 0.15s",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c084fc40"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1b2e"; }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{entry.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {entry.owner} · Created {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#4b5563" }}>→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
