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

describe("shortcode pass-through", () => {
  let md;

  it("converts the fixture without errors", async () => {
    md = await convertOrgFile(fixture("shortcodes-and-blocks.org"));
    assert.ok(md.length > 0);
  });

  it("preserves simple alert shortcode", () => {
    assert.ok(
      md.includes("{% alert 'It seems to be the beginning of a great documentation story!', 'success', 'Howdy!' %}"),
      "alert shortcode should pass through unchanged",
    );
  });

  it("preserves iconCard shortcodes", () => {
    assert.ok(
      md.includes("{% iconCard 'Configure',"),
      "first iconCard should pass through",
    );
    assert.ok(
      md.includes("{% iconCard 'Write',"),
      "second iconCard should pass through",
    );
  });

  it("preserves paired sandbox shortcode with HTML content", () => {
    assert.ok(md.includes("{% sandbox %}"), "opening sandbox tag");
    assert.ok(md.includes("{% endsandbox %}"), "closing sandbox tag");
    assert.ok(
      md.includes("<div class=\"test-sandbox\">"),
      "HTML inside sandbox preserved",
    );
    assert.ok(
      md.includes("<strong>HTML</strong>"),
      "nested HTML tags preserved",
    );
  });

  it("preserves alert shortcode mixed with regular content", () => {
    assert.ok(
      md.includes("{% alert 'This alert is mixed with regular content', 'warning', 'Watch out!' %}"),
      "alert in mixed content section should survive",
    );
  });
});

describe("org block conversion", () => {
  let md;

  it("converts the fixture without errors", async () => {
    md = await convertOrgFile(fixture("shortcodes-and-blocks.org"));
    assert.ok(md.length > 0);
  });

  it("converts quote blocks to Markdown blockquotes", () => {
    assert.ok(
      md.includes("> Measure twice, cut once."),
      "quote block should become > blockquote",
    );
  });

  it("converts second quote block too", () => {
    assert.ok(
      md.includes("> Another quote block after an alert."),
      "second quote block should also convert",
    );
  });

  it("converts Python source block to fenced code with language", () => {
    assert.ok(
      md.includes("``` python"),
      "python source block should have language specifier",
    );
    assert.ok(
      md.includes('print("world")'),
      "python code content should be preserved",
    );
  });

  it("converts JavaScript source block to fenced code with language", () => {
    assert.ok(
      md.includes("``` javascript"),
      "javascript source block should have language specifier",
    );
    assert.ok(
      md.includes("const x = 42;"),
      "javascript code content should be preserved",
    );
  });

  it("converts emphasis and inline code in body text", () => {
    assert.ok(
      md.includes("*emphasis*"),
      "org emphasis should become markdown emphasis",
    );
    assert.ok(
      md.includes("`inline code`"),
      "org inline code should become markdown backticks",
    );
  });
});
