(() => {
  const FORM_SELECTOR = "form[data-pdf-service-form]";
  const MODAL_ID = "serviceFlowModal";
  const SKIPPED_FIELD_NAMES = new Set(["access_key", "subject", "from_name", "redirect", "botcheck"]);
  const CARTORIO_NAME = "Cartório do 1º Ofício de Justiça de Rio das Ostras";
  const FLOW_DONE_MESSAGE =
    "Concluído! Solicitação finalizada. Nossa equipe analisa e responde em horário comercial (segunda a sexta, das 9h às 17h).";

  const flowState = {
    activeForm: null,
    generatedFileName: "",
    generatedAt: null,
  };

  const stripAccents = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const slugify = (value) =>
    stripAccents(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** unitIndex);
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const cleanLabel = (rawValue) =>
    String(rawValue ?? "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const toDisplayLabel = (fieldName) =>
    stripAccents(fieldName)
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getElementLabel = (form, element) => {
    if (element.dataset && element.dataset.pdfLabel) {
      return cleanLabel(element.dataset.pdfLabel);
    }

    if (element.id) {
      const safeId = element.id.replace(/"/g, '\\"');
      const labelByFor = form.querySelector(`label[for="${safeId}"]`);
      if (labelByFor) {
        return cleanLabel(labelByFor.textContent);
      }
    }

    const closestLabel = element.closest("label");
    if (closestLabel) {
      return cleanLabel(closestLabel.textContent);
    }

    if (element.name) {
      return toDisplayLabel(element.name);
    }

    return "Campo";
  };

  const getElementValue = (element) => {
    if (!(element instanceof HTMLElement)) {
      return "";
    }

    if (element instanceof HTMLSelectElement) {
      const selectedOption = element.selectedOptions && element.selectedOptions[0];
      return selectedOption ? selectedOption.textContent.trim() : "";
    }

    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase();
      if (type === "checkbox") {
        if (!element.checked) {
          return "";
        }
        const normalized = String(element.value || "").trim();
        return normalized && normalized.toLowerCase() !== "on" ? normalized : "Sim";
      }
      if (type === "radio") {
        return element.checked ? String(element.value || "").trim() : "";
      }
      return String(element.value || "").trim();
    }

    if (element instanceof HTMLTextAreaElement) {
      return String(element.value || "").trim();
    }

    return "";
  };

  const collectFieldEntries = (form) => {
    const entries = [];

    Array.from(form.elements).forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      if (
        !(element instanceof HTMLInputElement) &&
        !(element instanceof HTMLSelectElement) &&
        !(element instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      const fieldName = String(element.name || "").trim();
      if (!fieldName || SKIPPED_FIELD_NAMES.has(fieldName) || element.disabled) {
        return;
      }

      if (element instanceof HTMLInputElement) {
        const type = element.type.toLowerCase();
        if (["hidden", "submit", "button", "reset", "file"].includes(type)) {
          return;
        }
      }

      const value = getElementValue(element);
      if (!value) {
        return;
      }

      entries.push({
        label: getElementLabel(form, element),
        value,
      });
    });

    return entries;
  };

  const collectAttachments = (form) => {
    const files = [];
    const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    fileInputs.forEach((input) => {
      if (!(input instanceof HTMLInputElement) || !input.files) {
        return;
      }
      Array.from(input.files).forEach((file) => files.push(file));
    });
    return files;
  };

  const sanitizeFileName = (name) => {
    const cleaned = String(name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
    return cleaned || "anexo";
  };

  const buildPdfFileName = (serviceName) => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const base = slugify(serviceName) || "solicitacao";
    return `${base}-${year}${month}${day}-${hours}${minutes}.pdf`;
  };

  const createPdf = async ({ form, serviceName, attachments }) => {
    if (!window.PDFLib) {
      throw new Error("A biblioteca de PDF nao foi carregada.");
    }

    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const createdAt = new Date();
    const targetEmail = String(form?.dataset?.targetEmail || "").trim();
    const targetWhatsappRaw = String(form?.dataset?.targetWhatsapp || "").replace(/[^\d]/g, "");
    const formatWhatsappForDisplay = (digits) => {
      if (!digits) {
        return "";
      }
      const normalized = digits.startsWith("55") ? digits.slice(2) : digits;
      if (normalized.length === 11) {
        return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
      }
      if (normalized.length === 10) {
        return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
      }
      return digits;
    };
    const targetWhatsapp = formatWhatsappForDisplay(targetWhatsappRaw);

    pdfDoc.setTitle(`Serviço online solicitado: ${serviceName}`);
    pdfDoc.setSubject(`Solicitação de serviço online - ${CARTORIO_NAME}`);
    pdfDoc.setProducer(CARTORIO_NAME);
    pdfDoc.setCreator("Site oficial - formulario online");
    pdfDoc.setCreationDate(createdAt);
    pdfDoc.setModificationDate(createdAt);

    const pageSize = [595.28, 841.89];
    const margin = 42;
    const lineHeight = 14;
    const paragraphGap = 8;
    let page = pdfDoc.addPage(pageSize);
    let cursorY = page.getHeight() - margin;
    const maxTextWidth = page.getWidth() - margin * 2;

    const ensureSpace = (requiredHeight = lineHeight) => {
      if (cursorY - requiredHeight < margin) {
        page = pdfDoc.addPage(pageSize);
        cursorY = page.getHeight() - margin;
      }
    };

    const wrapText = (text, font, size, maxWidth) => {
      const words = String(text ?? "").split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        return [""];
      }

      const lines = [];
      let currentLine = words[0];

      const pushCurrentAndReset = (nextStart) => {
        lines.push(currentLine);
        currentLine = nextStart;
      };

      for (let i = 1; i < words.length; i += 1) {
        const word = words[i];
        const candidate = `${currentLine} ${word}`;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          currentLine = candidate;
          continue;
        }

        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          pushCurrentAndReset("");
          let token = "";
          for (let j = 0; j < word.length; j += 1) {
            const charCandidate = `${token}${word[j]}`;
            if (font.widthOfTextAtSize(charCandidate, size) <= maxWidth) {
              token = charCandidate;
            } else {
              if (token) {
                lines.push(token);
              }
              token = word[j];
            }
          }
          currentLine = token;
          continue;
        }

        pushCurrentAndReset(word);
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    const drawLines = (lines, options = {}) => {
      const font = options.font || regularFont;
      const size = options.size || 10.5;
      const color = options.color || rgb(0.06, 0.16, 0.26);
      const leading = options.leading || lineHeight;

      lines.forEach((line) => {
        ensureSpace(leading);
        page.drawText(line, {
          x: margin,
          y: cursorY,
          size,
          font,
          color,
        });
        cursorY -= leading;
      });
    };

    const drawParagraph = (text, options = {}) => {
      const font = options.font || regularFont;
      const size = options.size || 10.5;
      const lines = wrapText(text, font, size, maxTextWidth);
      drawLines(lines, options);
      cursorY -= options.paragraphGap ?? paragraphGap;
    };

    drawParagraph(CARTORIO_NAME, {
      font: boldFont,
      size: 13,
      color: rgb(0.06, 0.16, 0.26),
      paragraphGap: 6,
    });

    drawParagraph(`Serviço online solicitado: ${serviceName}`, {
      font: boldFont,
      size: 16,
      color: rgb(0.06, 0.16, 0.26),
      paragraphGap: 10,
    });

    drawParagraph(`Data e hora da geracao: ${createdAt.toLocaleString("pt-BR")}`, {
      size: 9.5,
      color: rgb(0.29, 0.4, 0.51),
      paragraphGap: 8,
    });

    const contactDestination = [
      targetEmail ? targetEmail : null,
      targetWhatsapp ? `WhatsApp ${targetWhatsapp}` : null,
    ]
      .filter(Boolean)
      .join(" ou ");

    const clientGuidance =
      `Orientação para o cliente: envie este PDF para ${contactDestination || "o canal informado pelo cartório"}. ` +
      "Após o envio da solicitação, nossa equipe analisará e responderá em horário comercial " +
      "(segunda a sexta, das 9h às 17h). Em caso de dúvidas, entre em contato pelo nosso e-mail ou WhatsApp.";

    drawParagraph(clientGuidance, {
      size: 9.6,
      color: rgb(0.16, 0.31, 0.45),
      paragraphGap: 12,
    });

    drawParagraph("Dados informados no formulario", {
      font: boldFont,
      size: 12,
      color: rgb(0.06, 0.16, 0.26),
      paragraphGap: 6,
    });

    const entries = collectFieldEntries(form);
    if (entries.length === 0) {
      drawParagraph("Nenhum dado preenchido.", {
        size: 10.5,
        color: rgb(0.43, 0.49, 0.56),
      });
    } else {
      entries.forEach((entry) => drawParagraph(`${entry.label}: ${entry.value}`, { size: 10.5 }));
    }

    cursorY -= 4;
    drawParagraph("Anexos", {
      font: boldFont,
      size: 12,
      color: rgb(0.06, 0.16, 0.26),
      paragraphGap: 6,
    });

    if (attachments.length === 0) {
      drawParagraph("Nenhum anexo foi selecionado.", {
        size: 10.5,
        color: rgb(0.43, 0.49, 0.56),
      });
    } else {
      attachments.forEach((file, index) => {
        drawParagraph(
          `${index + 1}. ${file.name} (${formatBytes(file.size)}${file.type ? `, ${file.type}` : ""})`,
          { size: 10.5 },
        );
      });
      drawParagraph(
        "Quando compativel, o conteudo dos anexos e incorporado nas paginas seguintes deste PDF.",
        {
          size: 9.8,
          color: rgb(0.29, 0.4, 0.51),
        },
      );
    }

    let attachedCount = 0;
    const attachmentOnlyCount = [];
    let optimizedImagesCount = 0;
    const attachmentErrors = [];

    const getAttachmentKind = (file) => {
      const type = String(file.type || "").toLowerCase();
      const fileName = String(file.name || "").toLowerCase();
      if (type.includes("pdf") || fileName.endsWith(".pdf")) {
        return "pdf";
      }
      if (type.includes("png") || fileName.endsWith(".png")) {
        return "png";
      }
      if (type.includes("jpeg") || type.includes("jpg") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        return "jpg";
      }
      if (type.includes("webp") || fileName.endsWith(".webp")) {
        return "webp";
      }
      return "other";
    };

    const readBlobAsImage = async (blob) => {
      if ("createImageBitmap" in window) {
        return window.createImageBitmap(blob);
      }

      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Falha ao carregar imagem."));
        };
        image.src = url;
      });
    };

    const optimizeImageForPdf = async ({ file, kind, bytes }) => {
      if (!["png", "jpg", "webp"].includes(kind)) {
        return null;
      }

      const fallbackKind = kind === "png" ? "png" : "jpg";
      const fallback = {
        embedKind: fallbackKind,
        imageBytes: bytes,
        optimized: false,
      };

      const originalMaxDimension = 2200;
      const needsOptimization = bytes.byteLength > 1_600_000 || kind === "webp";
      if (!needsOptimization && kind !== "webp") {
        return fallback;
      }

      try {
        const sourceBlob = new Blob([bytes], {
          type: file.type || (kind === "png" ? "image/png" : "image/jpeg"),
        });
        const imageSource = await readBlobAsImage(sourceBlob);
        const sourceWidth = imageSource.width;
        const sourceHeight = imageSource.height;
        const scale = Math.min(1, originalMaxDimension / Math.max(sourceWidth, sourceHeight));
        const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
        const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (typeof imageSource.close === "function") {
            imageSource.close();
          }
          return fallback;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

        if (typeof imageSource.close === "function") {
          imageSource.close();
        }

        const outputMime = kind === "png" ? "image/png" : "image/jpeg";
        const quality = outputMime === "image/jpeg" ? 0.86 : undefined;
        const optimizedBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), outputMime, quality);
        });

        if (!optimizedBlob) {
          return fallback;
        }

        const optimizedBytes = await optimizedBlob.arrayBuffer();
        if (optimizedBytes.byteLength >= bytes.byteLength * 0.98 && scale >= 1 && kind !== "webp") {
          return fallback;
        }

        return {
          embedKind: outputMime === "image/png" ? "png" : "jpg",
          imageBytes: optimizedBytes,
          optimized: true,
        };
      } catch (error) {
        return fallback;
      }
    };

    const appendAsEmbeddedAttachment = async (file, fileBytes) => {
      if (typeof pdfDoc.attach !== "function") {
        return false;
      }

      await pdfDoc.attach(fileBytes, sanitizeFileName(file.name), {
        mimeType: file.type || "application/octet-stream",
        description: `Anexo do formulario: ${serviceName}`,
        creationDate: createdAt,
        modificationDate: new Date(file.lastModified || Date.now()),
      });
      attachmentOnlyCount.push(file.name);
      return true;
    };

    for (const file of attachments) {
      let bytes;
      try {
        bytes = await file.arrayBuffer();
      } catch (error) {
        attachmentErrors.push(file.name);
        continue;
      }

      const kind = getAttachmentKind(file);
      let included = false;

      if (kind === "pdf") {
        try {
          const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const pageIndexes = sourcePdf.getPageIndices();
          if (pageIndexes.length > 0) {
            const copiedPages = await pdfDoc.copyPages(sourcePdf, pageIndexes);
            copiedPages.forEach((copiedPage) => pdfDoc.addPage(copiedPage));
            included = true;
          }
        } catch (error) {
          included = false;
        }
      } else if (kind === "png" || kind === "jpg" || kind === "webp") {
        try {
          const optimizedImage = await optimizeImageForPdf({ file, kind, bytes });
          if (!optimizedImage) {
            included = false;
            continue;
          }

          const image =
            optimizedImage.embedKind === "png"
              ? await pdfDoc.embedPng(optimizedImage.imageBytes)
              : await pdfDoc.embedJpg(optimizedImage.imageBytes);
          const imagePage = pdfDoc.addPage(pageSize);
          const headingY = imagePage.getHeight() - margin;
          imagePage.drawText(`Anexo: ${file.name}`, {
            x: margin,
            y: headingY,
            size: 10.5,
            font: boldFont,
            color: rgb(0.06, 0.16, 0.26),
          });

          const maxImageWidth = imagePage.getWidth() - margin * 2;
          const maxImageHeight = imagePage.getHeight() - margin * 2 - 20;
          const scale = Math.min(maxImageWidth / image.width, maxImageHeight / image.height, 1);
          const renderWidth = image.width * scale;
          const renderHeight = image.height * scale;
          const renderX = margin + (maxImageWidth - renderWidth) / 2;
          const renderY = margin + (maxImageHeight - renderHeight) / 2;

          imagePage.drawImage(image, {
            x: renderX,
            y: renderY,
            width: renderWidth,
            height: renderHeight,
          });
          if (optimizedImage.optimized) {
            optimizedImagesCount += 1;
          }
          included = true;
        } catch (error) {
          included = false;
        }
      }

      if (!included) {
        try {
          const embedded = await appendAsEmbeddedAttachment(file, bytes);
          included = embedded;
        } catch (error) {
          included = false;
        }
      }

      if (included) {
        attachedCount += 1;
      } else {
        attachmentErrors.push(file.name);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return {
      pdfBytes,
      attachedCount,
      attachmentOnlyCount: attachmentOnlyCount.length,
      optimizedImagesCount,
      attachmentErrors,
      fileName: buildPdfFileName(serviceName),
      attachmentTotal: attachments.length,
    };
  };

  const downloadPdf = (pdfBytes, fileName) => {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const buildWhatsappUrl = (rawNumber, message) => {
    const number = String(rawNumber || "").replace(/[^\d]/g, "");
    if (!number) {
      return "";
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const buildMailtoUrl = (email, subject, body) => {
    if (!email) {
      return "";
    }
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const buildOutboundMessage = ({ serviceName }) =>
    `Ola! Gerei o PDF da solicitacao de ${serviceName} no site do cartorio e vou anexar ele aqui nessa mensagem.`;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const copyTextToClipboard = async (text) => {
    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return false;
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(normalizedText);
        return true;
      } catch (error) {
        // Fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = normalizedText;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.focus();
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  };

  const getModal = () => document.getElementById(MODAL_ID);

  const setBodyScrollLock = (locked) => {
    document.body.classList.toggle("no-scroll", locked);
  };

  const setFlowStatus = (message, type = "neutral", options = {}) => {
    const modal = getModal();
    if (!modal) {
      return;
    }
    const statusEl = modal.querySelector("[data-flow-status]");
    if (!statusEl) {
      return;
    }
    const normalizedMessage = String(message || "").trim();
    statusEl.classList.remove("form-status--success", "form-status--error");
    if (normalizedMessage && type === "success") {
      statusEl.classList.add("form-status--success");
    } else if (normalizedMessage && type === "error") {
      statusEl.classList.add("form-status--error");
    }
    statusEl.hidden = !normalizedMessage;
    if (options.html) {
      statusEl.innerHTML = normalizedMessage;
    } else {
      statusEl.textContent = normalizedMessage;
    }
  };

  const getStepCard = (modal, stepNumber) => modal.querySelector(`[data-flow-step="${stepNumber}"]`);

  const setStepEnabled = (modal, stepNumber, enabled) => {
    const stepCard = getStepCard(modal, stepNumber);
    if (!stepCard) {
      return;
    }

    stepCard.classList.toggle("is-disabled", !enabled);
    stepCard.setAttribute("aria-disabled", String(!enabled));

    const controls = stepCard.querySelectorAll("button, a");
    controls.forEach((control) => {
      if (control instanceof HTMLButtonElement) {
        control.disabled = !enabled;
        return;
      }

      if (control instanceof HTMLAnchorElement) {
        if (!enabled) {
          if (!control.hasAttribute("data-prev-tabindex")) {
            control.setAttribute("data-prev-tabindex", control.getAttribute("tabindex") || "");
          }
          control.setAttribute("tabindex", "-1");
          control.setAttribute("aria-disabled", "true");
        } else {
          const previousTabIndex = control.getAttribute("data-prev-tabindex");
          if (previousTabIndex === "") {
            control.removeAttribute("tabindex");
          } else if (previousTabIndex !== null) {
            control.setAttribute("tabindex", previousTabIndex);
          }
          control.removeAttribute("aria-disabled");
        }
      }
    });
  };

  const setStepCompleted = (modal, stepNumber, completed) => {
    const stepCard = getStepCard(modal, stepNumber);
    if (!stepCard) {
      return;
    }

    stepCard.classList.toggle("is-complete", completed);
    const doneBadge = stepCard.querySelector("[data-step-done]");
    if (doneBadge) {
      doneBadge.hidden = !completed;
    }

    setStepCollapsed(modal, stepNumber, completed);
  };

  const setStepCollapsed = (modal, stepNumber, collapsed) => {
    const stepCard = getStepCard(modal, stepNumber);
    if (!stepCard) {
      return;
    }

    stepCard.classList.toggle("is-collapsed", collapsed);
    const toggleBtn = stepCard.querySelector("[data-step-toggle]");
    if (toggleBtn instanceof HTMLButtonElement) {
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
    }
  };

  const resetStepFlow = (modal) => {
    setStepEnabled(modal, 1, true);
    setStepEnabled(modal, 2, false);
    setStepEnabled(modal, 3, false);
    setStepEnabled(modal, 4, false);

    setStepCompleted(modal, 1, false);
    setStepCompleted(modal, 2, false);
    setStepCompleted(modal, 3, false);
    setStepCompleted(modal, 4, false);
  };

  const resetFlowActions = () => {
    const modal = getModal();
    if (!modal) {
      return;
    }

    const channelsWrap = modal.querySelector("[data-flow-channels]");
    const emailBtn = modal.querySelector("[data-flow-email]");
    const whatsappBtn = modal.querySelector("[data-flow-whatsapp]");
    const copyEmailBtn = modal.querySelector("[data-flow-copy-email]");
    const targetEmailDisplay = modal.querySelector("[data-flow-target-email]");
    const doneText = modal.querySelector("[data-flow-done]");

    if (channelsWrap) {
      channelsWrap.hidden = true;
    }
    if (emailBtn instanceof HTMLAnchorElement) {
      emailBtn.removeAttribute("href");
    }
    if (whatsappBtn instanceof HTMLAnchorElement) {
      whatsappBtn.removeAttribute("href");
    }
    if (copyEmailBtn instanceof HTMLButtonElement) {
      copyEmailBtn.hidden = true;
      delete copyEmailBtn.dataset.targetEmail;
    }
    if (targetEmailDisplay) {
      targetEmailDisplay.textContent = "e-mail indisponível";
    }
    if (doneText) {
      doneText.textContent = FLOW_DONE_MESSAGE;
    }
  };

  const fillFlowChannels = ({ form, fileName }) => {
    const modal = getModal();
    if (!modal) {
      return;
    }

    const serviceName = form.dataset.serviceName || "Solicitacao";
    const targetEmail = form.dataset.targetEmail || "";
    const targetWhatsapp = form.dataset.targetWhatsapp || "";
    const emailSubject = `Solicitacao de ${serviceName}`;
    const channelMessage = buildOutboundMessage({
      serviceName,
    });

    const emailHref = buildMailtoUrl(targetEmail, emailSubject, channelMessage);
    const whatsappHref = buildWhatsappUrl(targetWhatsapp, channelMessage);

    const channelsWrap = modal.querySelector("[data-flow-channels]");
    const emailBtn = modal.querySelector("[data-flow-email]");
    const whatsappBtn = modal.querySelector("[data-flow-whatsapp]");
    const copyEmailBtn = modal.querySelector("[data-flow-copy-email]");
    const targetEmailDisplay = modal.querySelector("[data-flow-target-email]");
    const doneText = modal.querySelector("[data-flow-done]");

    if (emailBtn instanceof HTMLAnchorElement) {
      if (emailHref) {
        emailBtn.href = emailHref;
        emailBtn.hidden = false;
      } else {
        emailBtn.hidden = true;
      }
    }

    if (whatsappBtn instanceof HTMLAnchorElement) {
      if (whatsappHref) {
        whatsappBtn.href = whatsappHref;
        whatsappBtn.hidden = false;
      } else {
        whatsappBtn.hidden = true;
      }
    }

    if (copyEmailBtn instanceof HTMLButtonElement) {
      if (targetEmail) {
        copyEmailBtn.hidden = false;
        copyEmailBtn.dataset.targetEmail = targetEmail;
      } else {
        copyEmailBtn.hidden = true;
        delete copyEmailBtn.dataset.targetEmail;
      }
    }

    if (targetEmailDisplay) {
      targetEmailDisplay.textContent = targetEmail || "e-mail indisponível";
    }

    if (channelsWrap) {
      const hasAnyLink = Boolean(emailHref || whatsappHref || targetEmail);
      channelsWrap.hidden = !hasAnyLink;
    }

    if (doneText) {
      doneText.textContent = FLOW_DONE_MESSAGE;
    }

    if (window.Iconify && typeof window.Iconify.scan === "function") {
      window.Iconify.scan(modal);
    }
  };

  const isFlowCompleted = (modal) =>
    Boolean(getStepCard(modal, 3)?.classList.contains("is-complete")) ||
    Boolean(getStepCard(modal, 4)?.classList.contains("is-complete"));

  const attemptCloseFlowModal = () => {
    const modal = getModal();
    if (!modal) {
      return;
    }

    if (!isFlowCompleted(modal)) {
      const shouldClose = window.confirm(
        "Atenção: se você não concluir todas as etapas e enviar o PDF, sua solicitação não será recebida. Deseja fechar mesmo assim?",
      );
      if (!shouldClose) {
        return;
      }
    }

    closeFlowModal();
  };

  const closeFlowModal = () => {
    const modal = getModal();
    if (!modal) {
      return;
    }
    modal.hidden = true;
    setBodyScrollLock(false);
  };

  const openFlowModal = (form) => {
    const modal = getModal();
    if (!modal) {
      return;
    }

    flowState.activeForm = form;
    flowState.generatedFileName = "";
    flowState.generatedAt = null;

    const titleEl = modal.querySelector("[data-flow-title]");
    if (titleEl) {
      const serviceName = form.dataset.serviceName || "Solicitacao";
      titleEl.textContent = `Enviar solicitação: ${serviceName}`;
    }

    resetFlowActions();
    resetStepFlow(modal);
    setFlowStatus("");
    modal.hidden = false;
    setBodyScrollLock(true);
  };

  const createFlowModal = () => {
    if (getModal()) {
      return;
    }

    const modal = document.createElement("section");
    modal.id = MODAL_ID;
    modal.className = "service-flow-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="service-flow-modal-backdrop" data-flow-close></div>
      <div class="service-flow-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="serviceFlowTitle">
        <button type="button" class="service-flow-close-btn" data-flow-close aria-label="Fechar">×</button>
        <div class="service-flow-head">
          <img
            src="assets/images/cartorio-icon.png"
            alt="Logo do Cartório do 1º Ofício de Justiça de Rio das Ostras"
            class="service-flow-logo"
          />
          <div class="service-flow-head-copy">
            <h2 class="service-flow-title" id="serviceFlowTitle" data-flow-title>Enviar solicitação</h2>
            <p class="service-flow-intro">
              Quase lá! Você preencheu o formulário, agora siga os passos abaixo para finalizar sua solicitação.
            </p>
          </div>
        </div>
        <p
          class="form-status service-flow-status service-flow-global-status"
          data-flow-status
          aria-live="polite"
          hidden
        ></p>
        <ol class="service-flow-steps">
          <li class="service-flow-step" data-flow-step="1">
            <button type="button" class="service-flow-step-title" data-step-toggle aria-expanded="true">
              <span>Passo 1</span>
              <span class="service-flow-step-meta">
                <span class="service-flow-step-done" data-step-done hidden>Concluído</span>
                <span class="service-flow-step-toggle-indicator" aria-hidden="true">▾</span>
              </span>
            </button>
            <div class="service-flow-step-content">
              <p class="service-flow-step-text">Clique no botão abaixo para baixar o PDF do formulário preenchido.</p>
              <button type="button" class="btn btn-primary service-flow-download-btn" data-flow-download>
                Baixar PDF do formulário
                <span class="iconify" data-icon="mdi:download" aria-hidden="true"></span>
              </button>
            </div>
          </li>
          <li class="service-flow-step" data-flow-step="2">
            <button type="button" class="service-flow-step-title" data-step-toggle aria-expanded="true">
              <span>Passo 2</span>
              <span class="service-flow-step-meta">
                <span class="service-flow-step-done" data-step-done hidden>Concluído</span>
                <span class="service-flow-step-toggle-indicator" aria-hidden="true">▾</span>
              </span>
            </button>
            <div class="service-flow-step-content">
              <p class="service-flow-step-text">
                Escolha como deseja enviar o formulário que você baixou para nós: WhatsApp, e-mail via seu app de email (se
                disponível em seu dispositivo), ou manualmente copiando o nosso e-mail de destino:
                <span class="service-flow-target-email" data-flow-target-email>e-mail indisponível</span>
                <button type="button" class="btn service-flow-inline-copy-btn" data-flow-copy-email hidden>
                  Copiar
                  <span class="iconify" data-icon="mdi:content-copy" aria-hidden="true"></span>
                </button>
              </p>
              <div class="service-flow-channels" data-flow-channels hidden>
                <a class="btn service-flow-whatsapp-btn" data-flow-whatsapp href="#" target="_blank" rel="noopener">
                  Enviar por WhatsApp
                  <span class="iconify" data-icon="mdi:whatsapp" aria-hidden="true"></span>
                </a>
                <a class="btn btn-primary service-flow-email-btn" data-flow-email href="#">
                  Enviar com meu app de email
                  <span class="iconify" data-icon="mdi:email-outline" aria-hidden="true"></span>
                </a>
              </div>
            </div>
          </li>
          <li class="service-flow-step" data-flow-step="3">
            <button type="button" class="service-flow-step-title" data-step-toggle aria-expanded="true">
              <span>Passo 3</span>
              <span class="service-flow-step-meta">
                <span class="service-flow-step-done" data-step-done hidden>Concluído</span>
                <span class="service-flow-step-toggle-indicator" aria-hidden="true">▾</span>
              </span>
            </button>
            <div class="service-flow-step-content">
              <p class="service-flow-step-text">
                Confira se o PDF baixado está anexado na mensagem. Se ainda não estiver, anexe o arquivo e faça o envio.
              </p>
              <button type="button" class="btn btn-primary service-flow-confirm-btn" data-flow-confirm-send>
                Já anexei e enviei
                <span class="iconify" data-icon="mdi:check-circle-outline" aria-hidden="true"></span>
              </button>
            </div>
          </li>
          <li class="service-flow-step" data-flow-step="4">
            <button type="button" class="service-flow-step-title" data-step-toggle aria-expanded="true">
              <span>Passo 4</span>
              <span class="service-flow-step-meta">
                <span class="service-flow-step-done" data-step-done hidden>Concluído</span>
                <span class="service-flow-step-toggle-indicator" aria-hidden="true">▾</span>
              </span>
            </button>
            <div class="service-flow-step-content">
              <p class="service-flow-step-text" data-flow-done>
                ${FLOW_DONE_MESSAGE}
              </p>
              <button type="button" class="btn btn-primary service-flow-finish-btn" data-flow-finish>
                Concluir
                <span class="iconify" data-icon="mdi:check-bold" aria-hidden="true"></span>
              </button>
            </div>
          </li>
        </ol>
      </div>
    `;

    document.body.append(modal);

    modal.querySelectorAll("[data-flow-close]").forEach((closeControl) => {
      closeControl.addEventListener("click", attemptCloseFlowModal);
    });

    const emailBtn = modal.querySelector("[data-flow-email]");
    const whatsappBtn = modal.querySelector("[data-flow-whatsapp]");
    const copyEmailBtn = modal.querySelector("[data-flow-copy-email]");
    const confirmSendBtn = modal.querySelector("[data-flow-confirm-send]");
    const finishBtn = modal.querySelector("[data-flow-finish]");
    const stepToggleButtons = Array.from(modal.querySelectorAll("[data-step-toggle]"));

    stepToggleButtons.forEach((toggleBtn) => {
      if (!(toggleBtn instanceof HTMLButtonElement)) {
        return;
      }
      toggleBtn.addEventListener("click", () => {
        const stepCard = toggleBtn.closest("[data-flow-step]");
        if (!(stepCard instanceof HTMLElement) || !stepCard.classList.contains("is-complete")) {
          return;
        }
        const shouldCollapse = !stepCard.classList.contains("is-collapsed");
        stepCard.classList.toggle("is-collapsed", shouldCollapse);
        toggleBtn.setAttribute("aria-expanded", String(!shouldCollapse));
      });
    });

    const finalizeStep2 = () => {
      if (getStepCard(modal, 2)?.classList.contains("is-disabled")) {
        return;
      }
      setStepCompleted(modal, 2, true);
      setStepEnabled(modal, 3, true);
      setFlowStatus("Passo 2 concluído. Agora confirme o envio no passo 3.", "success");
    };

    if (emailBtn instanceof HTMLAnchorElement) {
      emailBtn.addEventListener("click", (event) => {
        if (!emailBtn.href) {
          event.preventDefault();
          return;
        }
        finalizeStep2();
      });
    }

    if (whatsappBtn instanceof HTMLAnchorElement) {
      whatsappBtn.addEventListener("click", (event) => {
        if (!whatsappBtn.href) {
          event.preventDefault();
          return;
        }
        finalizeStep2();
      });
    }

    if (copyEmailBtn instanceof HTMLButtonElement) {
      copyEmailBtn.addEventListener("click", async () => {
        const targetEmail = String(copyEmailBtn.dataset.targetEmail || "").trim();
        if (!targetEmail) {
          setFlowStatus("E-mail de destino indisponível neste formulário.", "error");
          return;
        }

        const copied = await copyTextToClipboard(targetEmail);
        if (!copied) {
          setFlowStatus("Não foi possível copiar automaticamente. Copie o e-mail manualmente e continue.", "error");
          return;
        }

        finalizeStep2();
        setFlowStatus(
          `E-mail <strong>${escapeHtml(targetEmail)}</strong> copiado. Abra seu provedor de e-mail, cole o destinatário e anexe o PDF que você baixou.`,
          "success",
          { html: true },
        );
      });
    }

    if (confirmSendBtn instanceof HTMLButtonElement) {
      confirmSendBtn.addEventListener("click", () => {
        if (getStepCard(modal, 3)?.classList.contains("is-disabled")) {
          return;
        }
        setStepCompleted(modal, 3, true);
        setStepEnabled(modal, 4, true);
        setFlowStatus("Tudo certo!", "success");
      });
    }

    if (finishBtn instanceof HTMLButtonElement) {
      finishBtn.addEventListener("click", () => {
        if (getStepCard(modal, 4)?.classList.contains("is-disabled")) {
          return;
        }
        setStepCompleted(modal, 4, true);
        closeFlowModal();
      });
    }

    const downloadBtn = modal.querySelector("[data-flow-download]");
    if (downloadBtn instanceof HTMLButtonElement) {
      downloadBtn.addEventListener("click", async () => {
        const form = flowState.activeForm;
        if (!(form instanceof HTMLFormElement)) {
          setFlowStatus("Nao foi possivel identificar o formulario ativo.", "error");
          return;
        }

        downloadBtn.disabled = true;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.textContent = "Gerando PDF...";
        setFlowStatus("Gerando PDF da solicitacao...");

        try {
          const serviceName = form.dataset.serviceName || "Solicitacao";
          const attachments = collectAttachments(form);
          const {
            pdfBytes,
            fileName,
            attachmentErrors,
            attachedCount,
            attachmentTotal,
            attachmentOnlyCount,
            optimizedImagesCount,
          } =
            await createPdf({
              form,
              serviceName,
              attachments,
            });

          flowState.generatedFileName = fileName;
          flowState.generatedAt = new Date();

          downloadPdf(pdfBytes, fileName);
          fillFlowChannels({ form, fileName });
          setStepCompleted(modal, 1, true);
          setStepEnabled(modal, 2, true);

          const attachmentsSummary =
            attachmentTotal > 0 ? `${attachedCount}/${attachmentTotal} anexos incluídos no PDF.` : "Sem anexos.";
          const attachmentOnlySummary =
            attachmentOnlyCount > 0
              ? ` ${attachmentOnlyCount} anexo(s) foram incluídos como arquivo embutido (podem não aparecer visualmente em alguns leitores).`
              : "";
          const optimizationSummary =
            optimizedImagesCount > 0
              ? ` ${optimizedImagesCount} foto(s) grande(s) foram compactadas automaticamente para reduzir o tamanho do PDF sem comprometer a legibilidade.`
              : "";
          const nextStepInstruction = " Siga as instruções do passo 2 para escolher como deseja enviar.";
          if (attachmentErrors.length > 0 || attachmentOnlyCount > 0) {
            setFlowStatus(
              `PDF baixado com ressalvas. ${attachmentsSummary}${attachmentOnlySummary}${optimizationSummary}${nextStepInstruction}`,
              "error",
            );
          } else {
            setFlowStatus("PDF baixado com sucesso. Siga as instruções do passo 2 para escolher como deseja enviar.", "success");
          }
        } catch (error) {
          setFlowStatus("Nao foi possivel gerar o PDF agora. Verifique os dados e tente novamente.", "error");
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalText;
          if (window.Iconify && typeof window.Iconify.scan === "function") {
            window.Iconify.scan(modal);
          }
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        attemptCloseFlowModal();
      }
    });

    if (window.Iconify && typeof window.Iconify.scan === "function") {
      window.Iconify.scan(modal);
    }
  };

  const openFlowIfValid = (form) => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    openFlowModal(form);
  };

  const initPdfForms = () => {
    const forms = Array.from(document.querySelectorAll(FORM_SELECTOR));
    if (forms.length === 0) {
      return;
    }

    createFlowModal();

    forms.forEach((form) => {
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      const nextButton = form.querySelector("[data-form-next]");
      if (nextButton instanceof HTMLButtonElement) {
        nextButton.addEventListener("click", () => openFlowIfValid(form));
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        openFlowIfValid(form);
      });
    });
  };

  document.addEventListener("DOMContentLoaded", initPdfForms);
})();
