import data from '../assets/barangay.json';

export type Barangays = string[];

export type Municipalities = {
  [municipality: string]: Barangays;
};

export type Provinces = {
  [province: string]: Municipalities | Barangays;
};

export type Regions = {
  [region: string]: Provinces;
};

export type LatLng = { lat: number; lon: number };

const locations: Regions = data;

const compareStrings = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

export const getProvinces = (): string[] => {
  const provinces: string[] = [];
  for (const region in locations) {
    provinces.push(...Object.keys(locations[region]));
  }
  return [...new Set(provinces)].sort(compareStrings);
};

export const getMunicipalities = (province: string): string[] => {
  for (const region in locations) {
    const prov = locations[region][province];
    if (prov) {
      if (Array.isArray(prov)) {
        return []; // no municipalities
      } else {
        return Object.keys(prov).sort(compareStrings);
      }
    }
  }
  return [];
};

export const getBarangays = (province: string, municipality: string): string[] => {
  for (const region in locations) {
    const prov = locations[region][province];
    if (prov) {
      if (Array.isArray(prov)) {
        return [...prov].sort(compareStrings); // barangays directly
      } else if (prov[municipality]) {
        return [...prov[municipality]].sort(compareStrings);
      }
    }
  }
  return [];
};

// Convert degrees to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 * Returns the distance in meters.
 */
export function distanceInMeters(a: LatLng, b: LatLng, radius = 6_371_000): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lon - a.lon);

  const sinΔφ2 = Math.sin(Δφ / 2);
  const sinΔλ2 = Math.sin(Δλ / 2);

  const h = sinΔφ2 * sinΔφ2 + Math.cos(φ1) * Math.cos(φ2) * sinΔλ2 * sinΔλ2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return radius * c; // meters
}
