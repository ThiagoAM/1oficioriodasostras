import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

const mockConsultationResponse = (payload) => {
  if (payload.numeroProcesso === "17730") {
    return {
      found: true,
      processo: {
        numero: "17730",
        dataCadastro: "25/05/2026",
        selo: "EFDB05723",
        codigoAleatorio: "QEN",
        natureza: "HABILITAÇÃO DE CASAMENTO",
        partes: [{ nome: "ADEMILSON SILVA DE OLIVEIRA" }, { nome: "JEANE COSTA RIBEIRO" }],
        andamentos: [],
      },
    };
  }

  if (payload.numeroProcesso === "17703") {
    return {
      found: true,
      processo: {
        numero: "17703",
        dataCadastro: "15/05/2026",
        selo: "EFDB05432",
        codigoAleatorio: "MID",
        natureza: "HABILITAÇÃO DE CASAMENTO",
        ultimoAndamento: {
          data: "01/06/2026",
          tipo: "Andamento",
          descricao: "Certidão de Habilitação expedida EFDB06022-NYU",
        },
        partes: [
          { nome: "ARTHUR MOREIRA DE CASTRO SANTOS" },
          { nome: "EVELLYN JULIANNE TARGINO DE SOUZA" },
        ],
        andamentos: [
          {
            data: "01/06/2026",
            tipo: "Andamento",
            descricao: "Certidão de Habilitação expedida EFDB06022-NYU",
          },
          {
            data: "22/05/2026",
            tipo: "Andamento",
            descricao: "Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT",
          },
          {
            tipo: "Andamento",
            descricao: "Publicação Eletrônica do Edital de Proclamas",
          },
        ],
      },
    };
  }

  if (payload.numeroProcesso === "000000") {
    return { found: false, message: "Processo não encontrado" };
  }

  return null;
};

const createStaticServer = () => {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");

      if (request.method === "POST" && url.pathname === "/api/local-consulta-habilitacao") {
        await new Promise((resolve) => setTimeout(resolve, 25));
        const payload = await readJsonBody(request);
        const result = mockConsultationResponse(payload);
        if (!result) {
          sendJson(response, 503, { message: "Falha simulada" });
          return;
        }
        sendJson(response, 200, result);
        return;
      }

      const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
      const filePath = normalize(join(rootDir, pathname));

      if (relative(rootDir, filePath).startsWith("..")) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const body = await readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
};

const firebaseAppStub = `
  const apps = [];
  export const initializeApp = (config) => {
    const app = { config };
    apps.push(app);
    return app;
  };
  export const getApps = () => apps;
  export const getApp = () => apps[0];
`;

const firebaseAnalyticsStub = `
  export const isSupported = async () => false;
  export const getAnalytics = () => null;
`;

const firebaseFirestoreStub = `
  const snapshot = (data) => ({
    exists: () => Boolean(data),
    data: () => data || {},
    metadata: { fromCache: false },
  });
  export const getFirestore = (app) => ({ app });
  export const doc = (_db, collection, id) => ({ collection, id });
  export const increment = (value) => ({ increment: value });
  export const serverTimestamp = () => new Date();
  export const setDoc = async () => {};
  export const getDocFromServer = async () => snapshot({ total: 1 });
  export const getDoc = getDocFromServer;
`;

const firebaseFunctionsStub = `
  export const getFunctions = (app, region) => ({ app, region });
  export const httpsCallable = () => async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    if (payload.numeroProcesso === "17730") {
      return {
        data: {
          found: true,
          processo: {
            numero: "17730",
            dataCadastro: "25/05/2026",
            selo: "EFDB05723",
            codigoAleatorio: "QEN",
            natureza: "HABILITAÇÃO DE CASAMENTO",
            partes: [
              { nome: "ADEMILSON SILVA DE OLIVEIRA" },
              { nome: "JEANE COSTA RIBEIRO" }
            ],
            andamentos: []
          }
        }
      };
    }
    if (payload.numeroProcesso === "17703") {
      return {
        data: {
          found: true,
          processo: {
            numero: "17703",
            dataCadastro: "15/05/2026",
            selo: "EFDB05432",
            codigoAleatorio: "MID",
            natureza: "HABILITAÇÃO DE CASAMENTO",
            ultimoAndamento: {
              data: "01/06/2026",
              tipo: "Andamento",
              descricao: "Certidão de Habilitação expedida EFDB06022-NYU"
            },
            partes: [
              { nome: "ARTHUR MOREIRA DE CASTRO SANTOS" },
              { nome: "EVELLYN JULIANNE TARGINO DE SOUZA" }
            ],
            andamentos: [
              {
                data: "01/06/2026",
                tipo: "Andamento",
                descricao: "Certidão de Habilitação expedida EFDB06022-NYU"
              },
              {
                data: "22/05/2026",
                tipo: "Andamento",
                descricao: "Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT"
              },
              {
                tipo: "Andamento",
                descricao: "Publicação Eletrônica do Edital de Proclamas"
              }
            ]
          }
        }
      };
    }
    if (payload.numeroProcesso === "000000") {
      return { data: { found: false, message: "Processo não encontrado" } };
    }
    throw new Error("Falha simulada");
  };
`;

const stubFirebaseModules = async (page) => {
  await page.route("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js", (route) =>
    route.fulfill({ body: firebaseAppStub, contentType: "text/javascript" }),
  );
  await page.route("https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js", (route) =>
    route.fulfill({ body: firebaseAnalyticsStub, contentType: "text/javascript" }),
  );
  await page.route("https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js", (route) =>
    route.fulfill({ body: firebaseFirestoreStub, contentType: "text/javascript" }),
  );
  await page.route("https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js", (route) =>
    route.fulfill({ body: firebaseFunctionsStub, contentType: "text/javascript" }),
  );
};

const submitConsultation = async (page, processo) => {
  await page.locator("[data-civil-process-input]").fill(processo);
  await page.locator("[data-civil-cpf-input]").fill("01768702705");
  await page.getByRole("button", { name: /consultar processo/i }).click();
};

const { server, origin } = await createStaticServer();
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await stubFirebaseModules(page);
  await page.goto(`${origin}/servicos-online.html`, { waitUntil: "domcontentloaded" });

  await page.locator("[data-civil-consultation]").waitFor({ state: "attached" });
  await submitConsultation(page, "17730");
  await page.getByText("Processo encontrado").waitFor();
  await assert.equal(await page.getByText("HABILITAÇÃO DE CASAMENTO").isVisible(), true);
  await assert.equal(await page.getByText("Nenhum andamento registrado neste processo.").isVisible(), false);
  await assert.equal(await page.getByRole("tab", { name: /partes/i }).count(), 0);
  await assert.equal(await page.getByText("ADEMILSON SILVA DE OLIVEIRA").isVisible(), true);

  await page.getByRole("tab", { name: /andamentos/i }).click();
  await assert.equal(await page.getByText("Nenhum andamento registrado neste processo.").isVisible(), true);

  const bodyText = await page.locator("body").textContent();
  assert.equal(bodyText.includes("017.687.027-05"), false);
  assert.equal(bodyText.includes("01768702705"), false);

  await submitConsultation(page, "17703");
  await page
    .locator("[data-civil-panel='informacoes']")
    .filter({ hasText: "Certidão de Habilitação expedida EFDB06022-NYU" })
    .waitFor();
  const informacoesText = await page.locator("[data-civil-panel='informacoes']").innerText();
  assert.equal(informacoesText.includes("Selo / código"), true);
  assert.equal(informacoesText.includes("EFDB05432-MID"), true);
  assert.equal(informacoesText.includes("Código aleatório"), false);
  assert.equal(informacoesText.includes("ARTHUR MOREIRA DE CASTRO SANTOS"), true);
  assert.equal(informacoesText.includes("EVELLYN JULIANNE TARGINO DE SOUZA"), true);
  assert.equal(informacoesText.includes("00:00:00"), false);

  await page.getByRole("tab", { name: /^andamentos$/i }).click();
  await page
    .locator("[data-civil-panel='andamentos']")
    .filter({ hasText: "Certidão de Habilitação expedida EFDB06022-NYU" })
    .waitFor();
  await page
    .locator("[data-civil-panel='andamentos']")
    .filter({ hasText: "Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT" })
    .waitFor();
  const andamentosText = await page.locator("[data-civil-panel='andamentos']").innerText();
  assert.equal(andamentosText.includes("00:00:00"), false);
  assert.equal(andamentosText.includes("30/12/1899"), false);
  assert.equal(andamentosText.includes("01/06/2026"), true);
  assert.equal(andamentosText.includes("22/05/2026"), true);
  assert.equal(
    andamentosText.indexOf("Certidão de Habilitação expedida EFDB06022-NYU") <
      andamentosText.indexOf("Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT"),
    true,
  );
  assert.equal(
    andamentosText.indexOf("Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT") <
      andamentosText.indexOf("Publicação Eletrônica do Edital de Proclamas"),
    true,
  );

  await submitConsultation(page, "000000");
  await page.locator("[data-civil-result]").filter({ hasText: "Processo não encontrado" }).waitFor();

  await submitConsultation(page, "999999");
  await page.locator("[data-civil-result]").filter({ hasText: "Erro de comunicação" }).waitFor();

  await page.close();
  console.log("Civil consultation smoke test passed.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
