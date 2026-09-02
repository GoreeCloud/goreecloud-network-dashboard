import crypto from "node:crypto";
import fs from "node:fs";

const canonicalNetworkBlob = "7457cd187d65887189150016b44c28af279635e5";
const canonicalCopies = [
  "src/assets/goreecloud-network.svg",
  "src/app/icon.svg",
];

function fail(message) {
  console.error(`Branding validation failed: ${message}`);
  process.exitCode = 1;
}

function read(path) {
  if (!fs.existsSync(path)) {
    fail(`missing required file ${path}`);
    return null;
  }
  return fs.readFileSync(path);
}

function gitBlobSha(content) {
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([header, content]))
    .digest("hex");
}

for (const path of canonicalCopies) {
  const content = read(path);
  if (!content) continue;
  const actual = gitBlobSha(content);
  if (actual !== canonicalNetworkBlob) {
    fail(`${path} must match canonical Network blob ${canonicalNetworkBlob}; got ${actual}`);
  }
}

for (const obsoletePath of ["src/app/favicon.ico", "src/app/apple-icon.png"]) {
  if (fs.existsSync(obsoletePath)) {
    fail(`${obsoletePath} is an upstream NetBird browser identity asset and must not ship as GoreeCloud dashboard identity`);
  }
}

read("src/app/apple-icon.tsx");

const header = read("src/layouts/Header.tsx")?.toString("utf8") ?? "";
if (!header.includes("GoreeCloudNetworkLogo")) {
  fail("dashboard header must use GoreeCloudNetworkLogo");
}
if (header.includes("NetBirdLogo")) {
  fail("dashboard header must not use the upstream NetBird logo component");
}

const meta = read("src/utils/meta.ts")?.toString("utf8") ?? "";
if (!meta.includes('"GoreeCloud Network Dashboard"')) {
  fail("browser title must identify GoreeCloud Network Dashboard");
}

const layout = read("src/app/layout.tsx")?.toString("utf8") ?? "";
if (!layout.includes("GoreeCloud Network")) {
  fail("browser description must identify GoreeCloud Network");
}
if (layout.includes("NetBird combines")) {
  fail("upstream NetBird product description must not be used as GoreeCloud dashboard metadata");
}

if (!process.exitCode) {
  console.log(`Branding validation passed. Canonical Network blob: ${canonicalNetworkBlob}`);
}
