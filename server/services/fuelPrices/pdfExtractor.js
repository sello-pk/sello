import crypto from "crypto";
import { PDFParse } from "pdf-parse";
import { parseEffectiveDateFromText } from "./ograMonitor.js";

function normalizeWhitespace(text = "") {
  return String(text).replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
}

function matchAllNumbers(text, pattern) {
  const values = [];
  const global = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
  );
  let match;
  while ((match = global.exec(text))) {
    const value = Number(match[1]);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

// OGRA now often rounds pump prices to whole rupees (e.g. 346.00 / 346).
const PKR = String.raw`(\d{2,3}(?:\.\d{1,2})?)`;

const EXTRACTORS = [
  {
    fuel_type: "motor_spirit",
    label: "Premier Euro 5 (Petrol / Motor Spirit)",
    preferred: [
      new RegExp(
        String.raw`total\s+(?:calculated\s+)?petrol\s+price[\s\S]{0,200}?${PKR}`,
        "i"
      ),
      new RegExp(
        String.raw`total\s+petrol\s+price\s*\([^)]*\)[\s\S]{0,80}?${PKR}`,
        "i"
      ),
    ],
    fallback: [
      new RegExp(
        String.raw`motor\s+spirit\s*\(?\s*ms\s*\)?[\s\S]{0,40}?${PKR}`,
        "i"
      ),
      new RegExp(
        String.raw`(?:^|\n)\s*petrol\s*\(?\s*ms\s*\)?[\s\S]{0,40}?${PKR}`,
        "i"
      ),
    ],
  },
  {
    fuel_type: "high_speed_diesel",
    label: "Hi-Cetane Diesel Euro 5 (HSD)",
    preferred: [
      new RegExp(
        String.raw`total\s+(?:calculated\s+)?diesel\s+price[\s\S]{0,200}?${PKR}`,
        "i"
      ),
      new RegExp(
        String.raw`total\s+diesel\s+price\s*\([^)]*\)[\s\S]{0,80}?${PKR}`,
        "i"
      ),
    ],
    fallback: [
      new RegExp(
        String.raw`high\s*[- ]?\s*speed\s*diesel\s*\(?\s*hsd\s*\)?[\s\S]{0,40}?${PKR}`,
        "i"
      ),
    ],
  },
  {
    fuel_type: "kerosene_oil",
    label: "Superior Kerosene Oil (SKO)",
    preferred: [
      new RegExp(
        String.raw`(?:maximum\s+ex[- ]depot\s+sale\s+price|total\s+kerosene[^\n]{0,80})[\s\S]{0,80}?${PKR}`,
        "i"
      ),
      new RegExp(String.raw`kerosene(?:\s+oil)?[\s\S]{0,40}?${PKR}`, "i"),
    ],
    fallback: [],
  },
  {
    fuel_type: "light_diesel_oil",
    label: "Light Diesel Oil (LDO)",
    preferred: [
      new RegExp(
        String.raw`light\s+diesel(?:\s+oil)?[\s\S]{0,40}?${PKR}`,
        "i"
      ),
      new RegExp(String.raw`\bldo\b[\s\S]{0,40}?${PKR}`, "i"),
    ],
    fallback: [],
  },
];

export function extractPricesFromText(rawText = "", meta = {}) {
  const text = normalizeWhitespace(rawText);
  const prices = [];
  const warnings = [];

  for (const rule of EXTRACTORS) {
    let values = [];
    for (const pattern of rule.preferred) {
      values = values.concat(matchAllNumbers(text, pattern));
    }
    let usedFallback = false;
    if (!values.length) {
      for (const pattern of rule.fallback) {
        values = values.concat(matchAllNumbers(text, pattern));
      }
      usedFallback = values.length > 0;
    }

    if (!values.length) {
      warnings.push(`Missing extractable price for ${rule.label}`);
      continue;
    }

    const price = values[values.length - 1];
    prices.push({
      fuel_type: rule.fuel_type,
      label: rule.label,
      price,
      currency: "PKR",
      unit: "per_litre",
      evidence_count: values.length,
      used_fallback: usedFallback,
    });
    if (usedFallback) {
      warnings.push(`Used fallback pattern for ${rule.label}`);
    }
  }

  const effective_date =
    meta.effective_date ||
    parseEffectiveDateFromText(meta.title || "") ||
    parseEffectiveDateFromText(text);

  return {
    prices,
    warnings,
    effective_date,
    text_preview: text.slice(0, 1200),
    char_count: text.length,
  };
}

export async function extractFromPdfBuffer(buffer, meta = {}) {
  const content_hash = crypto.createHash("sha256").update(buffer).digest("hex");
  let text = "";
  let method = "pdf_text";
  let ocrUsed = false;

  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result?.text || "";
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    return {
      ok: false,
      content_hash,
      method,
      error: `PDF text extraction failed: ${error.message}`,
      prices: [],
      warnings: [],
      effective_date: meta.effective_date || null,
      char_count: 0,
    };
  }

  if (text.replace(/\s+/g, "").length < 40) {
    try {
      const ocrModule = await import("./ocrFallback.js");
      const ocrText = await ocrModule.ocrPdfBuffer(buffer);
      if (ocrText && ocrText.replace(/\s+/g, "").length > 40) {
        text = ocrText;
        method = "pdf_ocr";
        ocrUsed = true;
      }
    } catch {
      // OCR optional
    }
  }

  const extracted = extractPricesFromText(text, meta);
  return {
    ok: extracted.prices.length > 0,
    content_hash,
    method,
    ocrUsed,
    ...extracted,
  };
}
