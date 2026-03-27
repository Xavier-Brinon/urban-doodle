import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const contentDir = join(root, "content");
const generatedDir = join(root, "generated");

const readGenerated = (path) => readFileSync(join(generatedDir, path), "utf-8");

describe("pipeline orchestrator (convert-org.js)", () => {
  const testPostDir = join(contentDir, "test-section");

  before(() => {
    // Clean up from any prior run
    rmSync(testPostDir, { recursive: true, force: true });
    rmSync(join(generatedDir, "test-section"), { recursive: true, force: true });

    // Create a temporary test subdirectory with multiple org files and a data file
    mkdirSync(testPostDir, { recursive: true });

    writeFileSync(
      join(testPostDir, "first.org"),
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
      join(testPostDir, "second.org"),
      `#+title: Second Test Post
#+date: [2026-02-20 Fri]

Second post with minimal metadata.
`,
    );

    writeFileSync(
      join(testPostDir, "test-section.json"),
      JSON.stringify({
        layout: "libdoc_page.liquid",
        permalink: "/test-section/{{ page.fileSlug }}/",
      }),
    );

    // Run the conversion
    execFileSync("npm", ["run", "convert"], {
      cwd: root,
      stdio: "pipe",
      timeout: 30000,
    });
  });

  after(() => {
    // Clean up test files
    rmSync(testPostDir, { recursive: true, force: true });
    rmSync(join(generatedDir, "test-section"), { recursive: true, force: true });
  });

  describe("directory mirroring", () => {
    it("creates subdirectory in generated/", () => {
      assert.ok(
        existsSync(join(generatedDir, "test-section")),
        "generated/test-section/ should exist",
      );
    });

    it("mirrors posts/ subdirectory", () => {
      assert.ok(
        existsSync(join(generatedDir, "posts")),
        "generated/posts/ should exist",
      );
    });
  });

  describe("multiple file conversion", () => {
    it("converts first.org to first.md", () => {
      assert.ok(
        existsSync(join(generatedDir, "test-section", "first.md")),
        "first.md should exist",
      );
    });

    it("converts second.org to second.md", () => {
      assert.ok(
        existsSync(join(generatedDir, "test-section", "second.md")),
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
    it("copies test-section.json to generated/", () => {
      assert.ok(
        existsSync(join(generatedDir, "test-section", "test-section.json")),
        "test-section.json should be copied",
      );
    });

    it("copied json has correct content", () => {
      const json = readGenerated("test-section/test-section.json");
      const data = JSON.parse(json);
      assert.equal(data.layout, "libdoc_page.liquid");
    });

    it("copies posts.json to generated/posts/", () => {
      assert.ok(
        existsSync(join(generatedDir, "posts", "posts.json")),
        "posts.json should be copied",
      );
    });
  });
});
