/**
 * Wraps Pandoc to convert org-mode body content to Markdown.
 *
 * This is the seam where Pandoc can later be swapped for
 * Emacs batch mode — the interface (org string in, Markdown
 * string out) stays stable.
 */

import { execFile } from "node:child_process";

/**
 * Convert org-mode body content to GitHub-flavoured Markdown via Pandoc.
 *
 * @param {string} orgBody - Org-mode body content (no metadata)
 * @returns {Promise<string>} Markdown output
 */
export function convertOrgToMarkdown(orgBody) {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      "pandoc",
      ["-f", "org", "-t", "gfm", "--wrap=none"],
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Pandoc failed: ${stderr || error.message}`));
          return;
        }
        resolve(stdout.trimEnd());
      },
    );
    proc.stdin.write(orgBody);
    proc.stdin.end();
  });
}
