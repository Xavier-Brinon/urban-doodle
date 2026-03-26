import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const site = join(root, "_site");

const readSite = (path) => readFileSync(join(site, path), "utf-8");

describe("eleventy build", () => {
  before(() => {
    execFileSync("npm", ["run", "build"], {
      cwd: root,
      stdio: "pipe",
      timeout: 60000,
    });
  });

  describe("output structure", () => {
    const expectedFiles = [
      "index.html",
      "feed.xml",
      "posts/index.html",
      "posts/hello-post/index.html",
      "hello-page/index.html",
      "hello-page/hello-child/index.html",
      "hello-page/hello-child/hello-grandchild/index.html",
      "search/index.html",
      "tags/index.html",
      "core/assets/js/search_index.json",
      "core/assets/js/fuzzy_index.json",
    ];

    for (const file of expectedFiles) {
      it(`produces ${file}`, () => {
        assert.ok(existsSync(join(site, file)), `${file} should exist`);
      });
    }
  });

  describe("home page", () => {
    it("contains the site title", () => {
      const html = readSite("index.html");
      assert.ok(html.includes("Bastide hub"), "should contain site title");
    });

    it("contains navigation", () => {
      const html = readSite("index.html");
      assert.ok(html.includes("</nav>"), "should contain nav element");
    });

    it("has valid HTML structure", () => {
      const html = readSite("index.html");
      assert.ok(
        html.includes("<!doctype html>") ||
          html.includes("<!DOCTYPE html>"),
      );
      assert.ok(html.includes("</html>"));
    });
  });

  describe("blog", () => {
    it("blog index lists posts", () => {
      const html = readSite("posts/index.html");
      assert.ok(html.includes("Hello Post"), "should list hello post");
    });

    it("post page has title and content", () => {
      const html = readSite("posts/hello-post/index.html");
      assert.ok(html.includes("Hello Post"), "should contain post title");
    });

    it("post page has date", () => {
      const html = readSite("posts/hello-post/index.html");
      assert.ok(
        html.includes("2025-05-15"),
        "should contain publication date",
      );
    });
  });

  describe("navigation pages", () => {
    it("hello-page has navigation to child", () => {
      const html = readSite("hello-page/index.html");
      assert.ok(html.includes("hello-child"), "should link to child page");
    });

    it("grandchild page exists and has content", () => {
      const html = readSite(
        "hello-page/hello-child/hello-grandchild/index.html",
      );
      assert.ok(html.includes("</html>"));
    });
  });

  describe("feeds and search", () => {
    it("atom feed is valid XML", () => {
      const xml = readSite("feed.xml");
      assert.ok(xml.includes("<feed"), "should be an Atom feed");
      assert.ok(xml.includes("Bastide hub"), "should contain site title");
    });

    it("search index contains page data", () => {
      const json = readSite("core/assets/js/search_index.json");
      const index = JSON.parse(json);
      assert.ok(Array.isArray(index), "search index should be an array");
      assert.ok(index.length > 0, "search index should not be empty");
    });

    it("fuzzy index contains page data", () => {
      const json = readSite("core/assets/js/fuzzy_index.json");
      const index = JSON.parse(json);
      assert.ok(Array.isArray(index), "fuzzy index should be an array");
      assert.ok(index.length > 0, "fuzzy index should not be empty");
    });
  });

  describe("assets", () => {
    it("copies core CSS", () => {
      assert.ok(
        existsSync(join(site, "core/assets/css/ds.css")),
        "design system CSS should exist",
      );
    });

    it("copies favicon", () => {
      assert.ok(
        existsSync(join(site, "favicon.png")),
        "favicon should exist",
      );
    });
  });

  describe("custom links", () => {
    it("home page links to feed", () => {
      const html = readSite("index.html");
      assert.ok(html.includes("/feed.xml"), "should link to Atom feed");
    });

    it("home page links to GitHub", () => {
      const html = readSite("index.html");
      assert.ok(
        html.includes("github.com/Xavier-Brinon/urban-doodle"),
        "should link to GitHub repo",
      );
    });
  });
});
