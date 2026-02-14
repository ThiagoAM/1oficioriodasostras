(() => {
  const onlyDigits = (value) => String(value || "").replace(/[^\d]/g, "");

  const removeDiacritics = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const sanitizeMerchantName = (value) => {
    const normalized = removeDiacritics(value)
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return (normalized || "SERVICO 1 OFICIO").slice(0, 25);
  };

  const sanitizeMerchantCity = (value) => {
    const normalized = removeDiacritics(value)
      .toUpperCase()
      .replace(/[^A-Z ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return (normalized || "RIO DAS OSTRAS").slice(0, 15);
  };

  const sanitizeTxid = (value) => {
    const normalized = String(value || "***")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 25);
    return normalized || "***";
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const parsed = Number(String(value).replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "";
    }
    return parsed.toFixed(2);
  };

  const tlv = (id, value) => {
    const normalized = String(value || "");
    const length = String(normalized.length).padStart(2, "0");
    return `${id}${length}${normalized}`;
  };

  const crc16 = (value) => {
    let crc = 0xffff;
    for (let i = 0; i < value.length; i += 1) {
      crc ^= value.charCodeAt(i) << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const buildPixPayload = ({ pixKey, merchantName, merchantCity, amount, txid }) => {
    const key = onlyDigits(pixKey);
    if (!key) {
      return "";
    }

    const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", key);
    const formattedAmount = formatAmount(amount);

    let payload = "";
    payload += tlv("00", "01");
    payload += tlv("26", merchantAccountInfo);
    payload += tlv("52", "0000");
    payload += tlv("53", "986");
    if (formattedAmount) {
      payload += tlv("54", formattedAmount);
    }
    payload += tlv("58", "BR");
    payload += tlv("59", sanitizeMerchantName(merchantName));
    payload += tlv("60", sanitizeMerchantCity(merchantCity));
    payload += tlv("62", tlv("05", sanitizeTxid(txid)));
    payload += "6304";

    return payload + crc16(payload);
  };

  const renderPixQr = (container, overrides = {}) => {
    if (!(container instanceof HTMLElement)) {
      return false;
    }

    const staticPayload = String(overrides.staticPayload ?? container.dataset.pixPayloadStatic ?? "").trim();
    const pixKey = overrides.pixKey ?? container.dataset.pixKey ?? "";
    const merchantName = overrides.merchantName ?? container.dataset.pixMerchantName ?? "";
    const merchantCity = overrides.merchantCity ?? container.dataset.pixMerchantCity ?? "";
    const amount = overrides.amount ?? container.dataset.pixAmount ?? "";
    const txid = overrides.txid ?? container.dataset.pixTxid ?? "***";

    const payload =
      staticPayload ||
      buildPixPayload({
        pixKey,
        merchantName,
        merchantCity,
        amount,
        txid,
      });

    const target = container.querySelector("[data-pix-qr-code]");
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    target.innerHTML = "";

    if (!payload) {
      container.dataset.pixPayload = "";
      target.textContent = "QR Code indisponível.";
      return false;
    }

    container.dataset.pixPayload = payload;

    if (!(window.QRCode && typeof window.QRCode === "function")) {
      target.textContent = "QR Code indisponível.";
      return false;
    }

    new window.QRCode(target, {
      text: payload,
      width: 336,
      height: 336,
      correctLevel: window.QRCode.CorrectLevel.M,
    });

    return true;
  };

  const copyTextToClipboard = async (text) => {
    const normalized = String(text || "").trim();
    if (!normalized) {
      return false;
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(normalized);
        return true;
      } catch (error) {
        // Fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = normalized;
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

  const wireCopyButton = (container) => {
    const copyBtn = container.querySelector("[data-pix-copy-btn]");
    if (!(copyBtn instanceof HTMLButtonElement)) {
      return;
    }

    const defaultLabel = copyBtn.textContent?.trim() || "Copiar Código PIX";
    let resetTimer = 0;

    const setButtonLabel = (text) => {
      copyBtn.textContent = text;
    };

    const resetButton = () => {
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      copyBtn.disabled = false;
      copyBtn.classList.remove("is-copied");
      setButtonLabel(defaultLabel);
    };

    copyBtn.addEventListener("click", async () => {
      const payload = String(container.dataset.pixPayload || "").trim();
      if (!payload) {
        copyBtn.disabled = true;
        setButtonLabel("Código PIX indisponível");
        resetTimer = window.setTimeout(resetButton, 1600);
        return;
      }

      copyBtn.disabled = true;
      const copied = await copyTextToClipboard(payload);
      if (copied) {
        copyBtn.classList.add("is-copied");
        setButtonLabel("Código PIX copiado!");
      } else {
        setButtonLabel("Não foi possível copiar");
      }
      resetTimer = window.setTimeout(resetButton, 1600);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const blocks = Array.from(document.querySelectorAll("[data-pix-qr]"));
    blocks.forEach((block) => {
      renderPixQr(block);
      wireCopyButton(block);
    });
  });

  window.PixQr = {
    buildPixPayload,
    renderPixQr,
  };
})();
