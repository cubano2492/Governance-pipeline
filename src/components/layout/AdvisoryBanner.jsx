export default function AdvisoryBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "#1a1600", border: "1px solid #854d0e", borderRadius: 10,
      padding: 14, marginBottom: 16, fontSize: 13, color: "#fbbf24",
    }}>
      ⚡ Advisory: {message}
    </div>
  );
}
