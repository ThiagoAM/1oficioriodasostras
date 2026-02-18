(() => {
  const FORM_ID = "casamentoPaperForm";
  const STATUS_ID = "paperFormStatus";
  const BUTTON_ID = "gerarZipBtn";
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

  const normalizeWhitespace = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

  const normalizeLine = (value) => {
    const normalized = normalizeWhitespace(value);
    return normalized || "________________________________";
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

  const downloadZip = (bytes, fileName) => {
    const blob = new Blob([bytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const collectPayload = (form) => {
    const fd = new FormData(form);
    const get = (key) => normalizeWhitespace(fd.get(key));
    return {
      dataDocumento: get("data_documento"),
      cidadeDocumento: get("cidade_documento") || "Rio das Ostras - RJ",
      declaranteNome: get("declarante_nome"),
      declaranteNacionalidade: get("declarante_nacionalidade"),
      declaranteProfissao: get("declarante_profissao"),
      declaranteEstadoCivil: get("declarante_estado_civil"),
      declaranteIdade: get("declarante_idade"),
      declaranteRg: get("declarante_rg"),
      declaranteRgOrgao: get("declarante_rg_orgao"),
      declaranteRgData: get("declarante_rg_data"),
      declaranteCpf: formatCpf(get("declarante_cpf")),
      declaranteEndereco1: get("declarante_endereco_1"),
      declaranteEndereco2: get("declarante_endereco_2"),
      declaranteEndereco3: get("declarante_endereco_3"),
      conjuge1: get("conjuge_1"),
      conjuge2: get("conjuge_2"),
      t1Nome: get("t1_nome"),
      t1Nacionalidade: get("t1_nacionalidade"),
      t1Profissao: get("t1_profissao"),
      t1EstadoCivil: get("t1_estado_civil"),
      t1Idade: get("t1_idade"),
      t1Rg: get("t1_rg"),
      t1RgOrgao: get("t1_rg_orgao"),
      t1RgData: get("t1_rg_data"),
      t1Cpf: formatCpf(get("t1_cpf")),
      t1Endereco1: get("t1_endereco_1"),
      t1Endereco2: get("t1_endereco_2"),
      t2Nome: get("t2_nome"),
      t2Nacionalidade: get("t2_nacionalidade"),
      t2Profissao: get("t2_profissao"),
      t2EstadoCivil: get("t2_estado_civil"),
      t2Idade: get("t2_idade"),
      t2Rg: get("t2_rg"),
      t2RgOrgao: get("t2_rg_orgao"),
      t2RgData: get("t2_rg_data"),
      t2Cpf: formatCpf(get("t2_cpf")),
      t2Endereco1: get("t2_endereco_1"),
      t2Endereco2: get("t2_endereco_2"),
    };
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
        x: centerTextX(title, bold, 13),
        y: pageSize[1] - 122,
        font: bold,
        size: 13,
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
        x: startX + (endX - startX) / 2 - 45,
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
      colors: { dark: rgb(0.06, 0.16, 0.26) },
    };
  };

  const createDeclaracaoResidenciaPdf = async (payload, logoBytes) => {
    const writer = await buildPdfWriter({
      title: "Declaração de Residência",
      subtitle: "Formulário de habilitação para casamento civil",
      logoBytes,
    });
    const { pdfDoc, drawParagraph, drawSection, drawSignatureLine, fonts } = writer;
    const dateParts = formatDateLong(payload.dataDocumento);
    const rgDate = formatDateBr(payload.declaranteRgData);
    const addressLines = [payload.declaranteEndereco1, payload.declaranteEndereco2, payload.declaranteEndereco3]
      .map(normalizeWhitespace)
      .filter(Boolean);

    drawParagraph(
      `Eu, ${normalizeLine(payload.declaranteNome)}, nacionalidade ${normalizeLine(payload.declaranteNacionalidade)}, ` +
        `profissão ${normalizeLine(payload.declaranteProfissao)}, estado civil ${normalizeLine(payload.declaranteEstadoCivil)}, ` +
        `${normalizeLine(payload.declaranteIdade)} anos, portador(a) do RG nº ${normalizeLine(payload.declaranteRg)}, ` +
        `expedido por ${normalizeLine(payload.declaranteRgOrgao)} em ${rgDate}, CPF nº ${normalizeLine(payload.declaranteCpf)}.`,
    );

    drawSection("Endereço declarado");
    if (addressLines.length === 0) {
      drawParagraph("Residência: ________________________________________________");
    } else {
      addressLines.forEach((line, index) => {
        drawParagraph(`${index === 0 ? "Residência" : "Complemento"}: ${line}`, { gap: 3 });
      });
    }

    drawSection("Noivos");
    drawParagraph(`1º cônjuge: ${normalizeLine(payload.conjuge1)}`, { gap: 3 });
    drawParagraph(`2º cônjuge: ${normalizeLine(payload.conjuge2)}`, { gap: 8 });

    drawParagraph(
      "Declaro, para fazer prova nos autos do processo de habilitação para casamento civil, que os noivos acima " +
        "residem no endereço informado nesta declaração, constante no comprovante da conta de consumo anexo.",
      { gap: 8 },
    );

    drawParagraph(
      "Declaro, ainda, estar ciente de que a falsidade desta declaração pode implicar sanções civis e penais, " +
        "inclusive as previstas no art. 299 do Código Penal.",
      { size: 9.4, lineHeight: 12.8, gap: 10 },
    );

    drawParagraph(
      `${normalizeLine(payload.cidadeDocumento)}, ${dateParts.day} de ${dateParts.month} de ${dateParts.year}.`,
      { font: fonts.bold, gap: 16 },
    );
    drawSignatureLine("Assinatura do(a) declarante");

    pdfDoc.setTitle("Declaração de Residência - Casamento");
    pdfDoc.setSubject("Formulário preenchido - Cartório 1º Ofício de Rio das Ostras");
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - Formulários para impressão");
    return pdfDoc.save();
  };

  const drawWitnessBlock = (drawSection, drawParagraph, witnessLabel, witnessData) => {
    drawSection(witnessLabel);
    drawParagraph(`Nome: ${normalizeLine(witnessData.nome)}`, { gap: 3 });
    drawParagraph(
      `Nacionalidade: ${normalizeLine(witnessData.nacionalidade)} | Profissão: ${normalizeLine(witnessData.profissao)}`,
      { gap: 3 },
    );
    drawParagraph(
      `Estado civil: ${normalizeLine(witnessData.estadoCivil)} | Idade: ${normalizeLine(witnessData.idade)} anos`,
      { gap: 3 },
    );
    drawParagraph(
      `RG: ${normalizeLine(witnessData.rg)} (${normalizeLine(witnessData.rgOrgao)} - ${formatDateBr(witnessData.rgData)})`,
      { gap: 3 },
    );
    drawParagraph(`CPF: ${normalizeLine(witnessData.cpf)}`, { gap: 3 });
    drawParagraph(
      `Residência: ${normalizeLine([witnessData.endereco1, witnessData.endereco2].filter(Boolean).join(", "))}`,
      { gap: 10 },
    );
  };

  const createAtestadoTestemunhasPdf = async (payload, logoBytes) => {
    const writer = await buildPdfWriter({
      title: "Atestado das Testemunhas",
      subtitle: "Formulário de habilitação para casamento civil",
      logoBytes,
    });
    const { pdfDoc, drawParagraph, drawSection, drawSignatureLine, addVerticalSpace, fonts } = writer;
    const dateParts = formatDateLong(payload.dataDocumento);

    drawParagraph(
      `${normalizeLine(payload.cidadeDocumento)}, ${dateParts.day} de ${dateParts.month} de ${dateParts.year}.`,
      { font: fonts.bold, gap: 10 },
    );

    drawParagraph(
      "Nós, abaixo assinados, declaramos conhecer pessoalmente os noivos e atestamos não haver parentesco ou " +
        "qualquer impedimento que proíba o casamento dos nubentes identificados abaixo.",
      { gap: 10 },
    );

    drawSection("Nubentes");
    drawParagraph(`1º cônjuge: ${normalizeLine(payload.conjuge1)}`, { gap: 3 });
    drawParagraph(`2º cônjuge: ${normalizeLine(payload.conjuge2)}`, { gap: 10 });

    drawWitnessBlock(drawSection, drawParagraph, "1ª Testemunha", {
      nome: payload.t1Nome,
      nacionalidade: payload.t1Nacionalidade,
      profissao: payload.t1Profissao,
      estadoCivil: payload.t1EstadoCivil,
      idade: payload.t1Idade,
      rg: payload.t1Rg,
      rgOrgao: payload.t1RgOrgao,
      rgData: payload.t1RgData,
      cpf: payload.t1Cpf,
      endereco1: payload.t1Endereco1,
      endereco2: payload.t1Endereco2,
    });
    drawSignatureLine("Assinatura da 1ª testemunha");
    addVerticalSpace(22);

    drawWitnessBlock(drawSection, drawParagraph, "2ª Testemunha", {
      nome: payload.t2Nome,
      nacionalidade: payload.t2Nacionalidade,
      profissao: payload.t2Profissao,
      estadoCivil: payload.t2EstadoCivil,
      idade: payload.t2Idade,
      rg: payload.t2Rg,
      rgOrgao: payload.t2RgOrgao,
      rgData: payload.t2RgData,
      cpf: payload.t2Cpf,
      endereco1: payload.t2Endereco1,
      endereco2: payload.t2Endereco2,
    });
    drawSignatureLine("Assinatura da 2ª testemunha");

    pdfDoc.setTitle("Atestado das Testemunhas - Casamento");
    pdfDoc.setSubject("Formulário preenchido - Cartório 1º Ofício de Rio das Ostras");
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - Formulários para impressão");
    return pdfDoc.save();
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

  const init = () => {
    const form = document.getElementById(FORM_ID);
    const statusEl = document.getElementById(STATUS_ID);
    const submitButton = document.getElementById(BUTTON_ID);

    if (!form || !statusEl || !submitButton) {
      return;
    }

    const dateInput = form.querySelector('input[name="data_documento"]');
    if (dateInput && !dateInput.value) {
      const now = new Date();
      dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      showStatus(statusEl, "");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!window.PDFLib || !window.JSZip) {
        showStatus(statusEl, "Não foi possível carregar as bibliotecas de PDF/ZIP. Atualize a página e tente novamente.", "error");
        return;
      }

      submitButton.disabled = true;
      const previousLabel = submitButton.innerHTML;
      submitButton.innerHTML = "Gerando ZIP...";

      try {
        const payload = collectPayload(form);
        const logoBytes = await fetchLogoBytes();
        const declaracaoPdfBytes = await createDeclaracaoResidenciaPdf(payload, logoBytes);
        const atestadoPdfBytes = await createAtestadoTestemunhasPdf(payload, logoBytes);

        const zip = new window.JSZip();
        zip.file("Declaracao-de-Residencia-preenchida.pdf", declaracaoPdfBytes, { binary: true });
        zip.file("Atestado-das-Testemunhas-preenchido.pdf", atestadoPdfBytes, { binary: true });

        const zipBytes = await zip.generateAsync({
          type: "uint8array",
          compression: "DEFLATE",
          compressionOptions: { level: 7 },
        });

        const zipFileName = `formularios-casamento-preenchidos-${formatDateForFileName()}.zip`;
        downloadZip(zipBytes, zipFileName);
        showStatus(statusEl, "ZIP gerado com sucesso. O download foi iniciado.", "success");
      } catch (error) {
        showStatus(statusEl, "Não foi possível gerar os formulários preenchidos. Tente novamente.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = previousLabel;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
