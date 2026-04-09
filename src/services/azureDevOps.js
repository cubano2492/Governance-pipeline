const SECURITY_FILES = ["readme", "dockerfile", "docker-compose", ".env.example", ".env.sample", "security.md", "security", ".github/dependabot", "dependabot", ".gitignore"];
const DEP_FILES = ["package.json", "requirements.txt", "pyproject.toml", "cargo.toml", "go.mod", "gemfile", "pom.xml", "build.gradle"];
const CI_FILES = ["azure-pipelines.yml", "azure-pipelines.yaml", ".github/workflows", "jenkinsfile", ".gitlab-ci"];

/**
 * Scan an Azure DevOps repository: fetch file tree, categorise files, fetch key file contents.
 * PAT is used only within this function and never persisted.
 *
 * @param {{ org: string, project: string, repo: string, pat: string }} params
 * @returns {Promise<{ totalFiles: number, categorized: object, fileContents: object, scannedAt: string }>}
 */
export async function scanRepository({ org, project, repo, pat }) {
  const base = `https://dev.azure.com/${encodeURIComponent(org)}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repo)}`;
  const headers = {
    Authorization: `Basic ${btoa(":" + pat)}`,
    "Content-Type": "application/json",
  };

  const itemsResp = await fetch(`${base}/items?recursionLevel=full&api-version=7.1`, { headers });
  if (!itemsResp.ok) throw new Error(`Azure API returned ${itemsResp.status}: ${itemsResp.statusText}`);
  const itemsData = await itemsResp.json();

  const allPaths = (itemsData.value || []).filter(i => !i.isFolder).map(i => i.path);

  const categorized = { security: [], dependencies: [], ci: [], config: [] };
  allPaths.forEach(p => {
    const lower = p.toLowerCase();
    const name = lower.split("/").pop();
    if (SECURITY_FILES.some(sf => lower.includes(sf))) {
      categorized.security.push(p);
    } else if (DEP_FILES.some(df => name === df || lower.includes(df))) {
      categorized.dependencies.push(p);
    } else if (CI_FILES.some(cf => lower.includes(cf))) {
      categorized.ci.push(p);
    } else if ([".yml", ".yaml", ".json", ".toml", ".cfg", ".ini"].some(ext => name.endsWith(ext))) {
      categorized.config.push(p);
    }
  });

  // Fetch content of key files — prioritise security + dep + ci, limit to 8
  const keyFiles = [...categorized.security, ...categorized.dependencies, ...categorized.ci].slice(0, 8);
  const fileContents = {};
  for (const fp of keyFiles) {
    try {
      const fResp = await fetch(`${base}/items?path=${encodeURIComponent(fp)}&api-version=7.1`, { headers });
      if (fResp.ok) {
        const text = await fResp.text();
        fileContents[fp] = text.slice(0, 3000);
      }
    } catch {
      // Skip files that fail to fetch — non-fatal
    }
  }

  return {
    totalFiles: allPaths.length,
    categorized,
    fileContents,
    scannedAt: new Date().toISOString(),
  };
}
