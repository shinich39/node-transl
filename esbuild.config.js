import fs from "node:fs";
import path from "node:path";
import * as esbuild from 'esbuild';

// const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const FILENAME = "index";

const ESM = true;
const CJS = true;
const BROWSER = false;
const BROWSER_GLOBAL_NAME = "index";

const ENTRY_POINT = `./src/${FILENAME}.ts`;

// https://esbuild.github.io/api/#external
const externalPackages = [
  "cheerio",
  "puppeteer",
  "puppeteer-extra",
  "puppeteer-extra-plugin-stealth",
];

// https://esbuild.github.io/api/#packages
const bundleExternalPackages = true;

const options = [];
if (ESM) {
  options.push(
    {
      entryPoints: [ENTRY_POINT],
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      outfile: `./dist/${FILENAME}.mjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: [ENTRY_POINT],
      platform: BROWSER ? "browser" : "node",
      format: 'esm',
      bundle: true,
      minify: true,
      outfile: `./dist/${FILENAME}.min.mjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
  );
}

if (CJS) {
  options.push(
    {
      entryPoints: [ENTRY_POINT],
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      outfile: `./dist/${FILENAME}.cjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
    {
      entryPoints: [ENTRY_POINT],
      platform: BROWSER ? "browser" : "node",
      format: 'cjs',
      bundle: true,
      minify: true,
      outfile: `./dist/${FILENAME}.min.cjs`,
      external: externalPackages,
      ...(bundleExternalPackages ? {} : { packages: "external" }),
    },
  );
}

if (BROWSER) {
  options.push(
    {
      entryPoints: [ENTRY_POINT],
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      outfile: `./dist/${FILENAME}.js`,
      external: externalPackages,
    },
    {
      entryPoints: [ENTRY_POINT],
      platform: "browser",
      format: "iife",
      globalName: BROWSER_GLOBAL_NAME,
      bundle: true,
      minify: true,
      outfile: `./dist/${FILENAME}.min.js`,
      external: externalPackages,
    },
  );
}

// clear
if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}

// build
for (const option of options) {
  await esbuild.build(option);
}