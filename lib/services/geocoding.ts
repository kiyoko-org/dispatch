import { fetchNominatim } from './nominatim';

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  village?: string;
  town?: string;
  city?: string;
  suburb?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  name?: string;
}

export interface NominatimResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  boundingbox: string[];
}

export interface GeocodeResult {
  streetNumber?: string;
  street?: string;
  city?: string;
  subregion?: string;
  region?: string;
  name?: string;
}

interface CacheEntry {
  results: GeocodeResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim API
 * @param lat Latitude
 * @param lon Longitude
 * @returns Promise with geocoded address information
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult[]> {
  // Simple cache key: round coordinates to 6 decimal places (~10cm precision)
  const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const data: NominatimResponse = await fetchNominatim(url);

    if (!data || !data.address) {
      throw new Error('No address data returned from Nominatim');
    }

    // Map Nominatim address to the format expected by the app
    const address = data.address;
    const results: GeocodeResult[] = [{
      streetNumber: address.house_number,
      street: address.road,
      city: address.city || address.town || address.village || address.suburb,
      subregion: address.county,
      region: address.state || address.county,
      name: address.name || data.display_name,
    }];

    cache.set(cacheKey, { results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Search for an address using Nominatim
 */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<any[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    return await fetchNominatim(url, signal);
  } catch (error) {
    console.error('Search address error:', error);
    throw error;
  }
}

/**
 * Geocoding service object following the app's service pattern
 */
export const geocodingService = {
  reverseGeocode,
  searchAddress,
};
