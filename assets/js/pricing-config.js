(() => {
  const pricing = {
    mode: "updating",
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
    },
    services: {
      itc: {
        amountDisplay: "R$ 233,79",
        pixAmount: "233.79",
        txid: "ITC2026",
      },
      segundaViaCertidao: {
        amountDisplay: "R$ 176,50",
        pixAmount: "176.50",
        txid: "SEGVIA2026",
      },
      anotacaoCasamentoObito: {
        amountDisplay: "R$ 176,50",
      },
      averbacaoDivorcio: {
        amountDisplay: "R$ 393,56",
      },
      transcricaoEstrangeira: {
        amountDisplay: "R$ 983,68",
      },
      casamentoCivilSede: {
        amountDisplay: "R$ 1.770,73",
      },
      casamentoCivilExterno: {
        amountDisplay: "R$ 3.925,18",
      },
      uniaoEstavelComum: {
        amountDisplay: "R$ 355,24",
      },
      uniaoEstavelDiverso: {
        amountDisplay: "R$ 848,16",
      },
      conversaoUniaoEstavel: {
        amountDisplay: "R$ 1.308,29",
      },
      livroE: {
        amountDisplay: "R$ 471,22",
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
      return amount ? `${label}: ${amount}.` : `${label}.`;
    },
  };

  window.SitePricing = pricing;
})();
