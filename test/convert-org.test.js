import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { convert } from "../scripts/convert-org.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tmpContent = join(root, "test", ".tmp-content");
const tmpGenerated = join(root, "test", ".tmp-generated");

const readGenerated = (path) => readFileSync(join(tmpGenerated, path), "utf-8");

describe("pipeline orchestrator (convert-org.js)", () => {
  before(async () => {
    // Clean up from any prior run
    rmSync(tmpContent, { recursive: true, force: true });
    rmSync(tmpGenerated, { recursive: true, force: true });

    // Create test content structure
    mkdirSync(join(tmpContent, "posts"), { recursive: true });
    mkdirSync(join(tmpContent, "test-section"), { recursive: true });

    writeFileSync(
      join(tmpContent, "test-section", "first.org"),
      `#+title: First Test Post
#+description: Testing orchestrator
#+date: [2026-01-15 Thu]
:PROPERTIES:
:tags: test, orchestrator
:author: Test Author
:END:

This is the first test post.
`,
    );

    writeFileSync(
      join(tmpContent, "test-section", "second.org"),
      `#+title: Second Test Post
#+date: [2026-02-20 Fri]

Second post with minimal metadata.
`,
    );

    writeFileSync(
      join(tmpContent, "test-section", "test-section.json"),
      JSON.stringify({
        layout: "libdoc_page.liquid",
        permalink: "/test-section/{{ page.fileSlug }}/",
      }),
    );

    writeFileSync(
      join(tmpContent, "posts", "posts.json"),
      JSON.stringify({
        layout: "libdoc_page.liquid",
        permalink: "/posts/{{ page.fileSlug }}/",
        tags: ["post"],
      }),
    );

    // Run the conversion using the exported function
    await convert(tmpContent, tmpGenerated);
  });

  after(() => {
    rmSync(tmpContent, { recursive: true, force: true });
    rmSync(tmpGenerated, { recursive: true, force: true });
  });

  describe("directory mirroring", () => {
    it("creates subdirectory in output", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "test-section")),
        "test-section/ should exist in output",
      );
    });

    it("creates posts/ subdirectory in output", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "posts")),
        "posts/ should exist in output",
      );
    });
  });

  describe("multiple file conversion", () => {
    it("converts first.org to first.md", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "test-section", "first.md")),
        "first.md should exist",
      );
    });

    it("converts second.org to second.md", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "test-section", "second.md")),
        "second.md should exist",
      );
    });

    it("first.md has correct frontmatter", () => {
      const md = readGenerated("test-section/first.md");
      assert.ok(md.includes("title: First Test Post"));
      assert.ok(md.includes("description: Testing orchestrator"));
      assert.ok(md.includes("date: 2026-01-15"));
      assert.ok(md.includes("  - test\n  - orchestrator"));
      assert.ok(md.includes("author: Test Author"));
    });

    it("first.md has converted body", () => {
      const md = readGenerated("test-section/first.md");
      assert.ok(md.includes("This is the first test post."));
    });

    it("second.md handles minimal metadata", () => {
      const md = readGenerated("test-section/second.md");
      assert.ok(md.includes("title: Second Test Post"));
      assert.ok(md.includes("date: 2026-02-20"));
      assert.ok(!md.includes("description:"));
      assert.ok(md.includes("Second post with minimal metadata."));
    });
  });

  describe("json data file copying", () => {
    it("copies test-section.json to output", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "test-section", "test-section.json")),
        "test-section.json should be copied",
      );
    });

    it("copied json has correct content", () => {
      const json = readGenerated("test-section/test-section.json");
      const data = JSON.parse(json);
      assert.equal(data.layout, "libdoc_page.liquid");
    });

    it("copies posts.json to output", () => {
      assert.ok(
        existsSync(join(tmpGenerated, "posts", "posts.json")),
        "posts.json should be copied",
      );
    });
  });
});
