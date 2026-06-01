import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
  CivilConsultationError,
  consultarHabilitacaoCasamentoCore,
} from "./src/civil-consultation-core.js";

const civilApiToken = defineSecret("CIVIL_API_TOKEN");

const getCivilApiConfig = () => ({
  baseUrl: process.env.CIVIL_API_BASE_URL || "http://1oficio-ro.dyndns.info",
  port: process.env.CIVIL_API_PORT || "3529",
  token: civilApiToken.value(),
});

const toHttpsError = (error) => {
  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof CivilConsultationError) {
    return new HttpsError(error.code, error.message);
  }

  return new HttpsError("internal", "Erro ao consultar processo. Tente novamente em instantes.");
};

export const consultarHabilitacaoCasamento = onCall(
  {
    region: "southamerica-east1",
    secrets: [civilApiToken],
    timeoutSeconds: 20,
    memory: "256MiB",
  },
  async (request) => {
    try {
      return await consultarHabilitacaoCasamentoCore({
        input: request.data,
        fetchImpl: fetch,
        config: getCivilApiConfig(),
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);
