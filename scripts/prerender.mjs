#!/usr/bin/env node
/**
 * Pré-renderiza as páginas-shell do site (header, #siteRoot e footer) usando o
 * dev server local + Chromium (Playwright), gravando o HTML renderizado de
 * volta nos próprios arquivos para SEO e navegação sem JavaScript.
 *
 * Uso: npm run prerender   (ou: node scripts/prerender.mjs)
 * Porta do dev server: PRERENDER_PORT (padrão 4790).
 *
 * O script é idempotente: cada execução substitui o conteúdo dos containers
 * `[data-site-header]`, `#siteRoot` e `[data-site-footer]` — nunca duplica.
 * A home (index.html) NÃO é pré-renderizada (restrição de aparência).
 */

import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PRERENDER_PORT || 4790);
const baseUrl = `http://127.0.0.1:${port}`;

const PAGES = [
  "perguntas-frequentes.html",
  "guias.html",
  "links-uteis.html",
  "sobre-tabeliao.html",
  "numeros-cartorio.html",
  "cartorio-e-cidade.html",
  "servicos-online.html",
  "formularios-impressao.html",
];

const MARKER =
  "<!-- conteúdo pré-renderizado para SEO/no-JS; regenerar com: npm run prerender -->";

// Conteúdo volátil/externo que não deve entrar no HTML estático nem gerar
// efeitos colaterais durante o prerender (notícias mudam todo dia; widget e
// analytics são externos). O JS carrega tudo normalmente em runtime.
const BLOCKED_URL_PARTS = [
  "thiagoam.github.io", // feed de notícias (conteúdo volátil)
  "dev-robo.owarilabs.com", // widget externo
  "googletagmanager.com", // analytics (evita pageviews falsos do prerender)
  "google-analytics.com",
];

const startDevServer = async () => {
  const child = spawn(process.execPath, [join(rootDir, "scripts/civil-dev-server.mjs")], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let exited = false;
  child.on("exit", () => {
    exited = true;
  });

  for (let attempt = 0; attempt < 60; attempt++) {
    if (exited) {
      throw new Error(
        `O dev server terminou antes de ficar pronto (porta ${port} ocupada? use PRERENDER_PORT=<porta livre>).`,
      );
    }
    try {
      const response = await fetch(`${baseUrl}/index.html`, { method: "HEAD" });
      if (response.ok) {
        return child;
      }
    } catch {
      // ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  child.kill();
  throw new Error(`Dev server não respondeu em ${baseUrl}.`);
};

const waitForRenderedContainers = (page) =>
  page.waitForFunction(
    () => {
      const header = document.querySelector("[data-site-header]");
      const root = document.getElementById("siteRoot");
      const footer = document.querySelector("[data-site-footer]");
      return (
        Boolean(header && root && footer) &&
        header.children.length > 0 &&
        root.children.length > 0 &&
        footer.children.length > 0
      );
    },
    { timeout: 20000 },
  );

const expandAllFaqItems = async (page) => {
  await page.waitForSelector("#faqList .faq-item", { timeout: 20000 });
  const total = await page.evaluate(() =>
    Array.isArray(window.FAQ_ITEMS) ? window.FAQ_ITEMS.length : 0,
  );

  for (let attempt = 0; attempt < 20; attempt++) {
    const count = await page.evaluate(
      () => document.querySelectorAll("#faqList .faq-item").length,
    );
    if (count >= total) {
      break;
    }
    const button = page.locator("#faqShowMoreBtn");
    if (!(await button.isVisible())) {
      break;
    }
    await button.click();
    await page.waitForTimeout(150);
  }

  const finalCount = await page.evaluate(
    () => document.querySelectorAll("#faqList .faq-item").length,
  );
  if (finalCount !== total || total === 0) {
    throw new Error(`FAQ: esperava ${total} perguntas no DOM, encontrou ${finalCount}.`);
  }
  return finalCount;
};

const waitForStatsToSettle = async (page) => {
  try {
    await page.waitForFunction(
      () => !document.querySelector("#statsGrid strong.is-loading"),
      { timeout: 15000 },
    );
  } catch {
    console.warn(
      "  aviso: contador de visitas ainda em carregamento; capturando o estado atual.",
    );
  }
};

// Reverte estados transitórios de animação para que o HTML estático mostre o
// conteúdo real (o JS recria esses estados em runtime, após re-renderizar).
const captureContainers = (page) =>
  page.evaluate(() => {
    const containers = [
      document.querySelector("[data-site-header]"),
      document.getElementById("siteRoot"),
      document.querySelector("[data-site-footer]"),
    ];

    containers.forEach((container) => {
      if (!container) {
        return;
      }

      container.querySelectorAll('[data-stream-prepared="true"]').forEach((el) => {
        const richHtml = el.dataset.streamHtml || "";
        const plainText = (el.dataset.streamText || "").trim();
        if (richHtml) {
          el.innerHTML = richHtml;
        } else {
          el.textContent = plainText;
        }
        if ((el.getAttribute("aria-label") || "").trim() === plainText) {
          el.removeAttribute("aria-label");
        }
        el.classList.remove(
          "stream-text",
          "is-stream-ready",
          "stream-text-rich",
          "is-streaming",
          "is-stream-complete",
        );
        if (el.classList.length === 0) {
          el.removeAttribute("class");
        }
        delete el.dataset.streamPrepared;
        delete el.dataset.streamText;
        delete el.dataset.streamHtml;
        delete el.dataset.streamComplete;
        delete el.dataset.streamRich;
      });

      container.querySelectorAll(".reveal-on-scroll").forEach((el) => {
        el.classList.remove("reveal-on-scroll", "is-revealed");
        if (el.classList.length === 0) {
          el.removeAttribute("class");
        }
      });

      container
        .querySelectorAll("[data-dropdown-animation-bound], [data-starter-controller-bound]")
        .forEach((el) => {
          delete el.dataset.dropdownAnimationBound;
          delete el.dataset.starterControllerBound;
        });

      // civil-consultation.js faz bind único no PRIMEIRO [data-civil-consultation]
      // que encontrar — se o painel estático mantivesse o atributo, o módulo o
      // encontraria antes do main.js re-renderizar o #siteRoot e o formulário
      // re-renderizado ficaria sem bind. Sem o atributo no HTML estático, o
      // módulo segue tentando (polling) até o painel re-renderizado existir.
      container.querySelectorAll("[data-civil-consultation]").forEach((el) => {
        el.removeAttribute("data-civil-consultation");
        delete el.dataset.civilConsultationReady;
      });
    });

    const [header, root, footer] = containers;
    return {
      header: header ? header.innerHTML : "",
      root: root ? root.innerHTML : "",
      footer: footer ? footer.innerHTML : "",
    };
  });

const buildFaqJsonLd = (page) =>
  page.evaluate(() => {
    const items = Array.isArray(window.FAQ_ITEMS) ? window.FAQ_ITEMS : [];
    const cleanLine = (line) =>
      String(line ?? "")
        .trim()
        .replace(/^-\s+/, "");
    const answerToText = (answer) =>
      (Array.isArray(answer) ? answer : [answer])
        .map(cleanLine)
        .filter(Boolean)
        .join(" ");

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: String(item.question || "").trim(),
        acceptedAnswer: {
          "@type": "Answer",
          text: answerToText(item.answer),
        },
      })),
    };
  });

const replaceContainerContent = (source, openTagPattern, closeTag, newInner, label) => {
  const openMatch = source.match(openTagPattern);
  if (!openMatch) {
    throw new Error(`Não encontrei a tag de abertura de ${label}.`);
  }
  if (newInner.includes(closeTag)) {
    throw new Error(`Conteúdo capturado de ${label} contém "${closeTag}" — abortando.`);
  }

  const innerStart = openMatch.index + openMatch[0].length;
  const closeIndex = source.indexOf(closeTag, innerStart);
  if (closeIndex === -1) {
    throw new Error(`Não encontrei a tag de fechamento de ${label}.`);
  }

  return `${source.slice(0, innerStart)}${MARKER}${newInner}${source.slice(closeIndex)}`;
};

const injectFaqJsonLd = (source, jsonLd) => {
  const json = JSON.stringify(jsonLd, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  const block = `<script type="application/ld+json">\n${json}\n    </script>`;

  const scriptPattern = /<script type="application\/ld\+json">[\s\S]*?<\/script>/g;
  const blocks = [...source.matchAll(scriptPattern)];
  if (blocks.length === 0) {
    throw new Error("perguntas-frequentes.html: nenhum JSON-LD existente no head.");
  }

  const existingFaqBlock = blocks.find((match) => match[0].includes('"FAQPage"'));
  if (existingFaqBlock) {
    return (
      source.slice(0, existingFaqBlock.index) +
      block +
      source.slice(existingFaqBlock.index + existingFaqBlock[0].length)
    );
  }

  const lastBlock = blocks[blocks.length - 1];
  const insertAt = lastBlock.index + lastBlock[0].length;
  return `${source.slice(0, insertAt)}\n    ${block}${source.slice(insertAt)}`;
};

const prerenderPage = async (context, fileName) => {
  const filePath = join(rootDir, fileName);
  const originalSource = await readFile(filePath, "utf8");
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    await page.goto(`${baseUrl}/${fileName}`, { waitUntil: "load", timeout: 30000 });
    await waitForRenderedContainers(page);

    if (fileName === "perguntas-frequentes.html") {
      const count = await expandAllFaqItems(page);
      console.log(`  FAQ: ${count} perguntas no DOM.`);
    }
    if (fileName === "numeros-cartorio.html") {
      await waitForStatsToSettle(page);
    }

    // Deixa renderizações síncronas pós-load (fontes/reflow) assentarem.
    await page.waitForTimeout(300);

    const captured = await captureContainers(page);
    if (!captured.header || !captured.root || !captured.footer) {
      throw new Error("Captura vazia em um dos containers.");
    }

    let updated = originalSource;
    updated = replaceContainerContent(
      updated,
      /<header\b[^>]*\bdata-site-header\b[^>]*>/,
      "</header>",
      captured.header,
      `${fileName} [data-site-header]`,
    );
    updated = replaceContainerContent(
      updated,
      /<main\b[^>]*\bid="siteRoot"[^>]*>/,
      "</main>",
      captured.root,
      `${fileName} #siteRoot`,
    );
    updated = replaceContainerContent(
      updated,
      /<footer\b[^>]*\bdata-site-footer\b[^>]*>/,
      "</footer>",
      captured.footer,
      `${fileName} [data-site-footer]`,
    );

    if (fileName === "perguntas-frequentes.html") {
      const jsonLd = await buildFaqJsonLd(page);
      if (!Array.isArray(jsonLd.mainEntity) || jsonLd.mainEntity.length === 0) {
        throw new Error("FAQPage JSON-LD vazio.");
      }
      updated = injectFaqJsonLd(updated, jsonLd);
      console.log(`  FAQPage JSON-LD: ${jsonLd.mainEntity.length} perguntas.`);
    }

    await writeFile(filePath, updated, "utf8");
    console.log(
      `  gravado: ${Buffer.byteLength(originalSource)} -> ${Buffer.byteLength(updated)} bytes.`,
    );

    if (consoleErrors.length > 0) {
      console.warn(`  erros de console durante a captura (${consoleErrors.length}):`);
      consoleErrors.forEach((text) => console.warn(`    - ${text.split("\n")[0]}`));
    }
  } finally {
    await page.close();
  }
};

const main = async () => {
  const server = await startDevServer();
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext();
    // Evita que o prerender incremente o contador de visitas do site.
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem("siteVisit:lastTrackedAt", String(Date.now()));
      } catch {
        // indisponível — segue sem seed
      }
    });
    await context.route("**/*", (route) => {
      const url = route.request().url();
      if (BLOCKED_URL_PARTS.some((part) => url.includes(part))) {
        return route.abort();
      }
      return route.continue();
    });

    for (const fileName of PAGES) {
      console.log(`Pré-renderizando ${fileName}...`);
      await prerenderPage(context, fileName);
    }
  } finally {
    await browser.close();
    server.kill();
  }

  console.log("Concluído.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
