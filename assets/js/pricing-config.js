(() => {
  const pricing = {
    mode: "live",
    messages: {
      updating: "Valores em atualização. Consulte nossa equipe para confirmação.",
      updatingDetailed: "Valores em atualização. Consulte nossa equipe pelos canais oficiais para confirmação.",
      fieldValueUpdating: "Sob atualização",
      localRecordUpdating: "Valores em atualização para a 2ª via do 1º Ofício. Nossa equipe confirmará o valor e os dados para pagamento.",
      remoteRecordUpdating: "Não realize pagamento antes do retorno da equipe. Confirmaremos valores e orientações específicas.",
      paymentAfterReview: "Os dados para pagamento serão enviados pela equipe após a análise da solicitação.",
      proofOptional: "Comprovante e documentos adicionais (opcional)",
      attachmentsOptional: "Anexos (opcional)",
      faqUpdating: "Os valores estão em atualização no momento; consulte nossa equipe pelos canais oficiais.",
      requirementUpdating: "Valor de referência em atualização. Consulte nossa equipe para confirmação.",
      pendingContact: "Consulte nossa equipe para confirmação do valor atualizado.",
      secondCopyContact: "Para esta modalidade, consulte nossa equipe antes do pagamento para confirmar o valor final e as orientações.",
    },
    services: {
      itc: {
        amountDisplay: "R$ 249,90",
        pixAmount: "249.90",
        txid: "ITC2026",
      },
      segundaViaBreveRelato: {
        amountDisplay: "R$ 188,76",
        pixAmount: "188.76",
        txid: "SEGVIA2026",
      },
      segundaViaInteiroTeor: {
        amountDisplay: "R$ 251,57",
        pixAmount: "251.57",
        txid: "SEGVIA2026",
      },
      segundaViaInterligadaRj: {
        amountDisplay: "A partir de R$ 409,24",
        startingAmountDisplay: "R$ 409,24",
        startingPixAmount: "409.24",
        requiresReview: true,
      },
      anotacaoCasamentoObito: {
        amountDisplay: "",
        pending: true,
      },
      averbacaoDivorcioUmaVia: {
        amountDisplay: "R$ 420,95",
      },
      averbacaoDivorcioDuasVias: {
        amountDisplay: "R$ 609,71",
      },
      averbacaoRegimeBens: {
        amountDisplay: "",
        pending: true,
      },
      transcricaoEstrangeira: {
        amountDisplay: "",
        pending: true,
      },
      casamentoCivilSede: {
        amountDisplay: "R$ 1.896,90",
      },
      casamentoCivilExterno: {
        amountDisplay: "",
        pending: true,
      },
      uniaoEstavelComum: {
        amountDisplay: "R$ 379,86",
      },
      uniaoEstavelDiverso: {
        amountDisplay: "R$ 907,25",
      },
      conversaoUniaoEstavel: {
        amountDisplay: "R$ 1.400,58",
      },
      livroE: {
        amountDisplay: "R$ 504,14",
      },
      procuracaoSemValor: {
        amountDisplay: "R$ 326,87",
      },
      procuracaoComValor: {
        amountDisplay: "R$ 709,54",
      },
      certidaoUmaPagina: {
        amountDisplay: "R$ 56,77",
      },
      certidaoDuasPaginas: {
        amountDisplay: "R$ 108,90",
      },
      certidaoTresPaginas: {
        amountDisplay: "R$ 161,02",
      },
      emancipacao: {
        amountDisplay: "R$ 379,86",
      },
      divorcioSemBens: {
        amountDisplay: "R$ 827,19",
      },
      ataNotarialSemExcedente: {
        amountDisplay: "R$ 647,90",
      },
      ataNotarialFolhaExcedente: {
        amountDisplay: "R$ 296,00",
        approximate: true,
      },
      apostilamentoHaia: {
        amountDisplay: "R$ 162,15",
      },
      autenticacao: {
        amountDisplay: "R$ 18,22",
      },
      aberturaFirma: {
        amountDisplay: "R$ 57,32",
      },
      reconhecimentoAutenticidade: {
        amountDisplay: "R$ 22,07",
      },
      reconhecimentoSemelhanca: {
        amountDisplay: "R$ 17,77",
      },
      sinalPublico: {
        amountDisplay: "R$ 17,77",
      },
      materializacao: {
        amountDisplay: "R$ 32,95",
        unit: "por página",
      },
    },
    isUpdating() {
      return this.mode !== "live";
    },
    getService(key) {
      return this.services[key] || null;
    },
    getAmountDisplay(key, fallback = "") {
      const service = this.getService(key);
      return service && service.amountDisplay ? service.amountDisplay : fallback;
    },
    getPixAmount(key, fallback = "") {
      const service = this.getService(key);
      return service && service.pixAmount ? service.pixAmount : fallback;
    },
    getMessage(key, fallback = "") {
      return Object.prototype.hasOwnProperty.call(this.messages, key) ? this.messages[key] : fallback;
    },
    getReferenceText(serviceKey, label = "Valor de referência", fallback = "") {
      if (this.isUpdating()) {
        return `${label}: ${this.getMessage("requirementUpdating")}`;
      }
      const amount = this.getAmountDisplay(serviceKey, fallback);
      return amount ? `${label}: ${amount}.` : `${label}: ${this.getMessage("pendingContact")}`;
    },
  };

  window.SitePricing = pricing;
})();
