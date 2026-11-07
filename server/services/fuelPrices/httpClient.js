import { USER_AGENT, REQUEST_TIMEOUT_MS, MIN_REQUEST_GAP_MS } from "./constants.js";

let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function politeFetch(url, options = {}) {
  const gap = Date.now() - lastRequestAt;
  if (gap < MIN_REQUEST_GAP_MS) {
    await sleep(MIN_REQUEST_GAP_MS - gap);
  }
  lastRequestAt = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: options.accept || "*/*",
        ...(options.headers || {}),
      },
      redirect: "follow",
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url) {
  const response = await politeFetch(url, {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }
  return {
    status: response.status,
    url: response.url,
    text: await response.text(),
  };
}

export async function fetchBinary(url) {
  const response = await politeFetch(url, {
    accept: "application/pdf,application/octet-stream,*/*",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} downloading ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentDisposition = response.headers.get("content-disposition") || "";
  const contentType = response.headers.get("content-type") || "";
  const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1].replace(/"/g, "").trim())
    : null;

  return {
    status: response.status,
    url: response.url,
    buffer,
    contentType,
    filename,
  };
}
