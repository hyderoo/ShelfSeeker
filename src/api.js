// api.js - single place every OpenLibrary request goes through.
// When REACT_APP_MOCK_API=true (local development / offline demos only),
// responses come from the fixtures in mockApi.js instead of the network.
const MOCK = process.env.REACT_APP_MOCK_API === 'true';

export const REQUEST_TIMEOUT_MS = 15000;

// kind: 'offline' | 'timeout' | 'network' | 'notfound' | 'server' | 'http'
export class ApiError extends Error {
  constructor(kind, message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export async function apiJson(url, { timeout = REQUEST_TIMEOUT_MS } = {}) {
  if (MOCK) {
    // eslint-disable-next-line global-require
    const { mockJson } = require('./mockApi');
    return mockJson(url);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new ApiError('timeout', 'The request timed out.');
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new ApiError('offline', 'You are offline.');
    }
    throw new ApiError('network', 'Network request failed.');
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    if (response.status === 404) throw new ApiError('notfound', 'Not found.', 404);
    if (response.status >= 500) throw new ApiError('server', 'OpenLibrary had a problem.', response.status);
    throw new ApiError('http', `Request failed with status ${response.status}`, response.status);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('network', 'The response could not be read.');
  }
}

// Plain-language message for the user. Never returns an empty string.
export function describeError(error) {
  switch (error && error.kind) {
    case 'offline':
      return 'You are offline. Reconnect and try again - pages and books you opened before still work.';
    case 'timeout':
      return 'OpenLibrary is taking too long to respond. Try again in a moment.';
    case 'server':
      return 'OpenLibrary is having problems right now. Try again in a moment.';
    case 'notfound':
      return 'We could not find that on OpenLibrary.';
    default:
      return 'Could not reach OpenLibrary. Check your connection and try again.';
  }
}
