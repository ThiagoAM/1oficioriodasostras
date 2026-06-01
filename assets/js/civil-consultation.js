import { app } from "./firebase-app.js";

const FUNCTIONS_REGION = "southamerica-east1";
const CONSULTATION_FUNCTION = "consultarHabilitacaoCasamento";
const LOCAL_CONSULTATION_ENDPOINT = "/api/local-consulta-habilitacao";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

const formatCpf = (value) => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const isLocalDevelopmentHost = () => ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return { message: await response.text() };
};

const createConsultationClient = () => {
  if (isLocalDevelopmentHost()) {
    return async (payload) => {
      const response = await fetch(LOCAL_CONSULTATION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseResponseBody(response);
      if (!response.ok) {
        throw new Error(data.message || "Não foi possível consultar o servidor local.");
      }
      return data;
    };
  }

  let callable = null;
  return async (payload) => {
    if (!callable) {
      const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js");
      const functions = getFunctions(app, FUNCTIONS_REGION);
      callable = httpsCallable(functions, CONSULTATION_FUNCTION);
    }
    const response = await callable(payload);
    return response?.data || {};
  };
};

const normalizeLines = (value) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const renderMessageLines = (value) => {
  const lines = normalizeLines(value);
  if (!lines.length) {
    return "";
  }
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
};

const renderStatusCard = ({ tone, title, message }) => `
  <div class="civil-result-card civil-result-card-${escapeHtml(tone)}">
    <div class="civil-result-heading">
      <span class="civil-result-dot" aria-hidden="true"></span>
      <strong>${escapeHtml(title)}</strong>
    </div>
    <div class="civil-result-message">${renderMessageLines(message)}</div>
  </div>
`;

const getSeloRow = (processo) => {
  if (processo.selo && processo.codigoAleatorio) {
    return ["Selo / código", `${processo.selo}-${processo.codigoAleatorio}`];
  }
  if (processo.selo) {
    return ["Selo", processo.selo];
  }
  if (processo.codigoAleatorio) {
    return ["Código aleatório", processo.codigoAleatorio];
  }
  return null;
};

const getUltimoAndamentoText = (processo) => {
  const ultimo = processo.ultimoAndamento;
  return [ultimo?.data, ultimo?.tipo, ultimo?.descricao].filter(Boolean).join(" - ");
};

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getProcessStatus = (processo) => {
  const ultimoText = normalizeSearchText(getUltimoAndamentoText(processo));
  const isExpedido = ultimoText.includes("certidao de habilitacao expedida");

  return {
    label: isExpedido ? "Expedido" : "Em andamento",
    tone: isExpedido ? "success" : "pending",
    icon: isExpedido ? "&#10003;" : "",
  };
};

const renderStatusValue = (processo) => {
  const status = getProcessStatus(processo);
  return `
    <span class="civil-process-status civil-process-status-${escapeHtml(status.tone)}">
      ${status.icon ? `<span class="civil-process-status-icon" aria-hidden="true">${status.icon}</span>` : ""}
      <span>${escapeHtml(status.label)}</span>
    </span>
  `;
};

const getAndamentoTipoLabel = (andamento) => {
  const andamentoText = normalizeSearchText([andamento?.descricao, andamento?.complemento].filter(Boolean).join(" "));
  if (andamentoText.includes("certidao de habilitacao expedida")) {
    return "Expedido";
  }
  return andamento?.tipo || "";
};

const renderInfoRows = (processo) => {
  const seloRow = getSeloRow(processo);
  const rows = [
    { label: "Status", html: renderStatusValue(processo), value: getProcessStatus(processo).label },
    { label: "Processo", value: processo.numero },
    { label: "Natureza", value: processo.natureza },
    { label: "Data de cadastro", value: processo.dataCadastro },
    { label: "Situação", value: processo.situacao },
    seloRow ? { label: seloRow[0], value: seloRow[1] } : null,
    { label: "Observação", value: processo.observacao },
  ].filter((row) => row?.value || row?.html);

  const ultimoText = getUltimoAndamentoText(processo);
  if (ultimoText) {
    rows.push({ label: "Último andamento", value: ultimoText });
  }

  if (!rows.length) {
    return '<p class="civil-empty">Nenhuma informação principal disponível.</p>';
  }

  return `
    <dl class="civil-info-list">
      ${rows
        .map(
          ({ label, value, html }) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${html || escapeHtml(value)}</dd>
            </div>
          `,
        )
        .join("")}
    </dl>
  `;
};

const renderPartes = (partes) => {
  if (!partes?.length) {
    return '<p class="civil-empty">Nenhuma parte cadastrada neste processo.</p>';
  }

  return `
    <div class="civil-parties-list">
      ${partes
        .map(
          (parte, index) => `
            <article class="civil-party-card">
              <span>${escapeHtml(parte.tipo || `Nubente ${index + 1}`)}</span>
              <strong>${escapeHtml(parte.nome || `Parte ${index + 1}`)}</strong>
              ${parte.qualificacao ? `<p>${escapeHtml(parte.qualificacao)}</p>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderInfoPanel = (processo) => `
  ${renderInfoRows(processo)}
  <section class="civil-info-parties" aria-labelledby="civilInfoPartiesTitle">
    <h4 id="civilInfoPartiesTitle">Partes</h4>
    ${renderPartes(processo.partes)}
  </section>
`;

const renderAndamentos = (andamentos) => {
  if (!andamentos?.length) {
    return '<p class="civil-empty">Nenhum andamento registrado neste processo.</p>';
  }

  return `
    <div class="civil-timeline">
      ${andamentos
        .map(
          (andamento) => {
            const tipoLabel = getAndamentoTipoLabel(andamento);
            return `
            <article class="civil-timeline-item">
              <div class="civil-timeline-meta">
                ${andamento.data ? `<span>${escapeHtml(andamento.data)}</span>` : ""}
                ${andamento.hora ? `<span>${escapeHtml(andamento.hora)}</span>` : ""}
                ${tipoLabel ? `<strong>${escapeHtml(tipoLabel)}</strong>` : ""}
              </div>
              <p>${escapeHtml(andamento.descricao || "Andamento registrado")}</p>
              ${andamento.complemento ? `<small>${escapeHtml(andamento.complemento)}</small>` : ""}
            </article>
          `;
          },
        )
        .join("")}
    </div>
  `;
};

const renderTabs = (processo) => `
  <div class="civil-tabs" data-civil-tabs>
    <div class="civil-tabs-list" role="tablist" aria-label="Dados do processo">
      <button type="button" class="is-active" role="tab" aria-selected="true" data-civil-tab="informacoes">Informações</button>
      <button type="button" role="tab" aria-selected="false" data-civil-tab="andamentos">Andamentos</button>
    </div>
    <div class="civil-tab-panel" data-civil-panel="informacoes">${renderInfoPanel(processo)}</div>
    <div class="civil-tab-panel" data-civil-panel="andamentos" hidden>${renderAndamentos(processo.andamentos)}</div>
  </div>
`;

const renderFound = (processo) => `
  <div class="civil-found-alert">
    <span aria-hidden="true"></span>
    <strong>Processo encontrado</strong>
  </div>
  ${renderTabs(processo || {})}
`;

const bindTabs = (resultElement) => {
  const tabs = Array.from(resultElement.querySelectorAll("[data-civil-tab]"));
  const panels = Array.from(resultElement.querySelectorAll("[data-civil-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.civilTab;
      tabs.forEach((button) => {
        const isActive = button === tab;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.civilPanel !== target;
      });
    });
  });
};

const initCivilConsultation = (root) => {
  if (root.dataset.civilConsultationReady === "true") {
    return;
  }
  root.dataset.civilConsultationReady = "true";

  const form = root.querySelector("[data-civil-consultation-form]");
  const processInput = root.querySelector("[data-civil-process-input]");
  const cpfInput = root.querySelector("[data-civil-cpf-input]");
  const submitButton = root.querySelector("[data-civil-submit]");
  const statusElement = root.querySelector("[data-civil-status]");
  const resultElement = root.querySelector("[data-civil-result]");
  const consultar = createConsultationClient();

  processInput.addEventListener("input", () => {
    processInput.value = onlyDigits(processInput.value);
  });

  cpfInput.addEventListener("input", () => {
    cpfInput.value = formatCpf(cpfInput.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const numeroProcesso = onlyDigits(processInput.value);
    const cpf = onlyDigits(cpfInput.value);

    resultElement.hidden = true;
    resultElement.innerHTML = "";
    statusElement.textContent = "";

    if (!numeroProcesso) {
      statusElement.textContent = "Informe o número do processo.";
      processInput.focus();
      return;
    }

    if (cpf.length !== 11) {
      statusElement.textContent = "Informe o CPF de um dos nubentes.";
      cpfInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Consultando...";
    root.classList.add("is-loading");

    try {
      const data = await consultar({ numeroProcesso, cpf });

      if (!data.found) {
        resultElement.innerHTML = renderStatusCard({
          tone: "warning",
          title: "Processo não encontrado",
          message: data.message || "Verifique o número do processo e o CPF informado.",
        });
      } else {
        resultElement.innerHTML = renderFound(data.processo);
        bindTabs(resultElement);
      }

      resultElement.hidden = false;
      resultElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      resultElement.innerHTML = renderStatusCard({
        tone: "warning",
        title: "Erro de comunicação",
        message: error?.message || "Não foi possível obter resposta do servidor. Tente novamente em instantes.",
      });
      resultElement.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Consultar processo";
      root.classList.remove("is-loading");
    }
  });
};

const waitForCivilConsultation = (attempt = 0) => {
  const root = document.querySelector("[data-civil-consultation]");
  if (root) {
    initCivilConsultation(root);
    return;
  }

  if (attempt < 40) {
    window.setTimeout(() => waitForCivilConsultation(attempt + 1), 50);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => waitForCivilConsultation());
} else {
  waitForCivilConsultation();
}
