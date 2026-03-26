import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { convertOrgToMarkdown } from "../scripts/lib/pandoc-wrapper.js";

describe("convertOrgToMarkdown", () => {
  it("converts org headings to Markdown headings", async () => {
    const result = await convertOrgToMarkdown("* Heading 1\n** Heading 2");
    assert.ok(result.includes("# Heading 1"));
    assert.ok(result.includes("## Heading 2"));
  });

  it("converts org bold and italic to Markdown", async () => {
    const result = await convertOrgToMarkdown(
      "This is *bold* and /italic/ text.",
    );
    assert.ok(result.includes("**bold**"));
    assert.ok(result.includes("*italic*"));
  });

  it("converts org inline code to Markdown", async () => {
    const result = await convertOrgToMarkdown("Use the ~print~ function.");
    assert.ok(result.includes("`print`"));
  });

  it("converts org verbatim to Markdown", async () => {
    const result = await convertOrgToMarkdown("Run =npm install= first.");
    assert.ok(result.includes("`npm install`"));
  });

  it("converts org unordered lists to Markdown", async () => {
    const result = await convertOrgToMarkdown("- Item one\n- Item two");
    assert.ok(result.includes("- Item one"));
    assert.ok(result.includes("- Item two"));
  });

  it("converts org ordered lists to Markdown", async () => {
    const result = await convertOrgToMarkdown("1. First\n2. Second");
    assert.ok(result.includes("1."));
    assert.ok(result.includes("2."));
  });

  it("converts org links to Markdown links", async () => {
    const result = await convertOrgToMarkdown(
      "Visit [[https://example.com][Example]].",
    );
    assert.ok(result.includes("[Example](https://example.com)"));
  });

  it("converts org source blocks to fenced code blocks", async () => {
    const org = `#+begin_src python
def hello():
    print("Hello")
#+end_src`;
    const result = await convertOrgToMarkdown(org);
    assert.ok(result.includes("``` python"));
    assert.ok(result.includes('print("Hello")'));
    assert.ok(result.includes("```"));
  });

  it("converts org quote blocks to Markdown blockquotes", async () => {
    const org = `#+begin_quote
Measure twice, cut once.
#+end_quote`;
    const result = await convertOrgToMarkdown(org);
    assert.ok(result.includes("> Measure twice, cut once."));
  });

  it("converts org images to Markdown images", async () => {
    const result = await convertOrgToMarkdown("[[./images/photo.jpg]]");
    assert.ok(result.includes("![](./images/photo.jpg)"));
  });

  it("handles paragraphs", async () => {
    const result = await convertOrgToMarkdown(
      "First paragraph.\n\nSecond paragraph.",
    );
    assert.ok(result.includes("First paragraph."));
    assert.ok(result.includes("Second paragraph."));
  });
});
