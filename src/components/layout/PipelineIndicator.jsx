import { STAGE_META } from "../../data/stageMeta.js";

export default function PipelineIndicator({ project, activeStage, onStageSelect }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
      {STAGE_META.map((stage, idx) => {
        const isActive = activeStage === stage.id;
        const stageData = project[`stage${stage.id}`];
        const isComplete =
          stageData?.completedAt ||
          (stage.id === 2 && stageData?.scanResults) ||
          (stage.id === 4 && stageData?.changeLog?.length > 0);

        let statusColor = "#4b5563";
        if (isComplete) statusColor = "#22c55e";
        else if (isActive) statusColor = "#c084fc";

        return (
          <div key={stage.id} style={{ flex: 1, position: "relative" }}>
            {idx > 0 && (
              <div style={{
                position: "absolute", left: 0, top: 18, width: "50%", height: 2,
                background: isComplete || isActive ? `${statusColor}60` : "#1e1b2e",
              }} />
            )}
            {idx < 3 && (
              <div style={{
                position: "absolute", right: 0, top: 18, width: "50%", height: 2, background: "#1e1b2e",
              }} />
            )}
            <div
              onClick={() => onStageSelect(stage.id)}
              style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive ? "linear-gradient(135deg, #c084fc, #818cf8)" : isComplete ? "#052e16" : "#110f1a",
                border: `2px solid ${isActive ? "#c084fc" : isComplete ? "#22c55e" : "#1e1b2e"}`,
                fontSize: 14, color: isActive ? "#fff" : statusColor, transition: "all 0.2s",
              }}>
                {isComplete && !isActive ? "✓" : stage.icon}
              </div>
              <div style={{
                fontSize: 11, fontWeight: isActive ? 700 : 500,
                color: isActive ? "#e2e8f0" : "#6b7280", marginTop: 6, textAlign: "center",
              }}>
                {stage.short}
              </div>
              {stage.rubric && (
                <div style={{ fontSize: 9, color: "#4b5563" }}>{stage.rubric}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
