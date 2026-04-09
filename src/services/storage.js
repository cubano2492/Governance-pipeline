const PREFIX = "pipeline";

function getKey(key) {
  return `${PREFIX}:${key}`;
}

export function loadRegistry() {
  try {
    const val = localStorage.getItem(getKey("registry"));
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function saveRegistry(registry) {
  localStorage.setItem(getKey("registry"), JSON.stringify(registry));
}

export function loadProject(id) {
  try {
    const val = localStorage.getItem(getKey(`project:${id}`));
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function saveProject(project) {
  localStorage.setItem(getKey(`project:${project.id}`), JSON.stringify(project));
}

export function deleteProject(id) {
  localStorage.removeItem(getKey(`project:${id}`));
}

export function newProject(name, owner) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    owner,
    createdAt: new Date().toISOString(),
    currentStage: 1,
    stage1: { scores: {}, findings: {}, results: {}, completedAt: null, gateDecision: null },
    stage2: {
      remediationItems: [],
      repoOrg: "",
      repoProject: "",
      repoName: "",
      scanResults: null,
      scanDate: null,
      evidenceNotes: {},
      autoAssessment: null,
      completedAt: null,
    },
    stage3: { scores: {}, findings: {}, results: {}, completedAt: null, gateDecision: null },
    stage4: { nextReassessment: null, remediationItems: [], changeLog: [], reassessmentHistory: [] },
    auditLog: [],
  };
}
