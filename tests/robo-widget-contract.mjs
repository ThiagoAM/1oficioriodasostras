import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainJs = readFileSync(join(__dirname, "..", "assets", "js", "main.js"), "utf8");

assert.match(mainJs, /scriptUrl:\s*"https:\/\/dev-robo\.owarilabs\.com\/widget\.js\?v=v1"/);
assert.match(mainJs, /slug:\s*"cartorio-1-oficio-rio-das-ostras"/);
assert.match(mainJs, /version:\s*"v1"/);
assert.match(mainJs, /locale:\s*"pt-BR"/);
assert.match(mainJs, /host:\s*"https:\/\/dev-robo\.owarilabs\.com\/"/);
assert.match(mainJs, /script\.dataset\.roboHost\s*=\s*OWARI_ROBO_WIDGET\.host/);
