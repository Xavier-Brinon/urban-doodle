/**
 * Generates YAML frontmatter from a metadata object.
 *
 * Handles string values, date strings, and arrays (emitted as
 * YAML lists). Null/undefined values are omitted.
 */

/**
 * Escape a YAML string value if it contains special characters.
 */
function yamlValue(value) {
  if (typeof value !== "string") return String(value);
  if (
    value.includes(":") ||
    value.includes("#") ||
    value.includes("{") ||
    value.includes("}") ||
    value.includes("[") ||
    value.includes("]") ||
    value.includes('"') ||
    value.includes("'") ||
    value.startsWith("@") ||
    value.startsWith("*") ||
    value.startsWith("&")
  ) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

/**
 * Generate a YAML frontmatter string from a metadata object.
 *
 * @param {Record<string, string | string[] | null | undefined>} metadata
 * @returns {string} YAML frontmatter with --- delimiters, or empty string if no metadata
 */
export function generateFrontmatter(metadata) {
  const entries = Object.entries(metadata).filter(
    ([, v]) => v != null && v !== undefined,
  );

  if (entries.length === 0) return "";

  const lines = ["---"];

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${yamlValue(item)}`);
      }
    } else if (typeof value === "object") {
      lines.push(`${key}:`);
      for (const [subKey, subVal] of Object.entries(value)) {
        if (subVal != null) {
          lines.push(`  ${subKey}: ${yamlValue(String(subVal))}`);
        }
      }
    } else {
      lines.push(`${key}: ${yamlValue(value)}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}
