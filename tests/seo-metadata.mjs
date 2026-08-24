// Teste de regressão de metadados de SEO.
// Uso: node tests/seo-metadata.mjs
// Verifica, em todas as páginas HTML da raiz e de guides/: canonical única e
// absoluta, meta description, titles/descriptions sem duplicata, JSON-LD
// parseável, Open Graph completo, lang correto, presença de <h1>, e a
// consistência do sitemap.xml com o filesystem.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const ORIGIN = "https://cartorioderiodasostras.com.br";
const failures = [];
const fail = (msg) => failures.push(msg);

const pages = [
  ...readdirSync(root).filter((f) => f.endsWith(".html")),
  ...readdirSync(join(root, "guides"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => `guides/${f}`),
].sort();

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const file of pages) {
  const html = readFileSync(join(root, file), "utf8");
  const noindex = /name="robots"[^>]*noindex/.test(html);

  if (!/<html[^>]+lang="pt-BR"/.test(html)) fail(`${file}: lang="pt-BR" ausente`);

  const canonicalMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)];
  if (file === "404.html") {
    // sem canonical, com noindex
    if (!noindex) fail(`404.html: sem noindex`);
  } else if (canonicalMatches.length !== 1) {
    fail(`${file}: ${canonicalMatches.length} canonicals (esperado 1)`);
  } else {
    const href = canonicalMatches[0][1];
    if (!href.startsWith(ORIGIN)) fail(`${file}: canonical não-absoluta: ${href}`);
    if (!noindex) {
      if (canonicals.has(href)) fail(`${file}: canonical duplicada com ${canonicals.get(href)}`);
      canonicals.set(href, file);
    }
  }

  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (!titleMatch || !titleMatch[1].trim()) fail(`${file}: <title> ausente/vazio`);
  else if (!noindex) {
    const t = titleMatch[1].trim();
    if (titles.has(t)) fail(`${file}: title duplicado com ${titles.get(t)}: "${t}"`);
    titles.set(t, file);
  }

  if (!noindex) {
    const descMatches = [
      ...html.matchAll(/<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/?>/g),
    ];
    if (descMatches.length !== 1) {
      fail(`${file}: ${descMatches.length} meta descriptions (esperado 1)`);
    } else {
      const d = descMatches[0][1].replace(/\s+/g, " ").trim();
      if (d.length < 50 || d.length > 170) fail(`${file}: description com ${d.length} chars`);
      if (descriptions.has(d)) fail(`${file}: description duplicada com ${descriptions.get(d)}`);
      descriptions.set(d, file);
    }
    for (const prop of ["og:title", "og:description", "og:url", "og:image"]) {
      if (!html.includes(`property="${prop}"`)) fail(`${file}: ${prop} ausente`);
    }
    if (!/<h1[\s>]/.test(html)) fail(`${file}: nenhum <h1> no HTML servido`);
  }

  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block);
    } catch (error) {
      fail(`${file}: JSON-LD inválido (${error.message})`);
    }
  }
}

for (const f of [".nojekyll", "robots.txt", "sitemap.xml", "404.html"]) {
  if (!existsSync(join(root, f))) fail(`arquivo ausente: ${f}`);
}

if (existsSync(join(root, "sitemap.xml"))) {
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    const path = loc.replace(`${ORIGIN}/`, "") || "index.html";
    if (!existsSync(join(root, decodeURIComponent(path)))) fail(`sitemap: ${loc} sem arquivo`);
  }
  for (const [href, file] of canonicals) {
    if (!locs.includes(href)) fail(`sitemap: falta a canonical de ${file} (${href})`);
  }
}

if (failures.length) {
  console.error(`FALHOU — ${failures.length} problema(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK — ${pages.length} páginas verificadas, sitemap consistente.`);
