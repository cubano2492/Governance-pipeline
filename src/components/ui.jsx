export function Badge({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
      color, background: bg || `${color}18`, padding: "3px 9px", borderRadius: 4, whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, disabled, variant = "primary", style = {} }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
    fontWeight: 600, fontSize: 13, borderRadius: 8, padding: "9px 18px",
    transition: "all 0.15s", opacity: disabled ? 0.45 : 1, ...style,
  };
  const variants = {
    primary:   { background: "linear-gradient(135deg, #c084fc, #818cf8)", color: "#fff" },
    secondary: { background: "#1e1b2e", color: "#a5b4fc", border: "1px solid #2e2a45" },
    danger:    { background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d" },
    ghost:     { background: "transparent", color: "#94a3b8", border: "1px solid #1e1b2e" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "#0c0a14", border: "1px solid #1e1b2e", color: "#e2e8f0",
        borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit",
        outline: "none", width: "100%", transition: "border-color 0.2s", ...style,
      }}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, style = {} }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: "#0c0a14", border: "1px solid #1e1b2e", color: "#e2e8f0",
        borderRadius: 8, padding: "12px 14px", fontSize: 13, fontFamily: "inherit",
        outline: "none", width: "100%", resize: "vertical", lineHeight: 1.6,
        transition: "border-color 0.2s", ...style,
      }}
    />
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#110f1a", border: "1px solid #1e1b2e",
      borderRadius: 12, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: "#a5b4fc",
      letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14,
    }}>
      {children}
    </div>
  );
}
