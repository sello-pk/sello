import Logger from '../../utils/logger.js';

/**
 * JAG9-only Chat Completions adapter for Car Compare.
 * No Gemini/OpenAI on this path. Live web search is NOT used here —
 * Stage A fetches sources; Stage B asks JAG9 to extract from that text.
 */

const circuit = {
  openUntil: 0,
  reason: '',
};

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  return value || '';
}

export function jag9Config() {
  const apiKey = requiredEnv('JAG9_API_KEY') || requiredEnv('COMPARE_AI_API_KEY');
  const baseUrl = (
    requiredEnv('JAG9_BASE_URL') || requiredEnv('COMPARE_AI_BASE_URL')
  ).replace(/\/$/, '');
  const model = requiredEnv('JAG9_MODEL') || requiredEnv('COMPARE_AI_MODEL');
  if (!apiKey || !baseUrl || !model) {
    const err = new Error('not_configured');
    err.code = 'not_configured';
    err.status = 503;
    err.detail = 'Set JAG9_API_KEY (or COMPARE_AI_API_KEY), JAG9_BASE_URL (or COMPARE_AI_BASE_URL), and JAG9_MODEL (or COMPARE_AI_MODEL).';
    throw err;
  }
  return { apiKey, baseUrl, model };
}

export function isCircuitOpen() {
  return Date.now() < circuit.openUntil;
}

export function circuitReason() {
  return circuit.reason || 'provider unavailable';
}

function openCircuit(reason, ttlMs = 15 * 60 * 1000) {
  circuit.openUntil = Date.now() + ttlMs;
  circuit.reason = reason;
  Logger.warn('Car Compare JAG9 circuit opened', { reason, ttlMs });
}

function mapHttpError(status, body) {
  const message = String(body?.error?.message || body?.message || '');
  const code = String(body?.error?.code || body?.error?.type || '');
  if (
    status === 401
    || status === 403
    || /api.?key|unauthorized|permission.?denied|invalid.?key/i.test(`${code} ${message}`)
  ) {
    return 'ai_credentials';
  }
  if (
    status === 429
    || /insufficient.?quota|credit.?balance|billing|quota/i.test(`${code} ${message}`)
  ) {
    return /quota|credit|billing/i.test(`${code} ${message}`) ? 'ai_quota' : 'ai_capacity';
  }
  if (status >= 500) return 'ai_unavailable';
  return 'ai_unavailable';
}

async function postChat(messages, { maxTokens = 2500, temperature = 0.1 } = {}) {
  if (isCircuitOpen()) {
    const err = new Error('ai_unavailable');
    err.detail = circuitReason();
    throw err;
  }
  const { apiKey, baseUrl, model } = jag9Config();
  const url = `${baseUrl}/chat/completions`;
  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  };

  const attempt = async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const mapped = mapHttpError(response.status, payload);
      if (mapped === 'ai_credentials' || mapped === 'ai_quota') {
        openCircuit(mapped);
      }
      const err = new Error(mapped);
      err.statusCode = response.status;
      // Never log the API key; status + mapped code only.
      Logger.warn('Car Compare JAG9 HTTP error', { status: response.status, mapped });
      throw err;
    }
    const text = payload?.choices?.[0]?.message?.content;
    if (!text || !String(text).trim()) {
      throw new Error('ai_incomplete');
    }
    return {
      text: String(text).trim(),
      usage: payload?.usage
        ? {
          input_tokens: payload.usage.prompt_tokens,
          output_tokens: payload.usage.completion_tokens,
        }
        : undefined,
      modelLabel: `jag9:${model}`,
      liveSearch: false,
    };
  };

  try {
    return await attempt();
  } catch (error) {
    // One retry max on network / 5xx only — never on 4xx/429.
    const retryable = error?.name === 'TimeoutError'
      || error?.name === 'AbortError'
      || error?.code === 'ECONNRESET'
      || error?.code === 'ETIMEDOUT'
      || error?.message === 'ai_unavailable'
      || (error?.statusCode >= 500);
    if (!retryable || error?.message === 'ai_credentials' || error?.message === 'ai_quota' || error?.message === 'ai_capacity') {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    return attempt();
  }
}

/** Stage B / recommendation: JAG9 extraction only (no browsing). */
export async function jag9Extract(prompt, options = {}) {
  return postChat(
    [
      { role: 'system', content: 'You extract structured vehicle facts as compact JSON only. Never invent URLs or quotes not present in the provided sources.' },
      { role: 'user', content: prompt },
    ],
    options,
  );
}

export function jag9SigningSecret() {
  try {
    return jag9Config().apiKey;
  } catch {
    return '';
  }
}

/** Probe helper for ops — does not enable search. */
export async function jag9Probe() {
  const cfg = jag9Config();
  const result = await jag9Extract(
    'Return JSON {"ok":true,"provider":"jag9","live_web_search":false,"note":"extraction only"}',
    { maxTokens: 80 },
  );
  return {
    status: 'ok',
    model: cfg.model,
    baseUrlHost: (() => {
      try { return new URL(cfg.baseUrl).host; } catch { return 'invalid-url'; }
    })(),
    liveWebSearchSupported: false,
    responseShape: {
      hasText: Boolean(result.text),
      textHead: result.text.slice(0, 200),
      usage: result.usage || null,
    },
  };
}
