import { SYSTEM_PROMPT_AUTO_ASSESS } from "../data/systemPrompts.js";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

/**
 * Score a single criterion against a rubric using the Claude API.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {string} apiKey
 * @returns {Promise<{score: number, explanation: string, remediation: string[]}>}
 */
export async function scoreCriterion(systemPrompt, userMessage, apiKey) {
  const resp = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  const text = data.content?.[0]?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

/**
 * Run the automated code-evidence assessment for a single deploy criterion.
 * @param {object} criterion - { id, title, category }
 * @param {object} scanResults - { categorized, fileContents }
 * @param {string} apiKey
 * @returns {Promise<object>} - assessable result or not-assessable result
 */
export async function autoAssessCriterion(criterion, scanResults, apiKey) {
  // Build relevant file evidence for this criterion
  const relevantFiles = selectRelevantFiles(criterion.id, scanResults);
  const evidenceBlock = buildEvidenceBlock(relevantFiles, scanResults.fileContents);

  const userMessage = `Criterion: ${criterion.id}. ${criterion.title} (${criterion.category})

Available code evidence from repository scan:
${evidenceBlock || "No relevant files found in scan."}`;

  const resp = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT_AUTO_ASSESS,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  const text = data.content?.[0]?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

/**
 * Select the most relevant categorised files for a given criterion.
 * Returns an array of file paths.
 */
function selectRelevantFiles(criterionId, scanResults) {
  const { categorized } = scanResults;

  const mappings = {
    1:  [...categorized.security, ...categorized.config],       // Auth & Identity
    2:  [...categorized.security, ...categorized.config],       // Data Handling
    3:  [...categorized.config, ...categorized.security],       // Scope / Least Privilege
    4:  [],                                                      // Output Safety — non-code
    5:  [],                                                      // Prompt Injection — non-code
    6:  [...categorized.security, ...categorized.config],       // Audit Logging
    7:  [],                                                      // Vendor Risk — non-code
    8:  [],                                                      // Sensitive Data — non-code
    9:  [...categorized.ci, ...categorized.config],             // Change Control
    10: [],                                                      // Operational Boundaries — non-code
    11: [...categorized.ci, ...categorized.security, ...categorized.config], // Infrastructure
    12: [],                                                      // Incident Response — non-code
    13: [...categorized.config, ...categorized.ci],             // Cost & Usage Guardrails
  };

  return (mappings[criterionId] || []).slice(0, 6);
}

/**
 * Build a readable evidence block from selected file paths and their contents.
 */
function buildEvidenceBlock(filePaths, fileContents) {
  if (!filePaths.length) return "";

  return filePaths.map(fp => {
    const content = fileContents[fp];
    if (content) {
      return `--- ${fp} ---\n${content.slice(0, 1500)}`;
    }
    return `--- ${fp} --- (file listed in scan; content not fetched)`;
  }).join("\n\n");
}
