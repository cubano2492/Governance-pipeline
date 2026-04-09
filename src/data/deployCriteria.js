export const DEPLOY_CRITERIA = [
  { id: 1, title: "Authentication & Identity Verification", category: "Access Control", guidance: "Credential management practices, secrets vaulting, OAuth/managed identity usage, hardcoded credential scan results." },
  { id: 2, title: "Data Handling Classification Compliance", category: "Data Security", guidance: "Data classification, logging practices, sensitive data at external endpoints, data flow diagrams." },
  { id: 3, title: "Scope Limitation / Least Privilege Enforcement", category: "Access Control", guidance: "System permissions, permission manifest, access vs minimum required for stated function." },
  { id: 4, title: "Output Safety & Content Policy Adherence", category: "AI Safety", guidance: "Content filtering config, AUP testing results, known gaps in refusal behaviour." },
  { id: 5, title: "Prompt Injection & Jailbreak Resistance", category: "AI Safety", guidance: "Adversarial testing performed, categories covered, pass/fail results, known susceptibilities." },
  { id: 6, title: "Audit Logging & Non-Repudiation", category: "Monitoring", guidance: "What is logged, log format, identity binding, retention policy, SIEM integration status." },
  { id: 7, title: "Third-Party Model & Vendor Risk Acceptance", category: "Vendor Risk", guidance: "VRA status, data residency, training data usage, retention/deletion terms, DPA/BAA status." },
  { id: 8, title: "Sensitive Data Leakage Prevention", category: "Data Security", guidance: "Leakage testing, system prompt/RAG content extraction tests, automated output scanning." },
  { id: 9, title: "Change Control & Version Governance", category: "Governance", guidance: "Version control for code, model versions, system prompts, tool configs, retrieval sources, change approval process." },
  { id: 10, title: "Operational Boundaries & Fallback Behavior", category: "AI Safety", guidance: "Documented boundaries, system behaviour at limits, fallback behaviour test results." },
  { id: 11, title: "Infrastructure & Runtime Security", category: "Operations", guidance: "Container scanning, network segmentation, patch management cadence, runtime monitoring." },
  { id: 12, title: "Incident Response & Kill Switch", category: "Operations", guidance: "AI-specific IR plan, killswitch mechanism, rollback capability, staging environment tests." },
  { id: 13, title: "Cost & Usage Guardrails", category: "Operations", guidance: "Rate limits, token quotas, spending caps, circuit breakers, anomaly alerting." },
];

// Criteria assessable from code evidence alone
export const CODE_ASSESSABLE_IDS = new Set([1, 2, 3, 6, 9, 11, 13]);

// Criteria requiring non-code evidence (tests, contracts, documentation)
export const MANUAL_ONLY_IDS = new Set([4, 5, 7, 8, 10, 12]);

export const MANUAL_EVIDENCE_REQUIRED = {
  4: "Requires AUP test results and content filtering test logs",
  5: "Requires adversarial test report (prompt injection / jailbreak test battery)",
  7: "Requires Vendor Risk Acceptance (VRA) and DPA/BAA documentation",
  8: "Requires leakage test results and output scanning test logs",
  10: "Requires boundary definition document and fallback behaviour test records",
  12: "Requires AI-specific IR plan and killswitch test records",
};
