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

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  readFileSync(join(__dirname, "fixtures", name), "utf-8");

describe("parseOrgTimestamp", () => {
  it("converts an inactive timestamp to ISO date", () => {
    assert.equal(parseOrgTimestamp("[2026-03-21 Sat]"), "2026-03-21");
  });

  it("converts timestamp without day name match back as-is", () => {
    assert.equal(parseOrgTimestamp("2026-03-21"), "2026-03-21");
  });

  it("handles different day names", () => {
    assert.equal(parseOrgTimestamp("[2025-05-15 Thu]"), "2025-05-15");
  });
});

describe("splitCommaSeparated", () => {
  it("splits comma-separated values and trims", () => {
    assert.deepEqual(splitCommaSeparated("post, woodworking, diy"), [
      "post",
      "woodworking",
      "diy",
    ]);
  });

  it("handles single value", () => {
    assert.deepEqual(splitCommaSeparated("post"), ["post"]);
  });

  it("filters empty strings from trailing commas", () => {
    assert.deepEqual(splitCommaSeparated("post, "), ["post"]);
  });
});

describe("parseOrgMetadata", () => {
  it("extracts keywords from a full post", () => {
    const result = parseOrgMetadata(fixture("sample-post.org"));
    assert.equal(result.keywords.title, "Weekend Woodworking");
    assert.equal(
      result.keywords.description,
      "Building a bookshelf from reclaimed oak",
    );
    assert.equal(result.keywords.date, "[2026-03-21 Sat]");
  });

  it("extracts properties from a full post", () => {
    const result = parseOrgMetadata(fixture("sample-post.org"));
    assert.equal(result.properties.tags, "post, woodworking, diy");
    assert.equal(result.properties.author, "Xavier Brinon");
  });

  it("returns body content without metadata", () => {
    const result = parseOrgMetadata(fixture("sample-post.org"));
    assert.ok(result.body.startsWith("* Materials"));
    assert.ok(!result.body.includes("#+title"));
    assert.ok(!result.body.includes(":PROPERTIES:"));
    assert.ok(!result.body.includes(":END:"));
  });

  it("handles missing optional fields", () => {
    const result = parseOrgMetadata(fixture("minimal-post.org"));
    assert.equal(result.keywords.title, "Minimal Post");
    assert.equal(result.keywords.description, undefined);
    assert.equal(result.keywords.date, undefined);
    assert.deepEqual(result.properties, {});
    assert.equal(result.body, "Just a paragraph with no optional fields.");
  });

  it("handles file with only keywords and no properties", () => {
    const org = `#+title: Just Keywords
#+description: No properties drawer

Body here.`;
    const result = parseOrgMetadata(org);
    assert.equal(result.keywords.title, "Just Keywords");
    assert.equal(result.keywords.description, "No properties drawer");
    assert.deepEqual(result.properties, {});
    assert.equal(result.body, "Body here.");
  });

  it("handles file with only properties and no keywords", () => {
    const org = `:PROPERTIES:
:tags: test
:END:

Body here.`;
    const result = parseOrgMetadata(org);
    assert.deepEqual(result.keywords, {});
    assert.equal(result.properties.tags, "test");
    assert.equal(result.body, "Body here.");
  });
});
