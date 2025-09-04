/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Replaces expo-location reverse geocoding functionality
 */

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

/**
 * Reverse geocode coordinates using OpenStreetMap Nominatim API
 * @param lat Latitude
 * @param lon Longitude
 * @returns Promise with geocoded address information
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'DispatchApp/1.0 (kiyoko-org@github.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data: NominatimResponse = await response.json();

    if (!data || !data.address) {
      throw new Error('No address data returned from Nominatim');
    }

    // Map Nominatim address to the format expected by the app
    const address = data.address;
    const result: GeocodeResult = {
      streetNumber: address.house_number,
      street: address.road,
      city: address.city || address.town || address.village || address.suburb,
      subregion: address.county,
      region: address.state || address.county,
      name: address.name || data.display_name,
    };

    return [result];
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Geocoding service object following the app's service pattern
 */
export const geocodingService = {
  reverseGeocode,
};
