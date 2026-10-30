// api.js - single place every OpenLibrary request goes through.
// When REACT_APP_MOCK_API=true (local development / offline demos only),
// responses come from the fixtures in mockApi.js instead of the network.
const MOCK = process.env.REACT_APP_MOCK_API === 'true';

export async function apiJson(url) {
  if (MOCK) {
    // eslint-disable-next-line global-require
    const { mockJson } = require('./mockApi');
    return mockJson(url);
  }
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
