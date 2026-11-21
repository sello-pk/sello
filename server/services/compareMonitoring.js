import Logger from '../utils/logger.js';

const metrics = { startedAt: new Date().toISOString(), calls: 0, failures: 0, inputTokens: 0, cachedTokens: 0, outputTokens: 0, searchCalls: 0, estimatedUsd: 0, unpricedCalls: 0, durationMs: 0, byOperation: {}, recent: [] };
const rate = (name, fallback) => {
  if (process.env[name] === undefined && fallback === null) return null;
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export function recordCompareCall({ operation, model, durationMs, status, usage = {}, searchCalls = 0, requestId }) {
  const input = Number(usage.input_tokens) || 0;
  const cached = Math.min(input, Number(usage.input_tokens_details?.cached_tokens) || 0);
  const output = Number(usage.output_tokens) || 0;
  // Standard GPT-4.1 rates checked against OpenAI pricing on 2026-11-20.
  // Custom model/account rates can be supplied through environment variables.
  const defaults = model === 'gpt-4.1' ? [2, 0.5, 8] : [null, null, null];
  const rates = [rate('COMPARE_INPUT_USD_PER_MILLION', defaults[0]), rate('COMPARE_CACHED_USD_PER_MILLION', defaults[1]), rate('COMPARE_OUTPUT_USD_PER_MILLION', defaults[2])];
  const searchRate = rate('COMPARE_SEARCH_USD_PER_CALL', 0.01);
  const priced = rates.every(value => value !== null) && (!searchCalls || searchRate !== null);
  const estimatedUsd = priced ? ((input - cached) * rates[0] + cached * rates[1] + output * rates[2]) / 1e6 + searchCalls * (searchRate ?? 0) : null;
  const event = { at: new Date().toISOString(), operation, model, durationMs, status, requestId, inputTokens: input, cachedTokens: cached, outputTokens: output, searchCalls, estimatedUsd };
  metrics.calls++;
  if (status !== 'success') metrics.failures++;
  metrics.inputTokens += input;
  metrics.cachedTokens += cached;
  metrics.outputTokens += output;
  metrics.searchCalls += searchCalls;
  metrics.estimatedUsd += estimatedUsd || 0;
  metrics.durationMs += durationMs;
  if (!priced) metrics.unpricedCalls++;
  const bucket = metrics.byOperation[operation] ||= { calls: 0, failures: 0, durationMs: 0 };
  bucket.calls++;
  bucket.durationMs += durationMs;
  if (status !== 'success') bucket.failures++;
  metrics.recent.push(event);
  if (metrics.recent.length > 100) metrics.recent.shift();
  Logger.info('car_compare_api', event);
}

export function getCompareMetrics() {
  return { ...structuredClone(metrics), averageMs: metrics.calls ? Math.round(metrics.durationMs / metrics.calls) : 0, costBasis: 'Estimated USD from reported tokens and search calls. OpenAI billing is authoritative. Totals cover this server process since startup.' };
}
