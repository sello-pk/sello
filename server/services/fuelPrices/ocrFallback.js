/**
 * Optional OCR fallback for scanned OGRA PDFs.
 * tesseract.js is NOT a hard dependency — if it is not installed, this module
 * throws and the caller keeps previous verified prices / marks needs_review.
 */
export async function ocrPdfBuffer(buffer) {
  let Tesseract;
  try {
    Tesseract = (await import("tesseract.js")).default;
  } catch {
    throw new Error(
      "OCR fallback unavailable (tesseract.js not installed). Scanned PDF needs admin review."
    );
  }

  // Best-effort: feed raw PDF bytes. Some environments may need page rasterization;
  // if OCR fails, caller treats extraction as incomplete.
  const result = await Tesseract.recognize(buffer, "eng", {
    logger: () => {},
  });
  return result?.data?.text || "";
}
