import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateFrontmatter } from "../scripts/lib/generate-frontmatter.js";

describe("generateFrontmatter", () => {
  it("produces valid YAML with --- delimiters", () => {
    const result = generateFrontmatter({ title: "Hello" });
    assert.ok(result.startsWith("---\n"));
    assert.ok(result.endsWith("\n---"));
  });

  it("handles string values", () => {
    const result = generateFrontmatter({
      title: "Weekend Woodworking",
      description: "Building a bookshelf",
    });
    assert.ok(result.includes("title: Weekend Woodworking"));
    assert.ok(result.includes("description: Building a bookshelf"));
  });

  it("handles date strings", () => {
    const result = generateFrontmatter({ date: "2026-03-21" });
    assert.ok(result.includes("date: 2026-03-21"));
  });

  it("handles array values as YAML lists", () => {
    const result = generateFrontmatter({
      tags: ["post", "woodworking", "diy"],
    });
    assert.ok(result.includes("tags:\n  - post\n  - woodworking\n  - diy"));
  });

  it("omits null values", () => {
    const result = generateFrontmatter({
      title: "Hello",
      description: null,
    });
    assert.ok(result.includes("title: Hello"));
    assert.ok(!result.includes("description"));
  });

  it("omits undefined values", () => {
    const result = generateFrontmatter({
      title: "Hello",
      description: undefined,
    });
    assert.ok(!result.includes("description"));
  });

  it("returns empty string for empty metadata", () => {
    assert.equal(generateFrontmatter({}), "");
  });

  it("returns empty string when all values are null", () => {
    assert.equal(generateFrontmatter({ title: null, date: undefined }), "");
  });

  it("handles object values as nested YAML", () => {
    const result = generateFrontmatter({
      eleventyNavigation: { key: "Hello Page", parent: "Home", order: 1 },
    });
    assert.ok(result.includes("eleventyNavigation:"));
    assert.ok(result.includes("  key: Hello Page"));
    assert.ok(result.includes("  parent: Home"));
    assert.ok(result.includes("  order: 1"));
  });

  it("omits null sub-values in objects", () => {
    const result = generateFrontmatter({
      eleventyNavigation: { key: "Hello Page", parent: null },
    });
    assert.ok(result.includes("  key: Hello Page"));
    assert.ok(!result.includes("parent"));
  });

  it("escapes values with special YAML characters", () => {
    const result = generateFrontmatter({
      permalink: '{{ libdocConfig.blogSlug }}/hello-post/index.html',
    });
    assert.ok(result.includes('permalink: "{{ libdocConfig.blogSlug }}'));
  });
});
