import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  parseOrgMetadata,
  parseOrgTimestamp,
  splitCommaSeparated,
} from "../scripts/lib/parse-org-metadata.js";
import { generateFrontmatter } from "../scripts/lib/generate-frontmatter.js";
import { convertOrgToMarkdown } from "../scripts/lib/pandoc-wrapper.js";
import { assembleFile } from "../scripts/lib/assemble-file.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  readFileSync(join(__dirname, "fixtures", name), "utf-8");

/**
 * Convert a single org file through the full pipeline,
 * returning the complete .md file content.
 */
async function convertOrgFile(orgContent) {
  const { keywords, properties, body } = parseOrgMetadata(orgContent);

  const metadata = {
    title: keywords.title || null,
    description: keywords.description || null,
    date: keywords.date ? parseOrgTimestamp(keywords.date) : null,
    tags: properties.tags ? splitCommaSeparated(properties.tags) : null,
    author: properties.author || null,
  };

  const frontmatter = generateFrontmatter(metadata);
  const markdownBody = await convertOrgToMarkdown(body);
  return assembleFile(frontmatter, markdownBody);
}

describe("full pipeline integration", () => {
  it("converts a complete org post to valid Markdown with frontmatter", async () => {
    const orgContent = fixture("sample-post.org");
    const md = await convertOrgFile(orgContent);

    // Frontmatter is present and correct
    assert.ok(md.startsWith("---\n"));
    assert.ok(md.includes("title: Weekend Woodworking"));
    assert.ok(md.includes("description: Building a bookshelf from reclaimed oak"));
    assert.ok(md.includes("date: 2026-03-21"));
    assert.ok(md.includes("tags:\n  - post\n  - woodworking\n  - diy"));
    assert.ok(md.includes("author: Xavier Brinon"));

    // Body content is converted
    assert.ok(md.includes("# Materials"));
    assert.ok(md.includes("- 4 planks of reclaimed oak"));
    assert.ok(md.includes("**sanding**"));
    assert.ok(md.includes("*carefully*"));
    assert.ok(md.includes("`cut-list.py`"));
    assert.ok(md.includes("``` python"));
    assert.ok(md.includes("> Measure twice, cut once."));
    assert.ok(md.includes("[brass screws](https://example.com/brass-screws)"));

    // File ends with single newline
    assert.ok(md.endsWith("\n"));
    assert.ok(!md.endsWith("\n\n"));
  });

  it("converts a minimal org file with missing optional fields", async () => {
    const orgContent = fixture("minimal-post.org");
    const md = await convertOrgFile(orgContent);

    assert.ok(md.includes("title: Minimal Post"));
    assert.ok(!md.includes("description:"));
    assert.ok(!md.includes("date:"));
    assert.ok(!md.includes("tags:"));
    assert.ok(md.includes("Just a paragraph with no optional fields."));
  });
});
