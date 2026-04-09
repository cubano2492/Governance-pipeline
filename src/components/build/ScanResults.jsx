export default function ScanResults({ scanResults }) {
  const sr = scanResults;
  if (!sr) return null;

  const categories = [
    ["Security", sr.categorized.security, "#22c55e"],
    ["Dependencies", sr.categorized.dependencies, "#a855f7"],
    ["CI/CD", sr.categorized.ci, "#3b82f6"],
    ["Config", sr.categorized.config, "#f59e0b"],
  ];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
        Scan Results — {sr.totalFiles} files found
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {categories.map(([label, files, color]) => (
          <div key={label} style={{ background: "#0c0a14", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 6 }}>
              {label} ({files.length})
            </div>
            {files.slice(0, 5).map((f, i) => (
              <div key={i} style={{
                fontSize: 11, color: "#94a3b8", fontFamily: "monospace",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {f}
              </div>
            ))}
            {files.length > 5 && (
              <div style={{ fontSize: 11, color: "#6b7280" }}>+{files.length - 5} more</div>
            )}
            {files.length === 0 && (
              <div style={{ fontSize: 11, color: "#374151" }}>None found</div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(sr.fileContents).length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>File Previews</div>
          {Object.entries(sr.fileContents).map(([path, content]) => (
            <details key={path} style={{ marginBottom: 6 }}>
              <summary style={{ fontSize: 12, color: "#a5b4fc", cursor: "pointer", fontFamily: "monospace" }}>
                {path}
              </summary>
              <pre style={{
                fontSize: 11, color: "#94a3b8", background: "#0c0a14",
                padding: 10, borderRadius: 6, overflow: "auto", maxHeight: 200,
                marginTop: 4, whiteSpace: "pre-wrap",
              }}>
                {content}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
