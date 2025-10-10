/**
 * Geographical boundary utilities for Tuguegarao City
 * Coordinates are approximate bounds of Tuguegarao City, Cagayan, Philippines
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Approximate boundaries of Tuguegarao City
 * These coordinates define a bounding box that encompasses the city limits
 */
export const TUGUEGARAO_BOUNDS: GeoBounds = {
  north: 17.68,
  south: 17.56,
  east: 121.76,
  west: 121.65,
};

/**
 * Check if given coordinates are within Tuguegarao City bounds
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns true if coordinates are within bounds, false otherwise
 */
export function isWithinTuguegaraoBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= TUGUEGARAO_BOUNDS.south &&
    latitude <= TUGUEGARAO_BOUNDS.north &&
    longitude >= TUGUEGARAO_BOUNDS.west &&
    longitude <= TUGUEGARAO_BOUNDS.east
  );
}

/**
 * Check if given coordinates are within specified bounds
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param bounds - Geographical bounds to check against
 * @returns true if coordinates are within bounds, false otherwise
 */
export function isWithinBounds(
  latitude: number,
  longitude: number,
  bounds: GeoBounds
): boolean {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}
