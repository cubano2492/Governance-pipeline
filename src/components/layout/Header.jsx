export default function Header({ project, onNavigateHome }) {
  return (
    <div style={{
      background: "#0c0a14", borderBottom: "1px solid #1e1b2e",
      padding: "0 28px", position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", display: "flex",
        alignItems: "center", justifyContent: "space-between", height: 56,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: project ? "pointer" : "default" }}
          onClick={project ? onNavigateHome : undefined}
        >
          <div style={{
            width: 28, height: 28, background: "linear-gradient(135deg, #c084fc, #818cf8)",
            borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>
            ◈
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "#e2e8f0" }}>
              GOVERNANCE PIPELINE
            </div>
            <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              AI Security Assessment Workflow
            </div>
          </div>
        </div>

        {project && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 500 }}>{project.name}</span>
            <button
              onClick={onNavigateHome}
              style={{
                background: "transparent", color: "#94a3b8", border: "1px solid #1e1b2e",
                borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer",
                fontWeight: 600, fontFamily: "inherit",
              }}
            >
              All Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
