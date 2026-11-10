// Generates content-based cache identifiers for the existing CSS and JS URLs.
// The file names remain unchanged; no framework or npm packages are needed.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const htmlPath = resolve(root, "index.html");
let html = await readFile(htmlPath, "utf8");

for (const file of ["style.css", "script.js"]) {
  const data = await readFile(resolve(root, file));
  // Git-compatible blob fingerprint: changes only when this file changes.
  const version = createHash("sha1")
    .update("blob " + data.byteLength + String.fromCharCode(0))
    .update(data)
    .digest("hex")
    .slice(0, 12);

  const escapedName = file.replaceAll(".", "\\.");
  const pattern = new RegExp(`((?:href|src)=["'])${escapedName}(?:\\?v=[a-f0-9]{12})?(["'])`, "g");
  let matches = 0;
  html = html.replace(pattern, (_match, start, end) => {
    matches += 1;
    return `${start}${file}?v=${version}${end}`;
  });
  if (matches !== 1) throw new Error(`Expected one reference to ${file}, found ${matches}.`);
}

const original = await readFile(htmlPath, "utf8");
if (html !== original) {
  await writeFile(htmlPath, html);
  console.log("Updated CSS/JS cache fingerprints in index.html.");
} else {
  console.log("Asset fingerprints are already current.");
}
