export class CivilConsultationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CivilConsultationError";
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== "" && entryValue !== null && entryValue !== undefined),
  );

const parseDateTime = (value) => {
  const text = cleanText(value);
  if (!text) {
    return "";
  }

  const [datePart, timePart = ""] = text.split(/\s+/);
  const isoDateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    if (year === "1899" && month === "12" && day === "30") {
      return "";
    }
    return timePart && timePart !== "00:00:00" ? `${day}/${month}/${year} ${timePart}` : `${day}/${month}/${year}`;
  }

  const brDateMatch = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDateMatch) {
    const [, day, month, year] = brDateMatch;
    if (year === "1899" && month === "12" && day === "30") {
      return "";
    }
    return timePart && timePart !== "00:00:00" ? `${day}/${month}/${year} ${timePart}` : `${day}/${month}/${year}`;
  }

  return text;
};

const getProcessoPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }
  return payload || null;
};

const sortAndamentos = (andamentos) =>
  [...andamentos].sort((left, right) => {
    const leftDate = new Date(left.data || left.dt_andamento || left.data_andamento || 0).getTime();
    const rightDate = new Date(right.data || right.dt_andamento || right.data_andamento || 0).getTime();
    return rightDate - leftDate;
  });

const normalizePartes = (partes) => {
  if (!Array.isArray(partes)) {
    return [];
  }

  return partes
    .map((parte) =>
      compactObject({
        nome: cleanText(parte.nome || parte.nome_parte),
        tipo: cleanText(parte.tipo || parte.tipo_parte),
        qualificacao: cleanText(parte.qualificacao),
      }),
    )
    .filter((parte) => parte.nome || parte.tipo || parte.qualificacao);
};

const normalizeAndamentos = (andamentos) => {
  if (!Array.isArray(andamentos)) {
    return [];
  }

  return sortAndamentos(andamentos)
    .map((andamento) =>
      compactObject({
        data: parseDateTime(andamento.data || andamento.dt_andamento || andamento.data_andamento),
        hora: cleanText(andamento.hora),
        tipo: cleanText(andamento.tipo || andamento.tipo_andamento),
        descricao: cleanText(andamento.descricao || andamento.texto || andamento.andamento),
        complemento: cleanText(andamento.complemento),
      }),
    )
    .filter((andamento) => andamento.data || andamento.tipo || andamento.descricao || andamento.complemento);
};

const normalizeUltimoAndamento = (processo, andamentos) => {
  const resumo = compactObject({
    data: parseDateTime(processo.data_ultimo_andamento || processo.dt_ultimo_andamento),
    tipo: cleanText(processo.tipo_ultimo_andamento),
    descricao: cleanText(processo.descricao_ultimo_andamento || processo.ultimo_andamento),
  });

  if (resumo.data || resumo.tipo || resumo.descricao) {
    return resumo;
  }

  return andamentos.length ? andamentos[0] : null;
};

export const normalizeCivilProcessPayload = (payload) => {
  const processo = getProcessoPayload(payload);

  if (!processo || typeof processo !== "object") {
    return {
      found: false,
      message: "Processo não encontrado.",
    };
  }

  if (processo.erro) {
    return {
      found: false,
      message: cleanText(processo.erro) || "Processo não encontrado.",
    };
  }

  const andamentos = normalizeAndamentos(processo.andamentos);
  const normalized = compactObject({
    numero: cleanText(processo.num_seq || processo.num_seq_processo || processo.numero || processo.processo),
    dataCadastro: parseDateTime(processo.dt_cadastro || processo.data_cadastro),
    nome: cleanText(processo.nome),
    situacao: cleanText(processo.situacao),
    observacao: cleanText(processo.observacao),
    selo: cleanText(processo.selo),
    codigoAleatorio: cleanText(processo.aleatorio || processo.codigo_aleatorio),
    natureza: cleanText(processo.natureza_tombo || processo.natureza),
    ultimoAndamento: normalizeUltimoAndamento(processo, andamentos),
    partes: normalizePartes(processo.partes),
    andamentos,
  });

  return {
    found: true,
    processo: normalized,
  };
};

const buildApiUrl = ({ baseUrl, port, numeroProcesso, cpf }) => {
  const trimmedBaseUrl = cleanText(baseUrl).replace(/\/$/, "");
  const normalizedBaseUrl = /^https?:\/\//i.test(trimmedBaseUrl) ? trimmedBaseUrl : `http://${trimmedBaseUrl}`;
  const trimmedPort = cleanText(port);
  const url = new URL(`${normalizedBaseUrl}${trimmedPort ? `:${trimmedPort}` : ""}/marcha`);
  url.searchParams.set("num_seq", numeroProcesso);
  url.searchParams.set("identificacao", cpf);
  return url;
};

const validateInput = (input) => {
  const numeroProcesso = onlyDigits(input?.numeroProcesso);
  const cpf = onlyDigits(input?.cpf);

  if (!numeroProcesso) {
    throw new CivilConsultationError("invalid-argument", "Informe o número do processo.");
  }

  if (cpf.length !== 11) {
    throw new CivilConsultationError("invalid-argument", "Informe o CPF de um dos nubentes.");
  }

  return { numeroProcesso, cpf };
};

const getConfigValue = (config, key) => {
  const value = config?.[key];
  return typeof value === "function" ? value() : value;
};

export const consultarHabilitacaoCasamentoCore = async ({
  input,
  fetchImpl = fetch,
  config = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  const { numeroProcesso, cpf } = validateInput(input);
  const baseUrl = getConfigValue(config, "baseUrl");
  const port = getConfigValue(config, "port");
  const token = getConfigValue(config, "token");

  if (!baseUrl || !port || !token) {
    throw new CivilConsultationError("failed-precondition", "Configuração da API de consulta incompleta.");
  }

  const url = buildApiUrl({ baseUrl, port, numeroProcesso, cpf });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (response.status === 401) {
      throw new CivilConsultationError("failed-precondition", "Token da API de consulta inválido.");
    }

    if (!response.ok && response.status !== 404) {
      throw new CivilConsultationError("unavailable", "A API de consulta retornou erro. Tente novamente em instantes.");
    }

    const contentType = response.headers?.get?.("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new CivilConsultationError("unavailable", "A API de consulta retornou uma resposta inválida.");
    }

    const payload = await response.json();
    return normalizeCivilProcessPayload(payload);
  } catch (error) {
    if (error instanceof CivilConsultationError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new CivilConsultationError("deadline-exceeded", "Tempo limite excedido ao consultar a API.");
    }

    throw new CivilConsultationError("unavailable", "Não foi possível conectar à API de consulta.");
  } finally {
    clearTimeout(timeoutId);
  }
};
