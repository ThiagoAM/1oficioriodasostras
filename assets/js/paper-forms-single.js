(() => {
  const FORM_ID = "singlePaperForm";
  const STATUS_ID = "paperFormStatus";
  const BUTTON_ID = "gerarPdfBtn";
  const TITLE_ID = "paperFormTitle";
  const SUBTITLE_ID = "paperFormSubtitle";
  const HIGHLIGHTS_ID = "paperFormHighlights";

  const CARTORIO_NAME = "Cartório do 1º Ofício de Justiça de Rio das Ostras";
  const CARTORIO_SUBTITLE = "Notas • Protesto • Registro Civil de Pessoas Naturais";
  const LOGO_PATH = "assets/images/cartorio-icon.png";

  const MONTHS_PT = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const todayIso = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const normalizeWhitespace = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

  const normalizeLine = (value, fallback = "________________________________") => {
    const normalized = normalizeWhitespace(value);
    return normalized || fallback;
  };

  const toDigits = (value) => String(value ?? "").replace(/\D+/g, "");

  const formatCpf = (value) => {
    const digits = toDigits(value).slice(0, 11);
    if (digits.length !== 11) {
      return normalizeWhitespace(value);
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatDateBr = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return "__/__/____";
    }
    const parsed = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return "__/__/____";
    }
    return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
  };

  const formatDateLong = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return { day: "__", month: "______________", year: "____" };
    }
    const parsed = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { day: "__", month: "______________", year: "____" };
    }
    return {
      day: String(parsed.getDate()).padStart(2, "0"),
      month: MONTHS_PT[parsed.getMonth()] || "______________",
      year: String(parsed.getFullYear()),
    };
  };

  const formatDateForFileName = (dateValue = new Date()) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return "data-indefinida";
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const showStatus = (element, message, type = "") => {
    if (!element) {
      return;
    }
    element.textContent = message;
    element.classList.remove("form-status--success", "form-status--error");
    if (type === "success") {
      element.classList.add("form-status--success");
    } else if (type === "error") {
      element.classList.add("form-status--error");
    }
  };

  const scanIcons = () => {
    if (window.Iconify && typeof window.Iconify.scan === "function") {
      window.Iconify.scan();
    }
  };

  const downloadPdf = (bytes, fileName) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const wrapText = (text, font, size, maxWidth) => {
    const words = String(text ?? "").split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return [""];
    }
    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${current} ${words[i]}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }

    lines.push(current);
    return lines;
  };

  const buildPdfWriter = async ({ title, subtitle, logoBytes }) => {
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let logoImage = null;
    if (logoBytes) {
      try {
        const signature = new Uint8Array(logoBytes).slice(0, 4);
        const isPng = signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47;
        logoImage = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
      } catch (error) {
        logoImage = null;
      }
    }

    const pageSize = [595.28, 841.89];
    const margin = 40;
    const contentWidth = pageSize[0] - margin * 2;
    let page = null;
    let cursorY = 0;

    const drawHeader = () => {
      const centerTextX = (text, font, size) => (pageSize[0] - font.widthOfTextAtSize(text, size)) / 2;
      if (logoImage) {
        const logoSize = 56;
        page.drawImage(logoImage, {
          x: (pageSize[0] - logoSize) / 2,
          y: pageSize[1] - 76,
          width: logoSize,
          height: logoSize,
        });
      }

      page.drawText(CARTORIO_NAME, {
        x: centerTextX(CARTORIO_NAME, bold, 12),
        y: pageSize[1] - 88,
        font: bold,
        size: 12,
        color: rgb(0.08, 0.08, 0.08),
      });
      page.drawText(CARTORIO_SUBTITLE, {
        x: centerTextX(CARTORIO_SUBTITLE, regular, 9.2),
        y: pageSize[1] - 102,
        font: regular,
        size: 9.2,
        color: rgb(0.25, 0.25, 0.25),
      });

      page.drawText(title, {
        x: centerTextX(title, bold, 12.5),
        y: pageSize[1] - 122,
        font: bold,
        size: 12.5,
        color: rgb(0.05, 0.05, 0.05),
      });

      if (subtitle) {
        page.drawText(subtitle, {
          x: centerTextX(subtitle, regular, 8.8),
          y: pageSize[1] - 135,
          font: regular,
          size: 8.8,
          color: rgb(0.35, 0.35, 0.35),
        });
      }

      const dividerY = pageSize[1] - 146;
      page.drawLine({
        start: { x: margin, y: dividerY },
        end: { x: pageSize[0] - margin, y: dividerY },
        thickness: 0.8,
        color: rgb(0.7, 0.7, 0.7),
      });
    };

    const newPage = () => {
      page = pdfDoc.addPage(pageSize);
      drawHeader();
      cursorY = pageSize[1] - 166;
    };

    const ensureSpace = (height) => {
      if (!page) {
        newPage();
      }
      if (cursorY - height < margin) {
        newPage();
      }
    };

    const drawParagraph = (text, options = {}) => {
      const font = options.font || regular;
      const size = options.size || 10.2;
      const color = options.color || rgb(0.12, 0.12, 0.12);
      const lineHeight = options.lineHeight || 13.8;
      const gap = options.gap ?? 6;
      const lines = wrapText(text, font, size, contentWidth);

      ensureSpace(lines.length * lineHeight + gap);
      lines.forEach((line) => {
        page.drawText(line, { x: margin, y: cursorY, font, size, color });
        cursorY -= lineHeight;
      });
      cursorY -= gap;
    };

    const drawSection = (label) => {
      ensureSpace(28);
      page.drawRectangle({
        x: margin,
        y: cursorY - 5,
        width: contentWidth,
        height: 18,
        color: rgb(0.95, 0.95, 0.95),
      });
      page.drawText(label, {
        x: margin + 8,
        y: cursorY,
        font: bold,
        size: 9.8,
        color: rgb(0.09, 0.09, 0.09),
      });
      cursorY -= 24;
    };

    const drawSignatureLine = (label) => {
      const topGap = 16;
      const bottomGap = 18;
      ensureSpace(topGap + 44 + bottomGap);
      cursorY -= topGap;
      const lineY = cursorY;
      const startX = margin + 60;
      const endX = pageSize[0] - margin - 60;
      page.drawLine({
        start: { x: startX, y: lineY },
        end: { x: endX, y: lineY },
        thickness: 0.9,
        color: rgb(0.38, 0.38, 0.38),
      });
      page.drawText(label, {
        x: startX + (endX - startX) / 2 - 58,
        y: lineY - 13,
        font: regular,
        size: 9.2,
        color: rgb(0.35, 0.35, 0.35),
      });
      cursorY = lineY - 18 - bottomGap;
    };

    const addVerticalSpace = (height = 12) => {
      const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
      if (!safeHeight) {
        return;
      }
      ensureSpace(safeHeight);
      cursorY -= safeHeight;
    };

    newPage();

    return {
      pdfDoc,
      drawParagraph,
      drawSection,
      drawSignatureLine,
      addVerticalSpace,
      fonts: { regular, bold },
    };
  };

  const drawRequirements = (drawSection, drawParagraph, items) => {
    if (!items || items.length === 0) {
      return;
    }
    drawSection("Documentos e observações");
    items.forEach((item) => {
      drawParagraph(`• ${item}`, { size: 9.2, lineHeight: 12.4, gap: 4 });
    });
  };

  const localAndDateLine = (payload) => {
    const dateParts = formatDateLong(payload.data_documento);
    const city = normalizeLine(payload.cidade_documento || "Rio das Ostras - RJ");
    return `${city}, ${dateParts.day} de ${dateParts.month} de ${dateParts.year}.`;
  };

  const requerenteIntro = (payload) => {
    return (
      `Eu, ${normalizeLine(payload.requerente_nome)}, nacionalidade ${normalizeLine(payload.requerente_nacionalidade)}, ` +
      `estado civil ${normalizeLine(payload.requerente_estado_civil)}, profissão ${normalizeLine(payload.requerente_profissao)}, ` +
      `residente e domiciliado(a) em ${normalizeLine(payload.requerente_domicilio)}, portador(a) do RG nº ` +
      `${normalizeLine(payload.requerente_rg)}, expedido em ${formatDateBr(payload.requerente_rg_data)} ` +
      `pelo ${normalizeLine(payload.requerente_rg_orgao)}.`
    );
  };

  const fetchLogoBytes = async () => {
    const candidateUrls = [
      LOGO_PATH,
      `/${LOGO_PATH.replace(/^\/+/, "")}`,
      new URL(LOGO_PATH, window.location.href).href,
      new URL(`./${LOGO_PATH}`, window.location.href).href,
      new URL(`../${LOGO_PATH}`, window.location.href).href,
    ];
    const uniqueCandidates = [...new Set(candidateUrls)];

    for (let index = 0; index < uniqueCandidates.length; index += 1) {
      try {
        const response = await fetch(uniqueCandidates[index], { cache: "no-store" });
        if (!response.ok) {
          continue;
        }
        const bytes = await response.arrayBuffer();
        if (bytes && bytes.byteLength > 0) {
          return bytes;
        }
      } catch (error) {
        // Try next path candidate.
      }
    }

    return null;
  };

  const field = (name, label, options = {}) => ({
    name,
    label,
    type: options.type || "text",
    required: Boolean(options.required),
    span: options.span || "full",
    placeholder: options.placeholder || "",
    defaultValue: options.defaultValue || "",
    min: options.min,
    max: options.max,
    step: options.step,
    helper: options.helper || "",
    options: options.options || [],
    defaultToday: Boolean(options.defaultToday),
  });

  const baseDocumentSection = () => ({
    title: "Dados do documento",
    fields: [
      field("data_documento", "Data de referência *", { type: "date", required: true, span: "half", defaultToday: true }),
      field("cidade_documento", "Cidade/UF", { type: "text", span: "half", defaultValue: "Rio das Ostras - RJ" }),
    ],
  });

  const baseRequerenteSection = () => ({
    title: "Dados do requerente",
    fields: [
      field("requerente_nome", "Nome completo *", { required: true }),
      field("requerente_nacionalidade", "Nacionalidade *", { required: true, span: "half" }),
      field("requerente_estado_civil", "Estado civil *", { required: true, span: "half" }),
      field("requerente_profissao", "Profissão *", { required: true, span: "half" }),
      field("requerente_domicilio", "Residência e domicílio *", { required: true }),
      field("requerente_rg", "RG/CNH *", { required: true, span: "half" }),
      field("requerente_rg_orgao", "Órgão expedidor *", { required: true, span: "half" }),
      field("requerente_rg_data", "Data de expedição *", { required: true, type: "date", span: "half" }),
    ],
  });

  const drawWitnessBlock = (drawSection, drawParagraph, label, witness) => {
    drawSection(label);
    drawParagraph(`Nome: ${normalizeLine(witness.nome)}`, { gap: 3 });
    drawParagraph(`Naturalidade (cidade): ${normalizeLine(witness.naturalidade)} | Profissão: ${normalizeLine(witness.profissao)}`, { gap: 3 });
    drawParagraph(`Estado civil: ${normalizeLine(witness.estadoCivil)} | Data de nascimento: ${formatDateBr(witness.nascimento)}`, { gap: 3 });
    drawParagraph(
      `RG/CNH: ${normalizeLine(witness.rg)} | Expedido pelo: ${normalizeLine(witness.rgOrgao)} | Em: ${formatDateBr(witness.rgData)} | CPF: ${normalizeLine(witness.cpf)}`,
      { gap: 3 },
    );
    drawParagraph(`Residência: ${normalizeLine(witness.residencia)}`, { gap: 8 });
  };

  const renderAtestadoTestemunhasPdf = async (payload, logoBytes) => {
    const writer = await buildPdfWriter({
      title: "Atestado das Testemunhas",
      subtitle: "Formulário de habilitação para casamento civil",
      logoBytes,
    });
    const { pdfDoc, drawParagraph, drawSection, drawSignatureLine, addVerticalSpace, fonts } = writer;

    drawParagraph(localAndDateLine(payload), { font: fonts.bold, gap: 10 });
    drawParagraph(
      "Nós abaixo-assinados, declaramos conhecer pessoalmente os noivos e atestamos não haver parentesco ou qualquer impedimento que proíba o casamento dos nubentes.",
      { gap: 10 },
    );

    drawSection("Nubentes");
    drawParagraph(`1º cônjuge: ${normalizeLine(payload.conjuge_1)}`, { gap: 3 });
    drawParagraph(`2º cônjuge: ${normalizeLine(payload.conjuge_2)}`, { gap: 10 });

    drawWitnessBlock(drawSection, drawParagraph, "1ª Testemunha", {
      nome: payload.t1_nome,
      naturalidade: payload.t1_naturalidade,
      profissao: payload.t1_profissao,
      estadoCivil: payload.t1_estado_civil,
      nascimento: payload.t1_nascimento,
      rg: payload.t1_rg,
      rgOrgao: payload.t1_rg_orgao,
      rgData: payload.t1_rg_data,
      cpf: formatCpf(payload.t1_cpf),
      residencia: payload.t1_residencia,
    });
    drawSignatureLine("Assinatura da 1ª testemunha");

    addVerticalSpace(18);

    drawWitnessBlock(drawSection, drawParagraph, "2ª Testemunha", {
      nome: payload.t2_nome,
      naturalidade: payload.t2_naturalidade,
      profissao: payload.t2_profissao,
      estadoCivil: payload.t2_estado_civil,
      nascimento: payload.t2_nascimento,
      rg: payload.t2_rg,
      rgOrgao: payload.t2_rg_orgao,
      rgData: payload.t2_rg_data,
      cpf: formatCpf(payload.t2_cpf),
      residencia: payload.t2_residencia,
    });
    drawSignatureLine("Assinatura da 2ª testemunha");

    pdfDoc.setTitle("Atestado das Testemunhas - preenchido");
    pdfDoc.setSubject("Formulário preenchido");
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - Formulários para impressão");
    return pdfDoc.save();
  };

  const renderDeclaracaoResidenciaPdf = async (payload, logoBytes) => {
    const writer = await buildPdfWriter({
      title: "Declaração de Residência",
      subtitle: "Formulário de habilitação para casamento civil",
      logoBytes,
    });
    const { pdfDoc, drawParagraph, drawSection, drawSignatureLine, fonts } = writer;

    drawParagraph(
      `Eu, ${normalizeLine(payload.declarante_nome)}, nacionalidade ${normalizeLine(payload.declarante_nacionalidade)}, ` +
        `profissão ${normalizeLine(payload.declarante_profissao)}, estado civil ${normalizeLine(payload.declarante_estado_civil)}, ` +
        `idade ${normalizeLine(payload.declarante_idade)} anos, portador(a) do documento de identidade nº ` +
        `${normalizeLine(payload.declarante_documento)}, expedido pelo ${normalizeLine(payload.declarante_documento_orgao)} ` +
        `em ${formatDateBr(payload.declarante_documento_data)} e CPF nº ${normalizeLine(formatCpf(payload.declarante_cpf))}.`,
      { gap: 8 },
    );

    drawParagraph(`Residente à ${normalizeLine(payload.declarante_residencia)}.`, { gap: 10 });

    drawParagraph(
      "Declaro, para fazer prova nos autos do processo de habilitação para casamento civil, que os noivos abaixo residem no endereço acima descrito e constante no comprovante da conta de consumo anexo.",
      { gap: 10 },
    );

    drawSection("Noivos");
    drawParagraph(`1º cônjuge: ${normalizeLine(payload.conjuge_1)}`, { gap: 3 });
    drawParagraph(`2º cônjuge: ${normalizeLine(payload.conjuge_2)}`, { gap: 10 });

    drawParagraph(
      "Declaro, ainda, estar ciente de que a falsidade desta declaração pode implicar sanção civil consistente no pagamento de até o dobro das custas judiciais, nos termos do art. 4º, §1º da Lei 1.060/50, sem prejuízo da sanção penal prevista no art. 299 do Código Penal.",
      { size: 9.3, lineHeight: 12.4, gap: 12 },
    );

    drawParagraph(localAndDateLine(payload), { font: fonts.bold, gap: 16 });
    drawSignatureLine("Assinatura do(a) declarante");

    pdfDoc.setTitle("Declaração de Residência - preenchida");
    pdfDoc.setSubject("Formulário preenchido");
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - Formulários para impressão");
    return pdfDoc.save();
  };

  const renderRequerimentoPadraoPdf = async ({ title, subtitle, payload, requestText, requirements, logoBytes }) => {
    const writer = await buildPdfWriter({ title, subtitle, logoBytes });
    const { pdfDoc, drawParagraph, drawSection, drawSignatureLine, fonts } = writer;

    drawParagraph("Ilmo. Sr. Oficial do Cartório do RCPN do 1º Ofício de Justiça de Rio das Ostras/RJ,", {
      font: fonts.bold,
      gap: 10,
    });
    drawParagraph(requerenteIntro(payload), { gap: 10 });
    drawParagraph(requestText(payload), { gap: 10 });
    drawParagraph("Nestes termos, pede deferimento.", { font: fonts.bold, gap: 10 });
    drawParagraph(localAndDateLine(payload), { font: fonts.bold, gap: 16 });
    drawSignatureLine("Assinatura do(a) requerente");

    drawRequirements(drawSection, drawParagraph, requirements);

    pdfDoc.setTitle(`${title} - preenchido`);
    pdfDoc.setSubject("Formulário preenchido");
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - Formulários para impressão");
    return pdfDoc.save();
  };

  const FORM_DEFINITIONS = {
    "atestado-testemunhas-casamento-civil": {
      pageTitle: "Atestado de Testemunhas para Casamento Civil",
      subtitle: "Preencha os dados e baixe o atestado em PDF pronto para impressão e assinatura.",
      highlights: [
        "Preenchimento digital para reduzir rasuras e retrabalho no atendimento.",
        "Confira os dados dos noivos e testemunhas antes de gerar o PDF.",
      ],
      submitLabel: "Baixar PDF preenchido",
      outputName: "atestado-testemunhas-casamento-civil-preenchido",
      sections: [
        baseDocumentSection(),
        {
          title: "Dados dos noivos",
          fields: [
            field("conjuge_1", "Nome do(a) 1º cônjuge *", { required: true }),
            field("conjuge_2", "Nome do(a) 2º cônjuge *", { required: true }),
          ],
        },
        {
          title: "1ª Testemunha",
          fields: [
            field("t1_nome", "Nome completo *", { required: true }),
            field("t1_naturalidade", "Naturalidade (cidade) *", { required: true, span: "half" }),
            field("t1_profissao", "Profissão *", { required: true, span: "half" }),
            field("t1_estado_civil", "Estado civil *", { required: true, span: "half" }),
            field("t1_nascimento", "Data de nascimento *", { required: true, type: "date", span: "half" }),
            field("t1_rg", "RG/CNH *", { required: true, span: "half" }),
            field("t1_rg_orgao", "Órgão expedidor *", { required: true, span: "half" }),
            field("t1_rg_data", "Data de expedição *", { required: true, type: "date", span: "half" }),
            field("t1_cpf", "CPF *", { required: true, span: "half" }),
            field("t1_residencia", "Residência *", { required: true }),
          ],
        },
        {
          title: "2ª Testemunha",
          fields: [
            field("t2_nome", "Nome completo *", { required: true }),
            field("t2_naturalidade", "Naturalidade (cidade) *", { required: true, span: "half" }),
            field("t2_profissao", "Profissão *", { required: true, span: "half" }),
            field("t2_estado_civil", "Estado civil *", { required: true, span: "half" }),
            field("t2_nascimento", "Data de nascimento *", { required: true, type: "date", span: "half" }),
            field("t2_rg", "RG/CNH *", { required: true, span: "half" }),
            field("t2_rg_orgao", "Órgão expedidor *", { required: true, span: "half" }),
            field("t2_rg_data", "Data de expedição *", { required: true, type: "date", span: "half" }),
            field("t2_cpf", "CPF *", { required: true, span: "half" }),
            field("t2_residencia", "Residência *", { required: true }),
          ],
        },
      ],
      renderPdf: renderAtestadoTestemunhasPdf,
    },

    "declaracao-residencia-casamento-civil": {
      pageTitle: "Declaração de Residência para Casamento Civil",
      subtitle: "Informe os dados do declarante e dos noivos para gerar a declaração em PDF.",
      highlights: [
        "Versão digital para preenchimento completo antes do comparecimento ao cartório.",
        "O PDF gerado deve ser revisado e assinado pelo declarante.",
      ],
      submitLabel: "Baixar PDF preenchido",
      outputName: "declaracao-residencia-casamento-civil-preenchida",
      sections: [
        baseDocumentSection(),
        {
          title: "Dados do declarante",
          fields: [
            field("declarante_nome", "Nome completo *", { required: true }),
            field("declarante_nacionalidade", "Nacionalidade *", { required: true, span: "half" }),
            field("declarante_profissao", "Profissão *", { required: true, span: "half" }),
            field("declarante_estado_civil", "Estado civil *", { required: true, span: "half" }),
            field("declarante_idade", "Idade *", { required: true, type: "number", span: "half", min: 16, max: 120 }),
            field("declarante_documento", "Documento de identidade nº *", { required: true, span: "half" }),
            field("declarante_documento_orgao", "Órgão expedidor *", { required: true, span: "half" }),
            field("declarante_documento_data", "Data de expedição *", { required: true, type: "date", span: "half" }),
            field("declarante_cpf", "CPF *", { required: true, span: "half" }),
            field("declarante_residencia", "Residência completa *", { required: true }),
          ],
        },
        {
          title: "Dados dos noivos",
          fields: [
            field("conjuge_1", "Nome do(a) 1º cônjuge *", { required: true }),
            field("conjuge_2", "Nome do(a) 2º cônjuge *", { required: true }),
          ],
        },
      ],
      renderPdf: renderDeclaracaoResidenciaPdf,
    },

    "requerimento-anotacao-casamento-obito": {
      pageTitle: "Requerimento de Anotação de Casamento e Óbito",
      subtitle: "Preencha os dados do requerente e do registro para gerar o requerimento.",
      highlights: [
        "Selecione o tipo de anotação (casamento ou óbito).",
        "Leve os documentos listados ao final do formulário para protocolo.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-anotacao-casamento-obito-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da anotação",
          fields: [
            field("tipo_anotacao", "Tipo de registro *", {
              required: true,
              type: "select",
              span: "half",
              options: [
                { value: "Óbito", label: "Óbito" },
                { value: "Casamento", label: "Casamento" },
              ],
            }),
            field("registro_nome", "Nome do registro a ser anotado *", { required: true }),
          ],
        },
      ],
      requirements: [
        "Certidão com data não inferior a seis meses do ocorrido (cópia autenticada).",
        "Requerimento com firma reconhecida.",
        "Valor de referência: R$ 176,50.",
      ],
      requestText: (payload) => {
        return (
          `Venho através deste solicitar que proceda a anotação do registro de ${normalizeLine(payload.tipo_anotacao)} de ` +
          `${normalizeLine(payload.registro_nome)}, em seu registro primitivo, em conformidade com o Art. 805 do Código ` +
          "de Normas da Corregedoria Geral de Justiça do Estado do Rio de Janeiro, junto a este Cartório."
        );
      },
    },

    "requerimento-averbacao-regime-bens-transcricao-casamento": {
      pageTitle: "Requerimento de Averbação de Regime de Bens em Transcrição de Casamento",
      subtitle: "Gere o requerimento com os dados da transcrição e do termo cartorário.",
      highlights: [
        "Informe corretamente Livro, Folhas e Termo da transcrição.",
        "Confira a lista de documentos obrigatórios antes do protocolo.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-averbacao-regime-bens-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da transcrição",
          fields: [
            field("transcricao_casal", "Nome do casal na transcrição *", { required: true }),
            field("transcricao_livro", "Livro nº *", { required: true, span: "half" }),
            field("transcricao_folhas", "Folhas nº *", { required: true, span: "half" }),
            field("transcricao_termo", "Termo nº *", { required: true, span: "half" }),
          ],
        },
      ],
      requirements: [
        "Xerox da identidade (RG, CNH ou RNE, Passaporte) e CPF dos nubentes (cópia e original).",
        "Certidão atualizada de registro civil de cônjuge brasileiro anterior ao casamento, atualizada com óbito, quando aplicável.",
        "Comprovante de residência no município (cópia e original).",
        "Requerimento com firma reconhecida por um dos cônjuges ou procurador.",
        "Valor de referência: R$ 393,56.",
      ],
      requestText: (payload) => {
        return (
          "Venho através deste requerer a averbação do regime de bens, ou a mesma da certidão de casamento realizado no exterior, " +
          "obedecendo à lei do país em que os nubentes declararam domicílio, conforme disposto na Resolução CNJ nº 155/2012 " +
          "e no art. 7º, § 4º, da LINDB, na transcrição de casamento de " +
          `${normalizeLine(payload.transcricao_casal)}, registrada no Livro nº ${normalizeLine(payload.transcricao_livro)}, ` +
          `às Folhas nº ${normalizeLine(payload.transcricao_folhas)}, sob o Termo nº ${normalizeLine(payload.transcricao_termo)}, ` +
          "neste Cartório."
        );
      },
    },

    "requerimento-averbacao-divorcio-transcricao-casamento": {
      pageTitle: "Requerimento de Averbação de Divórcio em Transcrição de Casamento",
      subtitle: "Preencha os dados da transcrição para solicitar averbação de divórcio.",
      highlights: [
        "Use os dados da certidão e do divórcio exatamente como constam nos documentos.",
        "O requerimento deve ser apresentado com firma reconhecida.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-averbacao-divorcio-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da averbação",
          fields: [
            field("conjuge_1", "Nome do(a) 1º cônjuge *", { required: true }),
            field("conjuge_2", "Nome do(a) 2º cônjuge *", { required: true }),
            field("certidao_emitente", "Órgão/cartório emissor da certidão *", { required: true }),
          ],
        },
      ],
      requirements: [
        "Averbação direta em cartório no Brasil apenas para divórcio simples (sem partilha de bens) e sem envolver guarda de filhos.",
        "Sentença ou Escritura Pública de Divórcio brasileira.",
        "Ou Escritura Pública de Divórcio emitida por autoridade consular brasileira.",
        "Ou sentença estrangeira com trânsito em julgado, apostilada, traduzida e registrada em Cartório de RTD.",
        "Requerimento com firma reconhecida por um dos cônjuges ou procurador.",
        "Valor de referência (2ª via com averbação): R$ 393,56.",
      ],
      requestText: (payload) => {
        return (
          "Venho através deste solicitar a averbação de divórcio da transcrição de casamento de " +
          `${normalizeLine(payload.conjuge_1)} e ${normalizeLine(payload.conjuge_2)}, expedida pelo ` +
          `${normalizeLine(payload.certidao_emitente)}, em conformidade com o Art. 32 da Lei nº 6.015/73, junto a este Cartório.`
        );
      },
    },

    "requerimento-transcricao-casamento": {
      pageTitle: "Requerimento de Transcrição de Casamento",
      subtitle: "Preencha os dados da certidão estrangeira de casamento para gerar o requerimento.",
      highlights: [
        "Transcrição destinada ao registro de casamento celebrado no exterior.",
        "Revise a grafia dos nomes antes de gerar o PDF.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-transcricao-casamento-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da transcrição",
          fields: [
            field("conjuge_1", "Nome do(a) 1º cônjuge *", { required: true }),
            field("conjuge_2", "Nome do(a) 2º cônjuge *", { required: true }),
            field("certidao_emitente", "Órgão/cartório emissor da certidão *", { required: true }),
          ],
        },
      ],
      requirements: [
        "Xerox da identidade (RG, CNH ou RNE, Passaporte) e CPF dos cônjuges (cópia e original).",
        "Certidão de assento de casamento estrangeiro legalizada/apostilada e traduzida por tradutor público juramentado, quando aplicável.",
        "Certidão de nascimento do cônjuge brasileiro anterior ao casamento e certidão de óbito do ex-cônjuge falecido, quando houver.",
        "Comprovante de residência no município (cópia e original).",
        "Requerimento com firma reconhecida por um dos cônjuges ou procurador.",
        "Valor de referência da transcrição: R$ 983,68.",
      ],
      requestText: (payload) => {
        return (
          "Venho através deste solicitar a transcrição de casamento de " +
          `${normalizeLine(payload.conjuge_1)} e ${normalizeLine(payload.conjuge_2)}, expedida pelo ` +
          `${normalizeLine(payload.certidao_emitente)}, em conformidade com o Art. 32 da Lei nº 6.015/73, junto a este Cartório.`
        );
      },
    },

    "requerimento-transcricao-nascimento": {
      pageTitle: "Requerimento de Transcrição de Nascimento",
      subtitle: "Informe os dados do registrado para gerar o requerimento de transcrição.",
      highlights: [
        "Utilize os mesmos dados constantes na certidão de nascimento estrangeira.",
        "O requerimento pode ser apresentado pelo interessado ou procurador.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-transcricao-nascimento-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da transcrição",
          fields: [
            field("registrado_nome", "Nome completo do registrado *", { required: true }),
            field("certidao_emitente", "Órgão/cartório emissor da certidão *", { required: true }),
          ],
        },
      ],
      requirements: [
        "Xerox da identidade (RG, CNH ou RNE, Passaporte) e CPF dos genitores (cópia autenticada).",
        "Certidão de assento estrangeiro de nascimento legalizada/apostilada e traduzida por tradutor público juramentado, quando necessário.",
        "Comprovante de residência no município (cópia autenticada).",
        "Requerimento com firma reconhecida.",
        "Valor de referência: R$ 983,68.",
      ],
      requestText: (payload) => {
        return (
          "Venho através deste solicitar a transcrição de nascimento de " +
          `${normalizeLine(payload.registrado_nome)}, expedida pelo ${normalizeLine(payload.certidao_emitente)}, ` +
          "em conformidade com o Art. 32 da Lei nº 6.015/73, junto a este Cartório."
        );
      },
    },

    "requerimento-transcricao-obito": {
      pageTitle: "Requerimento de Transcrição de Óbito",
      subtitle: "Preencha os dados do falecido e da certidão para gerar o requerimento.",
      highlights: [
        "Transcrição de óbito de cidadão ocorrido no exterior.",
        "Verifique os documentos exigidos para evitar pendências no protocolo.",
      ],
      submitLabel: "Baixar requerimento preenchido",
      outputName: "requerimento-transcricao-obito-preenchido",
      sections: [
        baseDocumentSection(),
        baseRequerenteSection(),
        {
          title: "Dados da transcrição",
          fields: [
            field("falecido_nome", "Nome completo do falecido *", { required: true }),
            field("certidao_emitente", "Órgão/cartório emissor da certidão *", { required: true }),
          ],
        },
      ],
      requirements: [
        "RG/CNH, Passaporte e CPF do(a) falecido(a) (cópia e original). Na ausência, pode ser aceito formato digital (CNH/RG).",
        "Certidão brasileira de nascimento ou, se for o caso, de casamento do(a) falecido(a).",
        "Certidão de assento de óbito estrangeira legalizada/apostilada e traduzida por tradutor público juramentado, quando aplicável.",
        "Comprovante de residência atualizado no município (cópia).",
        "Requerimento com firma reconhecida por familiar ou procurador.",
        "Valor de referência da transcrição: R$ 983,68.",
      ],
      requestText: (payload) => {
        return (
          "Venho através deste solicitar a transcrição de óbito de " +
          `${normalizeLine(payload.falecido_nome)}, expedida pelo ${normalizeLine(payload.certidao_emitente)}, ` +
          "em conformidade com o Art. 32 da Lei nº 6.015/73, junto a este Cartório."
        );
      },
    },
  };

  const createFieldControl = (definition) => {
    if (definition.type === "select") {
      const select = document.createElement("select");
      select.className = "field-input";
      select.name = definition.name;
      select.id = definition.name;
      if (definition.required) {
        select.required = true;
      }

      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "Selecione";
      if (definition.required) {
        placeholderOption.disabled = true;
      }
      placeholderOption.selected = true;
      select.append(placeholderOption);

      definition.options.forEach((optionItem) => {
        const option = document.createElement("option");
        option.value = optionItem.value;
        option.textContent = optionItem.label;
        select.append(option);
      });

      return select;
    }

    const input = document.createElement("input");
    input.className = "field-input";
    input.name = definition.name;
    input.id = definition.name;
    input.type = definition.type;

    if (definition.required) {
      input.required = true;
    }
    if (definition.placeholder) {
      input.placeholder = definition.placeholder;
    }
    if (definition.defaultValue) {
      input.value = definition.defaultValue;
    }
    if (definition.defaultToday && !input.value) {
      input.value = todayIso();
    }
    if (definition.min !== undefined) {
      input.min = String(definition.min);
    }
    if (definition.max !== undefined) {
      input.max = String(definition.max);
    }
    if (definition.step !== undefined) {
      input.step = String(definition.step);
    }

    return input;
  };

  const createFieldGroup = (definition) => {
    const group = document.createElement("div");
    group.className = "field-group";

    const label = document.createElement("label");
    label.className = "field-label";
    label.setAttribute("for", definition.name);
    label.textContent = definition.label;

    const control = createFieldControl(definition);

    group.append(label, control);

    if (definition.helper) {
      const helper = document.createElement("p");
      helper.className = "form-helper";
      helper.textContent = definition.helper;
      group.append(helper);
    }

    return group;
  };

  const renderSectionFields = (sectionElement, fields) => {
    let pendingHalf = null;

    const flushHalf = () => {
      if (!pendingHalf) {
        return;
      }
      sectionElement.append(createFieldGroup(pendingHalf));
      pendingHalf = null;
    };

    fields.forEach((fieldDef) => {
      if (fieldDef.span === "half") {
        if (!pendingHalf) {
          pendingHalf = fieldDef;
          return;
        }

        const grid = document.createElement("div");
        grid.className = "field-grid";
        grid.append(createFieldGroup(pendingHalf), createFieldGroup(fieldDef));
        sectionElement.append(grid);
        pendingHalf = null;
        return;
      }

      flushHalf();
      sectionElement.append(createFieldGroup(fieldDef));
    });

    flushHalf();
  };

  const renderForm = (definition, formElement) => {
    formElement.innerHTML = "";

    definition.sections.forEach((sectionDef) => {
      const section = document.createElement("section");
      section.className = "form-section";

      const title = document.createElement("h2");
      title.className = "form-section-title";
      title.textContent = sectionDef.title;

      section.append(title);
      renderSectionFields(section, sectionDef.fields);
      formElement.append(section);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "btn btn-primary btn-full";
    submitButton.id = BUTTON_ID;
    submitButton.innerHTML = `${definition.submitLabel}<span class="iconify" data-icon="mdi:file-download-outline" aria-hidden="true"></span>`;

    const status = document.createElement("p");
    status.id = STATUS_ID;
    status.className = "form-status";
    status.setAttribute("aria-live", "polite");

    formElement.append(submitButton, status);
    scanIcons();
  };

  const renderHighlights = (definition, listElement) => {
    listElement.innerHTML = "";
    definition.highlights.forEach((item) => {
      const li = document.createElement("li");
      li.className = "contact-item";
      li.innerHTML =
        '<span class="iconify contact-icon" data-icon="mdi:file-document-edit-outline" aria-hidden="true"></span>' +
        `<div>${item}</div>`;
      listElement.append(li);
    });
  };

  const collectPayload = (form) => {
    const fd = new FormData(form);
    const payload = {};
    for (const [key, value] of fd.entries()) {
      payload[key] = normalizeWhitespace(value);
    }
    return payload;
  };

  const init = () => {
    const formKey = document.body.dataset.paperFormKey;
    const formKeysRaw = normalizeWhitespace(document.body.dataset.paperFormKeys || "");
    const categoryTitle = normalizeWhitespace(document.body.dataset.paperFormCategoryTitle || "");
    const defaultFormKey = normalizeWhitespace(document.body.dataset.paperFormDefault || "");

    const form = document.getElementById(FORM_ID);
    const titleEl = document.getElementById(TITLE_ID);
    const subtitleEl = document.getElementById(SUBTITLE_ID);
    const highlightsEl = document.getElementById(HIGHLIGHTS_ID);
    const selectorEl = document.getElementById("paperFormSelector");

    if (!form || !titleEl || !subtitleEl || !highlightsEl) {
      return;
    }

    const keysFromCategory = formKeysRaw
      ? formKeysRaw
          .split(",")
          .map((item) => normalizeWhitespace(item))
          .filter(Boolean)
      : [];

    const availableDefinitions =
      keysFromCategory.length > 0
        ? keysFromCategory.map((key) => ({ key, definition: FORM_DEFINITIONS[key] })).filter((item) => Boolean(item.definition))
        : formKey && FORM_DEFINITIONS[formKey]
          ? [{ key: formKey, definition: FORM_DEFINITIONS[formKey] }]
          : [];

    if (availableDefinitions.length === 0) {
      return;
    }

    let activeDefinition = null;

    const applyDefinition = (definition) => {
      activeDefinition = definition;
      if (!categoryTitle) {
        titleEl.textContent = definition.pageTitle;
      }
      subtitleEl.textContent = definition.subtitle;
      renderHighlights(definition, highlightsEl);
      renderForm(definition, form);
      document.title = `${definition.pageTitle} – 1º Ofício Rio das Ostras`;
    };

    if (categoryTitle) {
      titleEl.textContent = categoryTitle;
    }

    if (selectorEl && availableDefinitions.length > 1) {
      selectorEl.innerHTML = "";
      availableDefinitions.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.key;
        option.textContent = item.definition.pageTitle;
        selectorEl.append(option);
      });

      const firstKey = availableDefinitions[0].key;
      const selectedKey =
        defaultFormKey && availableDefinitions.some((item) => item.key === defaultFormKey) ? defaultFormKey : firstKey;
      selectorEl.value = selectedKey;

      const initial = availableDefinitions.find((item) => item.key === selectedKey) || availableDefinitions[0];
      applyDefinition(initial.definition);

      selectorEl.addEventListener("change", () => {
        const selected = availableDefinitions.find((item) => item.key === selectorEl.value);
        if (selected) {
          applyDefinition(selected.definition);
        }
      });
    } else {
      applyDefinition(availableDefinitions[0].definition);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const definition = activeDefinition;
      if (!definition) {
        return;
      }

      const statusEl = document.getElementById(STATUS_ID);
      const submitButton = document.getElementById(BUTTON_ID);
      if (!statusEl || !submitButton) {
        return;
      }

      showStatus(statusEl, "");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!window.PDFLib) {
        showStatus(statusEl, "Não foi possível carregar a biblioteca de PDF. Atualize a página e tente novamente.", "error");
        return;
      }

      submitButton.disabled = true;
      const previousLabel = submitButton.innerHTML;
      submitButton.innerHTML = "Gerando PDF...";

      try {
        const payload = collectPayload(form);
        const logoBytes = await fetchLogoBytes();

        let pdfBytes;
        if (definition.renderPdf) {
          pdfBytes = await definition.renderPdf(payload, logoBytes);
        } else {
          pdfBytes = await renderRequerimentoPadraoPdf({
            title: definition.pageTitle,
            subtitle: "Formulário para impressão",
            payload,
            requestText: definition.requestText,
            requirements: definition.requirements || [],
            logoBytes,
          });
        }

        const fileName = `${definition.outputName}-${formatDateForFileName()}.pdf`;
        downloadPdf(pdfBytes, fileName);
        showStatus(statusEl, "PDF preenchido gerado com sucesso. O download foi iniciado.", "success");
      } catch (error) {
        showStatus(statusEl, "Não foi possível gerar o PDF preenchido. Revise os campos e tente novamente.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = previousLabel;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
