/**
 * Parses org-mode file content into metadata and body.
 *
 * Extracts #+KEYWORD values and :PROPERTIES: drawer entries,
 * returning them alongside the remaining body content.
 */

const KEYWORD_RE = /^#\+(\w+):\s*(.+)$/;
const INACTIVE_TIMESTAMP_RE = /^\[(\d{4}-\d{2}-\d{2})\s+\w+\]$/;

/**
 * Parse an org inactive timestamp into an ISO date string.
 * "[2026-03-21 Sat]" → "2026-03-21"
 * Returns the original string if not a valid timestamp.
 */
export function parseOrgTimestamp(value) {
  const match = value.match(INACTIVE_TIMESTAMP_RE);
  return match ? match[1] : value;
}

/**
 * Split a comma-separated string into a trimmed array.
 * "post, woodworking" → ["post", "woodworking"]
 */
export function splitCommaSeparated(value) {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Parse org file content into { keywords, properties, body }.
 *
 * @param {string} orgContent - Full org file content
 * @returns {{ keywords: Record<string, string>, properties: Record<string, string>, body: string }}
 */
export function parseOrgMetadata(orgContent) {
  const lines = orgContent.split("\n");
  const keywords = {};
  const properties = {};
  let bodyStartIndex = 0;
  let inProperties = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inProperties) {
      if (line.trim() === ":END:") {
        inProperties = false;
        bodyStartIndex = i + 1;
        continue;
      }
      const propMatch = line.match(/^:(\w+):\s*(.+)$/);
      if (propMatch) {
        properties[propMatch[1].toLowerCase()] = propMatch[2].trim();
      }
      continue;
    }

    if (line.trim() === ":PROPERTIES:") {
      inProperties = true;
      continue;
    }

    const kwMatch = line.match(KEYWORD_RE);
    if (kwMatch) {
      keywords[kwMatch[1].toLowerCase()] = kwMatch[2].trim();
      bodyStartIndex = i + 1;
      continue;
    }

    // Skip blank lines between metadata and body
    if (line.trim() === "" && bodyStartIndex === i) {
      bodyStartIndex = i + 1;
      continue;
    }

    // First non-metadata, non-blank line — body starts here
    break;
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();

  return { keywords, properties, body };
}
