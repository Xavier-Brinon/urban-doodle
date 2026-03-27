#!/usr/bin/env node

/**
 * Pipeline orchestrator: converts all .org files in content/ to .md in generated/.
 * Mirrors directory structure and copies .json data files.
 */

import { readdir, readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { join, relative, dirname, extname } from "node:path";

import { parseOrgMetadata, parseOrgTimestamp, splitCommaSeparated } from "./lib/parse-org-metadata.js";
import { generateFrontmatter } from "./lib/generate-frontmatter.js";
import { convertOrgToMarkdown } from "./lib/pandoc-wrapper.js";
import { assembleFile } from "./lib/assemble-file.js";

const CONTENT_DIR = "content";
const GENERATED_DIR = "generated";

/** Recursively find all files matching an extension in a directory. */
async function findFiles(dir, ext) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir.toString(), entry.name);
    if (entry.isDirectory()) {
      results.push(...await findFiles(fullPath, ext));
    } else if (extname(entry.name) === ext) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Build metadata object from parsed org keywords and properties. */
function buildMetadata(keywords, properties) {
  const metadata = {};

  if (keywords.title) metadata.title = keywords.title;
  if (keywords.description) metadata.description = keywords.description;
  if (keywords.date) metadata.date = parseOrgTimestamp(keywords.date);

  if (properties.tags) metadata.tags = splitCommaSeparated(properties.tags);
  if (properties.author) metadata.author = properties.author;
  if (properties.ogimageurl) metadata.ogImageUrl = properties.ogimageurl;

  // eleventyNavigation support
  if (properties.eleventynavigation_key) {
    const nav = { key: properties.eleventynavigation_key };
    if (properties.eleventynavigation_parent) nav.parent = properties.eleventynavigation_parent;
    if (properties.eleventynavigation_order) nav.order = Number(properties.eleventynavigation_order);
    metadata.eleventyNavigation = nav;
  }

  return metadata;
}

/** Convert a single .org file to .md and write to generated/. */
async function convertFile(orgPath) {
  const orgContent = await readFile(orgPath, "utf-8");
  const { keywords, properties, body } = parseOrgMetadata(orgContent);
  const metadata = buildMetadata(keywords, properties);
  const frontmatter = generateFrontmatter(metadata);
  const markdown = body ? await convertOrgToMarkdown(body) : "";
  const output = assembleFile(frontmatter, markdown);

  const relPath = relative(CONTENT_DIR, orgPath).replace(/\.org$/, ".md");
  const outPath = join(GENERATED_DIR, relPath);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, output, "utf-8");

  console.log(`  ${orgPath} → ${outPath}`);
}

/** Copy all .json data files from content/ to generated/, preserving structure. */
async function copyJsonFiles() {
  const jsonFiles = await findFiles(CONTENT_DIR, ".json");
  for (const jsonPath of jsonFiles) {
    const relPath = relative(CONTENT_DIR, jsonPath);
    const outPath = join(GENERATED_DIR, relPath);
    await mkdir(dirname(outPath), { recursive: true });
    await cp(jsonPath, outPath);
    console.log(`  ${jsonPath} → ${outPath} (data file)`);
  }
}

async function main() {
  console.log("Converting org files...");

  const orgFiles = await findFiles(CONTENT_DIR, ".org");

  if (orgFiles.length === 0) {
    console.log("  No .org files found in content/");
    return;
  }

  for (const orgPath of orgFiles) {
    await convertFile(orgPath);
  }

  await copyJsonFiles();

  console.log(`Done. Converted ${orgFiles.length} file(s).`);
}

main().catch((err) => {
  console.error("Conversion failed:", err.message);
  process.exit(1);
});
