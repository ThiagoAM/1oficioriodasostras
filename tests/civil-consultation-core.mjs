import assert from "node:assert/strict";
import {
  CivilConsultationError,
  consultarHabilitacaoCasamentoCore,
  normalizeCivilProcessPayload,
} from "../functions/src/civil-consultation-core.js";

const config = {
  baseUrl: "http://example.test",
  port: "3529",
  token: "secret-token",
};

const jsonResponse = (status, payload, contentType = "application/json; charset=utf-8") => ({
  status,
  ok: status >= 200 && status < 300,
  headers: {
    get: (key) => (key.toLowerCase() === "content-type" ? contentType : null),
  },
  json: async () => payload,
});

const assertCivilError = async (promise, code) => {
  await assert.rejects(
    promise,
    (error) => error instanceof CivilConsultationError && error.code === code,
  );
};

{
  const result = normalizeCivilProcessPayload({
    num_seq_processo: "17730",
    data_cadastro: "2026-05-25 00:00:00",
    selo: "EFDB05723",
    aleatorio: "QEN",
    natureza_tombo: "HABILITAÇÃO DE CASAMENTO",
    data_ultimo_andamento: "2026-05-26 10:00:00",
    descricao_ultimo_andamento: "Processo deferido",
    tipo_ultimo_andamento: "DEFERIDO",
    partes: [
      { nome: "ADEMILSON SILVA DE OLIVEIRA", cpf_cnpj: "01768702705" },
      { nome: "JEANE COSTA RIBEIRO", cpf_cnpj: "04085797573" },
    ],
    andamentos: [{ data: "2026-05-26", tipo: "DEFERIDO", descricao: "Processo deferido" }],
  });

  assert.equal(result.found, true);
  assert.equal(result.processo.numero, "17730");
  assert.equal(result.processo.dataCadastro, "25/05/2026");
  assert.equal(result.processo.natureza, "HABILITAÇÃO DE CASAMENTO");
  assert.equal(result.processo.codigoAleatorio, "QEN");
  assert.equal(result.processo.partes.length, 2);
  assert.equal(result.processo.partes[0].cpf_cnpj, undefined);
  assert.equal(result.processo.andamentos.length, 1);
}

{
  const result = normalizeCivilProcessPayload({
    num_seq_processo: "17703",
    data_cadastro: "2026-05-15 00:00:00",
    selo: "EFDB05432",
    aleatorio: "MID",
    natureza_tombo: "HABILITAÇÃO DE CASAMENTO",
    data_ultimo_andamento: "2026-06-01 00:00:00",
    descricao_ultimo_andamento: "Certidão de Habilitação expedida EFDB06022-NYU",
    tipo_ultimo_andamento: "Andamento",
    partes: [
      { nome: "ARTHUR MOREIRA DE CASTRO SANTOS", cpf_cnpj: "19899126703" },
      { nome: "EVELLYN JULIANNE TARGINO DE SOUZA", cpf_cnpj: "22843158796" },
    ],
    andamentos: [
      {
        data: "2026-06-01 00:00:00",
        descricao: "Certidão de Habilitação expedida EFDB06022-NYU",
        tipo: "Andamento",
      },
      {
        data: "2026-05-22 00:00:00",
        descricao: "Verificação pelo Juíz de Paz - CCT GAWQ78640-WQT",
        tipo: "Andamento",
      },
      {
        data: "1899-12-30 00:00:00",
        descricao: "Publicação Eletrônica do Edital de Proclamas",
        tipo: "Andamento",
      },
    ],
  });

  assert.equal(result.found, true);
  assert.equal(result.processo.numero, "17703");
  assert.equal(result.processo.ultimoAndamento.descricao, "Certidão de Habilitação expedida EFDB06022-NYU");
  assert.equal(result.processo.andamentos.length, 3);
  assert.equal(result.processo.dataCadastro, "15/05/2026");
  assert.equal(result.processo.ultimoAndamento.data, "01/06/2026");
  assert.equal(result.processo.andamentos[0].descricao, "Certidão de Habilitação expedida EFDB06022-NYU");
  assert.equal(result.processo.andamentos[2].descricao, "Publicação Eletrônica do Edital de Proclamas");
  assert.equal(result.processo.andamentos[2].data, undefined);
  assert.equal(result.processo.partes[0].cpf_cnpj, undefined);
}

{
  const result = normalizeCivilProcessPayload({ erro: "Processo não encontrado" });
  assert.equal(result.found, false);
  assert.equal(result.message, "Processo não encontrado");
}

{
  let calledUrl = null;
  const fetchImpl = async (url) => {
    calledUrl = url;
    return jsonResponse(200, {
      num_seq: "123",
      dt_cadastro: "2026-01-01",
      situacao: "EM ANDAMENTO",
      partes: [],
      andamentos: [],
    });
  };

  const result = await consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "123", cpf: "017.687.027-05" },
    fetchImpl,
    config,
  });

  assert.equal(result.found, true);
  assert.equal(calledUrl.searchParams.get("num_seq"), "123");
  assert.equal(calledUrl.searchParams.get("identificacao"), "01768702705");
}

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "", cpf: "01768702705" },
    fetchImpl: async () => jsonResponse(200, {}),
    config,
  }),
  "invalid-argument",
);

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "17730", cpf: "123" },
    fetchImpl: async () => jsonResponse(200, {}),
    config,
  }),
  "invalid-argument",
);

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "17730", cpf: "01768702705" },
    fetchImpl: async () => jsonResponse(401, {}),
    config,
  }),
  "failed-precondition",
);

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "17730", cpf: "01768702705" },
    fetchImpl: async () => jsonResponse(200, "<html></html>", "text/html"),
    config,
  }),
  "unavailable",
);

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "17730", cpf: "01768702705" },
    fetchImpl: async () => {
      throw new Error("ECONNREFUSED");
    },
    config,
  }),
  "unavailable",
);

await assertCivilError(
  consultarHabilitacaoCasamentoCore({
    input: { numeroProcesso: "17730", cpf: "01768702705" },
    fetchImpl: (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      }),
    config,
    timeoutMs: 5,
  }),
  "deadline-exceeded",
);

console.log("Civil consultation core tests passed.");
