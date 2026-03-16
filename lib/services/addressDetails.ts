import { SearchResult } from '../types/search';
import { fetchNominatim } from './nominatim';

const detailsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchAddressDetails(item: SearchResult) {
  const cacheKey = `${item.osm_type}_${item.osm_id}`;
  const now = Date.now();

  const cached = detailsCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const osmTypeShort =
    item.osm_type === 'node'
      ? 'N'
      : item.osm_type === 'way'
        ? 'W'
        : item.osm_type === 'relation'
          ? 'R'
          : item.osm_type;
  const detailsUrl = `https://nominatim.openstreetmap.org/details?osmtype=${osmTypeShort}&osmid=${item.osm_id}&class=${item.class}&addressdetails=1&hierarchy=0&group_hierarchy=1&polygon_geojson=1&format=json`;

  try {
    const details = await fetchNominatim(detailsUrl);
    detailsCache.set(cacheKey, { data: details, timestamp: Date.now() });
    return details;
  } catch (error) {
    console.error('Error fetching address details:', error);
    throw error;
  }
}
