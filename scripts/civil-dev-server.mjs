import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CivilConsultationError,
  consultarHabilitacaoCasamentoCore,
} from "../functions/src/civil-consultation-core.js";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT || 4173);

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
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16 * 1024) {
      throw new CivilConsultationError("invalid-argument", "Payload muito grande.");
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

const getTokenFromLegacyDump = async () => {
  try {
    const sql = await readFile(join(rootDir, "legacy/previous_site/cartorio_cartori.sql"), "utf8");
    const match = sql.match(/'http:\/\/1oficio-ro\.dyndns\.info', '([^']+)', 3529\)/);
    return match?.[1] || "";
  } catch {
    return "";
  }
};

const getCivilApiConfig = async () => ({
  baseUrl: process.env.CIVIL_API_BASE_URL || "http://1oficio-ro.dyndns.info",
  port: process.env.CIVIL_API_PORT || "3529",
  token: process.env.CIVIL_API_TOKEN || (await getTokenFromLegacyDump()),
});

const statusByCode = new Map([
  ["invalid-argument", 400],
  ["failed-precondition", 500],
  ["deadline-exceeded", 504],
  ["unavailable", 503],
]);

const handleConsultation = async (request, response) => {
  try {
    const input = await readJsonBody(request);
    const result = await consultarHabilitacaoCasamentoCore({
      input,
      config: await getCivilApiConfig(),
      timeoutMs: 20000,
    });
    sendJson(response, 200, result);
  } catch (error) {
    const statusCode =
      error instanceof CivilConsultationError ? statusByCode.get(error.code) || 500 : 500;
    sendJson(response, statusCode, {
      message: error?.message || "Erro ao consultar processo.",
    });
  }
};

const handleStatic = async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
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
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  if (request.method === "POST" && url.pathname === "/api/local-consulta-habilitacao") {
    await handleConsultation(request, response);
    return;
  }

  await handleStatic(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Civil consultation dev server running at http://127.0.0.1:${port}/servicos-online.html#consulta-habilitacao-casamento`);
});
