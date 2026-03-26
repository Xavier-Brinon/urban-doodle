import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assembleFile } from "../scripts/lib/assemble-file.js";

describe("assembleFile", () => {
  it("combines frontmatter and body into a complete .md file", () => {
    const frontmatter = "---\ntitle: Hello\n---";
    const body = "# Content\n\nA paragraph.";
    const result = assembleFile(frontmatter, body);
    assert.equal(result, "---\ntitle: Hello\n---\n# Content\n\nA paragraph.\n");
  });

  it("handles empty body", () => {
    const frontmatter = "---\ntitle: Hello\n---";
    const result = assembleFile(frontmatter, "");
    assert.equal(result, "---\ntitle: Hello\n---\n");
  });

  it("handles empty frontmatter", () => {
    const result = assembleFile("", "# Just body content");
    assert.equal(result, "# Just body content\n");
  });

  it("handles both empty", () => {
    const result = assembleFile("", "");
    assert.equal(result, "\n");
  });

  it("ends with a single newline", () => {
    const result = assembleFile("---\ntitle: Test\n---", "Body");
    assert.ok(result.endsWith("\n"));
    assert.ok(!result.endsWith("\n\n"));
  });
});
