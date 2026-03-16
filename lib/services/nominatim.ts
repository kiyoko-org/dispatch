/**
 * Centralized Nominatim API service to handle rate limiting and common headers.
 * Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Max 1 request per second
 * - Valid User-Agent and Contact email
 * - No bulk geocoding
 */

const MIN_REQUEST_INTERVAL = 1100; // 1.1s to be safe
let lastRequestTime = 0;

async function waitIfNeeded() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

export async function fetchNominatim(url: string, signal?: AbortSignal) {
  await waitIfNeeded();
  
  // Update lastRequestTime just before the fetch to prevent concurrent overlap
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'DispatchApp/1.0 (kiyoko-org@github.com)',
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Nominatim API rate limit reached. Please wait a moment.');
    }
    throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
