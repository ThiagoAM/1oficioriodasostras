import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const visitCount = 4321;

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

const createStaticServer = () => {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");
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
    } catch (error) {
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
  const delay = () => new Promise((resolve) => setTimeout(resolve, 150));
  const yearlyCounts = { "2026": ${visitCount} };
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
  export const getDocFromServer = async (reference) => {
    await delay();
    if (reference.collection === "site_visits_summary") {
      return snapshot({ total: ${visitCount} });
    }
    if (reference.collection === "site_visits_yearly") {
      return snapshot({ year: Number(reference.id), count: yearlyCounts[reference.id] || 0 });
    }
    return snapshot(null);
  };
  export const getDoc = getDocFromServer;
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
};

const assertVisitMetricHydrates = async ({ page, url, valueSelector }) => {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const value = page.locator(valueSelector);
  await value.waitFor({ state: "attached" });

  const initialText = (await value.textContent())?.trim();
  assert.notEqual(initialText, "0", `${url} rendered a false zero before visit counts loaded`);

  await page.waitForFunction(
    ({ selector, expected }) => document.querySelector(selector)?.textContent?.trim() === expected,
    { selector: valueSelector, expected: "4.321" },
  );
};

const { server, origin } = await createStaticServer();
const browser = await chromium.launch();

try {
  const homePage = await browser.newPage();
  await stubFirebaseModules(homePage);
  await assertVisitMetricHydrates({
    page: homePage,
    url: `${origin}/index.html`,
    valueSelector: '.metric[data-metric-key="visitas-site"] strong',
  });
  await homePage.close();

  const statsPage = await browser.newPage();
  await stubFirebaseModules(statsPage);
  await assertVisitMetricHydrates({
    page: statsPage,
    url: `${origin}/numeros-cartorio.html`,
    valueSelector: '.stats-card[data-stat-id="visitas-site"] strong',
  });
  await statsPage.close();

  console.log("Site visit hydration smoke test passed.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
