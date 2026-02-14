(() => {
  const FORM_SELECTOR = "form[data-pdf-service-form]";
  const MODAL_ID = "serviceFlowModal";
  const SKIPPED_FIELD_NAMES = new Set(["access_key", "subject", "from_name", "redirect", "botcheck"]);
  const CARTORIO_NAME = "Cartório do 1º Ofício de Justiça de Rio das Ostras";
  const JSZIP_CDN_URL = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
  const FLOW_DONE_MESSAGE =
    "Sua solicitação foi finalizada. Agradecemos por utilizar nossos serviços. Nossa equipe analisará o pedido e responderá em horário comercial (segunda a sexta, das 9h às 17h).";

  const flowState = {
    activeForm: null,
    generatedFileName: "",
    generatedAt: null,
  };
  let jsZipLoadPromise = null;
  let isCloseAttemptInProgress = false;
  const fileSelectionStore = new WeakMap();

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

  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
  const ZIP_AGGRESSIVE_THRESHOLD_BYTES = 25 * 1024 * 1024;
  const MAX_FILES_PER_INPUT = 12;
  const REQUIRED_TEXT_MIN_LENGTH = 3;
  const REQUIRED_TEXTAREA_MIN_LENGTH = 10;

  const onlyDigits = (value) => String(value || "").replace(/\D+/g, "");

  const normalizeWhitespace = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const formatCpf = (digitsValue) => {
    const digits = onlyDigits(digitsValue).slice(0, 11);
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatCnpj = (digitsValue) => {
    const digits = onlyDigits(digitsValue).slice(0, 14);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    if (digits.length <= 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    }
    if (digits.length <= 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const formatCpfOrCnpj = (value) => {
    const digits = onlyDigits(value);
    if (digits.length <= 11) {
      return formatCpf(digits);
    }
    return formatCnpj(digits);
  };

  const formatPhoneBr = (value) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) {
      return digits ? `(${digits}` : "";
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCep = (value) => {
    const digits = onlyDigits(value).slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const formatUf = (value) => stripAccents(value).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);

  const hasAllSameDigits = (digits) => /^(\d)\1+$/.test(digits);

  const isValidCpf = (value) => {
    const digits = onlyDigits(value);
    if (digits.length !== 11 || hasAllSameDigits(digits)) {
      return false;
    }
    const calcDigit = (base, factor) => {
      let total = 0;
      for (let index = 0; index < base.length; index += 1) {
        total += Number(base[index]) * (factor - index);
      }
      const remainder = (total * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };
    const digit1 = calcDigit(digits.slice(0, 9), 10);
    const digit2 = calcDigit(digits.slice(0, 10), 11);
    return digit1 === Number(digits[9]) && digit2 === Number(digits[10]);
  };

  const isValidCnpj = (value) => {
    const digits = onlyDigits(value);
    if (digits.length !== 14 || hasAllSameDigits(digits)) {
      return false;
    }

    const calcDigit = (base, factors) => {
      const total = base.split("").reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const factors2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digit1 = calcDigit(digits.slice(0, 12), factors1);
    const digit2 = calcDigit(digits.slice(0, 12) + String(digit1), factors2);
    return digit1 === Number(digits[12]) && digit2 === Number(digits[13]);
  };

  const parseAcceptTokens = (acceptValue) =>
    String(acceptValue || "")
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

  const fileMatchesAccept = (file, acceptTokens) => {
    if (!acceptTokens.length) {
      return true;
    }
    const fileType = String(file.type || "").toLowerCase();
    const fileName = String(file.name || "").toLowerCase();
    return acceptTokens.some((token) => {
      if (token.startsWith(".")) {
        return fileName.endsWith(token);
      }
      if (token.endsWith("/*")) {
        const prefix = token.slice(0, -1);
        return fileType.startsWith(prefix);
      }
      return fileType === token;
    });
  };

  const bytesToHex = (buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");

  const getFileContentHash = async (bytes) => {
    if (!(window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === "function")) {
      return "";
    }

    try {
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      return bytesToHex(digest);
    } catch (error) {
      return "";
    }
  };

  const buildFileIdentityKey = (file) =>
    [String(file.name || ""), String(file.size || 0), String(file.lastModified || 0), String(file.type || "")].join("|");

  const getSelectedFiles = (input) => {
    const cached = fileSelectionStore.get(input);
    if (Array.isArray(cached)) {
      return cached;
    }
    return Array.from(input.files || []);
  };

  const applyFilesToInput = (input, files) => {
    fileSelectionStore.set(input, files);
    if (typeof window.DataTransfer !== "function") {
      return;
    }
    try {
      const transfer = new window.DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    } catch (error) {
      if (files.length === 0) {
        input.value = "";
      }
      // Keep cached files even if assignment is blocked by the browser.
    }
  };

  const mergeInputFiles = (input) => {
    const currentSelection = Array.from(input.files || []);
    const previousSelection = getSelectedFiles(input);

    if (!input.multiple) {
      applyFilesToInput(input, currentSelection);
      return;
    }

    if (currentSelection.length === 0) {
      applyFilesToInput(input, previousSelection);
      return;
    }

    const merged = [];
    const seen = new Set();

    [...previousSelection, ...currentSelection].forEach((file) => {
      const identity = buildFileIdentityKey(file);
      if (seen.has(identity)) {
        return;
      }
      seen.add(identity);
      merged.push(file);
    });

    applyFilesToInput(input, merged);
  };

  const ensureAttachmentListContainer = (input) => {
    const parent = input.parentElement;
    if (!parent) {
      return null;
    }
    let container = parent.querySelector(".file-attachments-panel");
    if (container) {
      return container;
    }

    container = document.createElement("div");
    container.className = "file-attachments-panel";
    container.innerHTML = `
      <div class="file-attachments-head">
        <span class="file-attachments-title">Arquivos adicionados</span>
        <span class="file-attachments-summary">Nenhum arquivo</span>
      </div>
      <ul class="file-attachments-list"></ul>
    `;
    parent.append(container);
    return container;
  };

  const updateAttachmentListUi = (input, form) => {
    const container = ensureAttachmentListContainer(input);
    if (!container) {
      return;
    }

    const files = getSelectedFiles(input);
    const summaryEl = container.querySelector(".file-attachments-summary");
    const listEl = container.querySelector(".file-attachments-list");
    if (!summaryEl || !listEl) {
      return;
    }

    if (files.length === 0) {
      summaryEl.textContent = "Nenhum arquivo";
      listEl.innerHTML = `
        <li class="file-attachment-item file-attachment-item-empty">
          Nenhum arquivo selecionado.
        </li>
      `;
      return;
    }

    const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    summaryEl.textContent = `${files.length} arquivo(s) • ${formatBytes(totalBytes)}`;

    listEl.innerHTML = "";
    files.forEach((file, index) => {
      const item = document.createElement("li");
      item.className = "file-attachment-item";

      const fileInfo = document.createElement("div");
      fileInfo.className = "file-attachment-meta";
      const safeName = String(file.name || `arquivo-${index + 1}`);
      fileInfo.innerHTML = `
        <span class="file-attachment-name">${escapeHtml(safeName)}</span>
        <span class="file-attachment-size">${formatBytes(file.size)}</span>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "file-attachment-remove-btn";
      removeBtn.textContent = "Remover";
      removeBtn.setAttribute("aria-label", `Remover ${safeName}`);
      removeBtn.addEventListener("click", () => {
        const currentFiles = getSelectedFiles(input);
        const targetKey = buildFileIdentityKey(file);
        const nextFiles = [];
        let removed = false;
        currentFiles.forEach((currentFile) => {
          if (!removed && buildFileIdentityKey(currentFile) === targetKey) {
            removed = true;
            return;
          }
          nextFiles.push(currentFile);
        });
        applyFilesToInput(input, nextFiles);
        validateFileInputs(form);
        updateAttachmentListUi(input, form);
      });

      item.append(fileInfo, removeBtn);
      listEl.append(item);
    });
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
      const fieldLabel = getElementLabel(form, input);
      getSelectedFiles(input).forEach((file) =>
        files.push({
          file,
          fieldLabel,
        }),
      );
    });
    return files;
  };

  const sanitizeFileName = (name) => {
    const cleaned = String(name || "").replace(/[^a-zA-Z0-9._-]/g, "_");
    return cleaned || "anexo";
  };

  const buildFileBaseName = (serviceName, createdAt = new Date()) => {
    const year = String(createdAt.getFullYear());
    const month = String(createdAt.getMonth() + 1).padStart(2, "0");
    const day = String(createdAt.getDate()).padStart(2, "0");
    const hours = String(createdAt.getHours()).padStart(2, "0");
    const minutes = String(createdAt.getMinutes()).padStart(2, "0");
    const base = slugify(serviceName) || "solicitacao";
    return `${base}-${year}${month}${day}-${hours}${minutes}`;
  };

  const buildPdfFileName = (serviceName, createdAt = new Date()) => `${buildFileBaseName(serviceName, createdAt)}.pdf`;

  const buildZipFileName = (serviceName, createdAt = new Date()) => `${buildFileBaseName(serviceName, createdAt)}.zip`;

  const getAttachmentDisplayName = (attachment) => {
    const file = attachment.file;
    const fieldLabel = String(attachment.fieldLabel || "").trim();
    return fieldLabel ? `${fieldLabel} - ${file.name}` : file.name;
  };

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

  const optimizeAttachmentForZip = async ({ file, bytes, aggressive = false }) => {
    const kind = getAttachmentKind(file);
    const fallback = {
      bytes,
      fileName: sanitizeFileName(file.name),
      optimized: false,
    };

    if (!["png", "jpg", "webp"].includes(kind)) {
      return fallback;
    }

    const shouldOptimize =
      aggressive || bytes.byteLength > 1_600_000 || kind === "webp" || (kind === "png" && bytes.byteLength > 2_000_000);
    if (!shouldOptimize) {
      return fallback;
    }

    try {
      const sourceBlob = new Blob([bytes], {
        type: file.type || (kind === "png" ? "image/png" : "image/jpeg"),
      });
      const imageSource = await readBlobAsImage(sourceBlob);
      const sourceWidth = imageSource.width;
      const sourceHeight = imageSource.height;
      const maxDimension = aggressive ? 1700 : 2200;
      const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
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

      const outputMime = aggressive ? "image/jpeg" : kind === "png" ? "image/png" : "image/jpeg";
      const quality = outputMime === "image/jpeg" ? (aggressive ? 0.74 : 0.86) : undefined;
      const optimizedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), outputMime, quality);
      });

      if (!optimizedBlob) {
        return fallback;
      }

      const optimizedBytes = await optimizedBlob.arrayBuffer();
      if (!aggressive && optimizedBytes.byteLength >= bytes.byteLength * 0.97 && scale >= 1 && kind !== "webp") {
        return fallback;
      }

      const originalName = sanitizeFileName(file.name);
      const extensionIndex = originalName.lastIndexOf(".");
      const baseName = extensionIndex > 0 ? originalName.slice(0, extensionIndex) : originalName;
      const suffix = outputMime === "image/png" ? "png" : "jpg";

      return {
        bytes: optimizedBytes,
        fileName: `${baseName}-compactado.${suffix}`,
        optimized: true,
      };
    } catch (error) {
      return fallback;
    }
  };

  const buildZipAttachmentName = (attachment, index, fileName) => {
    const sequence = String(index + 1).padStart(2, "0");
    const labelSlug = slugify(attachment.fieldLabel || "") || "anexo";
    return `${sequence}-${labelSlug}-${sanitizeFileName(fileName)}`;
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
      document.head.append(script);
    });

  const ensureJsZipLoaded = async () => {
    if (window.JSZip) {
      return window.JSZip;
    }

    if (!jsZipLoadPromise) {
      jsZipLoadPromise = loadScript(JSZIP_CDN_URL).then(() => {
        if (!window.JSZip) {
          throw new Error("A biblioteca de ZIP nao foi carregada.");
        }
        return window.JSZip;
      });
    }

    return jsZipLoadPromise;
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
      `Orientação para o cliente: envie o arquivo ZIP gerado pelo site para ${contactDestination || "o canal informado pelo cartório"}. ` +
      "Esse ZIP contém este PDF com os dados da solicitação e os anexos em arquivos separados. " +
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
      attachments.forEach((attachment, index) => {
        const file = attachment.file;
        drawParagraph(
          `${index + 1}. ${getAttachmentDisplayName(attachment)} (${formatBytes(file.size)}${file.type ? `, ${file.type}` : ""})`,
          { size: 10.5 },
        );
      });
    }

    const pdfBytes = await pdfDoc.save();
    return {
      pdfBytes,
      fileName: buildPdfFileName(serviceName, createdAt),
      createdAt,
    };
  };

  const createZipPackage = async ({ serviceName, createdAt, pdfBytes, pdfFileName, attachments }) => {
    const JSZip = await ensureJsZipLoaded();
    const zip = new JSZip();
    const attachmentErrors = [];
    const seenHashes = new Set();
    let optimizedCount = 0;
    let deduplicatedCount = 0;

    const totalOriginalBytes = attachments.reduce((total, attachment) => total + Number(attachment?.file?.size || 0), 0);
    const aggressiveCompression = totalOriginalBytes > ZIP_AGGRESSIVE_THRESHOLD_BYTES;

    zip.file(pdfFileName, pdfBytes, { binary: true });

    for (let index = 0; index < attachments.length; index += 1) {
      const attachment = attachments[index];
      const file = attachment.file;
      try {
        const originalBytes = await file.arrayBuffer();
        const hash = await getFileContentHash(originalBytes);
        if (hash && seenHashes.has(hash)) {
          deduplicatedCount += 1;
          continue;
        }
        if (hash) {
          seenHashes.add(hash);
        }

        const optimizedAttachment = await optimizeAttachmentForZip({
          file,
          bytes: originalBytes,
          aggressive: aggressiveCompression,
        });

        if (optimizedAttachment.optimized) {
          optimizedCount += 1;
        }

        const zipFileName = buildZipAttachmentName(attachment, index, optimizedAttachment.fileName);
        zip.file(`anexos/${zipFileName}`, optimizedAttachment.bytes, { binary: true });
      } catch (error) {
        attachmentErrors.push(file.name);
      }
    }

    const zipBytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: aggressiveCompression ? 9 : 6 },
    });

    return {
      zipBytes,
      fileName: buildZipFileName(serviceName, createdAt),
      optimizedCount,
      deduplicatedCount,
      aggressiveCompression,
      attachmentErrors,
      attachmentTotal: attachments.length,
    };
  };

  const downloadZip = (zipBytes, fileName) => {
    const blob = new Blob([zipBytes], { type: "application/zip" });
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
    `Ola! Gerei o arquivo ZIP da solicitacao de ${serviceName} no site do cartorio e vou anexar ele aqui nessa mensagem.`;

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

  const applyDocumentMask = (input) => {
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    input.value = input.name === "cpf" ? formatCpf(input.value) : formatCpfOrCnpj(input.value);
  };

  const applyPhoneMask = (input) => {
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    input.value = formatPhoneBr(input.value);
  };

  const validateDocumentFields = (form) => {
    let isValid = true;
    const tipoPessoaField = form.querySelector('select[name="tipo_pessoa"]');
    const tipoPessoa = tipoPessoaField instanceof HTMLSelectElement ? String(tipoPessoaField.value || "") : "";

    form.querySelectorAll('input[name="cpf"], input[name="cpf_cnpj"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement) || field.disabled) {
        return;
      }

      field.setCustomValidity("");
      const digits = onlyDigits(field.value);
      if (!digits) {
        return;
      }

      if (field.name === "cpf") {
        if (!isValidCpf(digits)) {
          field.setCustomValidity("Informe um CPF válido.");
          isValid = false;
        }
        return;
      }

      if (digits.length === 11 && !isValidCpf(digits)) {
        field.setCustomValidity("Informe um CPF válido.");
        isValid = false;
        return;
      }
      if (digits.length === 14 && !isValidCnpj(digits)) {
        field.setCustomValidity("Informe um CNPJ válido.");
        isValid = false;
        return;
      }
      if (![11, 14].includes(digits.length)) {
        field.setCustomValidity("Informe um CPF ou CNPJ válido.");
        isValid = false;
        return;
      }

      if (tipoPessoa.includes("Jurídica") && digits.length !== 14) {
        field.setCustomValidity("Para pessoa jurídica, informe um CNPJ válido.");
        isValid = false;
      } else if (tipoPessoa.includes("Física") && digits.length !== 11) {
        field.setCustomValidity("Para pessoa física, informe um CPF válido.");
        isValid = false;
      }
    });

    return isValid;
  };

  const validateEmailConfirmation = (form) => {
    const emailField = form.querySelector('input[type="email"][name="email"]');
    const confirmationField = form.querySelector('input[type="email"][name="email_confirmacao"]');
    if (!(emailField instanceof HTMLInputElement) || !(confirmationField instanceof HTMLInputElement)) {
      return true;
    }

    confirmationField.setCustomValidity("");
    const emailValue = normalizeWhitespace(emailField.value).toLowerCase();
    const confirmationValue = normalizeWhitespace(confirmationField.value).toLowerCase();

    if (confirmationValue && emailValue !== confirmationValue) {
      confirmationField.setCustomValidity("Os e-mails não coincidem.");
      return false;
    }
    return true;
  };

  const validateRequiredTextFields = (form) => {
    let isValid = true;
    const minLengthSkipNames = new Set(["cpf", "cpf_cnpj", "estado", "cep", "phone", "telefone_adicional"]);

    form.querySelectorAll('input[type="text"], textarea').forEach((field) => {
      if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
        return;
      }
      if (field.disabled || field.readOnly) {
        return;
      }

      const normalized = normalizeWhitespace(field.value);
      if (normalized !== field.value) {
        field.value = normalized;
      }
      const shouldSkipMinLength = field instanceof HTMLInputElement && minLengthSkipNames.has(field.name);
      if (shouldSkipMinLength) {
        return;
      }

      field.setCustomValidity("");
      if (!field.required || !normalized) {
        return;
      }

      if (field instanceof HTMLInputElement) {
        if (normalized.length < REQUIRED_TEXT_MIN_LENGTH) {
          field.setCustomValidity("Preencha este campo com pelo menos 3 caracteres.");
          isValid = false;
        }
        return;
      }

      if (normalized.length < REQUIRED_TEXTAREA_MIN_LENGTH) {
        field.setCustomValidity("Detalhe um pouco mais este campo (mínimo de 10 caracteres).");
        isValid = false;
      }
    });

    return isValid;
  };

  const validatePhoneFields = (form) => {
    let isValid = true;

    form.querySelectorAll('input[type="tel"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement) || field.disabled) {
        return;
      }
      field.setCustomValidity("");
      const digits = onlyDigits(field.value);
      if (!digits) {
        return;
      }
      if (digits.length < 10 || digits.length > 11) {
        field.setCustomValidity("Informe um telefone válido com DDD.");
        isValid = false;
      }
    });

    return isValid;
  };

  const validateDateFields = (form) => {
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    form.querySelectorAll('input[type="date"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement) || field.disabled) {
        return;
      }
      field.setCustomValidity("");
      if (!field.value) {
        return;
      }

      const selectedDate = new Date(`${field.value}T00:00:00`);
      if (selectedDate > today) {
        field.setCustomValidity("Informe uma data válida (não pode ser no futuro).");
        isValid = false;
      }
    });

    return isValid;
  };

  const validateFileInputs = (form) => {
    let isValid = true;

    form.querySelectorAll('input[type="file"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement) || field.disabled) {
        return;
      }
      field.setCustomValidity("");
      const files = getSelectedFiles(field);
      if (files.length === 0) {
        return;
      }

      const label = getElementLabel(form, field) || "Arquivo";
      if (files.length > MAX_FILES_PER_INPUT) {
        field.setCustomValidity(`Anexe no máximo ${MAX_FILES_PER_INPUT} arquivos em "${label}".`);
        isValid = false;
        return;
      }

      const acceptTokens = parseAcceptTokens(field.accept);
      const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
      if (oversized) {
        field.setCustomValidity(`O arquivo "${oversized.name}" excede o limite de 20 MB.`);
        isValid = false;
        return;
      }

      const invalidType = files.find((file) => !fileMatchesAccept(file, acceptTokens));
      if (invalidType) {
        field.setCustomValidity(`O arquivo "${invalidType.name}" não é compatível com os formatos aceitos.`);
        isValid = false;
      }
    });

    return isValid;
  };

  const runEssentialFormValidation = (form) => {
    const rules = [
      validateEmailConfirmation(form),
      validateDocumentFields(form),
      validatePhoneFields(form),
      validateRequiredTextFields(form),
      validateDateFields(form),
      validateFileInputs(form),
    ];
    return rules.every(Boolean);
  };

  const setupEssentialFieldValidation = (form) => {
    const tipoPessoaField = form.querySelector('select[name="tipo_pessoa"]');

    form.querySelectorAll('input[name="cpf"], input[name="cpf_cnpj"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      field.inputMode = "numeric";
      field.maxLength = field.name === "cpf" ? 14 : 18;
      field.addEventListener("input", () => {
        applyDocumentMask(field);
        validateDocumentFields(form);
      });
      field.addEventListener("blur", () => validateDocumentFields(form));
      applyDocumentMask(field);
    });

    if (tipoPessoaField instanceof HTMLSelectElement) {
      tipoPessoaField.addEventListener("change", () => validateDocumentFields(form));
    }

    form.querySelectorAll('input[type="tel"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      field.inputMode = "numeric";
      field.maxLength = 15;
      field.addEventListener("input", () => applyPhoneMask(field));
      field.addEventListener("blur", () => validatePhoneFields(form));
      applyPhoneMask(field);
    });

    form.querySelectorAll('input[name="cep"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      field.inputMode = "numeric";
      field.maxLength = 9;
      field.addEventListener("input", () => {
        field.value = formatCep(field.value);
      });
      field.value = formatCep(field.value);
    });

    form.querySelectorAll('input[name="estado"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      field.maxLength = 2;
      field.addEventListener("input", () => {
        field.value = formatUf(field.value);
      });
      field.value = formatUf(field.value);
    });

    form.querySelectorAll('input[type="date"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      if (!field.max) {
        field.max = new Date().toISOString().split("T")[0];
      }
      field.addEventListener("change", () => validateDateFields(form));
    });

    form.querySelectorAll('input[type="email"], input[type="text"], textarea').forEach((field) => {
      if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
        return;
      }
      field.addEventListener("blur", () => {
        runEssentialFormValidation(form);
      });
    });

    form.querySelectorAll('input[type="file"]').forEach((field) => {
      if (!(field instanceof HTMLInputElement)) {
        return;
      }
      applyFilesToInput(field, Array.from(field.files || []));
      updateAttachmentListUi(field, form);
      field.addEventListener("change", () => {
        mergeInputFiles(field);
        validateFileInputs(form);
        updateAttachmentListUi(field, form);
      });
    });
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

  const isFlowCompleted = (modal) => Boolean(getStepCard(modal, 4)?.classList.contains("is-complete"));
  const hasReachedFinalStep = (modal) => {
    const step4 = getStepCard(modal, 4);
    return Boolean(step4 && !step4.classList.contains("is-disabled"));
  };

  const goToMainPage = () => {
    window.location.href = "/";
  };

  const attemptCloseFlowModal = () => {
    if (isCloseAttemptInProgress) {
      return;
    }

    isCloseAttemptInProgress = true;
    const modal = getModal();
    if (!modal) {
      isCloseAttemptInProgress = false;
      return;
    }

    try {
      if (hasReachedFinalStep(modal) || isFlowCompleted(modal)) {
        setStepCompleted(modal, 4, true);
        closeFlowModal();
        goToMainPage();
        return;
      }

      const shouldClose = window.confirm(
        "Atenção: se você não concluir todas as etapas e enviar o arquivo ZIP, sua solicitação não será recebida. Deseja fechar mesmo assim?",
      );
      if (!shouldClose) {
        return;
      }

      closeFlowModal();
    } finally {
      isCloseAttemptInProgress = false;
    }
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
              <p class="service-flow-step-text">Clique no botão abaixo para baixar o arquivo ZIP da solicitação.</p>
              <button type="button" class="btn btn-primary service-flow-download-btn" data-flow-download>
                Baixar ZIP da solicitação
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
                Escolha como deseja enviar o arquivo ZIP: WhatsApp, e-mail pelo seu aplicativo ou copiando manualmente
                para
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
                Confira se o ZIP baixado está anexado na mensagem. Se ainda não estiver, anexe o arquivo e faça o envio.
              </p>
              <button type="button" class="btn btn-primary service-flow-confirm-btn" data-flow-confirm-send>
                Já anexei e enviei
                <span class="iconify" data-icon="mdi:check-circle-outline" aria-hidden="true"></span>
              </button>
            </div>
          </li>
          <li class="service-flow-step" data-flow-step="4">
            <button type="button" class="service-flow-step-title" data-step-toggle aria-expanded="true">
              <span>Pronto!</span>
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
          `E-mail <strong>${escapeHtml(targetEmail)}</strong> copiado. Abra seu provedor de e-mail, cole o destinatário e anexe o ZIP que você baixou.`,
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
        goToMainPage();
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
        downloadBtn.textContent = "Gerando ZIP...";
        setFlowStatus("Gerando arquivo ZIP da solicitacao...");

        try {
          const serviceName = form.dataset.serviceName || "Solicitacao";
          const attachments = collectAttachments(form);
          const { pdfBytes, fileName: pdfFileName, createdAt } = await createPdf({
            form,
            serviceName,
            attachments,
          });

          const { zipBytes, fileName, attachmentErrors, attachmentTotal, optimizedCount, deduplicatedCount, aggressiveCompression } =
            await createZipPackage({
              serviceName,
              createdAt,
              pdfBytes,
              pdfFileName,
              attachments,
          });

          flowState.generatedFileName = fileName;
          flowState.generatedAt = createdAt;

          downloadZip(zipBytes, fileName);
          fillFlowChannels({ form, fileName });
          setStepCompleted(modal, 1, true);
          setStepEnabled(modal, 2, true);

          const optimizationSummary =
            optimizedCount > 0
              ? ` ${optimizedCount} anexo(s) de imagem foram compactados para reduzir o tamanho do arquivo.`
              : "";
          const dedupeSummary =
            deduplicatedCount > 0 ? ` ${deduplicatedCount} arquivo(s) duplicado(s) foram removidos automaticamente.` : "";
          const aggressiveSummary = aggressiveCompression
            ? " Compressão reforçada aplicada porque os anexos ultrapassaram 25 MB no total."
            : "";
          const nextStepInstruction = " Siga as instruções do passo 2 para escolher como deseja enviar.";
          if (attachmentErrors.length > 0) {
            const failedCount = attachmentErrors.length;
            const failedSummary =
              failedCount < attachmentTotal
                ? ` ${failedCount} anexo(s) não puderam ser incluídos no ZIP e devem ser enviados separadamente.`
                : " Não foi possível incluir os anexos no ZIP. Tente novamente.";
            setFlowStatus(
              `ZIP baixado com ressalvas.${failedSummary}${dedupeSummary}${optimizationSummary}${aggressiveSummary}${nextStepInstruction}`,
              "error",
            );
          } else {
            setFlowStatus(`ZIP baixado com sucesso.${dedupeSummary}${optimizationSummary}${aggressiveSummary}${nextStepInstruction}`, "success");
          }
        } catch (error) {
          setFlowStatus("Nao foi possivel gerar o arquivo ZIP agora. Verifique os dados e tente novamente.", "error");
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
      if (event.key === "Escape" && !event.repeat && !modal.hidden) {
        event.preventDefault();
        event.stopPropagation();
        attemptCloseFlowModal();
      }
    });

    if (window.Iconify && typeof window.Iconify.scan === "function") {
      window.Iconify.scan(modal);
    }
  };

  const openFlowIfValid = (form) => {
    const essentialsValid = runEssentialFormValidation(form);
    if (!essentialsValid || !form.checkValidity()) {
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

      setupEssentialFieldValidation(form);

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
