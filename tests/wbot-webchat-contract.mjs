// Contrato do web chat de atendimento (wbot.chat) pedido pelo cartório, que
// substituiu o WhatsApp flutuante e os botões que levavam ao WhatsApp.
// O script do fornecedor lê o token do próprio <script> (document.currentScript
// ou, na falta dele, script[src="https://wbot.chat/index.js"]); por isso a URL
// precisa ser exata e o token precisa ir como atributo `token` na tag injetada.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const mainJs = read("assets", "js", "main.js");
const siteData = read("assets", "js", "site-data.js");
const mainCss = read("assets", "css", "main.css");
const prerender = read("scripts", "prerender.mjs");

assert.match(mainJs, /scriptUrl:\s*"https:\/\/wbot\.chat\/index\.js"/);
assert.match(mainJs, /token:\s*"4edb62cb718ab0e3bf588dee7e6b5880"/);
assert.match(mainJs, /script\.setAttribute\("token",\s*WBOT_WEBCHAT\.token\)/);
assert.match(mainJs, /loadWbotWebchat\(\);/, "o init precisa carregar o web chat");
assert.match(mainJs, /initWebchatTriggers\(\);/, "o init precisa ligar os botões de atendimento");
assert.match(mainJs, /window\.WBOTopenChat\(\)/, "os botões abrem o chat pela função do fornecedor");

// Sem WhatsApp flutuante nem botões apontando para o WhatsApp.
assert.doesNotMatch(mainJs, /whatsapp-float/);
assert.doesNotMatch(mainCss, /\.whatsapp-float/);
assert.doesNotMatch(mainJs, /whatsappUrl|whatsappServiceUrl|whatsappLabel/);
assert.doesNotMatch(siteData, /wa\.me\//);
assert.match(siteData, /webchatHref:\s*"#contato"/);
const webchatActions = siteData.match(/webchatOpen:\s*true/g) || [];
assert.equal(webchatActions.length, 2, "hero e boas-vindas abrem o web chat");
const webchatLinks = mainJs.match(/data-webchat-open>/g) || [];
assert.ok(webchatLinks.length >= 3, "Fale conosco, formulário e calculadora abrem o web chat");

// O lançador ocupa o canto que era do WhatsApp, à direita do widget de IA.
assert.match(mainCss, /body #wbot-chat-container #wbot-open-chat \{[^}]*right: 22px;/);
assert.match(mainCss, /body #wbot-chat-container #wbot-open-chat \{[^}]*right: 16px;/);
// A janela aberta cobre o lançador do widget de IA (z-index 2147483000).
assert.match(mainCss, /body #wbot-chat-container #wbot-chat \{[^}]*z-index: 2147483001;/);

// O prerender não pode carregar o chat nem abrir sessão na API dele.
assert.match(prerender, /"wbot\.chat"/);
assert.match(prerender, /"mzworkspace\.com"/);

console.log("wbot webchat contract ok");
