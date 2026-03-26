/**
 * Assembles a complete Markdown file from YAML frontmatter and body.
 */

/**
 * Combine YAML frontmatter and Markdown body into a complete .md file.
 *
 * @param {string} frontmatter - YAML frontmatter string (with --- delimiters), or empty
 * @param {string} body - Markdown body content
 * @returns {string} Complete .md file content
 */
export function assembleFile(frontmatter, body) {
  const parts = [];

  if (frontmatter) {
    parts.push(frontmatter);
  }

  if (body) {
    parts.push(body);
  }

  return parts.join("\n") + "\n";
}
