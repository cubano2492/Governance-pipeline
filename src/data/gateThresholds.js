export function gateDecision(score, stage) {
  if (stage === 1) {
    if (score >= 47) return { label: "Proceed", color: "#22c55e", severity: 0 };
    if (score >= 36) return { label: "Proceed with Conditions", color: "#4ade80", severity: 1 };
    if (score >= 26) return { label: "Revise & Resubmit", color: "#eab308", severity: 2 };
    if (score >= 13) return { label: "High Risk — Block", color: "#f97316", severity: 3 };
    return { label: "Critical — Block", color: "#ef4444", severity: 4 };
  }
  if (score >= 47) return { label: "Approved", color: "#22c55e", severity: 0 };
  if (score >= 36) return { label: "Conditional", color: "#4ade80", severity: 1 };
  if (score >= 26) return { label: "High Risk", color: "#eab308", severity: 2 };
  if (score >= 13) return { label: "Critical Risk", color: "#f97316", severity: 3 };
  return { label: "Critical Risk", color: "#ef4444", severity: 4 };
}
