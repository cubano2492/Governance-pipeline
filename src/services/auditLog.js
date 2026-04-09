export function addAuditEntry(project, action, detail) {
  return {
    ...project,
    auditLog: [
      ...(project.auditLog || []),
      { ts: new Date().toISOString(), action, detail },
    ],
  };
}
