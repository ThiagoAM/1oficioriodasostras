// Gera sitemap.xml a partir das tags <link rel="canonical"> das páginas.
// Uso: node scripts/build-sitemap.mjs
// Regras: entra toda página HTML da raiz e de guides/ que tenha canonical,
// exceto as marcadas com noindex (redirects) e o 404.html.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const ORIGIN = "https://cartorioderiodasostras.com.br";

const htmlFiles = [
  ...readdirSync(root).filter((f) => f.endsWith(".html")),
  ...readdirSync(join(root, "guides"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => `guides/${f}`),
];

const urls = [];
const problems = [];

for (const file of htmlFiles.sort()) {
  if (file === "404.html") continue;
  const html = readFileSync(join(root, file), "utf8");
  if (/name="robots"[^>]*noindex/.test(html)) continue;
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  if (!match) {
    problems.push(`SEM CANONICAL: ${file}`);
    continue;
  }
  const canonical = match[1];
  if (!canonical.startsWith(ORIGIN)) {
    problems.push(`CANONICAL FORA DO DOMÍNIO: ${file} -> ${canonical}`);
    continue;
  }
  if (!urls.includes(canonical)) urls.push(canonical);
}

const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) =>
    [
      "  <url>",
      `    <loc>${u.replaceAll("&", "&amp;").replaceAll(" ", "%20")}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");

writeFileSync(join(root, "sitemap.xml"), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
for (const p of problems) console.warn(p);
