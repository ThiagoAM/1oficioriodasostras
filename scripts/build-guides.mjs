// Gera as páginas HTML dos guias ao cidadão a partir de guides/markdown/*.md.
// Uso: node scripts/build-guides.mjs
// Saída: guides/<slug>.html (uma página por .md, exceto os roteiro-*.md,
// que correspondem às três guias grandes mantidas à mão).
// Sem dependências externas: o conversor cobre a sintaxe realmente usada
// nos .md (headings, parágrafos, listas aninhadas, negrito, tabelas,
// citações e réguas horizontais). Os HTML gerados são commitados.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const ORIGIN = "https://cartorioderiodasostras.com.br";
const TITLE_SUFFIX = " – Cartório 1º Ofício Rio das Ostras";
const OG_IMAGE = `${ORIGIN}/assets/images/og/og-cartorio-1200x630.jpg`;
const OG_IMAGE_ALT =
  "Orla de Rio das Ostras vista do alto — Cartório do 1º Ofício de Justiça de Rio das Ostras";

// slug → { pdf (nome real do arquivo em guides/), shortName (breadcrumb),
//          description (140–160 caracteres, escrita à mão a partir do conteúdo) }
const GUIDES = {
  "adjudicacao-compulsoria-extrajudicial": {
    pdf: "Adjudicacao-Compulsoria-Extrajudicial.pdf",
    shortName: "Adjudicação Compulsória Extrajudicial",
    description:
      "Entenda a adjudicação compulsória extrajudicial: quem pode requerer, ata notarial, documentos e etapas para regularizar imóvel quitado sem escritura definitiva.",
  },
  "apostilamento-haia": {
    pdf: "guia-apostilamento-haia.pdf",
    shortName: "Apostilamento da Haia",
    description:
      "Saiba como funciona a Apostila da Haia no cartório de Rio das Ostras: quando usar, documentos apostiláveis, etapas da emissão e conferência de autenticidade.",
  },
  "ata-notarial-whatsapp-imoveis": {
    pdf: "guia-ata-notarial-whatsApp-imoveis.pdf",
    shortName: "Ata Notarial de WhatsApp para Imóveis",
    description:
      "Veja como a ata notarial preserva conversas de WhatsApp em negociações imobiliárias: o que ela prova, cuidados antes de lavrar e etapas no tabelionato de notas.",
  },
  "atos-notariais": {
    pdf: "guia-atos-notariais.pdf",
    shortName: "Atos Notariais",
    description:
      "Guia dos atos notariais: quando a lei exige escritura pública, advogado ou forma solene, e as diferenças entre escritura, ata, procuração e reconhecimento.",
  },
  "conversao-uniao-estavel": {
    pdf: "guia-conversao-uniao-estavel.pdf",
    shortName: "Conversão de União Estável em Casamento",
    description:
      "Veja como converter união estável em casamento no Registro Civil: título necessário, documentos, edital, regime de bens e lavratura do assento no Livro B.",
  },
  "direitos-possessorios": {
    pdf: "guia-direitos-possessorios.pdf",
    shortName: "Direitos Possessórios",
    description:
      "Entenda os direitos possessórios e a escritura declaratória de posse: o que a posse comprova, limites frente à propriedade e cuidados antes de formalizar o ato.",
  },
  enotariado: {
    pdf: "guia-enotariado.pdf",
    shortName: "e-Notariado",
    description:
      "Conheça o e-Notariado: escrituras, procurações e outros atos notariais por videoconferência e assinatura digital, com validade jurídica, sem ir ao cartório.",
  },
  escrituras: {
    pdf: "guia-escrituras.pdf",
    shortName: "Escrituras Públicas",
    description:
      "Guia das escrituras públicas: documentos das partes e do imóvel, tributos, etapas da lavratura no cartório e a importância do registro no Registro de Imóveis.",
  },
  estremacao: {
    pdf: "guia-estremacao.pdf",
    shortName: "Escritura de Estremação",
    description:
      "Entenda a escritura de estremação: como individualizar parcela de imóvel em condomínio pro diviso, requisitos, documentos e abertura de matrícula própria.",
  },
  "guia-escritura-compra-venda-dacao-pagamento": {
    pdf: "guia-escritura-compra-venda-dacao-pagamento.pdf",
    shortName: "Escritura de Compra e Venda e Dação em Pagamento",
    description:
      "Guia prático da escritura de compra e venda e da dação em pagamento: documentos, ITBI, fluxo no cartório, prazos e cautelas até o registro do imóvel no RI.",
  },
  "habilitacao-casamento": {
    pdf: "guia-habilitacao casamento.pdf",
    shortName: "Habilitação de Casamento",
    description:
      "Saiba como funciona a habilitação de casamento no Registro Civil: prazos, documentos dos noivos, editais, regime de bens e validade da certidão para celebrar.",
  },
  "incorporacao-imobiliaria": {
    pdf: "guia-incorporacao-imobiliaria.pdf",
    shortName: "Incorporação Imobiliária",
    description:
      "Entenda a incorporação imobiliária: etapas do empreendimento, registro do memorial no Registro de Imóveis e documentos exigidos antes da venda das unidades.",
  },
  "inventario-partilha": {
    pdf: "guia-inventario-partilha.pdf",
    shortName: "Inventário e Partilha Extrajudicial",
    description:
      "Guia do inventário e partilha extrajudicial por escritura pública: requisitos, documentos, ITCMD, papel do advogado e registros após a lavratura do ato.",
  },
  investidura: {
    pdf: "guia-investidura.pdf",
    shortName: "Escritura de Investidura",
    description:
      "Entenda a escritura pública de investidura: quando área pública remanescente pode ser incorporada ao imóvel vizinho, requisitos, documentos e etapas do ato.",
  },
  "livro-e-rcpn": {
    pdf: "guia-livro-e-RCPN.pdf",
    shortName: "Livro E do Registro Civil",
    description:
      "Conheça o Livro E do Registro Civil: quais atos especiais do estado civil são registrados nele, etapas do procedimento na serventia e emissão de certidões.",
  },
  "mudanca-nome-sobrenome": {
    pdf: "guia-mudanca-nome-sobrenome.pdf",
    shortName: "Mudança de Nome e Sobrenome",
    description:
      "Veja o que pode ser alterado no nome diretamente no Registro Civil: mudança de prenome, inclusão ou retirada de sobrenomes, documentos e efeitos da averbação.",
  },
  "mudanca-regime-bens": {
    pdf: "guia-mudanca-regime-bens.pdf",
    shortName: "Mudança de Regime de Bens",
    description:
      "Entenda a mudança de regime de bens no casamento: requisitos, pedido motivado ao juízo, papel do advogado e averbação no Registro Civil após a decisão final.",
  },
  nascimento: {
    pdf: "guia-nascimento-ludico.pdf",
    shortName: "Registro de Nascimento",
    description:
      "Guia do registro de nascimento no cartório: prazos, quem pode declarar, documentos, conteúdo do assento, reconhecimento de filho e emissão de certidões.",
  },
  obito: {
    pdf: "guia-obito-ludico.pdf",
    shortName: "Registro de Óbito",
    description:
      "Guia do registro de óbito no cartório: prazos, quem deve declarar, documentos necessários, conteúdo do assento e certidões para inventário e outras medidas.",
  },
  "procuracao-publica": {
    pdf: "guia-procuracao-publica.pdf",
    shortName: "Procuração Pública",
    description:
      "Entenda a procuração pública lavrada em cartório: tipos de poderes, documentos do outorgante, validade, revogação e cuidados na representação de terceiros.",
  },
  "setor-firmas": {
    pdf: "guia-setor-firmas.pdf",
    shortName: "Setor de Firmas",
    description:
      "Guia do setor de firmas do cartório: reconhecimento de firma por semelhança e autenticidade, autenticação de cópias, abertura de ficha e apostilamento.",
  },
  "testamento-publico": {
    pdf: "guia-testamento-publico.pdf",
    shortName: "Testamento Público",
    description:
      "Saiba como fazer testamento público em cartório: quem pode testar, testemunhas, parte disponível dos bens, cláusulas possíveis e revogação das disposições.",
  },
  "uniao-estavel": {
    pdf: "guia-uniao-estavel.pdf",
    shortName: "União Estável",
    description:
      "Entenda a escritura pública de união estável: requisitos, documentos, regime de bens, efeitos perante bancos e previdência, presencial ou pelo e-Notariado.",
  },
  "usucapiao-extrajudicial-tabelionato": {
    pdf: "Usucapiao-Extrajudicial Tabelionato.pdf",
    shortName: "Usucapião Extrajudicial",
    description:
      "Guia da usucapião extrajudicial: papel da ata notarial lavrada no tabelionato, requisitos da posse, documentos e etapas do pedido no Registro de Imóveis.",
  },
};

// ---------------------------------------------------------------------------
// Conversor de Markdown (apenas o subconjunto usado nos .md dos guias)
// ---------------------------------------------------------------------------

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const escapeAttr = escapeHtml;

// Inline: negrito (**texto**) e links markdown ([texto](destino)). Escapa HTML
// primeiro; o destino aceita só caminho absoluto do site ou https, para que um
// .md nunca consiga injetar javascript: numa página gerada. O `(?![/\\])` barra
// `//host` e `/\host`, que o navegador resolveria como outro domínio e que
// escapariam do rel="noopener noreferrer" do ramo externo.
const LINK_RE = /\[([^\]]+)\]\((\/(?![/\\])[^\s)]*|https:\/\/[^\s)]+)\)/g;

const inline = (text) => {
  const escaped = escapeHtml(text.trim()).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // O destino para no primeiro ")", então uma URL com parêntese sairia truncada
  // e o resto vazaria como texto. Melhor falhar a build do que publicar isso.
  const truncated = escaped.match(/\[[^\]]+\]\([^\s)]*\([^\s)]*\)/);
  if (truncated) {
    throw new Error(
      `Link markdown com parêntese no destino não é suportado: ${truncated[0]}. Use uma URL sem parêntese (percent-encode: %28 e %29).`,
    );
  }
  return escaped.replace(LINK_RE, (_match, label, href) =>
    href.startsWith("https://")
      ? `<a href="${href}" rel="noopener noreferrer">${label}</a>`
      : `<a href="${href}">${label}</a>`,
  );
};

const LIST_ITEM_RE = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}[\s|:-]*$/;

const isListItem = (line) => {
  const m = line.match(LIST_ITEM_RE);
  return m && !TABLE_SEP_RE.test(line) ? m : null;
};

// Converte uma sequência de linhas de lista (com aninhamento por indentação
// e linhas de continuação) em <ul>/<ol> aninhados.
function renderList(lines) {
  const first = isListItem(lines[0]);
  const baseIndent = first[1].length;
  const ordered = /^\d+\.$/.test(first[2]);
  const items = [];
  let current = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const m = isListItem(line);
    const indent = (line.match(/^\s*/) || [""])[0].length;
    if (m && m[1].length <= baseIndent) {
      if (current) items.push(current);
      current = { head: m[3], childLines: [], contLines: [] };
    } else if (m && m[1].length > baseIndent) {
      current.childLines.push(line);
    } else if (indent > baseIndent) {
      // Linha de continuação de um item (ex.: passos numerados com descrição).
      if (current.childLines.length > 0) current.childLines.push(line);
      else current.contLines.push(line.trim());
    } else {
      throw new Error(`Linha inesperada dentro de lista: ${JSON.stringify(line)}`);
    }
  }
  if (current) items.push(current);

  const body = items
    .map((item) => {
      let html = inline(item.head);
      if (item.contLines.length > 0) html += `<br />${inline(item.contLines.join(" "))}`;
      if (item.childLines.length > 0) html += renderList(item.childLines);
      return `<li>${html}</li>`;
    })
    .join("\n");
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>\n${body}\n</${tag}>`;
}

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

function renderTable(lines) {
  const rows = lines.map(splitRow);
  if (rows.length < 2 || !TABLE_SEP_RE.test(lines[1])) {
    throw new Error(`Tabela malformada: ${lines[0]}`);
  }
  const header = rows[0];
  const body = rows.slice(2);
  const thead = `<thead>\n<tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>\n</thead>`;
  const tbody = body
    .map((cells) => `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("\n");
  return `<div class="table-wrap">\n<table>\n${thead}\n<tbody>\n${tbody}\n</tbody>\n</table>\n</div>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let title = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) {
        if (title !== null) throw new Error("Mais de um título de nível 1 no arquivo.");
        title = heading[2].trim();
      } else {
        blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      }
      i += 1;
      continue;
    }

    if (/^-{3,}\s*$/.test(line)) {
      blocks.push("<hr />");
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const paragraphs = quote
        .join("\n")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${inline(p.replace(/\n/g, " "))}</p>`)
        .join("\n");
      blocks.push(`<blockquote>\n${paragraphs}\n</blockquote>`);
      continue;
    }

    if (line.trim().startsWith("|")) {
      const table = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        table.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(table));
      continue;
    }

    if (isListItem(line)) {
      const list = [];
      while (i < lines.length) {
        const current = lines[i];
        if (current.trim() && (isListItem(current) || /^\s/.test(current))) {
          list.push(current);
          i += 1;
          continue;
        }
        if (!current.trim()) {
          // Linha em branco só continua a lista se a próxima linha útil
          // ainda pertencer a ela (novo item ou conteúdo indentado).
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j += 1;
          if (j < lines.length && (isListItem(lines[j]) || /^\s/.test(lines[j]))) {
            i = j;
            continue;
          }
        }
        break;
      }
      blocks.push(renderList(list));
      continue;
    }

    // Parágrafo: agrega linhas até a próxima linha em branco ou outro bloco.
    const paragraph = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^-{3,}\s*$/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !lines[i].trim().startsWith("|") &&
      !isListItem(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }

  if (!title) throw new Error("Arquivo sem título de nível 1.");
  return { title, body: blocks.join("\n") };
}

// ---------------------------------------------------------------------------
// Template da página
// ---------------------------------------------------------------------------

const PAGE_STYLE = `
.guide-breadcrumb{background:var(--bg-panel);border-bottom:1px solid var(--line-light);font-size:14px}
.guide-breadcrumb .container{max-width:860px;padding-top:12px;padding-bottom:12px}
.guide-breadcrumb a{color:var(--accent-dark);text-decoration:underline;text-underline-offset:2px}
.guide-breadcrumb a:hover{color:var(--text-dark)}
.guide-breadcrumb span[aria-hidden]{margin:0 6px;color:var(--text-muted)}
.guide-main{max-width:860px;margin:0 auto;padding:32px var(--container-gutter) 56px}
.guide-article{background:var(--bg-panel);border:1px solid var(--line-light);border-radius:18px;padding:clamp(24px,4vw,48px)}
.guide-article>*{max-width:70ch}
.guide-kicker{font-family:var(--font-sans);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-dark);margin:0 0 10px}
.guide-article h1{font-family:var(--font-serif);font-weight:600;font-size:clamp(28px,4.4vw,40px);line-height:1.15;margin:0 0 18px;color:var(--text-dark)}
.guide-article h2{font-family:var(--font-serif);font-weight:600;font-size:clamp(21px,3vw,26px);line-height:1.25;margin:36px 0 12px;padding-top:18px;border-top:1px solid var(--line-light);color:var(--text-dark)}
.guide-article h3{font-family:var(--font-sans);font-weight:700;font-size:17px;line-height:1.3;margin:26px 0 10px;color:var(--text-dark)}
.guide-article p{margin:0 0 14px;line-height:1.65;color:var(--text-muted)}
.guide-article ul,.guide-article ol{margin:0 0 16px;padding-left:24px}
.guide-article li{margin:0 0 8px;line-height:1.6;color:var(--text-muted)}
.guide-article li ul,.guide-article li ol{margin:8px 0 0}
.guide-article strong{color:var(--text-dark)}
.guide-article hr{border:0;border-top:1px solid var(--line-light);margin:28px 0}
.guide-article hr+h2{border-top:0;padding-top:0;margin-top:0}
.guide-article blockquote{margin:0 0 16px;padding:14px 18px;border-left:4px solid var(--accent);background:var(--bg-light);border-radius:0 10px 10px 0}
.guide-article blockquote p{margin:0}
.guide-article blockquote p+p{margin-top:10px}
.table-wrap{overflow-x:auto;margin:0 0 18px;max-width:none}
.guide-article table{border-collapse:collapse;width:100%;min-width:560px;font-size:15px}
.guide-article th,.guide-article td{border:1px solid var(--line-light);padding:10px 12px;text-align:left;vertical-align:top;line-height:1.55;color:var(--text-muted)}
.guide-article th{background:var(--bg-light);color:var(--text-dark);font-weight:600}
.guide-cta{margin-top:32px;padding:22px 24px;border:1px solid var(--line-light);border-radius:14px;background:var(--bg-light);max-width:none}
.guide-cta h2{font-family:var(--font-serif);font-size:20px;margin:0 0 12px;border:0;padding:0;color:var(--text-dark)}
.guide-cta p{margin:0 0 10px}
.guide-cta a{color:var(--accent-dark);text-decoration:underline;text-underline-offset:2px;font-weight:600}
.guide-cta a:hover{color:var(--text-dark)}
.guide-footer{background:var(--bg-dark);color:var(--text-soft);font-size:14px;line-height:1.6}
.guide-footer .container{max-width:860px;padding-top:24px;padding-bottom:24px}
.guide-footer strong{color:var(--text-light);font-weight:600}
.guide-footer a{color:var(--text-light);text-decoration:underline;text-underline-offset:2px}
`.trim();

function renderPage({ slug, title, shortName, description, pdf, body }) {
  const canonical = `${ORIGIN}/guides/${slug}.html`;
  const pdfHref = encodeURI(pdf);
  const ogTitle = title.length <= 70 ? title : shortName;
  const breadcrumbJson = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "Guias ao cidadão", item: `${ORIGIN}/guias.html` },
        { "@type": "ListItem", position: 3, name: shortName },
      ],
    },
    null,
    2,
  );

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}${TITLE_SUFFIX}</title>
<meta name="description" content="${escapeAttr(description)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Cartório do 1º Ofício de Justiça de Rio das Ostras" />
<meta property="og:title" content="${escapeAttr(ogTitle)}" />
<meta property="og:description" content="${escapeAttr(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeAttr(OG_IMAGE_ALT)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeAttr(ogTitle)}" />
<meta name="twitter:description" content="${escapeAttr(description)}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="icon" type="image/x-icon" href="../favicon.ico" />
<link rel="shortcut icon" href="../favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="../assets/images/apple-touch-icon.png" />
<link rel="stylesheet" href="../assets/css/main.css" />
<style>
${PAGE_STYLE}
</style>
<script type="application/ld+json">
${breadcrumbJson}
</script>
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="brand">
      <img
        src="../assets/images/display/cartorio-icon-140.png"
        alt="Logo do Cartório do 1º Ofício de Justiça de Rio das Ostras"
        class="brand-logo"
      />
      <div class="brand-text">
        <span class="brand-title">1º Ofício de Justiça</span>
        <span class="brand-subtitle">Notas • Protesto • RCPN • Rio das Ostras/RJ</span>
      </div>
    </a>
  </div>
</header>

<nav class="guide-breadcrumb" aria-label="Trilha de navegação">
  <div class="container">
    <a href="/">Início</a><span aria-hidden="true">›</span><a href="/guias.html">Guias ao cidadão</a><span aria-hidden="true">›</span>${escapeHtml(shortName)}
  </div>
</nav>

<main class="guide-main">
  <article class="guide-article">
    <p class="guide-kicker">Guia ao cidadão</p>
    <h1>${inline(title)}</h1>
${body}
    <aside class="guide-cta">
      <h2>Materiais e atendimento</h2>
      <p><a href="${pdfHref}">Baixar este guia em PDF</a> · <a href="/guias.html">Ver todos os guias</a></p>
      <p>
        Dúvidas? Fale com o cartório: <a href="tel:+552231900120">(22) 3190-0120</a> ·
        <a href="https://wa.me/552231900120" rel="noopener noreferrer">WhatsApp</a>
      </p>
    </aside>
  </article>
</main>

<footer class="guide-footer">
  <div class="container">
    <p>
      <strong>Cartório do 1º Ofício de Justiça de Rio das Ostras</strong><br />
      Rua Luíza Vianna, nº 87, Loja 1 – Novo Rio das Ostras, Rio das Ostras/RJ · CEP 28893-470 ·
      <a href="tel:+552231900120">(22) 3190-0120</a>
    </p>
  </div>
</footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Geração + validações
// ---------------------------------------------------------------------------

const problems = [];
const generated = [];

for (const [slug, meta] of Object.entries(GUIDES)) {
  const mdPath = join(root, "guides", "markdown", `${slug}.md`);
  const pdfPath = join(root, "guides", meta.pdf);
  if (!existsSync(mdPath)) {
    problems.push(`Markdown não encontrado: ${mdPath}`);
    continue;
  }
  if (!existsSync(pdfPath)) {
    problems.push(`PDF não encontrado: ${pdfPath}`);
    continue;
  }
  const length = [...meta.description].length;
  if (length < 140 || length > 160) {
    problems.push(`Description de ${slug} com ${length} caracteres (esperado 140–160).`);
  }

  const { title, body } = markdownToHtml(readFileSync(mdPath, "utf8"));
  const html = renderPage({ slug, title, ...meta, body });
  writeFileSync(join(root, "guides", `${slug}.html`), html, "utf8");
  generated.push({ slug, title });
}

if (problems.length > 0) {
  console.error("Problemas encontrados:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`${generated.length} páginas geradas em guides/:`);
for (const { slug, title } of generated) console.log(`- ${slug}.html — ${title}`);
