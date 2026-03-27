#!/usr/bin/env node

/**
 * Pipeline orchestrator: converts all .org files in content/ to .md in generated/.
 * Mirrors directory structure and copies .json data files.
 */

import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { join, relative, dirname, extname } from "node:path";

import { parseOrgMetadata, parseOrgTimestamp, splitCommaSeparated } from "./lib/parse-org-metadata.js";
import { generateFrontmatter } from "./lib/generate-frontmatter.js";
import { convertOrgToMarkdown } from "./lib/pandoc-wrapper.js";
import { assembleFile } from "./lib/assemble-file.js";

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

/**
 * Convert all .org files in contentDir to .md in outputDir.
 * Cleans outputDir first, mirrors directory structure, copies .json data files.
 *
 * @param {string} contentDir - Source directory containing .org files
 * @param {string} outputDir - Destination directory for .md output
 */
export async function convert(contentDir, outputDir) {
  // Clean output to avoid stale files from deleted sources
  await rm(outputDir, { recursive: true, force: true });

  const orgFiles = await findFiles(contentDir, ".org");

  if (orgFiles.length === 0) {
    console.log("  No .org files found in " + contentDir);
    return 0;
  }

  for (const orgPath of orgFiles) {
    const orgContent = await readFile(orgPath, "utf-8");
    const { keywords, properties, body } = parseOrgMetadata(orgContent);
    const metadata = buildMetadata(keywords, properties);
    const frontmatter = generateFrontmatter(metadata);
    const markdown = body ? await convertOrgToMarkdown(body) : "";
    const output = assembleFile(frontmatter, markdown);

    const relPath = relative(contentDir, orgPath).replace(/\.org$/, ".md");
    const outPath = join(outputDir, relPath);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output, "utf-8");

    console.log(`  ${orgPath} → ${outPath}`);
  }

  // Copy .json data files
  const jsonFiles = await findFiles(contentDir, ".json");
  for (const jsonPath of jsonFiles) {
    const relPath = relative(contentDir, jsonPath);
    const outPath = join(outputDir, relPath);
    await mkdir(dirname(outPath), { recursive: true });
    await cp(jsonPath, outPath);
    console.log(`  ${jsonPath} → ${outPath} (data file)`);
  }

  return orgFiles.length;
}

// CLI entry point
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain) {
  console.log("Converting org files...");
  convert("content", "generated")
    .then((count) => console.log(`Done. Converted ${count} file(s).`))
    .catch((err) => {
      console.error("Conversion failed:", err.message);
      process.exit(1);
    });
}
